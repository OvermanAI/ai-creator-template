import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function bootstrap() {
  const payload = await getPayload({ config: configPromise })

  console.log('Checking for existing admin user...')
  const existing = await payload.find({ collection: 'users', limit: 1 })

  if (existing.docs.length > 0) {
    console.log('Admin user already exists, skipping...')
    process.exit(0)
  }

  console.log('Creating admin user...')
  await payload.create({
    collection: 'users',
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@your-site.tw',
      password: process.env.ADMIN_PASSWORD || 'changeme123',
      name: 'Admin',
    },
  })

  console.log('✅ Admin user created.')
  process.exit(0)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
