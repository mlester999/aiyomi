import type { MetadataRoute } from "next";
import { brandConfig } from "@aiyomi/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${brandConfig.siteUrl}/sitemap.xml`,
  };
}
