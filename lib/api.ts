import type { Profile, SwipeAction } from "./types";
import { actionToDirection } from "./mappers";

/**
 * Thin client-side wrappers around the discovery/swipe endpoints.
 * Keeping fetch details here lets components stay declarative.
 */

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
