import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { NewsletterSignupSection } from '@/sections/NewsletterSignupSection/component'
import { getLessonBySlug, getStudentByEmail } from '@/lib/queries'
import { seedLessons, seedHomePage } from '@/payload/seed-data'
import { LessonLP } from '@/components/lessons/LessonLP'
import { LessonContent } from '@/components/lessons/LessonContent'
import { auth } from '@/lib/auth'

import type { Chapter } from '@/components/lessons/LessonContent'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ch?: string; unit?: string }>
}

const LEVEL_COLORS: Record<string, string> = {
  '1': 'var(--color-l1)',
  '2': 'var(--color-l2)',
  '3': 'var(--color-l3)',
}

const LEVEL_STARS: Record<string, string> = {
  beginner: '★☆☆ 入門',
  easy: '★★☆ 簡單',
  medium: '★★★ 中等',
}

const CATEGORY_LABEL: Record<string, string> = {
  build: '建造 BUILD',
  sell: '銷售 SELL',
}

function hasAccess(studentLevel: string, lessonUpgradeLevel: string): boolean {
  if (lessonUpgradeLevel === '1') return true
  if (lessonUpgradeLevel === '2') return ['l2', 'l3', 'coach'].includes(studentLevel)
  if (lessonUpgradeLevel === '3') return ['l3', 'coach'].includes(studentLevel)
  return false
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const db = await getLessonBySlug(slug).catch(() => null)
  const fallback = seedLessons.find((l) => l.slug === slug)
  const raw = db as Record<string, unknown> | null
  const title = String(raw?.title ?? fallback?.title ?? slug)
  return { title }
}

export default async function LessonDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { ch, unit } = await searchParams
  const initialChapter = Math.max(0, Number(ch ?? 0))
  const initialUnit = Math.max(0, Number(unit ?? 0))
  const db = await getLessonBySlug(slug).catch(() => null)
  const raw =
    (db as Record<string, unknown> | null) ??
    (seedLessons.find((l) => l.slug === slug) as Record<string, unknown> | undefined) ??
    null

  if (!raw) notFound()

  // Extract all values as properly typed strings before JSX
  const title = String(raw.title ?? '')
  const summary = String(raw.summary ?? '')
  const missionLabel = raw.missionLabel ? String(raw.missionLabel) : ''
  const outcome = raw.outcome ? String(raw.outcome) : ''
  const upgradeLevel = String(raw.upgradeLevel ?? '1')
  const levelStr = String(raw.level ?? 'beginner')
  const category = String(raw.category ?? 'build')
  const durationMinutes = raw.durationMinutes ? String(raw.durationMinutes) : ''
  const price = Number(raw.price ?? 0)
  const isFree = raw.accessLevel === 'free'

  const levelColor: string = LEVEL_COLORS[upgradeLevel] ?? 'var(--color-l1)'
  const levelStars: string = LEVEL_STARS[levelStr] ?? '★☆☆ 入門'
  const categoryLabel: string = CATEGORY_LABEL[category] ?? category

  const tools: string[] = Array.isArray(raw.tools)
    ? (raw.tools as Array<{ tool?: unknown } | string>).map((t) =>
        typeof t === 'object' && t !== null
          ? String((t as { tool?: unknown }).tool ?? '')
          : String(t)
      ).filter(Boolean)
    : []

  const newsletterData = seedHomePage.blocks[2] as Parameters<
    typeof NewsletterSignupSection
  >[0]['data']

  // ── L2/L3 付費課程 → 授權閘門 ───────────────────────────
  if (!isFree) {
    // 1. 取得 session
    const reqHeaders = await headers()
    const session = await auth.api.getSession({ headers: reqHeaders }).catch(() => null)

    if (session?.user?.email) {
      // 2. 查 Payload Students 取得 level
      const student = await getStudentByEmail(session.user.email)
      const studentLevel = student ? String((student as Record<string, unknown>).level ?? 'guest') : 'guest'

      // 3. 授權通過 → 顯示課程內容
      if (hasAccess(studentLevel, upgradeLevel)) {
        // 解析 chapters（Payload 回傳的 nested array）
        const rawChapters = Array.isArray(raw.chapters) ? raw.chapters : []
        const chapters: Chapter[] = (rawChapters as Record<string, unknown>[]).map(ch => ({
          title: String(ch.title ?? ''),
          units: Array.isArray(ch.units)
            ? (ch.units as Record<string, unknown>[]).map(u => ({
                title: String(u.title ?? ''),
                videoUrl: u.videoUrl ? String(u.videoUrl) : undefined,
                durationMinutes: u.durationMinutes ? Number(u.durationMinutes) : undefined,
                isFreePreview: Boolean(u.isFreePreview),
              }))
            : [],
        })).filter(ch => ch.title)

        // 邊界保護：確保 initialChapter / initialUnit 不超出範圍
        const safeChapter = Math.min(initialChapter, Math.max(0, chapters.length - 1))
        const safeUnit = Math.min(
          initialUnit,
          Math.max(0, (chapters[safeChapter]?.units.length ?? 1) - 1)
        )

        return (
          <LessonContent
            title={title}
            summary={summary}
            missionLabel={missionLabel}
            outcome={outcome}
            upgradeLevel={upgradeLevel}
            category={category}
            tools={tools}
            durationMinutes={durationMinutes}
            videoUrl={raw.videoUrl ? String(raw.videoUrl) : undefined}
            coverImage={raw.coverImage ? String(raw.coverImage) : undefined}
            chapters={chapters}
            initialChapter={safeChapter}
            initialUnit={safeUnit}
          />
        )
      }
    }

    // 未登入 or 無權限 → LP（訪客 or 升級 CTA）
    return (
      <LessonLP
        title={title}
        summary={summary}
        missionLabel={missionLabel}
        outcome={outcome}
        upgradeLevel={upgradeLevel}
        category={category}
        price={price}
        tools={tools}
        coverImage={raw.coverImage ? String(raw.coverImage) : undefined}
        isLoggedIn={!!session?.user}
      />
    )
  }

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="w-full bg-white border-b border-black">
        {/* Breadcrumb */}
        <div className="border-b border-[#eee] px-10 md:px-16 py-3 flex items-center gap-3">
          <Link
            href={`/${category}`}
            className="font-mono text-[9px] uppercase text-[#aaa] hover:text-black transition-colors"
          >
            {categoryLabel}
          </Link>
          <span className="font-mono text-[9px] text-[#ddd]">/</span>
          <span className="font-mono text-[9px] uppercase text-[#ccc]">{slug}</span>
        </div>

        <div className="max-w-4xl px-10 md:px-16 py-16">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {missionLabel && (
              <span className="font-mono text-[9px] uppercase" style={{ color: levelColor }}>
                ▶ {missionLabel}
              </span>
            )}
            <span className="h-3 w-px bg-[#ddd]" />
            <span className="font-mono text-[9px] uppercase text-[#aaa]">{levelStars}</span>
            <span className="h-3 w-px bg-[#ddd]" />
            <span
              className="font-mono text-[9px] uppercase px-2 py-0.5 text-white font-black"
              style={{ background: isFree ? '#000' : levelColor }}
            >
              {isFree ? '免費課程' : '付費課程'}
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-black text-black leading-[0.92] mb-6"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
          >
            {title}
          </h1>

          {/* Summary */}
          <p className="text-[16px] text-[#555] leading-relaxed max-w-2xl mb-8">{summary}</p>

          {/* Tools + Duration */}
          <div className="flex flex-wrap gap-2 mb-10">
            {tools.map((tool) => (
              <span
                key={tool}
                className="font-mono text-[9px] uppercase px-3 py-1 border border-[#ddd] text-[#666]"
              >
                {tool}
              </span>
            ))}
            {durationMinutes && (
              <span className="font-mono text-[9px] uppercase px-3 py-1 border border-[#ddd] text-[#aaa]">
                {durationMinutes} 分鐘
              </span>
            )}
          </div>

          {/* Outcome */}
          {outcome && (
            <div className="border-l-4 pl-6 py-2 mb-10" style={{ borderColor: levelColor }}>
              <p className="font-mono text-[9px] uppercase text-[#aaa] mb-1">完成後你能做到</p>
              <p className="font-black text-black text-base">{outcome}</p>
            </div>
          )}

          {/* CTA */}
          {isFree ? (
            <button
              className="ed-btn ed-btn-black opacity-50 cursor-not-allowed"
              disabled
            >
              課程影片（即將上架）
            </button>
          ) : (
            <div className="flex flex-col gap-4 max-w-sm">
              <div className="border border-black px-8 py-6">
                <p className="font-mono text-[9px] uppercase text-[#999] mb-2">單課定價</p>
                <p className="font-black text-3xl text-black mb-4">
                  NT${price.toLocaleString()}
                </p>
                <Link href="#newsletter" className="ed-btn ed-btn-black w-full justify-center">
                  加入候補名單
                </Link>
                <p className="text-[10px] text-[#aaa] text-center mt-3">開放購買時第一時間通知你</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── BACK NAV ─────────────────────────────────── */}
      <section className="w-full bg-white border-b border-[#eee]">
        <div className="px-10 md:px-16 py-5 flex items-center justify-between">
          <Link
            href={`/${category}`}
            className="font-bold text-sm text-[#888] hover:text-black transition-colors duration-150"
          >
            ← 返回{category === 'build' ? '建造' : '銷售'}課程列表
          </Link>
          <Link
            href="/pricing"
            className="font-mono text-[9px] uppercase text-[#bbb] hover:text-black transition-colors duration-150"
          >
            查看升級路徑 →
          </Link>
        </div>
      </section>

      <NewsletterSignupSection data={newsletterData} />
    </>
  )
}
