'use client'

import Link from 'next/link'
import { useState } from 'react'

// ── 型別 ──────────────────────────────────────────────────────

export type Unit = {
  title: string
  type?: 'video' | 'practice'
  videoUrl?: string
  durationMinutes?: number
  isFreePreview?: boolean
  practiceContent?: string
}

export type Chapter = {
  title: string
  units: Unit[]
}

type LessonContentProps = {
  title: string
  summary: string
  missionLabel: string
  outcome: string
  upgradeLevel: string
  category: string
  tools: string[]
  durationMinutes: string
  videoUrl?: string
  coverImage?: string
  // 章節模式
  chapters?: Chapter[]
  initialChapter?: number
  initialUnit?: number
}

// ── 常數 ──────────────────────────────────────────────────────

const LEVEL_COLOR: Record<string, string> = {
  '1': '#CC1F1F',
  '2': '#FFB11B',
  '3': '#00b388',
}

const CATEGORY_LABEL: Record<string, string> = {
  build: '建造 BUILD',
  sell: '銷售 SELL',
}

// ── 工具函式 ──────────────────────────────────────────────────

function toEmbedUrl(url: string): string | null {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?color=ffffff`
  if (url.includes('/embed/') || url.includes('player.vimeo')) return url
  return null
}

function formatDuration(minutes: number): string {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = Math.floor(minutes % 60)
  const s = Math.round((minutes % 1) * 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function totalMinutes(chapters: Chapter[]): number {
  return chapters.reduce((sum, ch) =>
    sum + ch.units.reduce((s, u) => (u.type === 'practice' ? s : s + (u.durationMinutes ?? 0)), 0), 0)
}

// ── 影片佔位元件 ──────────────────────────────────────────────

function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center"
      style={{ aspectRatio: '16/9', background: '#111' }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-white/10"
        style={{ background: '#1a1a1a' }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <polygon points="5,3 19,12 5,21" fill="currentColor" className="text-white/20" />
        </svg>
      </div>
      <p className="font-mono text-[10px] uppercase text-white/20 tracking-widest">影片準備中</p>
      <p className="font-mono text-[9px] text-white/10 mt-1">// {title}</p>
    </div>
  )
}

// ── 影片播放區 ────────────────────────────────────────────────

function VideoPlayer({ url, title }: { url?: string; title: string }) {
  const embedUrl = url ? toEmbedUrl(url) : null
  return embedUrl ? (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        style={{ border: 'none' }}
      />
    </div>
  ) : (
    <VideoPlaceholder title={title} />
  )
}

// ── 實做卡片 ──────────────────────────────────────────────────

interface PracticeSection {
  topic: string
  caseText: string
  prompts: string[]
}

function parsePracticeContent(content: string): PracticeSection {
  const lines = content.split('\n')
  let topic = ''
  let caseText = ''
  const prompts: string[] = []
  let inPrompts = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('topic:')) {
      topic = trimmed.replace(/^topic:\s*/, '')
      inPrompts = false
    } else if (trimmed.startsWith('case:')) {
      caseText = trimmed.replace(/^case:\s*/, '')
      inPrompts = false
    } else if (trimmed === 'prompts:') {
      inPrompts = true
    } else if (inPrompts && trimmed.startsWith('- ')) {
      prompts.push(trimmed.replace(/^-\s*/, ''))
    }
  }

  return { topic, caseText, prompts }
}

function PracticeCard({ unit, accentColor }: { unit: Unit; accentColor: string }) {
  const content = unit.practiceContent ? parsePracticeContent(unit.practiceContent) : { topic: '', caseText: '', prompts: [] }

  return (
    <div className="px-6 md:px-10 py-8 max-w-3xl">
      {/* Header badge */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="font-mono text-[10px] uppercase px-3 py-1.5 font-black"
          style={{ background: accentColor, color: '#000' }}
        >
          🛠 AI 實做
        </span>
      </div>

      <h2 className="font-black text-white leading-tight mb-8" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)' }}>
        {unit.title}
      </h2>

      {/* 實做主題 */}
      {content.topic && (
        <div className="mb-8 border-2 border-white/10 p-5" style={{ background: '#111' }}>
          <p className="font-mono text-[9px] uppercase mb-3" style={{ color: accentColor }}>實做主題</p>
          <p className="text-[15px] text-white/80 leading-relaxed">{content.topic}</p>
        </div>
      )}

      {/* 案例參考 */}
      {content.caseText && (
        <div className="mb-8 border-l-2 pl-5 py-2" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
          <p className="font-mono text-[9px] uppercase mb-2 text-white/30">案例參考</p>
          <p className="text-[14px] text-white/50 leading-relaxed italic">{content.caseText}</p>
        </div>
      )}

      {/* 提示詞模板 */}
      {content.prompts.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-[9px] uppercase mb-4" style={{ color: accentColor }}>提示詞模板</p>
          <div className="flex flex-col gap-3">
            {content.prompts.map((prompt, i) => (
              <div
                key={i}
                className="font-mono text-[12px] text-white/70 p-4 border border-white/10 leading-relaxed"
                style={{ background: '#0d0d0d' }}
              >
                <p className="text-[9px] text-white/20 mb-2">PROMPT {i + 1}</p>
                {prompt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 完成按鈕 */}
      <button
        className="font-mono text-[11px] uppercase px-8 py-3 font-black mt-2 transition-opacity hover:opacity-80"
        style={{ background: accentColor, color: '#000' }}
      >
        完成實做 ✓
      </button>
    </div>
  )
}

// ── 章節側邊欄 ────────────────────────────────────────────────

function ChapterSidebar({
  chapters,
  currentChapter,
  currentUnit,
  accentColor,
  onSelect,
}: {
  chapters: Chapter[]
  currentChapter: number
  currentUnit: number
  accentColor: string
  onSelect: (ch: number, unit: number) => void
}) {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({})

  const toggle = (idx: number) =>
    setCollapsed(prev => ({ ...prev, [idx]: !prev[idx] }))

  return (
    <aside
      className="w-full md:w-72 lg:w-80 shrink-0 overflow-y-auto border-b md:border-b-0 md:border-r border-white/10"
      style={{ maxHeight: 'calc(100vh - 56px)', background: '#0a0a0a' }}
    >
      {/* 課程總覽 */}
      <div className="px-5 py-4 border-b border-white/10">
        <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: accentColor }}>
          課程大綱
        </p>
        <p className="font-mono text-[9px] text-white/25">
          共 {chapters.reduce((s, c) => s + c.units.length, 0)} 個單元・
          {Math.round(totalMinutes(chapters))} 分鐘影片
        </p>
      </div>

      {/* 章節列表 */}
      {chapters.map((chapter, chIdx) => {
        const isCollapsed = collapsed[chIdx]
        const isActiveChapter = chIdx === currentChapter

        return (
          <div key={chIdx} className="border-b border-white/5">
            {/* 章節標題 */}
            <button
              onClick={() => toggle(chIdx)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-white/3 transition-colors"
            >
              <span
                className="font-black text-[12px] leading-tight"
                style={{ color: isActiveChapter ? '#fff' : 'rgba(255,255,255,0.5)' }}
              >
                {chapter.title}
              </span>
              <span className="text-white/20 text-[10px] ml-3 shrink-0">
                {isCollapsed ? '▶' : '▼'}
              </span>
            </button>

            {/* 單元列表 */}
            {!isCollapsed && (
              <ul>
                {chapter.units.map((unit, unitIdx) => {
                  const isActive = isActiveChapter && unitIdx === currentUnit
                  return (
                    <li key={unitIdx}>
                      {unit.type === 'practice' ? (
                        <button
                          onClick={() => onSelect(chIdx, unitIdx)}
                          className="w-full flex items-start gap-3 px-5 py-2.5 text-left transition-colors"
                          style={{
                            background: isActive ? `${accentColor}10` : 'transparent',
                            borderLeft: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                          }}
                        >
                          {/* 實做圖示 */}
                          <span className="mt-0.5 shrink-0 text-[11px]" style={{ color: isActive ? accentColor : 'rgba(255,255,255,0.15)' }}>
                            🛠
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[11px] leading-tight italic"
                              style={{ color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)' }}
                            >
                              {unit.title}
                            </p>
                            <p className="font-mono text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.15)' }}>
                              AI 實做
                            </p>
                          </div>
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelect(chIdx, unitIdx)}
                          className="w-full flex items-start gap-3 px-5 py-2.5 text-left transition-colors"
                          style={{
                            background: isActive ? `${accentColor}15` : 'transparent',
                            borderLeft: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                          }}
                        >
                          {/* 播放圖示 */}
                          <span className="mt-0.5 shrink-0" style={{ color: isActive ? accentColor : 'rgba(255,255,255,0.2)' }}>
                            {isActive ? '▶' : '○'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[12px] leading-tight"
                              style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.45)' }}
                            >
                              {unit.title}
                            </p>
                            {unit.durationMinutes ? (
                              <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                {formatDuration(unit.durationMinutes)}
                              </p>
                            ) : null}
                          </div>
                          {unit.isFreePreview && (
                            <span className="font-mono text-[8px] uppercase px-1.5 py-0.5 shrink-0" style={{
                              border: `1px solid ${accentColor}`,
                              color: accentColor,
                            }}>
                              試看
                            </span>
                          )}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </aside>
  )
}

// ── 主元件 ────────────────────────────────────────────────────

export function LessonContent({
  title,
  summary,
  missionLabel,
  outcome,
  upgradeLevel,
  category,
  tools,
  durationMinutes,
  videoUrl,
  chapters = [],
  initialChapter = 0,
  initialUnit = 0,
}: LessonContentProps) {
  const accentColor = LEVEL_COLOR[upgradeLevel] ?? '#FF6B9D'
  const categoryLabel = CATEGORY_LABEL[category] ?? category
  const categoryPath = `/${category}`
  const hasChapters = chapters.length > 0

  // 章節模式的當前位置
  const [currentChapter, setCurrentChapter] = useState(initialChapter)
  const [currentUnit, setCurrentUnit] = useState(initialUnit)

  // 當前單元資料
  const activeUnit = hasChapters
    ? chapters[currentChapter]?.units[currentUnit]
    : null

  // 前/後單元導覽
  function navigate(direction: 1 | -1) {
    if (!hasChapters) return
    const allUnits: { ch: number; unit: number }[] = []
    chapters.forEach((ch, chIdx) => {
      ch.units.forEach((_, uIdx) => allUnits.push({ ch: chIdx, unit: uIdx }))
    })
    const current = allUnits.findIndex(u => u.ch === currentChapter && u.unit === currentUnit)
    const next = allUnits[current + direction]
    if (next) {
      setCurrentChapter(next.ch)
      setCurrentUnit(next.unit)
    }
  }

  // ── 渲染：共用頂部導覽 ────
  const navbar = (
    <nav className="border-b border-white/10 px-6 md:px-10 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Link
          href={categoryPath}
          className="font-mono text-[9px] uppercase text-white/30 hover:text-white/70 transition-colors"
        >
          ← {categoryLabel}
        </Link>
        <span className="font-mono text-[9px] text-white/10">/</span>
        <span className="font-mono text-[9px] uppercase" style={{ color: accentColor }}>
          Level {upgradeLevel}
        </span>
      </div>
      <Link
        href="/dashboard"
        className="font-mono text-[9px] uppercase text-white/30 hover:text-white/70 transition-colors"
      >
        我的課程 →
      </Link>
    </nav>
  )

  // ══════════════════════════════════════════════
  // 模式 A：單一影片（L1 免費課 / 無章節）
  // ══════════════════════════════════════════════
  if (!hasChapters) {
    const embedUrl = videoUrl ? toEmbedUrl(videoUrl) : null

    return (
      <div className="min-h-screen" style={{ background: '#080808', color: '#f0f0f0' }}>
        {navbar}

        {/* 影片 */}
        <section className="border-b border-white/10">
          {embedUrl ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={embedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            <VideoPlaceholder title={title} />
          )}
        </section>

        {/* 資訊列 */}
        <section className="border-b border-white/10 px-8 md:px-16 py-5">
          <div className="flex flex-wrap items-center gap-6">
            {missionLabel && (
              <span className="font-mono text-[9px] uppercase" style={{ color: accentColor }}>
                ▶ {missionLabel}
              </span>
            )}
            {tools.map(tool => (
              <span key={tool} className="font-mono text-[9px] uppercase text-white/25 border border-white/10 px-3 py-1">
                {tool}
              </span>
            ))}
            {durationMinutes && (
              <span className="font-mono text-[9px] uppercase text-white/20">{durationMinutes} 分鐘</span>
            )}
          </div>
        </section>

        {/* 標題 + 摘要 + 成果 */}
        <section className="px-8 md:px-16 py-12 max-w-4xl">
          <h1 className="font-black text-white leading-[0.92] mb-6" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            {title}
          </h1>
          {summary && <p className="text-[17px] text-white/55 leading-relaxed mb-8 max-w-2xl">{summary}</p>}
          {outcome && (
            <div className="border-l-2 pl-6 py-2" style={{ borderColor: accentColor }}>
              <p className="font-mono text-[9px] uppercase mb-2" style={{ color: accentColor }}>完成後你能做到</p>
              <p className="font-black text-white text-[18px] leading-tight">{outcome}</p>
            </div>
          )}
        </section>

        <section className="border-t border-white/10 px-8 md:px-16 py-8 flex items-center justify-between">
          <Link href={categoryPath} className="font-mono text-[10px] uppercase text-white/30 hover:text-white/70 transition-colors">
            ← 返回課程列表
          </Link>
          <Link href="/dashboard" className="font-mono text-[10px] uppercase text-white/30 hover:text-white/70 transition-colors">
            查看我的所有課程 →
          </Link>
        </section>
      </div>
    )
  }

  // ══════════════════════════════════════════════
  // 模式 B：多章節（L2 / L3）
  // ══════════════════════════════════════════════

  // 計算前後單元
  const allUnits: { ch: number; unit: number }[] = []
  chapters.forEach((ch, chIdx) => {
    ch.units.forEach((_, uIdx) => allUnits.push({ ch: chIdx, unit: uIdx }))
  })
  const currentIdx = allUnits.findIndex(u => u.ch === currentChapter && u.unit === currentUnit)
  const hasPrev = currentIdx > 0
  const hasNext = currentIdx < allUnits.length - 1

  const totalDuration = totalMinutes(chapters)
  const totalHours = Math.floor(totalDuration / 60)
  const totalMins = Math.round(totalDuration % 60)
  const durationLabel = totalHours > 0
    ? `${totalHours} 小時 ${totalMins} 分`
    : `${totalMins} 分鐘`

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080808', color: '#f0f0f0' }}>
      {navbar}

      {/* 主體：側邊欄 + 內容 */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* ── 側邊欄 ─── */}
        <ChapterSidebar
          chapters={chapters}
          currentChapter={currentChapter}
          currentUnit={currentUnit}
          accentColor={accentColor}
          onSelect={(ch, unit) => {
            setCurrentChapter(ch)
            setCurrentUnit(unit)
          }}
        />

        {/* ── 主內容 ─── */}
        <main className="flex-1 overflow-y-auto">

          {/* 影片 or 實做卡片 */}
          {activeUnit?.type === 'practice' ? (
            <>
              {/* 實做單元頂部導覽列 */}
              <section className="border-b border-white/10 px-6 md:px-10 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="font-mono text-[9px] uppercase" style={{ color: accentColor }}>
                      {chapters[currentChapter]?.title}
                    </span>
                    <span className="font-mono text-[9px] text-white/25">AI 實做</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(-1)}
                      disabled={!hasPrev}
                      className="font-mono text-[10px] uppercase transition-colors disabled:opacity-20"
                      style={{ color: hasPrev ? accentColor : 'rgba(255,255,255,0.2)' }}
                    >
                      ← 上一單元
                    </button>
                    <span className="font-mono text-[9px] text-white/15">
                      {currentIdx + 1} / {allUnits.length}
                    </span>
                    <button
                      onClick={() => navigate(1)}
                      disabled={!hasNext}
                      className="font-mono text-[10px] uppercase transition-colors disabled:opacity-20"
                      style={{ color: hasNext ? accentColor : 'rgba(255,255,255,0.2)' }}
                    >
                      下一單元 →
                    </button>
                  </div>
                </div>
              </section>
              {/* 實做卡片 */}
              <PracticeCard unit={activeUnit} accentColor={accentColor} />
            </>
          ) : (
            <>
              <section className="border-b border-white/10">
                <VideoPlayer url={activeUnit?.videoUrl} title={activeUnit?.title ?? title} />
              </section>

              {/* 單元資訊列 */}
              <section className="border-b border-white/10 px-6 md:px-10 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="font-mono text-[9px] uppercase" style={{ color: accentColor }}>
                      {chapters[currentChapter]?.title}
                    </span>
                    {activeUnit?.durationMinutes ? (
                      <span className="font-mono text-[9px] text-white/25">
                        {formatDuration(activeUnit.durationMinutes)}
                      </span>
                    ) : null}
                    {tools.map(tool => (
                      <span key={tool} className="font-mono text-[9px] text-white/20 border border-white/10 px-2 py-0.5 hidden md:inline">
                        {tool}
                      </span>
                    ))}
                  </div>
                  {/* 前後導覽 */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(-1)}
                      disabled={!hasPrev}
                      className="font-mono text-[10px] uppercase transition-colors disabled:opacity-20"
                      style={{ color: hasPrev ? accentColor : 'rgba(255,255,255,0.2)' }}
                    >
                      ← 上一單元
                    </button>
                    <span className="font-mono text-[9px] text-white/15">
                      {currentIdx + 1} / {allUnits.length}
                    </span>
                    <button
                      onClick={() => navigate(1)}
                      disabled={!hasNext}
                      className="font-mono text-[10px] uppercase transition-colors disabled:opacity-20"
                      style={{ color: hasNext ? accentColor : 'rgba(255,255,255,0.2)' }}
                    >
                      下一單元 →
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* 當前單元標題（只在 video 單元顯示） */}
          {activeUnit?.type !== 'practice' && (
            <section className="px-6 md:px-10 py-8 max-w-3xl">
              <h1 className="font-black text-white leading-tight mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
                {activeUnit?.title ?? title}
              </h1>

              {/* 課程總覽資訊（只在第一個單元顯示） */}
              {currentChapter === 0 && currentUnit === 0 && (
                <>
                  {summary && (
                    <p className="text-[15px] text-white/50 leading-relaxed mb-6 max-w-xl">{summary}</p>
                  )}
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div>
                      <p className="font-mono text-[9px] uppercase text-white/20 mb-1">總時長</p>
                      <p className="font-mono text-[12px] text-white/60">{durationLabel}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase text-white/20 mb-1">單元數</p>
                      <p className="font-mono text-[12px] text-white/60">{allUnits.length} 個</p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase text-white/20 mb-1">章節數</p>
                      <p className="font-mono text-[12px] text-white/60">{chapters.length} 章</p>
                    </div>
                  </div>
                  {outcome && (
                    <div className="border-l-2 pl-5 py-2" style={{ borderColor: accentColor }}>
                      <p className="font-mono text-[9px] uppercase mb-2" style={{ color: accentColor }}>完成後你能做到</p>
                      <p className="font-black text-white text-[16px] leading-tight">{outcome}</p>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* 底部導覽 */}
          <section className="border-t border-white/10 px-6 md:px-10 py-6 flex items-center justify-between">
            <Link href={categoryPath} className="font-mono text-[10px] uppercase text-white/20 hover:text-white/50 transition-colors">
              ← 返回課程列表
            </Link>
            <Link href="/dashboard" className="font-mono text-[10px] uppercase text-white/20 hover:text-white/50 transition-colors">
              我的課程 →
            </Link>
          </section>
        </main>
      </div>
    </div>
  )
}
