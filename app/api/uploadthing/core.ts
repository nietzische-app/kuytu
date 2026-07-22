import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "@/lib/auth";

const f = createUploadthing();

/**
 * Kuytu's Uploadthing file router.
 *
 * `profileImage` accepts up to 6 images per batch, 4 MB each, image types only
 * (png / jpg / jpeg / webp). The middleware requires an authenticated user so
 * uploads are always attributable; persistence of the resulting URLs into the
 * user's `photos[]` is handled client-side via `PATCH /api/me`.
 */
export const ourFileRouter = {
  profileImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 6 },
  })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) {
        throw new UploadThingError("Yüklemek için oturum açmalısınız.");
      }
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Runs on the Uploadthing server after the file lands. The returned
      // object is delivered to the client's `onClientUploadComplete`.
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
