import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "./prisma";

/** Cookie that pins the demo viewer; set it to impersonate a seeded user. */
export const DEMO_USER_COOKIE = "kuytu_uid";

const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL ?? "demo@kuytu.app";

/**
 * Resolves "the current user" for the MVP.
 *
 * TODO(auth): replace with a real session (NextAuth / Lucia / custom JWT).
 * Resolution order:
 *   1. `kuytu_uid` cookie (an explicit user id) — lets us demo any account.
 *   2. The seeded demo account (`DEMO_USER_EMAIL`).
 *   3. The first user in the database, so the app is never empty in dev.
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieUserId = cookies().get(DEMO_USER_COOKIE)?.value;

  if (cookieUserId) {
    const byCookie = await prisma.user.findUnique({
      where: { id: cookieUserId },
    });
    if (byCookie) return byCookie;
  }

  const byEmail = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });
  if (byEmail) return byEmail;

  return prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
}
