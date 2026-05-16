import { SectionShell } from '@/components/SectionShell'
import { ButtonLink } from '@/components/ButtonLink'
import { NewsletterSignupSection } from '@/sections/NewsletterSignupSection/component'
import { getLessonBySlug } from '@/lib/queries'
import { seedLessons, seedHomePage } from '@/payload/seed-data'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const course = await getLessonBySlug(slug).catch(() => null)
  const fallback = seedLessons.find((c) => c.slug === slug)
  const title = (course as Record<string, unknown> | null)?.title ?? fallback?.title ?? slug
  return { title: String(title) }
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  const dbCourse = await getLessonBySlug(slug).catch(() => null)
  const course = dbCourse as Record<string, unknown> | null
    ?? (seedLessons.find((c) => c.slug === slug) as Record<string, unknown> | undefined)
    ?? null

  if (!course) notFound()

  const newsletterData = seedHomePage.blocks[2] as Parameters<typeof NewsletterSignupSection>[0]['data']
  const isPaid = course.accessLevel === 'paid'

  return (
    <>
      <SectionShell>
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-4">
            <span className="text-sm font-black uppercase text-[var(--color-text-muted)]">
              Level {String(course.upgradeLevel)}
            </span>
            <span className="text-sm font-bold">
              {course.accessLevel === 'free' ? '免費課程' : '付費課程'}
            </span>
          </div>
          <h1 className="text-[clamp(2rem,5vw,4rem)] font-black leading-[1.1] mb-6">
            {String(course.title)}
          </h1>
          {course.summary ? (
            <p className="text-xl text-[var(--color-text-muted)] mb-8">
              {String(course.summary)}
            </p>
          ) : null}

          {course.body ? (
            <div className="prose prose-lg max-w-none mb-12">
              <RichText data={course.body as Parameters<typeof RichText>[0]['data']} />
            </div>
          ) : null}

          {isPaid ? (
            <div className="nb-card p-8 bg-[var(--color-highlight)]">
              <p className="text-xl font-black mb-4">解鎖完整課程</p>
              <p className="text-[var(--color-text-muted)] mb-6">
                訂閱電子報，開放購買時第一時間通知你
              </p>
              <ButtonLink href="#newsletter" variant="black">
                加入候補名單
              </ButtonLink>
            </div>
          ) : null}
        </div>
      </SectionShell>

      <NewsletterSignupSection data={newsletterData} />
    </>
  )
}
