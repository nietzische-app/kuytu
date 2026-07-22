import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUsersWhoLikedMe } from "@/lib/liked";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/liked-you — profiles who liked the current user and are awaiting a
 * like back. Liking any of them back creates a match immediately.
 */
export async function GET() {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }
  const profiles = await getUsersWhoLikedMe(viewer);
  return NextResponse.json({ profiles });
}
