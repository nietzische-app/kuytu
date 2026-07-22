import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

/**
 * Typed Uploadthing React helpers bound to our file router. `useUploadThing`
 * drives the custom Photo Manager (hidden input + spinner) rather than the
 * default drop-zone UI.
 */
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
