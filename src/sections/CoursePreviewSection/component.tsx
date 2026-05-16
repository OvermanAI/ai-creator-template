import Link from 'next/link'
import { SectionShell } from '@/components/SectionShell'
import { ButtonLink } from '@/components/ButtonLink'
import { coursePreviewTokens, levelColor } from './tokens'
import type { CoursePreviewSectionData } from './schema'

export function CoursePreviewSection({ data }: { data: CoursePreviewSectionData }) {
  return (
    <SectionShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase text-[var(--color-text-muted)] mb-4">
            免費課程
          </p>
          <h2 className="text-4xl font-black">{data.title}</h2>
          {data.subtitle && (
            <p className="mt-2 text-[var(--color-text-muted)] max-w-xl">{data.subtitle}</p>
          )}
        </div>
        <ButtonLink href={data.ctaHref} variant="black">
          {data.ctaLabel}
        </ButtonLink>
      </div>

      {data.courses.length === 0 ? (
        <div className="mt-12 ed-card p-12 text-center bg-gray-50">
          <p className="font-mono text-[11px] uppercase text-[var(--color-text-muted)] mb-4">
            即將上架
          </p>
          <p className="text-2xl font-black">課程正在準備中</p>
          <p className="text-[var(--color-text-muted)] mt-2 text-sm">
            訂閱電子報，課程開放時第一時間通知你
          </p>
        </div>
      ) : (
        <div className={coursePreviewTokens.grid}>
          {data.courses.map((course) => (
            <div key={course.id} className={coursePreviewTokens.card}>
              <div
                className={coursePreviewTokens.levelBar}
                style={{ background: levelColor[course.upgradeLevel] }}
              />
              <span
                className={coursePreviewTokens.level}
                style={{ color: levelColor[course.upgradeLevel] }}
              >
                Level {course.upgradeLevel}
              </span>
              <h3 className={coursePreviewTokens.title}>{course.title}</h3>
              {course.summary && (
                <p className={coursePreviewTokens.summary}>{course.summary}</p>
              )}
              <Link href={`/courses/${course.slug}`} className={coursePreviewTokens.link}>
                開始學習 →
              </Link>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  )
}
