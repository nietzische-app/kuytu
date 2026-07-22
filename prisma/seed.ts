import { PrismaClient, type Gender, type Prisma } from "@prisma/client";
import { mockProfiles } from "../lib/mockData";
import {
  labelToGender,
  labelToKidsStatus,
  niyetToIntention,
} from "../lib/mappers";

const prisma = new PrismaClient();

/** The demo "current user" the API resolves to until real auth exists. */
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

function targetOf(gender: Gender): Gender {
  return gender === "FEMALE" ? "MALE" : "FEMALE";
}

async function main() {
  // Clean slate (respect FK order).
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.user.deleteMany();

  // The demo viewer — a woman looking for men, so she discovers the seeded men.
  const demo = await prisma.user.create({
    data: {
      email: DEMO_USER_EMAIL,
      name: "Deniz",
      age: 44,
      gender: "FEMALE",
      targetGender: "MALE",
      bio: "Kuytu demo hesabı.",
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
        { prompt: "Beni mutlu eden", answer: "İyi bir sohbet ve deniz." },
      ],
    },
  });

  // Seed every mock profile as a real user.
  const created = [];
  for (const p of mockProfiles) {
    const meta = seedMeta[p.id];
    if (!meta) continue;
    const gender = labelToGender[p.gender];
    const prompts = p.prompts as unknown as Prisma.InputJsonValue;

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
        prompts,
      },
    });
    created.push(user);
  }

  // Give the demo a guaranteed match: Murat has already liked her, so her
  // first LIKE on him mints a Match (with the 48h window) immediately.
  const murat = created.find((u) => u.email === "murat@kuytu.app");
  if (murat) {
    await prisma.swipe.create({
      data: { swiperId: murat.id, targetId: demo.id, direction: "LIKE" },
    });
  }

  console.log(
    `Seeded ${created.length + 1} users (demo: ${demo.email}) and 1 pending like.`,
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
