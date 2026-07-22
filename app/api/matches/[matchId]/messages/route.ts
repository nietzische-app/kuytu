import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  FIRST_MOVE_LOCK_REASON,
  getConversation,
  sendMessage,
} from "@/lib/messaging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: { matchId: string };
}

/**
 * GET /api/matches/[matchId]/messages
 *
 * Full conversation for the chat screen: the other profile, message history,
 * the first-move state, and whether the viewer may send (women-first rule).
 * Also marks the conversation read for the viewer.
 */
export async function GET(_request: Request, { params }: RouteContext) {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  const conversation = await getConversation(viewer, params.matchId);
  if (!conversation) {
    return NextResponse.json({ error: "Sohbet bulunamadı." }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

/**
 * POST /api/matches/[matchId]/messages
 *
 * Body: { content: string }. Sends a message; the opening message flips
 * `isFirstMessageSent`. Men are blocked (403) from opening a conversation.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const viewer = await getCurrentUser();
  if (!viewer) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  let content: unknown;
  try {
    ({ content } = await request.json());
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (typeof content !== "string") {
    return NextResponse.json({ error: "content gerekli." }, { status: 400 });
  }

  try {
    const message = await sendMessage(viewer, params.matchId, content);
    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mesaj gönderilemedi.";
    // The women-first block is an authorization failure, not a bad request.
    const status = message === FIRST_MOVE_LOCK_REASON ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
