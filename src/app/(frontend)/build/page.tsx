import type { Metadata } from 'next'
import { LessonIndex } from '@/components/lessons/LessonIndex'
import { getLessons } from '@/lib/queries'
import { seedLessons } from '@/payload/seed-data'
import type { LessonCard } from '@/lib/lessons/types'

export const metadata: Metadata = {
  title: '建造 — Build',
  description: '用 AI 工具做出真實可交付的品牌視覺作品，從入門到自動化工作流。',
}

export default async function BuildPage() {
  const dbLessons = await getLessons('build').catch(() => [])

  const lessons: LessonCard[] =
    dbLessons.length > 0
      ? dbLessons.map((l: Record<string, unknown>) => ({
          slug: String(l.slug),
          title: String(l.title),
          summary: String(l.summary ?? ''),
          missionLabel: l.missionLabel ? String(l.missionLabel) : '',
          category: 'build' as const,
          upgradeLevel: String(l.upgradeLevel) as '1' | '2' | '3',
          level: String(l.level ?? 'beginner') as 'beginner' | 'easy' | 'medium',
          tools: Array.isArray(l.tools)
            ? (l.tools as Array<{ tool?: unknown }>).map((t) => String(t?.tool ?? t))
            : [],
          durationMinutes: Number(l.durationMinutes ?? 30),
          outcome: l.outcome ? String(l.outcome) : '',
          accessLevel: String(l.accessLevel) as 'free' | 'paid',
          order: Number(l.order ?? 0),
          price: Number(l.price ?? 0),
        }))
      : seedLessons
          .filter((l) => l.category === 'build')
          .map((l) => ({
            ...l,
            missionLabel: l.missionLabel ?? '',
            outcome: l.outcome ?? '',
          }))

  return (
    <>
      <LessonIndex lessons={lessons} category="build" />
    </>
  )
}
