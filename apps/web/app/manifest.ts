import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aiyomi",
    short_name: "Aiyomi",
    description: "Your AI companion for better days.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7ee",
    theme_color: "#2f7f73",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
