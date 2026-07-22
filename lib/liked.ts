import type { User } from "@prisma/client";
import { prisma } from "./prisma";
import { haversineKm } from "./geo";
import { toProfile } from "./mappers";
import type { Profile } from "./types";

/**
 * Profiles who have liked the viewer but whom the viewer hasn't swiped yet —
 * "Liked You". Liking any of them back mints an instant match.
 */
export async function getUsersWhoLikedMe(viewer: User): Promise<Profile[]> {
  const incoming = await prisma.swipe.findMany({
    where: {
      targetId: viewer.id,
      direction: { in: ["LIKE", "SUPERLIKE"] },
    },
    select: { swiperId: true },
  });
  const swiperIds = incoming.map((s) => s.swiperId);
  if (swiperIds.length === 0) return [];

  // Exclude anyone the viewer has already acted on.
  const mySwipes = await prisma.swipe.findMany({
    where: { swiperId: viewer.id, targetId: { in: swiperIds } },
    select: { targetId: true },
  });
  const alreadySwiped = new Set(mySwipes.map((s) => s.targetId));
  const pendingIds = swiperIds.filter((id) => !alreadySwiped.has(id));
  if (pendingIds.length === 0) return [];

  const users = await prisma.user.findMany({ where: { id: { in: pendingIds } } });
  return users.map((u) => toProfile(u, Math.round(haversineKm(viewer, u))));
}
