import Image from 'next/image'
import Link from 'next/link'
import { NewsletterSignupSection } from '@/sections/NewsletterSignupSection/component'
import { getLessons } from '@/lib/queries'
import { seedHomePage, seedLessons } from '@/payload/seed-data'
import type { Metadata } from 'next'
import coachConfig from '../../../coach.config'

export const metadata: Metadata = {
  title: coachConfig.brand.name,
  description: coachConfig.brand.tagline,
}

const LEVEL_COLORS: Record<string, string> = {
  '1': 'var(--color-l1)',
  '2': 'var(--color-l2)',
  '3': 'var(--color-l3)',
}

export default async function HomePage() {
  const allLessons = await getLessons().catch(() => [])
  const newsletterData = seedHomePage.blocks[2] as Parameters<
    typeof NewsletterSignupSection
  >[0]['data']

  const displayCourses =
    allLessons.length > 0
      ? (allLessons as Record<string, unknown>[])
          .filter((l) => l.accessLevel === 'free')
          .slice(0, 4)
          .map((c) => ({
            id: String(c.id),
            title: String(c.title),
            slug: String(c.slug),
            summary: c.summary ? String(c.summary) : undefined,
            upgradeLevel: String(c.upgradeLevel) as '1' | '2' | '3',
          }))
      : seedLessons
          .filter((c) => c.accessLevel === 'free')
          .slice(0, 4)
          .map((c) => ({
            id: c.slug,
            title: c.title,
            slug: c.slug,
            summary: c.summary,
            upgradeLevel: c.upgradeLevel as '1' | '2' | '3',
          }))

  return (
    <>
      {/* ─── 01 HERO — full-width cover ──────────────────────────── */}
      <section className="img-hover relative w-full overflow-hidden bg-black" style={{ minHeight: '92vh' }}>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between px-10 md:px-16 py-16 md:py-20" style={{ minHeight: '92vh' }}>
          {/* Top: issue tag */}
          <p className="font-mono text-[10px] uppercase text-white/50 anim-fade anim-d1">
            /01 — {coachConfig.brand.name.toUpperCase()} &nbsp;&nbsp; ISSUE 2026
          </p>

          {/* Bottom: headline + copy + CTAs */}
          <div className="max-w-3xl">
            <h1
              className="font-black leading-[0.92] mb-6 text-white anim-fade-up anim-d2"
            >
              用 AI 開創<br />你的一人事業
            </h1>
            <p className="text-[16px] text-white/70 mb-10 max-w-md leading-relaxed anim-fade-up anim-d3">
              {coachConfig.brand.tagline}
            </p>
            <div className="flex flex-wrap gap-3 anim-fade-up anim-d4">
              <Link href="/courses" className="ed-btn ed-btn-accent">
                {coachConfig.cta.primary.label}
              </Link>
              <Link href="/pricing" className="ed-btn ed-btn-white">
                {coachConfig.cta.secondary.label}
              </Link>
            </div>
            <p className="font-mono text-[10px] uppercase text-white/30 mt-10 anim-fade anim-d5">
              I DREAM. AI WORKS.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 02 LEVEL GRID ───────────────────────────────────────── */}
      <section className="w-full grain bg-[var(--color-canvas)] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-[10px] uppercase text-white/50 mb-3">/02 — 升級路徑</p>
              <h2
                className="text-4xl font-black text-white"
              >
                三個階段，一條清楚的路
              </h2>
            </div>
            <Link href="/pricing" className="ed-btn ed-btn-white hidden md:inline-flex">
              查看定價
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                level: '1' as const,
                title: coachConfig.levels.l1.name,
                desc: coachConfig.levels.l1.description,
                href: '/courses',
                cta: '進入 Level 1',
              },
              {
                level: '2' as const,
                title: coachConfig.levels.l2.name,
                desc: coachConfig.levels.l2.description,
                href: '/pricing',
                cta: '進入 Level 2',
              },
              {
                level: '3' as const,
                title: coachConfig.levels.l3.name,
                desc: coachConfig.levels.l3.description,
                href: '/pricing',
                cta: '進入 Level 3',
              },
            ].map((item) => (
              <div key={item.level} className="level-card bg-white flex flex-col">
                <div className="p-6 flex flex-col gap-3 flex-1 border-t border-black">
                  <div className="level-bar" style={{ background: LEVEL_COLORS[item.level] }} />
                  <p className="font-mono text-[10px] uppercase" style={{ color: LEVEL_COLORS[item.level] }}>
                    Level {item.level}
                  </p>
                  <h3 className="text-xl font-black text-black">{item.title}</h3>
                  <p className="text-sm text-[#666] leading-relaxed flex-1">{item.desc}</p>
                  <Link
                    href={item.href}
                    className="font-bold text-sm hover:text-[var(--color-accent)] transition-colors duration-150"
                  >
                    {item.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 md:hidden">
            <Link href="/pricing" className="ed-btn ed-btn-white w-full justify-center">
              查看定價
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 03 COURSE LIST ──────────────────────────────────────── */}
      {displayCourses.length > 0 && (
        <section className="w-full bg-white border-t border-black">
          <div className="border-b border-black px-10 md:px-16 py-5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="font-mono text-[10px] uppercase text-[#999]">/03 — 免費課程</span>
              <h2 className="text-xl font-black text-black">先試試看</h2>
            </div>
            <Link href="/courses" className="ed-btn ed-btn-black text-[11px]">
              看全部
            </Link>
          </div>

          {displayCourses.map((course, i) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="course-row flex items-center justify-between px-10 md:px-16 py-7 border-b border-[#eee]"
            >
              <div className="flex items-start gap-8 flex-1 min-w-0">
                <span className="course-index font-mono text-[10px] text-[#ccc] pt-1.5 w-6 shrink-0 transition-colors duration-200">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="font-mono text-[10px] uppercase"
                      style={{ color: LEVEL_COLORS[course.upgradeLevel] }}
                    >
                      Level {course.upgradeLevel}
                    </span>
                  </div>
                  <h3 className="course-title text-lg font-black text-black transition-colors duration-200">
                    {course.title}
                  </h3>
                  {course.summary && (
                    <p className="course-meta text-sm text-[#888] mt-0.5 transition-colors duration-200 max-w-lg">
                      {course.summary}
                    </p>
                  )}
                </div>
              </div>
              <span className="course-arrow text-[#ccc] text-xl ml-6 shrink-0 transition-colors duration-200">
                →
              </span>
            </Link>
          ))}
        </section>
      )}

      {/* ─── 04 NEWSLETTER ───────────────────────────────────────── */}
      <NewsletterSignupSection data={newsletterData} />
    </>
  )
}
