import { MetadataRoute } from 'next'
import { appConfig } from "@/lib/appConfig";

// 强制静态生成
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = appConfig.baseUrl

  const routes = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/new`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0
    }
  ]

  return routes
}
