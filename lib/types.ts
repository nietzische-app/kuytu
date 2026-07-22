/**
 * Shared domain types for Kuytu.
 * Kept framework-agnostic so they can be reused by future API/data layers.
 */

/** Relationship goal — "Niyet". */
export type Niyet =
  | "Ciddi İlişki" // Serious relationship
  | "Uzun Vadeli" // Long term
  | "Arkadaşlık" // Friendship
  | "Henüz Emin Değilim"; // Not sure yet

/** Kids status — "Çocuk Durumu". */
export type CocukDurumu =
  | "Çocuğum Yok" // No kids
  | "Çocuğum Var" // Has kids
  | "İstiyorum" // Wants kids
  | "İstemiyorum"; // Doesn't want kids

/** A short prompt-style bio entry, à la Bumble. */
export interface BioPrompt {
  prompt: string;
  answer: string;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  /** City / district shown under the name. */
  location: string;
  /** Distance in km from the current user. */
  distanceKm: number;
  /** Ordered photo URLs; the first is the hero image. */
  photos: string[];
  /** Gender is used to enforce the "women first move" rule after a match. */
  gender: "kadın" | "erkek";
  verified: boolean;
  niyet: Niyet;
  cocukDurumu: CocukDurumu;
  bio: string;
  prompts: BioPrompt[];
  /** Free-form interest tags. */
  interests: string[];
}

/** The direction a card was committed in. */
export type SwipeDirection = "left" | "right" | "up";

/** Maps a swipe gesture to a product action. */
export type SwipeAction = "pass" | "like" | "super";

export interface Match {
  id: string;
  profile: Profile;
  /** Epoch ms when the match was created — drives the 48h countdown. */
  matchedAt: number;
}
