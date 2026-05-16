import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Posts } from './collections/Posts'
import { Pages } from './collections/Pages'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { Students } from './collections/Students'
import { Purchases } from './collections/Purchases'
import { Subscriptions } from './collections/Subscriptions'
import { Lessons } from './collections/Lessons'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isProd = process.env.PAYLOAD_DATABASE_PROVIDER === 'postgres'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Posts,
    Pages,
    NewsletterSubscribers,
    Students,
    Lessons,
    Purchases,
    Subscriptions,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: isProd
    ? postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URL || '',
        },
        push: process.env.PAYLOAD_DATABASE_PUSH !== 'false',
      })
    : sqliteAdapter({
        client: {
          url: `file:${process.env.PAYLOAD_DATABASE_PATH || './creator-dev.db'}`,
        },
        push: true,
      }),
  upload: {
    limits: {
      fileSize: 5000000,
    },
  },
})
