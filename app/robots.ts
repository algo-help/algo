import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/',
      },
    ],
    sitemap: '', // 사이트맵 제공하지 않음
  }
}