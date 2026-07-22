import type {
  Gender,
  Intention,
  KidsStatus,
  SwipeDirection,
} from "@prisma/client";
import type {
  BioPrompt,
  CocukDurumu,
  Niyet,
  Profile,
  SwipeAction,
} from "./types";

/**
 * Translation layer between the database's ASCII enums and the Turkish,
 * user-facing labels used throughout the UI. Keeping this in one place means
 * the schema stays locale-neutral while the frontend stays fully Turkish.
 */

export const intentionToNiyet: Record<Intention, Niyet> = {
  SERIOUS: "Ciddi İlişki",
  LONG_TERM: "Uzun Vadeli",
  FRIENDSHIP: "Arkadaşlık",
  UNSURE: "Henüz Emin Değilim",
};

export const kidsStatusToLabel: Record<KidsStatus, CocukDurumu> = {
  NO_KIDS: "Çocuğum Yok",
  HAS_KIDS: "Çocuğum Var",
  WANTS_KIDS: "İstiyorum",
  NO_WANT_KIDS: "İstemiyorum",
};

export const genderToLabel: Record<Gender, "kadın" | "erkek"> = {
  FEMALE: "kadın",
  MALE: "erkek",
};

/** Reverse maps — handy for seeding from the original Turkish mock data. */
export const niyetToIntention: Record<Niyet, Intention> = {
  "Ciddi İlişki": "SERIOUS",
  "Uzun Vadeli": "LONG_TERM",
  Arkadaşlık: "FRIENDSHIP",
  "Henüz Emin Değilim": "UNSURE",
};

export const labelToKidsStatus: Record<CocukDurumu, KidsStatus> = {
  "Çocuğum Yok": "NO_KIDS",
  "Çocuğum Var": "HAS_KIDS",
  İstiyorum: "WANTS_KIDS",
  İstemiyorum: "NO_WANT_KIDS",
};

export const labelToGender: Record<"kadın" | "erkek", Gender> = {
  kadın: "FEMALE",
  erkek: "MALE",
};

/** Maps the frontend swipe action to the persisted enum. */
export const actionToDirection: Record<SwipeAction, SwipeDirection> = {
  pass: "PASS",
  like: "LIKE",
  super: "SUPERLIKE",
};

/** The minimal user shape this mapper needs (a Prisma User row). */
export interface UserRow {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  bio: string;
  photos: string[];
  isVerified: boolean;
  intention: Intention;
  kidsStatus: KidsStatus;
  city: string | null;
  latitude: number;
  longitude: number;
  interests: string[];
  prompts: unknown;
}

function parsePrompts(value: unknown): BioPrompt[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (p): p is BioPrompt =>
      typeof p === "object" &&
      p !== null &&
      typeof (p as BioPrompt).prompt === "string" &&
      typeof (p as BioPrompt).answer === "string",
  );
}

/**
 * Projects a database user into the `Profile` shape the discovery card renders.
 * `distanceKm` is supplied by the caller since it depends on the viewer.
 */
export function toProfile(user: UserRow, distanceKm: number): Profile {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
    location: user.city ?? "Yakınında",
    distanceKm,
    photos: user.photos,
    gender: genderToLabel[user.gender],
    verified: user.isVerified,
    niyet: intentionToNiyet[user.intention],
    cocukDurumu: kidsStatusToLabel[user.kidsStatus],
    bio: user.bio,
    prompts: parsePrompts(user.prompts),
    interests: user.interests,
  };
}
