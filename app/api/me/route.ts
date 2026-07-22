import { NextResponse } from "next/server";
import { getCurrentUser, getDemoAccounts } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genderToLabel, intentionToNiyet, niyetToIntention } from "@/lib/mappers";
import type { MeProfile, Niyet } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NIYET_VALUES: Niyet[] = [
  "Ciddi İlişki",
  "Uzun Vadeli",
  "Arkadaşlık",
  "Henüz Emin Değilim",
];

function toMeProfile(user: {
  id: string;
  name: string;
  age: number;
  gender: "FEMALE" | "MALE";
  bio: string;
  photos: string[];
  intention: keyof typeof intentionToNiyet;
  isVerified: boolean;
  city: string | null;
}): MeProfile {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
    gender: genderToLabel[user.gender],
    bio: user.bio,
    photos: user.photos,
    intention: intentionToNiyet[user.intention],
    verified: user.isVerified,
    city: user.city,
  };
}

/** GET /api/me — the current user's profile plus switchable demo accounts. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }
  const accounts = await getDemoAccounts(user.id);
  return NextResponse.json({ me: toMeProfile(user), accounts });
}

interface PatchBody {
  bio?: unknown;
  intention?: unknown;
  photos?: unknown;
}

/** PATCH /api/me — update bio, intention (Niyet) and/or photos. */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const data: {
    bio?: string;
    intention?: keyof typeof intentionToNiyet;
    photos?: string[];
  } = {};

  if (body.bio !== undefined) {
    if (typeof body.bio !== "string") {
      return NextResponse.json({ error: "Geçersiz bio." }, { status: 400 });
    }
    data.bio = body.bio.slice(0, 500);
  }

  if (body.intention !== undefined) {
    if (!NIYET_VALUES.includes(body.intention as Niyet)) {
      return NextResponse.json({ error: "Geçersiz niyet." }, { status: 400 });
    }
    data.intention = niyetToIntention[body.intention as Niyet];
  }

  if (body.photos !== undefined) {
    if (
      !Array.isArray(body.photos) ||
      body.photos.some((p) => typeof p !== "string")
    ) {
      return NextResponse.json({ error: "Geçersiz fotoğraflar." }, { status: 400 });
    }
    data.photos = (body.photos as string[])
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ me: toMeProfile(updated) });
}
