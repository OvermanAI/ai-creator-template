import { getPayload } from 'payload'
import configPromise from '../payload.config'
import { seedCourses } from '../payload/seed-data'

async function seed() {
  const payload = await getPayload({ config: configPromise })

  console.log('Seeding courses...')

  const existing = await payload.find({ collection: 'courses', limit: 1 })
  if (existing.docs.length > 0) {
    console.log('Courses already seeded, skipping...')
  } else {
    for (const course of seedCourses) {
      await payload.create({ collection: 'courses', data: course })
      console.log(`  ✅ ${course.title}`)
    }
  }

  console.log('Seeding site settings...')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      brandName: 'YOUR_SITE.tw',
      tagline: '你的品牌標語（一句話說清楚你幫誰做什麼）',
      navigation: [
        { label: '課程', href: '/courses' },
        { label: '定價', href: '/pricing' },
        { label: '部落格', href: '/blog' },
      ],
    },
  })

  console.log('✅ Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
