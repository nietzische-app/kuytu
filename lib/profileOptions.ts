/** Option sets and icebreaker questions for onboarding + the profile editor. */

export const SMOKING_OPTIONS = [
  "Kullanmıyorum",
  "Sosyal İçici",
  "Kullanıyorum",
] as const;

export const ALCOHOL_OPTIONS = [
  "Kullanmıyorum",
  "Sosyal İçici",
  "Özel Günlerde",
] as const;

export const PETS_OPTIONS = [
  "Kedi Sahibi",
  "Köpek Sahibi",
  "Evcil Hayvanı Yok",
  "Hayvanları Çok Sever",
] as const;

export const EDUCATION_OPTIONS = [
  "Lise",
  "Ön Lisans",
  "Lisans",
  "Yüksek Lisans",
  "Doktora",
] as const;

export const ZODIAC_SIGNS = [
  "Koç",
  "Boğa",
  "İkizler",
  "Yengeç",
  "Aslan",
  "Başak",
  "Terazi",
  "Akrep",
  "Yay",
  "Oğlak",
  "Kova",
  "Balık",
] as const;

export interface IcebreakerQuestion {
  id: string;
  text: string;
}

/** Prompt questions users can pick and answer (max 3). */
export const ICEBREAKER_QUESTIONS: IcebreakerQuestion[] = [
  { id: "ideal-sunday", text: "İdeal bir Pazar sabahım..." },
  { id: "no-compromise", text: "İlişkide asla kompromis yapamayacağım şey..." },
  { id: "daily-ritual", text: "En çok keyif aldığım günlük ritüelim..." },
  { id: "explore-together", text: "Birlikte keşfetmek istediğim şey..." },
  { id: "makes-me-laugh", text: "Beni en çok güldüren şey..." },
  { id: "weekend-plan", text: "Kusursuz bir hafta sonu planım..." },
];

export const MAX_PROMPTS = 3;

/** Looks up a question's text by id (falls back to a stored text). */
export function questionTextById(id: string, fallback = ""): string {
  return ICEBREAKER_QUESTIONS.find((q) => q.id === id)?.text ?? fallback;
}
