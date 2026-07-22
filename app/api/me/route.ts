import { NextResponse } from "next/server";
import type { Prisma, User } from "@prisma/client";
import { getCurrentUser, getDemoAccounts } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  genderToLabel,
  intentionToNiyet,
  labelToGender,
  niyetToIntention,
} from "@/lib/mappers";
import { computeCompletion } from "@/lib/completion";
import {
  ALCOHOL_OPTIONS,
  EDUCATION_OPTIONS,
  MAX_PROMPTS,
  PETS_OPTIONS,
  SMOKING_OPTIONS,
  ZODIAC_SIGNS,
  questionTextById,
} from "@/lib/profileOptions";
import type { MeProfile, Niyet, ProfilePrompt } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NIYET_VALUES: Niyet[] = [
  "Ciddi İlişki",
  "Uzun Vadeli",
  "Arkadaşlık",
  "Henüz Emin Değilim",
];

const GENDER_LABELS = ["kadın", "erkek"] as const;

/** Parses stored prompt JSON into the structured editing shape. */
function parseProfilePrompts(value: unknown): ProfilePrompt[] {
  if (!Array.isArray(value)) return [];
  const out: ProfilePrompt[] = [];
  for (const p of value) {
    if (!p || typeof p !== "object") continue;
    const rec = p as Record<string, unknown>;
    const questionId =
      typeof rec.questionId === "string" ? rec.questionId : "custom";
    const questionText =
      typeof rec.questionText === "string"
        ? rec.questionText
        : typeof rec.prompt === "string"
          ? (rec.prompt as string)
          : questionTextById(questionId);
    const answerText =
      typeof rec.answerText === "string"
        ? rec.answerText
        : typeof rec.answer === "string"
          ? (rec.answer as string)
          : "";
    if (answerText.trim()) out.push({ questionId, questionText, answerText });
  }
  return out.slice(0, MAX_PROMPTS);
}

function toMeProfile(user: User): MeProfile {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
    gender: genderToLabel[user.gender],
    targetGender: genderToLabel[user.targetGender],
    bio: user.bio,
    photos: user.photos,
    intention: intentionToNiyet[user.intention],
    verified: user.isVerified,
    city: user.city,
    jobTitle: user.jobTitle,
    education: user.education,
    height: user.height,
    zodiac: user.zodiac,
    smoking: user.smoking,
    alcohol: user.alcohol,
    pets: user.pets,
    prompts: parseProfilePrompts(user.prompts),
    profileCompletion: user.profileCompletion,
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

/** Validates a nullable enum-ish string against an allow-list (or clears it). */
function optionalEnum(
  value: unknown,
  allowed: readonly string[],
): { ok: true; value: string | null } | { ok: false } {
  if (value === null || value === "") return { ok: true, value: null };
  if (typeof value === "string" && allowed.includes(value)) {
    return { ok: true, value };
  }
  return { ok: false };
}

/**
 * PATCH /api/me — updates any subset of the profile (core + deep) and
 * recomputes `profileCompletion`. Used by both onboarding and the editor.
 */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const bad = (msg: string) =>
    NextResponse.json({ error: msg }, { status: 400 });

  const data: Prisma.UserUpdateInput = {};

  // ---- Core fields ----
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim())
      return bad("Geçersiz isim.");
    data.name = body.name.trim().slice(0, 60);
  }
  if (body.age !== undefined) {
    const age = Number(body.age);
    if (!Number.isInteger(age) || age < 18 || age > 99)
      return bad("Geçersiz yaş.");
    data.age = age;
  }
  if (body.gender !== undefined) {
    if (!GENDER_LABELS.includes(body.gender as (typeof GENDER_LABELS)[number]))
      return bad("Geçersiz cinsiyet.");
    data.gender = labelToGender[body.gender as "kadın" | "erkek"];
  }
  if (body.targetGender !== undefined) {
    if (
      !GENDER_LABELS.includes(body.targetGender as (typeof GENDER_LABELS)[number])
    )
      return bad("Geçersiz tercih.");
    data.targetGender = labelToGender[body.targetGender as "kadın" | "erkek"];
  }
  if (body.intention !== undefined) {
    if (!NIYET_VALUES.includes(body.intention as Niyet))
      return bad("Geçersiz niyet.");
    data.intention = niyetToIntention[body.intention as Niyet];
  }
  if (body.bio !== undefined) {
    if (typeof body.bio !== "string") return bad("Geçersiz bio.");
    data.bio = body.bio.slice(0, 500);
  }
  if (body.photos !== undefined) {
    if (
      !Array.isArray(body.photos) ||
      body.photos.some((p) => typeof p !== "string")
    )
      return bad("Geçersiz fotoğraflar.");
    data.photos = (body.photos as string[])
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  // ---- Deep profile: free text ----
  if (body.jobTitle !== undefined) {
    if (body.jobTitle !== null && typeof body.jobTitle !== "string")
      return bad("Geçersiz meslek.");
    data.jobTitle = body.jobTitle
      ? (body.jobTitle as string).trim().slice(0, 80) || null
      : null;
  }
  if (body.height !== undefined) {
    if (body.height === null || body.height === "") {
      data.height = null;
    } else {
      const h = Number(body.height);
      if (!Number.isInteger(h) || h < 120 || h > 230)
        return bad("Geçersiz boy.");
      data.height = h;
    }
  }

  // ---- Deep profile: enum-ish ----
  const enums: [string, readonly string[], keyof Prisma.UserUpdateInput][] = [
    ["education", EDUCATION_OPTIONS, "education"],
    ["zodiac", ZODIAC_SIGNS, "zodiac"],
    ["smoking", SMOKING_OPTIONS, "smoking"],
    ["alcohol", ALCOHOL_OPTIONS, "alcohol"],
    ["pets", PETS_OPTIONS, "pets"],
  ];
  for (const [key, allowed, field] of enums) {
    if (body[key] === undefined) continue;
    const res = optionalEnum(body[key], allowed);
    if (!res.ok) return bad(`Geçersiz ${key}.`);
    (data as Record<string, unknown>)[field] = res.value;
  }

  // ---- Prompts ----
  if (body.prompts !== undefined) {
    if (!Array.isArray(body.prompts)) return bad("Geçersiz sorular.");
    const prompts: ProfilePrompt[] = [];
    for (const p of body.prompts as unknown[]) {
      if (!p || typeof p !== "object") continue;
      const rec = p as Record<string, unknown>;
      const questionId =
        typeof rec.questionId === "string" ? rec.questionId : "custom";
      const answerText =
        typeof rec.answerText === "string" ? rec.answerText.trim() : "";
      const questionText =
        typeof rec.questionText === "string" && rec.questionText
          ? rec.questionText
          : questionTextById(questionId);
      if (answerText)
        prompts.push({
          questionId,
          questionText,
          answerText: answerText.slice(0, 300),
        });
    }
    data.prompts = prompts.slice(0, MAX_PROMPTS) as unknown as Prisma.InputJsonValue;
  }

  // ---- Recompute completion from the merged state ----
  const merged = { ...user, ...(data as Partial<User>) };
  const promptsForScore = (
    (data.prompts as unknown as ProfilePrompt[] | undefined) ??
    parseProfilePrompts(user.prompts)
  ).map((p) => ({ answerText: p.answerText }));
  data.profileCompletion = computeCompletion({
    photos: merged.photos,
    bio: merged.bio,
    jobTitle: merged.jobTitle,
    education: merged.education,
    height: merged.height,
    zodiac: merged.zodiac,
    smoking: merged.smoking,
    alcohol: merged.alcohol,
    pets: merged.pets,
    interests: merged.interests,
    prompts: promptsForScore,
  });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });
  return NextResponse.json({ me: toMeProfile(updated) });
}
