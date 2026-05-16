import Link from 'next/link'
import { LessonCard } from './LessonCard'
import type { LessonCard as LessonCardType, LessonCategory } from '@/lib/lessons/types'

// ── Interleave algorithm ─────────────────────────────────
// Pattern: L1 L1 / L2 L2 / L3 — repeating
// Each "round": 2× L1 cards, then 2× L2 cards, then 1× L3 card
function createEditorialLayout(lessons: LessonCardType[]): LessonCardType[] {
  const l1 = lessons.filter((l) => l.upgradeLevel === '1').sort((a, b) => a.order - b.order)
  const l2 = lessons.filter((l) => l.upgradeLevel === '2').sort((a, b) => a.order - b.order)
  const l3 = lessons.filter((l) => l.upgradeLevel === '3').sort((a, b) => a.order - b.order)

  const result: LessonCardType[] = []
  const maxRounds = Math.max(Math.ceil(l1.length / 2), Math.ceil(l2.length / 2), l3.length)

  for (let i = 0; i < maxRounds; i++) {
    // 2 L1 cards per round
    for (let j = 0; j < 2; j++) {
      const item = l1[i * 2 + j]
      if (item) result.push(item)
    }
    // 2 L2 cards per round
    for (let j = 0; j < 2; j++) {
      const item = l2[i * 2 + j]
      if (item) result.push(item)
    }
    // 1 L3 card per round
    if (l3[i]) result.push(l3[i])
  }

  return result
}

// ── Per-category visual identity ─────────────────────────
const categoryMeta: Record<
  LessonCategory,
  {
    code: string
    title: string
    intro: string
    // Build = white canvas; Sell = #CC1F1F red
    pageBg: string
    headerBorderColor: string
    eyebrowColor: string
    headlineColor: string
    introColor: string
    // grid gap colour (shows between cards)
    gridBg: string
    gridGap: string
  }
> = {
  build: {
    code: '/BUILD',
    title: '學會用 AI\n做出真實作品',
    intro: '從 AI 生圖工具到完整品牌視覺，每一課都有一個具體可交付的成果。',
    pageBg: 'bg-white',
    headerBorderColor: 'border-black',
    eyebrowColor: 'text-[#999]',
    headlineColor: 'text-black',
    introColor: 'text-[#666]',
    gridBg: 'bg-black',     // thin black lines between cards
    gridGap: 'gap-px',
  },
  sell: {
    code: '/SELL',
    title: '學會讓作品\n轉成收入',
    intro: '從個人品牌到上架銷售，每一課都讓你更接近第一筆真實成交。',
    pageBg: 'bg-[#080808]',
    headerBorderColor: 'border-[#1a1a1a]',
    eyebrowColor: 'text-white/40',
    headlineColor: 'text-white',
    introColor: 'text-white/60',
    gridBg: 'bg-[#1a1a1a]',  // near-black lines between cards
    gridGap: 'gap-px',
  },
}

type LessonIndexProps = {
  lessons: LessonCardType[]
  category: LessonCategory
}

export function LessonIndex({ lessons, category }: LessonIndexProps) {
  const meta = categoryMeta[category]
  const ordered = createEditorialLayout(lessons)

  // Track a global stage counter across all lessons
  let stageCounter = 0

  return (
    <div className={meta.pageBg}>
      {/* ── EDITORIAL HEADER ────────────────────────── */}
      <header
        className={`border-b ${meta.headerBorderColor} px-10 md:px-16 py-12 md:py-16`}
      >
        <p className={`font-mono text-[10px] uppercase ${meta.eyebrowColor} mb-5 anim-fade anim-d1`}>
          {meta.code} &nbsp;—&nbsp; YOUR_SITE.TW &nbsp;&nbsp; ISSUE 2026
        </p>
        <h1
          className={`font-black ${meta.headlineColor} leading-[0.90] anim-fade-up anim-d2`}
          style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', whiteSpace: 'pre-line' }}
        >
          {meta.title}
        </h1>
        <p className={`text-[15px] ${meta.introColor} mt-5 max-w-md leading-relaxed anim-fade-up anim-d3`}>
          {meta.intro}
        </p>
      </header>

      {/* ── EDITORIAL GRID ──────────────────────────── */}
      {/* 2-col grid; L3 cards get col-span-2 (full width)  */}
      {/* gap-px with bg-black/dark-red creates thin editorial dividers */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${meta.gridGap} ${meta.gridBg}`}>
        {ordered.map((lesson) => {
          const isL3 = lesson.upgradeLevel === '3'
          const idx = stageCounter++

          return (
            <div
              key={lesson.slug}
              className={isL3 ? 'md:col-span-2' : ''}
            >
              <LessonCard lesson={lesson} index={idx} isFullWidth={isL3} />
            </div>
          )
        })}
      </div>

      {/* ── BOTTOM CTA ──────────────────────────────── */}
      <div className={`border-t ${meta.headerBorderColor} px-10 md:px-16 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
        <div>
          <p className={`font-mono text-[10px] uppercase ${meta.eyebrowColor} mb-2`}>
            // 選一課，今天就開始
          </p>
          <p className={`font-black text-xl ${meta.headlineColor}`}>
            {category === 'build' ? '每一課都有一個可完成的任務' : '每一課都讓你更接近第一筆收入'}
          </p>
        </div>
        <div className="flex gap-3">
          {category === 'build' ? (
            <>
              <Link href="/sell" className={`ed-btn ${category === 'build' ? 'ed-btn-black' : 'ed-btn-white'}`}>
                前往銷售 →
              </Link>
              <Link href="/one-person-company" className={`ed-btn ${category === 'build' ? 'ed-btn-outline-black' : 'ed-btn-outline'}`}>
                OPC 路線圖
              </Link>
            </>
          ) : (
            <>
              <Link href="/build" className="ed-btn ed-btn-white">
                前往建造 →
              </Link>
              <Link href="/one-person-company" className="ed-btn ed-btn-outline">
                OPC 路線圖
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
