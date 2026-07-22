import type { SwipeDirection, User } from "@prisma/client";
import { prisma } from "./prisma";
import { toProfile } from "./mappers";
import { FIRST_MOVE_WINDOW_MS } from "./constants";
import type { Match as MatchDTO } from "./types";

export interface SwipeResult {
  /** True when this swipe produced (or re-surfaced) a mutual match. */
  matched: boolean;
  /** Present when `matched` — shaped for the MatchModal. */
  match?: MatchDTO;
}

/** A LIKE or SUPERLIKE expresses interest; PASS never creates a match. */
function isPositive(direction: SwipeDirection): boolean {
  return direction === "LIKE" || direction === "SUPERLIKE";
}

/**
 * Deterministic pair ordering so a given couple can only ever map to one Match
 * row regardless of who swiped first.
 */
function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/**
 * Records a swipe by `viewer` on `targetId` and, when the interest is mutual,
 * creates the Match with a 48-hour first-move deadline.
 *
 * The swipe is upserted so re-swiping the same target is idempotent. Match
 * creation is likewise upserted to stay safe under concurrent reciprocal
 * swipes.
 */
export async function recordSwipe(
  viewer: User,
  targetId: string,
  direction: SwipeDirection,
): Promise<SwipeResult> {
  if (targetId === viewer.id) {
    throw new Error("Bir kullanıcı kendini kaydıramaz.");
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) {
    throw new Error("Hedef kullanıcı bulunamadı.");
  }

  await prisma.swipe.upsert({
    where: { swiperId_targetId: { swiperId: viewer.id, targetId } },
    update: { direction },
    create: { swiperId: viewer.id, targetId, direction },
  });

  // A PASS can never match; a positive swipe matches only if the target has
  // already expressed positive interest in the viewer.
  if (!isPositive(direction)) {
    return { matched: false };
  }

  const reciprocal = await prisma.swipe.findUnique({
    where: { swiperId_targetId: { swiperId: targetId, targetId: viewer.id } },
  });

  if (!reciprocal || !isPositive(reciprocal.direction)) {
    return { matched: false };
  }

  const [user1Id, user2Id] = orderPair(viewer.id, targetId);
  const expiresAt = new Date(Date.now() + FIRST_MOVE_WINDOW_MS);

  const match = await prisma.match.upsert({
    where: { user1Id_user2Id: { user1Id, user2Id } },
    update: {},
    create: { user1Id, user2Id, expiresAt },
  });

  return {
    matched: true,
    match: {
      id: match.id,
      profile: toProfile(target, 0),
      matchedAt: match.createdAt.getTime(),
    },
  };
}
