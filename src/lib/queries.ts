import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function getPayloadClient() {
  return getPayload({ config: configPromise })
}

async function withDatabaseFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.warn('[DB Fallback]', err)
    return fallback
  }
}


export const getPosts = unstable_cache(
  async (limit = 20) => {
    return withDatabaseFallback(async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'posts',
        where: { status: { equals: 'published' } },
        sort: '-publishedAt',
        limit,
      })
      return result.docs
    }, [])
  },
  ['posts'],
  { revalidate: 300 },
)

export const getPostBySlug = unstable_cache(
  async (slug: string) => {
    return withDatabaseFallback(async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'posts',
        where: { slug: { equals: slug }, status: { equals: 'published' } },
        limit: 1,
      })
      return result.docs[0] || null
    }, null)
  },
  ['post-by-slug'],
  { revalidate: 300 },
)

export const getLessons = unstable_cache(
  async (category?: 'build' | 'sell') => {
    return withDatabaseFallback(async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'lessons',
        ...(category ? { where: { category: { equals: category } } } : {}),
        sort: 'order',
        limit: 100,
      })
      return result.docs
    }, [])
  },
  ['lessons'],
  { revalidate: 300 },
)

export const getLessonBySlug = unstable_cache(
  async (slug: string) => {
    return withDatabaseFallback(async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'lessons',
        where: { slug: { equals: slug } },
        limit: 1,
      })
      return result.docs[0] || null
    }, null)
  },
  ['lesson-by-slug'],
  { revalidate: 300 },
)

export const getStudentByEmail = unstable_cache(
  async (email: string) => {
    return withDatabaseFallback(async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'students',
        where: { email: { equals: email } },
        limit: 1,
      })
      return result.docs[0] || null
    }, null)
  },
  ['student-by-email'],
  { revalidate: 60 },
)

export const getSiteSettings = unstable_cache(
  async () => {
    return withDatabaseFallback(async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({ slug: 'site-settings' })
    }, null)
  },
  ['site-settings'],
  { revalidate: 300 },
)
