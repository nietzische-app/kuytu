import { NextResponse } from "next/server";
import type { SwipeDirection } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { recordSwipe } from "@/lib/matching";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_DIRECTIONS: SwipeDirection[] = ["LIKE", "PASS", "SUPERLIKE"];

interface SwipeBody {
  targetId?: unknown;
  direction?: unknown;
}

/**
 * POST /api/swipe
 *
 * Body: { targetId: string, direction: "LIKE" | "PASS" | "SUPERLIKE" }
 * Records the swipe and, on a mutual like, returns the freshly created match
 * (including the 48-hour first-move window) for the MatchModal.
 */
export async function POST(request: Request) {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  let body: SwipeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const { targetId, direction } = body;

  if (typeof targetId !== "string" || !targetId) {
    return NextResponse.json({ error: "targetId gerekli." }, { status: 400 });
  }
  if (
    typeof direction !== "string" ||
    !VALID_DIRECTIONS.includes(direction as SwipeDirection)
  ) {
    return NextResponse.json(
      { error: "Geçersiz swipe yönü." },
      { status: 400 },
    );
  }

  try {
    const result = await recordSwipe(
      viewer,
      targetId,
      direction as SwipeDirection,
    );
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Swipe kaydedilemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
