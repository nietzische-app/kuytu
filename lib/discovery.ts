import type { User } from "@prisma/client";
import { prisma } from "./prisma";
import { haversineKm } from "./geo";
import { toProfile } from "./mappers";
import type { Profile } from "./types";

/** Default discovery radius (km) and page size. */
export const DEFAULT_RADIUS_KM = 150;
export const DISCOVER_LIMIT = 20;
/** Cap on rows pulled before distance filtering — keeps the query bounded. */
const CANDIDATE_SCAN_LIMIT = 200;

export interface DiscoverOptions {
  radiusKm?: number;
  limit?: number;
}

/**
 * Returns nearby, unseen, mutually-compatible profiles for `viewer`, sorted by
 * distance ascending.
 *
 * "Unseen" excludes anyone the viewer has already swiped. Compatibility is a
 * simple mutual-orientation check (their gender matches my target, and vice
 * versa). Distance is computed with the Haversine formula and filtered to the
 * requested radius.
 */
export async function getDiscoverProfiles(
  viewer: User,
  { radiusKm = DEFAULT_RADIUS_KM, limit = DISCOVER_LIMIT }: DiscoverOptions = {},
): Promise<Profile[]> {
  // Everyone the viewer has already acted on.
  const swiped = await prisma.swipe.findMany({
    where: { swiperId: viewer.id },
    select: { targetId: true },
  });
  const excludeIds = [viewer.id, ...swiped.map((s) => s.targetId)];

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: excludeIds },
      gender: viewer.targetGender,
      targetGender: viewer.gender,
    },
    take: CANDIDATE_SCAN_LIMIT,
  });

  return candidates
    .map((user) => ({
      user,
      distanceKm: haversineKm(viewer, user),
    }))
    .filter(({ distanceKm }) => distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
    .map(({ user, distanceKm }) => toProfile(user, Math.round(distanceKm)));
}
