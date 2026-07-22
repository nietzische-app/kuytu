import type { Profile } from "./types";

/**
 * Seed source data.
 *
 * The app no longer reads this at runtime — the discovery feed now comes from
 * the database via `GET /api/discover` (see `lib/discovery.ts`). This dataset
 * is consumed by `prisma/seed.ts` to populate that database.
 *
 * Photos use Unsplash portrait URLs (allow-listed in next.config.mjs).
 */
export const mockProfiles: Profile[] = [
  {
    id: "p1",
    name: "Elif",
    age: 42,
    location: "Kadıköy, İstanbul",
    distanceKm: 4,
    gender: "kadın",
    verified: true,
    niyet: "Ciddi İlişki",
    cocukDurumu: "Çocuğum Var",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80",
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=900&q=80",
    ],
    bio: "Mimar. İyi bir kahvenin ve uzun yürüyüşlerin peşinde.",
    prompts: [
      {
        prompt: "Beni en iyi anlatan şey",
        answer: "Pazar sabahları semt pazarında kaybolmak.",
      },
      {
        prompt: "Birlikte yapalım",
        answer: "Bir Ayvalık kaçamağı ve bol zeytinyağlı bir sofra.",
      },
    ],
    interests: ["Sanat", "Yoga", "Seyahat", "Şarap"],
  },
  {
    id: "p2",
    name: "Murat",
    age: 47,
    location: "Çankaya, Ankara",
    distanceKm: 9,
    gender: "erkek",
    verified: true,
    niyet: "Uzun Vadeli",
    cocukDurumu: "Çocuğum Yok",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
    ],
    bio: "Doktor, amatör gitarist. Hayatı sadeleştirmeyi seviyorum.",
    prompts: [
      {
        prompt: "Boş vaktimde",
        answer: "Plak koleksiyonumu genişletiyorum.",
      },
      {
        prompt: "Aradığım kişi",
        answer: "Sohbeti derin, kahkahası içten biri.",
      },
    ],
    interests: ["Müzik", "Kitap", "Doğa", "Sinema"],
  },
  {
    id: "p3",
    name: "Selin",
    age: 38,
    location: "Alsancak, İzmir",
    distanceKm: 2,
    gender: "kadın",
    verified: false,
    niyet: "Henüz Emin Değilim",
    cocukDurumu: "İstiyorum",
    photos: [
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=80",
    ],
    bio: "Yazar ve deniz tutkunu. Kelimelerle ve dalgalarla aram iyi.",
    prompts: [
      {
        prompt: "Kusursuz bir gün",
        answer: "Sabah yüzmek, akşam iyi bir kitapla balkonda.",
      },
      {
        prompt: "Zaafım",
        answer: "Eski İzmir sokakları ve boyoz.",
      },
    ],
    interests: ["Edebiyat", "Yüzme", "Fotoğraf", "Kedi"],
  },
  {
    id: "p4",
    name: "Kemal",
    age: 51,
    location: "Nilüfer, Bursa",
    distanceKm: 14,
    gender: "erkek",
    verified: true,
    niyet: "Ciddi İlişki",
    cocukDurumu: "Çocuğum Var",
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=900&q=80",
    ],
    bio: "Şef. Sofrayı paylaşmayı hayatın en güzel yanı sayarım.",
    prompts: [
      {
        prompt: "En iyi yaptığım şey",
        answer: "Odun ateşinde mangal ve uzun akşam yemekleri.",
      },
      {
        prompt: "Hayalim",
        answer: "Ege'de küçük bir taş ev ve bir bağ.",
      },
    ],
    interests: ["Yemek", "Bağcılık", "Tarih", "Yürüyüş"],
  },
];
