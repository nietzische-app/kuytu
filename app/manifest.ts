import type { MetadataRoute } from "next";

/**
 * PWA manifest (served at /manifest.webmanifest).
 * Standalone display + dark theming for an installed, app-like experience.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kuytu",
    short_name: "Kuytu",
    description:
      "Olgun yetişkinler için zarif, güvenilir bir tanışma deneyimi.",
    start_url: "/discover",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B0B0E",
    theme_color: "#0B0B0E",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
