import type { MetadataRoute } from 'next'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://your-site.tw'

  const staticPages = ['/', '/courses', '/pricing', '/blog', '/auth/login'].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1 : 0.8,
  }))

  return staticPages
}
