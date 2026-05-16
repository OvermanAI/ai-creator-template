import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getLessons, getStudentByEmail } from '@/lib/queries'
import { seedLessons } from '@/payload/seed-data'
import { ButtonLink } from '@/components/ButtonLink'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '學員後台',
}

const LEVEL_COLOR: Record<string, string> = {
  '1': '#CC1F1F',
  '2': '#FFB11B',
  '3': '#00b388',
}

const LEVEL_BADGE: Record<string, { label: string; bg: string }> = {
  guest: { label: 'Guest', bg: '#333' },
  l1: { label: 'Level 1', bg: '#CC1F1F' },
  l2: { label: 'Level 2', bg: '#FFB11B' },
  l3: { label: 'Level 3', bg: '#00b388' },
  coach: { label: 'Coach', bg: '#FF6B9D' },
}

function hasAccess(studentLevel: string, lessonUpgradeLevel: string): boolean {
  if (lessonUpgradeLevel === '1') return true
  if (lessonUpgradeLevel === '2') return ['l2', 'l3', 'coach'].includes(studentLevel)
  if (lessonUpgradeLevel === '3') return ['l3', 'coach'].includes(studentLevel)
  return false
}

export default async function DashboardPage() {
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList }).catch(() => null)

  if (!session) {
    redirect('/auth/login')
  }

  const userEmail = String(session.user.email ?? '')

  // Fetch student from Payload (source of truth for level)
  const student = await getStudentByEmail(userEmail)
  const studentLevel = student
    ? String((student as Record<string, unknown>).level ?? 'guest')
    : 'guest'

  // Fetch all lessons
  const dbLessons = await getLessons().catch(() => [])
  const allLessons =
    dbLessons.length > 0
      ? (dbLessons as Record<string, unknown>[]).map((l) => ({
          slug: String(l.slug),
          title: String(l.title),
          summary: l.summary ? String(l.summary) : '',
          upgradeLevel: String(l.upgradeLevel ?? '1') as '1' | '2' | '3',
          category: String(l.category ?? 'build') as 'build' | 'sell',
          accessLevel: String(l.accessLevel ?? 'free') as 'free' | 'paid',
          order: Number(l.order ?? 0),
        }))
      : seedLessons.map((l) => ({
          slug: l.slug,
          title: l.title,
          summary: l.summary ?? '',
          upgradeLevel: l.upgradeLevel as '1' | '2' | '3',
          category: l.category as 'build' | 'sell',
          accessLevel: l.accessLevel as 'free' | 'paid',
          order: l.order ?? 0,
        }))

  const sortedLessons = allLessons.sort((a, b) => a.order - b.order)
  const buildLessons = sortedLessons.filter((l) => l.category === 'build')
  const sellLessons = sortedLessons.filter((l) => l.category === 'sell')

  const badge = LEVEL_BADGE[studentLevel] ?? LEVEL_BADGE.guest

  return (
    <div className="min-h-screen" style={{ background: '#080808', color: '#f0f0f0' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="border-b border-white/10 px-8 md:px-16 py-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase text-white/30 mb-1">
            // 學員後台
          </p>
          <h1 className="font-black text-white text-2xl">Dashboard</h1>
        </div>
        <Link
          href="/"
          className="font-mono text-[9px] uppercase text-white/20 hover:text-white/60 transition-colors"
        >
          ← 回首頁
        </Link>
      </div>

      <div className="px-8 md:px-16 py-12 max-w-5xl">

        {/* ── 學員資訊卡 ──────────────────────────────────── */}
        <div className="border border-white/10 p-8 mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="font-mono text-[9px] uppercase text-white/25 mb-2">Email</p>
            <p className="text-white font-bold">{userEmail}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase text-white/25 mb-2">會員等級</p>
            <span
              className="font-mono text-[10px] uppercase font-black px-4 py-2 text-white"
              style={{ background: badge.bg }}
            >
              {badge.label}
            </span>
          </div>
          {studentLevel === 'guest' || studentLevel === 'l1' ? (
            <ButtonLink href="/pricing" variant="accent">升級方案</ButtonLink>
          ) : null}
        </div>

        {/* ── 課程列表 ─────────────────────────────────────── */}
        {[
          { label: 'BUILD — 建造', lessons: buildLessons, path: '/build' },
          { label: 'SELL — 銷售', lessons: sellLessons, path: '/sell' },
        ].map(({ label, lessons, path }) => (
          <section key={path} className="mb-12">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
              <span className="font-mono text-[10px] uppercase text-white/40">{label}</span>
            </div>

            {lessons.length === 0 ? (
              <p className="font-mono text-[10px] uppercase text-white/20">// 課程即將上架</p>
            ) : (
              <div className="space-y-px">
                {lessons.map((lesson) => {
                  const unlocked = hasAccess(studentLevel, lesson.upgradeLevel)
                  const levelColor = LEVEL_COLOR[lesson.upgradeLevel] ?? '#fff'

                  return unlocked ? (
                    <Link
                      key={lesson.slug}
                      href={`/lessons/${lesson.slug}`}
                      className="flex items-center gap-6 px-6 py-5 bg-[#111] hover:bg-[#1a1a1a] transition-colors group"
                    >
                      {/* Level dot */}
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: levelColor }}
                      />
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white group-hover:text-white/80 transition-colors truncate">
                          {lesson.title}
                        </p>
                        {lesson.summary && (
                          <p className="font-mono text-[10px] text-white/30 mt-0.5 truncate">
                            {lesson.summary}
                          </p>
                        )}
                      </div>
                      {/* Badge */}
                      <span
                        className="font-mono text-[8px] uppercase text-white shrink-0"
                        style={{ color: levelColor }}
                      >
                        L{lesson.upgradeLevel}
                      </span>
                      {/* Arrow */}
                      <span className="text-white/20 group-hover:text-white/60 transition-colors shrink-0">
                        →
                      </span>
                    </Link>
                  ) : (
                    <div
                      key={lesson.slug}
                      className="flex items-center gap-6 px-6 py-5 bg-[#0d0d0d] opacity-40 cursor-not-allowed"
                    >
                      {/* Lock icon */}
                      <span className="text-white/20 text-sm shrink-0">🔒</span>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white/40 truncate">{lesson.title}</p>
                        <p className="font-mono text-[10px] text-white/15 mt-0.5">
                          需要 Level {lesson.upgradeLevel} 解鎖
                        </p>
                      </div>
                      <span className="font-mono text-[8px] uppercase text-white/20 shrink-0">
                        L{lesson.upgradeLevel}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        ))}

        {/* ── 升級 CTA ─────────────────────────────────────── */}
        {(studentLevel === 'guest' || studentLevel === 'l1') && (
          <div className="border border-white/10 px-8 py-10 text-center mt-4">
            <p className="font-mono text-[10px] uppercase text-white/30 mb-4">
              // 解鎖更多課程
            </p>
            <p
              className="font-black text-white leading-tight mb-6"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}
            >
              升級為 L2，解鎖{' '}
              <span style={{ color: '#FFB11B' }}>完整變現系統</span>
            </p>
            <p className="text-white/40 text-[14px] mb-8">
              從 AI 創作者到真正的一人事業。
            </p>
            <Link
              href="/pricing"
              className="ed-btn ed-btn-accent px-10 py-4 text-[13px]"
            >
              查看升級方案 →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
