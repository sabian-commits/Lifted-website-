import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lifted · See · Grow · Multiply",
    short_name: "Lifted",
    description:
      "First Impressions Ministry platform for Lifted Church. People stay where they can grow.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f2",
    theme_color: "#1c6b4c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
