import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gambit — Offline Chess Puzzles",
    short_name: "Gambit",
    description: "Download chess puzzle packs and solve offline.",
    start_url: "/",
    display: "standalone",
    background_color: "#eaf7fb",
    theme_color: "#0f172a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/gambit-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/gambit-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/gambit-icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}