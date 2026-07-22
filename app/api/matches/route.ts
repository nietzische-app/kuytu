import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMatchesForUser } from "@/lib/messaging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/matches
 *
 * Returns the current user's matches grouped into `newMatches` (awaiting the
 * first move) and `conversations` (started), each with its latest message and
 * the viewer's unread count.
 */
export async function GET() {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const grouped = await getMatchesForUser(viewer);
  return NextResponse.json(grouped);
}
