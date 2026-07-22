import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDiscoverProfiles, DEFAULT_RADIUS_KM } from "@/lib/discovery";

// Prisma requires the Node.js runtime, and the feed must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/discover
 *
 * Returns nearby, unseen, mutually-compatible profiles for the current user.
 * Optional query params: `radius` (km), `limit`.
 */
export async function GET(request: Request) {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return NextResponse.json(
      { error: "Oturum bulunamadı." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const radiusKm = Number(searchParams.get("radius")) || DEFAULT_RADIUS_KM;
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  const profiles = await getDiscoverProfiles(viewer, { radiusKm, limit });

  return NextResponse.json({ profiles });
}
