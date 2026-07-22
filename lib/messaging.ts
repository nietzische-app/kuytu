import type { Match, Message, User } from "@prisma/client";
import { prisma } from "./prisma";
import { toProfile } from "./mappers";
import { haversineKm } from "./geo";
import type {
  ChatMessage,
  Conversation,
  GroupedMatches,
  MatchSummary,
} from "./types";

/** Shown to a man who tries to open a chat before the woman has written. */
export const FIRST_MOVE_LOCK_REASON =
  "Sohbeti başlatmak için karşı tarafın ilk mesajı atması bekleniyor.";

const MAX_MESSAGE_LENGTH = 2000;

type MatchWithUsers = Match & { user1: User; user2: User };

/** Resolves the viewer's side of a match and the other participant. */
function sides(match: MatchWithUsers, viewerId: string) {
  const isUser1 = match.user1Id === viewerId;
  const isUser2 = match.user2Id === viewerId;
  if (!isUser1 && !isUser2) return null;
  return {
    isUser1,
    other: isUser1 ? match.user2 : match.user1,
    myLastReadAt: isUser1 ? match.user1LastReadAt : match.user2LastReadAt,
  };
}

/**
 * The women-first rule, in one place: anyone may reply once the conversation
 * has started, but the *first* message must come from the woman.
 */
export function canSendMessage(
  viewer: Pick<User, "gender">,
  match: Pick<Match, "isFirstMessageSent">,
): boolean {
  return match.isFirstMessageSent || viewer.gender === "FEMALE";
}

function mapMessage(m: Message): ChatMessage {
  return {
    id: m.id,
    matchId: m.matchId,
    senderId: m.senderId,
    content: m.content,
    createdAt: m.createdAt.getTime(),
  };
}

/** Column holding the viewer's read cursor for a given match. */
function readColumn(isUser1: boolean): "user1LastReadAt" | "user2LastReadAt" {
  return isUser1 ? "user1LastReadAt" : "user2LastReadAt";
}

/**
 * All of the viewer's matches, grouped into "new" (no first message) and
 * "conversations" (started), each enriched with the latest message and the
 * viewer's unread count.
 */
export async function getMatchesForUser(viewer: User): Promise<GroupedMatches> {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1Id: viewer.id }, { user2Id: viewer.id }],
    },
    include: {
      user1: true,
      user2: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const summaries: MatchSummary[] = await Promise.all(
    matches.map(async (match) => {
      const side = sides(match, viewer.id)!;
      const lastMessage = match.messages[0] ?? null;

      const unreadCount = await prisma.message.count({
        where: {
          matchId: match.id,
          senderId: { not: viewer.id },
          ...(side.myLastReadAt
            ? { createdAt: { gt: side.myLastReadAt } }
            : {}),
        },
      });

      return {
        matchId: match.id,
        profile: toProfile(side.other, Math.round(haversineKm(viewer, side.other))),
        matchedAt: match.createdAt.getTime(),
        expiresAt: match.expiresAt.getTime(),
        isFirstMessageSent: match.isFirstMessageSent,
        lastMessage: lastMessage ? mapMessage(lastMessage) : null,
        unreadCount,
      };
    }),
  );

  const newMatches = summaries
    .filter((s) => !s.isFirstMessageSent)
    .sort((a, b) => a.expiresAt - b.expiresAt); // most urgent first

  const conversations = summaries
    .filter((s) => s.isFirstMessageSent)
    .sort(
      (a, b) =>
        (b.lastMessage?.createdAt ?? b.matchedAt) -
        (a.lastMessage?.createdAt ?? a.matchedAt),
    );

  return { newMatches, conversations };
}

/**
 * Full conversation for the chat screen, or `null` if the match doesn't exist
 * or the viewer isn't a participant. Opening a conversation marks it read.
 */
export async function getConversation(
  viewer: User,
  matchId: string,
): Promise<Conversation | null> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      user1: true,
      user2: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!match) return null;

  const side = sides(match, viewer.id);
  if (!side) return null;

  // Mark everything read for the viewer.
  await prisma.match.update({
    where: { id: match.id },
    data: { [readColumn(side.isUser1)]: new Date() },
  });

  const allowed = canSendMessage(viewer, match);

  return {
    matchId: match.id,
    viewerId: viewer.id,
    profile: toProfile(side.other, Math.round(haversineKm(viewer, side.other))),
    isFirstMessageSent: match.isFirstMessageSent,
    expiresAt: match.expiresAt.getTime(),
    messages: match.messages.map(mapMessage),
    canSend: allowed,
    lockReason: allowed ? null : FIRST_MOVE_LOCK_REASON,
  };
}

/**
 * Sends a message on behalf of `viewer`, enforcing the women-first rule and
 * flipping `isFirstMessageSent` on the opening message. Returns the new message.
 */
export async function sendMessage(
  viewer: User,
  matchId: string,
  rawContent: string,
): Promise<ChatMessage> {
  const content = rawContent.trim();
  if (!content) {
    throw new Error("Mesaj boş olamaz.");
  }
  if (content.length > MAX_MESSAGE_LENGTH) {
    throw new Error("Mesaj çok uzun.");
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { user1: true, user2: true },
  });
  if (!match) {
    throw new Error("Eşleşme bulunamadı.");
  }

  const side = sides(match, viewer.id);
  if (!side) {
    throw new Error("Bu sohbete erişiminiz yok.");
  }

  if (!canSendMessage(viewer, match)) {
    // Surfaced as 403 by the route handler.
    throw new Error(FIRST_MOVE_LOCK_REASON);
  }

  // Create the message, flip the first-message flag, and advance the sender's
  // read cursor — atomically.
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { matchId, senderId: viewer.id, content },
    }),
    prisma.match.update({
      where: { id: matchId },
      data: {
        isFirstMessageSent: true,
        [readColumn(side.isUser1)]: new Date(),
      },
    }),
  ]);

  return mapMessage(message);
}
