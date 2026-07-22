import { PrismaClient, type Gender, type Prisma, type User } from "@prisma/client";
import { mockProfiles } from "../lib/mockData";
import {
  labelToGender,
  labelToKidsStatus,
  niyetToIntention,
} from "../lib/mappers";
import { FIRST_MOVE_WINDOW_MS } from "../lib/constants";
import { computeCompletion } from "../lib/completion";

const prisma = new PrismaClient();

/** Deep-profile attributes per account, keyed by email. */
type DeepProfile = {
  jobTitle: string;
  education: string;
  height: number;
  zodiac: string;
  smoking: string;
  alcohol: string;
  pets: string;
};
const deepByEmail: Record<string, DeepProfile> = {
  "demo@kuytu.app": { jobTitle: "Mimarlık", education: "Yüksek Lisans", height: 168, zodiac: "Terazi", smoking: "Kullanmıyorum", alcohol: "Sosyal İçici", pets: "Kedi Sahibi" },
  "ahmet@kuytu.app": { jobTitle: "Öğretmen", education: "Lisans", height: 180, zodiac: "Başak", smoking: "Kullanmıyorum", alcohol: "Özel Günlerde", pets: "Köpek Sahibi" },
  "cem@kuytu.app": { jobTitle: "Müzisyen", education: "Lisans", height: 178, zodiac: "Yay", smoking: "Sosyal İçici", alcohol: "Sosyal İçici", pets: "Hayvanları Çok Sever" },
  "elif@kuytu.app": { jobTitle: "İç Mimar", education: "Lisans", height: 165, zodiac: "Kova", smoking: "Kullanmıyorum", alcohol: "Sosyal İçici", pets: "Kedi Sahibi" },
  "murat@kuytu.app": { jobTitle: "Doktor", education: "Doktora", height: 182, zodiac: "Oğlak", smoking: "Kullanmıyorum", alcohol: "Özel Günlerde", pets: "Köpek Sahibi" },
  "selin@kuytu.app": { jobTitle: "Yazar", education: "Yüksek Lisans", height: 170, zodiac: "Balık", smoking: "Sosyal İçici", alcohol: "Sosyal İçici", pets: "Hayvanları Çok Sever" },
  "kemal@kuytu.app": { jobTitle: "Şef", education: "Ön Lisans", height: 176, zodiac: "Boğa", smoking: "Kullanıyorum", alcohol: "Özel Günlerde", pets: "Evcil Hayvanı Yok" },
};

/** Female demo account — the API's default "current user". */
const DEMO_USER_EMAIL = "demo@kuytu.app";

/**
 * Per-mock-profile fields that don't exist on the display-only mock data:
 * a stable email and a real coordinate. Everyone is clustered around İstanbul
 * so the demo viewer (also in İstanbul) sees them within the default radius.
 */
const seedMeta: Record<
  string,
  { email: string; latitude: number; longitude: number }
> = {
  p1: { email: "elif@kuytu.app", latitude: 40.9903, longitude: 29.028 }, // Kadıköy
  p2: { email: "murat@kuytu.app", latitude: 41.0602, longitude: 28.9877 }, // Şişli
  p3: { email: "selin@kuytu.app", latitude: 41.0369, longitude: 28.985 }, // Beyoğlu
  p4: { email: "kemal@kuytu.app", latitude: 40.1885, longitude: 29.061 }, // Bursa
};

/** Extra men so the demo woman still has cards to discover after matching. */
const extraMen: Prisma.UserCreateInput[] = [
  {
    email: "ahmet@kuytu.app",
    name: "Ahmet",
    age: 46,
    gender: "MALE",
    targetGender: "FEMALE",
    bio: "Öğretmen. İyi kitap, iyi kahve, uzun sohbet.",
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80",
    ],
    isVerified: true,
    intention: "SERIOUS",
    kidsStatus: "HAS_KIDS",
    city: "Moda, İstanbul",
    latitude: 40.981,
    longitude: 29.026,
    interests: ["Kitap", "Bisiklet", "Tarih"],
    prompts: [
      { prompt: "Pazar sabahları", answer: "Sahilde bisiklet turu." },
    ] as unknown as Prisma.InputJsonValue,
  },
  {
    email: "cem@kuytu.app",
    name: "Cem",
    age: 40,
    gender: "MALE",
    targetGender: "FEMALE",
    bio: "Müzisyen. Sahne ve deniz insanı.",
    photos: [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80",
    ],
    isVerified: false,
    intention: "LONG_TERM",
    kidsStatus: "NO_KIDS",
    city: "Karaköy, İstanbul",
    latitude: 41.025,
    longitude: 28.978,
    interests: ["Müzik", "Yelken", "Kahve"],
    prompts: [
      { prompt: "Beni anlatan", answer: "Bir gitar ve açık deniz." },
    ] as unknown as Prisma.InputJsonValue,
  },
];

function targetOf(gender: Gender): Gender {
  return gender === "FEMALE" ? "MALE" : "FEMALE";
}

/** Stable pair ordering — mirrors lib/matching.ts. */
function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** Creates a mutual LIKE/LIKE pair of swipes between two users. */
async function mutualLike(a: string, b: string) {
  await prisma.swipe.createMany({
    data: [
      { swiperId: a, targetId: b, direction: "LIKE" },
      { swiperId: b, targetId: a, direction: "LIKE" },
    ],
    skipDuplicates: true,
  });
}

async function main() {
  // Clean slate (respect FK order).
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.user.deleteMany();

  // The female demo viewer — looking for men, so she discovers the seeded men.
  const demo = await prisma.user.create({
    data: {
      email: DEMO_USER_EMAIL,
      name: "Deniz",
      age: 44,
      gender: "FEMALE",
      targetGender: "MALE",
      bio: "Mimar. Denizi, iyi kahveyi ve dürüst sohbeti severim.",
      photos: [
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80",
      ],
      isVerified: true,
      intention: "SERIOUS",
      kidsStatus: "NO_KIDS",
      city: "Kadıköy, İstanbul",
      latitude: 40.9903,
      longitude: 29.028,
      interests: ["Sinema", "Yürüyüş", "Kahve"],
      prompts: [
        {
          questionId: "ideal-sunday",
          questionText: "İdeal bir Pazar sabahım...",
          answerText: "Sahilde uzun bir yürüyüş ve iyi bir kahve.",
        },
        {
          questionId: "daily-ritual",
          questionText: "En çok keyif aldığım günlük ritüelim...",
          answerText: "Akşam balkonda bir kitapla demlenmek.",
        },
      ],
      ...deepByEmail[DEMO_USER_EMAIL],
    },
  });

  // Seed every mock profile as a real user.
  const byEmail = new Map<string, User>();
  for (const p of mockProfiles) {
    const meta = seedMeta[p.id];
    if (!meta) continue;
    const gender = labelToGender[p.gender];
    const user = await prisma.user.create({
      data: {
        email: meta.email,
        name: p.name,
        age: p.age,
        gender,
        targetGender: targetOf(gender),
        bio: p.bio,
        photos: p.photos,
        isVerified: p.verified,
        intention: niyetToIntention[p.niyet],
        kidsStatus: labelToKidsStatus[p.cocukDurumu],
        city: p.location,
        latitude: meta.latitude,
        longitude: meta.longitude,
        interests: p.interests,
        prompts: p.prompts as unknown as Prisma.InputJsonValue,
        ...(deepByEmail[meta.email] ?? {}),
      },
    });
    byEmail.set(user.email, user);
  }

  for (const data of extraMen) {
    const user = await prisma.user.create({
      data: { ...data, ...(deepByEmail[data.email] ?? {}) },
    });
    byEmail.set(user.email, user);
  }

  const murat = byEmail.get("murat@kuytu.app")!;
  const kemal = byEmail.get("kemal@kuytu.app")!;
  const ahmet = byEmail.get("ahmet@kuytu.app")!;

  // 1) Pending like — Murat has liked Deniz but no match yet, so her first LIKE
  //    on him in /discover mints a Match live.
  await prisma.swipe.create({
    data: { swiperId: murat.id, targetId: demo.id, direction: "LIKE" },
  });

  // 2) New match awaiting first move — Kemal ↔ Deniz, no message yet. Drives the
  //    women-first rule: Deniz (female) may open; Kemal (male) must wait.
  await mutualLike(demo.id, kemal.id);
  {
    const [u1, u2] = orderPair(demo.id, kemal.id);
    await prisma.match.create({
      data: {
        user1Id: u1,
        user2Id: u2,
        // ~40h left on the 48h window.
        expiresAt: new Date(Date.now() + FIRST_MOVE_WINDOW_MS - 8 * 3600_000),
        isFirstMessageSent: false,
      },
    });
  }

  // 3) Active chat — Ahmet ↔ Deniz, first message already sent (by Deniz), with
  //    a short history. Ahmet's latest reply is unread by Deniz.
  await mutualLike(demo.id, ahmet.id);
  {
    const [u1, u2] = orderPair(demo.id, ahmet.id);
    const now = Date.now();
    const match = await prisma.match.create({
      data: {
        user1Id: u1,
        user2Id: u2,
        expiresAt: new Date(now + FIRST_MOVE_WINDOW_MS),
        isFirstMessageSent: true,
        // Deniz last read right after her own last message; Ahmet replied after.
        user1LastReadAt: u1 === demo.id ? new Date(now - 30 * 60_000) : null,
        user2LastReadAt: u2 === demo.id ? new Date(now - 30 * 60_000) : null,
      },
    });
    await prisma.message.createMany({
      data: [
        {
          matchId: match.id,
          senderId: demo.id,
          content: "Merhaba Ahmet, profilindeki kitap seçkisi çok iyiymiş.",
          createdAt: new Date(now - 60 * 60_000),
        },
        {
          matchId: match.id,
          senderId: ahmet.id,
          content: "Teşekkürler Deniz! En son ne okudun?",
          createdAt: new Date(now - 50 * 60_000),
        },
        {
          matchId: match.id,
          senderId: demo.id,
          content: "Şu an bir Sait Faik cildindeyim, çok iyi gidiyor.",
          createdAt: new Date(now - 40 * 60_000),
        },
        {
          matchId: match.id,
          senderId: ahmet.id,
          content: "Harika seçim. Cumartesi bir kahve içelim mi?",
          createdAt: new Date(now - 10 * 60_000), // after Deniz's last read
        },
      ],
    });
  }

  // Recompute "Profil Doluluk Oranı" for every seeded user.
  const all = await prisma.user.findMany();
  for (const u of all) {
    const prompts = Array.isArray(u.prompts)
      ? (u.prompts as { answerText?: string; answer?: string }[]).map((p) => ({
          answerText: p.answerText ?? p.answer ?? "",
        }))
      : [];
    await prisma.user.update({
      where: { id: u.id },
      data: {
        profileCompletion: computeCompletion({ ...u, prompts }),
      },
    });
  }

  const total = byEmail.size + 1;
  console.log(
    `Seeded ${total} users. Demo accounts: ${DEMO_USER_EMAIL} (Female), ` +
      `kemal@kuytu.app (Male, new match), ahmet@kuytu.app (Male, active chat).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
