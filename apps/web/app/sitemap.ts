import type { MetadataRoute } from "next";
import { brandConfig } from "@aiyomi/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: brandConfig.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
