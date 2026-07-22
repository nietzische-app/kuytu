import type {
  ChatMessage,
  Conversation,
  DemoAccount,
  GroupedMatches,
  MeProfile,
  Niyet,
  Profile,
  SwipeAction,
} from "./types";
import { actionToDirection } from "./mappers";

/**
 * Thin client-side wrappers around the discovery/swipe/chat endpoints.
 * Keeping fetch details here lets components stay declarative.
 */

/** Reads `{ error }` from a failed response, falling back to a default. */
async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

export interface SwipeResponse {
  matched: boolean;
  match?: {
    id: string;
    profile: Profile;
    matchedAt: number;
  };
}

/** Fetches the current user's discovery feed. */
export async function fetchDiscoverProfiles(): Promise<Profile[]> {
  const res = await fetch("/api/discover", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Keşfet yüklenemedi (${res.status})`);
  }
  const data = (await res.json()) as { profiles: Profile[] };
  return data.profiles;
}

/** Fetches profiles who have liked the current user (awaiting a like back). */
export async function fetchLikedYou(): Promise<Profile[]> {
  const res = await fetch("/api/liked-you", { cache: "no-store" });
  if (!res.ok) throw new Error(await errorMessage(res, "Beğenenler yüklenemedi"));
  const data = (await res.json()) as { profiles: Profile[] };
  return data.profiles;
}

/** Records a swipe and reports whether it produced a match. */
export async function sendSwipe(
  targetId: string,
  action: SwipeAction,
): Promise<SwipeResponse> {
  const res = await fetch("/api/swipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetId, direction: actionToDirection[action] }),
  });
  if (!res.ok) {
    throw new Error(`Swipe kaydedilemedi (${res.status})`);
  }
  return (await res.json()) as SwipeResponse;
}

// ---- Matches & chat ----

/** Fetches the current user's matches, grouped into new / conversations. */
export async function fetchMatches(): Promise<GroupedMatches> {
  const res = await fetch("/api/matches", { cache: "no-store" });
  if (!res.ok) throw new Error(await errorMessage(res, "Eşleşmeler yüklenemedi"));
  return (await res.json()) as GroupedMatches;
}

/** Fetches a single conversation (and marks it read). */
export async function fetchConversation(matchId: string): Promise<Conversation> {
  const res = await fetch(`/api/matches/${matchId}/messages`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Sohbet yüklenemedi"));
  return (await res.json()) as Conversation;
}

/** Sends a message; throws with the server's reason (e.g. the women-first lock). */
export async function postMessage(
  matchId: string,
  content: string,
): Promise<ChatMessage> {
  const res = await fetch(`/api/matches/${matchId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Mesaj gönderilemedi"));
  const data = (await res.json()) as { message: ChatMessage };
  return data.message;
}

// ---- Profile & demo auth ----

export interface MeResponse {
  me: MeProfile;
  accounts: DemoAccount[];
}

/** Fetches the current user's profile and the switchable demo accounts. */
export async function fetchMe(): Promise<MeResponse> {
  const res = await fetch("/api/me", { cache: "no-store" });
  if (!res.ok) throw new Error(await errorMessage(res, "Profil yüklenemedi"));
  return (await res.json()) as MeResponse;
}

/** Updates the current user's editable profile fields. */
export async function updateMe(patch: {
  bio?: string;
  intention?: Niyet;
  photos?: string[];
}): Promise<MeProfile> {
  const res = await fetch("/api/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Profil güncellenemedi"));
  const data = (await res.json()) as { me: MeProfile };
  return data.me;
}

/** Switches the active demo identity (sets the kuytu_uid cookie). */
export async function switchAccount(userId: string): Promise<void> {
  const res = await fetch("/api/auth/switch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Hesap değiştirilemedi"));
}
