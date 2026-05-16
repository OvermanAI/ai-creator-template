import Link from 'next/link'
import { PageHeroSection } from '@/sections/PageHeroSection/component'
import { NewsletterSignupSection } from '@/sections/NewsletterSignupSection/component'
import { SectionShell } from '@/components/SectionShell'
import { getLessons } from '@/lib/queries'
import { seedLessons, seedHomePage } from '@/payload/seed-data'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '課程',
}

const levelColor: Record<string, string> = {
  '1': 'var(--color-l1)',
  '2': 'var(--color-l2)',
  '3': 'var(--color-l3)',
}

const levelLabel: Record<string, string> = {
  '1': 'Level 1 — AI 創作力',
  '2': 'Level 2 — 開課賺錢',
  '3': 'Level 3 — 升級 OPC',
}

export default async function CoursesPage() {
  const dbLessons = await getLessons().catch(() => [])
  const courses = dbLessons.length > 0
    ? (dbLessons as Record<string, unknown>[]).map((c) => ({
        id: String(c.id),
        title: String(c.title),
        slug: String(c.slug),
        summary: c.summary ? String(c.summary) : undefined,
        upgradeLevel: String(c.upgradeLevel) as '1' | '2' | '3',
        accessLevel: String(c.accessLevel) as 'free' | 'paid',
      }))
    : seedLessons.map((c) => ({
        id: c.slug,
        title: c.title,
        slug: c.slug,
        summary: c.summary,
        upgradeLevel: c.upgradeLevel as '1' | '2' | '3',
        accessLevel: c.accessLevel as 'free' | 'paid',
      }))

  const grouped = {
    '1': courses.filter((c) => c.upgradeLevel === '1'),
    '2': courses.filter((c) => c.upgradeLevel === '2'),
    '3': courses.filter((c) => c.upgradeLevel === '3'),
  }

  const newsletterData = seedHomePage.blocks[2] as Parameters<typeof NewsletterSignupSection>[0]['data']

  return (
    <>
      <PageHeroSection
        data={{
          blockType: 'pageHeroSection',
          title: '所有課程',
          intro: '從免費課程開始，依照你的目標選擇升級路徑',
        }}
      />

      {(['1', '2', '3'] as const).map((level) => (
        <SectionShell key={level}>
          <h2
            className="text-3xl font-black mb-8 pb-4 border-b-4 border-black"
            style={{ borderBottomColor: levelColor[level] }}
          >
            {levelLabel[level]}
          </h2>

          {grouped[level].length === 0 ? (
            <div className="nb-card p-12 text-center">
              <p className="text-xl font-black">課程即將上架</p>
              <p className="text-[var(--color-text-muted)] mt-2">訂閱電子報，開放時第一時間通知你</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grouped[level].map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="nb-card p-6 flex flex-col gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-black uppercase"
                      style={{ color: levelColor[course.upgradeLevel] }}
                    >
                      Level {course.upgradeLevel}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-text-muted)]">
                      {course.accessLevel === 'free' ? '免費' : '付費'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black leading-tight group-hover:underline">
                    {course.title}
                  </h3>
                  {course.summary && (
                    <p className="text-[var(--color-text-muted)] text-sm">{course.summary}</p>
                  )}
                  <span className="font-bold text-sm mt-auto">開始學習 →</span>
                </Link>
              ))}
            </div>
          )}
        </SectionShell>
      ))}

      <NewsletterSignupSection data={newsletterData} />
    </>
  )
}
