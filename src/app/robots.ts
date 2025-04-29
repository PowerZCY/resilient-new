import { appConfig } from "@/lib/appConfig";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    sitemap: `${appConfig.baseUrl}/sitemap.xml`,
  };
}