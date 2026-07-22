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

/** A short prompt-style bio entry, à la Bumble (display shape for cards). */
export interface BioPrompt {
  prompt: string;
  answer: string;
}

/** A stored icebreaker prompt Q&A (editing shape). */
export interface ProfilePrompt {
  questionId: string;
  questionText: string;
  answerText: string;
}

/** Optional lifestyle attributes shown as chips. */
export interface Lifestyle {
  jobTitle: string | null;
  education: string | null;
  height: number | null;
  zodiac: string | null;
  smoking: string | null;
  alcohol: string | null;
  pets: string | null;
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
  /** Optional lifestyle attributes for the card. */
  lifestyle: Lifestyle;
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

/** A single chat message, timestamps as epoch ms for easy client use. */
export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: number;
}

/** One row in the matches / conversations list. */
export interface MatchSummary {
  matchId: string;
  /** The *other* participant. */
  profile: Profile;
  matchedAt: number;
  /** Epoch ms deadline for the first move (matchedAt + 48h). */
  expiresAt: number;
  isFirstMessageSent: boolean;
  /** Present once the conversation has any messages. */
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

/** The two buckets the matches list is grouped into. */
export interface GroupedMatches {
  /** "Yeni Eşleşmeler" — matched, no first message yet. */
  newMatches: MatchSummary[];
  /** "Sohbetler" — conversation started. */
  conversations: MatchSummary[];
}

/** Everything the chat screen needs to render and gate the composer. */
export interface Conversation {
  matchId: string;
  /** The current viewer's id — used to align message bubbles. */
  viewerId: string;
  /** The other participant's profile. */
  profile: Profile;
  isFirstMessageSent: boolean;
  expiresAt: number;
  messages: ChatMessage[];
  /** Whether the viewer may send right now (women-first rule). */
  canSend: boolean;
  /** Turkish explanation shown when `canSend` is false. */
  lockReason: string | null;
}

/** The current user's own editable profile. */
export interface MeProfile {
  id: string;
  name: string;
  age: number;
  gender: "kadın" | "erkek";
  targetGender: "kadın" | "erkek";
  bio: string;
  photos: string[];
  /** Niyet, as the Turkish label, for the editor's select. */
  intention: Niyet;
  verified: boolean;
  city: string | null;
  /** Deep-profile lifestyle attributes (any may be null). */
  jobTitle: string | null;
  education: string | null;
  height: number | null;
  zodiac: string | null;
  smoking: string | null;
  alcohol: string | null;
  pets: string | null;
  /** Icebreaker prompts (≤ 3). */
  prompts: ProfilePrompt[];
  /** "Profil Doluluk Oranı" (0–100). */
  profileCompletion: number;
}

/** A switchable demo identity for the MVP profile switcher. */
export interface DemoAccount {
  id: string;
  name: string;
  gender: "kadın" | "erkek";
  photo: string | null;
  /** True if this is the currently active identity. */
  active: boolean;
}
