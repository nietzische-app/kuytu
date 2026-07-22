import { MAX_PROMPTS } from "./profileOptions";

/** The fields that feed the "Profil Doluluk Oranı" meter. */
export interface CompletionInput {
  photos?: string[] | null;
  bio?: string | null;
  jobTitle?: string | null;
  education?: string | null;
  height?: number | null;
  zodiac?: string | null;
  smoking?: string | null;
  alcohol?: string | null;
  pets?: string | null;
  interests?: string[] | null;
  prompts?: { answerText?: string }[] | null;
}

/** Base score for having completed the mandatory onboarding step. */
export const BASE_COMPLETION = 40;

const has = (v: unknown) =>
  typeof v === "string" ? v.trim().length > 0 : v != null;

/**
 * Computes "Profil Doluluk Oranı" (0–100). The mandatory core is worth 40;
 * optional deep-profile fields fill the remaining 60. Recomputed on every write.
 */
export function computeCompletion(u: CompletionInput): number {
  let score = BASE_COMPLETION;

  if ((u.photos?.length ?? 0) > 0) score += 12;
  if (has(u.bio)) score += 8;
  if (has(u.jobTitle)) score += 5;
  if (has(u.education)) score += 5;
  if (has(u.height)) score += 5;
  if (has(u.zodiac)) score += 4;
  if (has(u.smoking)) score += 4;
  if (has(u.alcohol)) score += 4;
  if (has(u.pets)) score += 4;
  if ((u.interests?.length ?? 0) > 0) score += 3;

  const answered = (u.prompts ?? []).filter((p) => has(p?.answerText)).length;
  score += Math.min(answered, MAX_PROMPTS) * 2;

  return Math.max(BASE_COMPLETION, Math.min(100, Math.round(score)));
}

/** Short Turkish tips for the next things to fill in (to reach 100%). */
export function completionTips(u: CompletionInput): string[] {
  const tips: string[] = [];
  if ((u.photos?.length ?? 0) < 2) tips.push("Daha fazla fotoğraf ekle");
  if (!has(u.bio)) tips.push("Kısa bir biyografi yaz");
  if (!has(u.jobTitle)) tips.push("Mesleğini ekle");
  if (!has(u.education)) tips.push("Eğitim bilgini ekle");
  if (!has(u.height)) tips.push("Boyunu ekle");
  const anyLifestyle =
    has(u.smoking) || has(u.alcohol) || has(u.pets) || has(u.zodiac);
  if (!anyLifestyle) tips.push("Yaşam tarzı rozetlerini seç");
  const answered = (u.prompts ?? []).filter((p) => has(p?.answerText)).length;
  if (answered < MAX_PROMPTS) tips.push("Buz kırıcı sorularını yanıtla");
  return tips.slice(0, 3);
}
