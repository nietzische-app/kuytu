import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_USER_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/switch — MVP identity switch.
 *
 * Body: { userId: string }. Sets the `kuytu_uid` cookie so the app treats that
 * seeded user as the current viewer. This exists purely to test the
 * women-first flow from both a female and a male account.
 * TODO(auth): remove once real authentication lands.
 */
export async function POST(request: Request) {
  let userId: unknown;
  try {
    ({ userId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ error: "userId gerekli." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name },
  });
  res.cookies.set(DEMO_USER_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
