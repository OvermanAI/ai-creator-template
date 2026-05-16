import Image from 'next/image'
import Link from 'next/link'
import type { LessonCard as LessonCardType } from '@/lib/lessons/types'

const LEVEL_GRADIENTS: Record<string, [string, string]> = {
  '1': ['#CC1F1F', '#7A0D0D'],
  '2': ['#B37900', '#6B4800'],
  '3': ['#007A5E', '#003D2F'],
}


type LessonCardProps = {
  lesson: LessonCardType
  index: number
  isFullWidth?: boolean
}

export function LessonCard({ lesson, index, isFullWidth }: LessonCardProps) {
  const [gradA, gradB] = LEVEL_GRADIENTS[lesson.upgradeLevel] ?? ['#111', '#000']
  const stageNum = String(index + 1).padStart(2, '0')

  // 3:2 landscape for L1/L2 (66.67%), 21:9 cinematic for L3 (42.86%)
  const paddingTop = isFullWidth ? '42.86%' : '66.67%'

  return (
    <Link href={`/lessons/${lesson.slug}`} className="editorial-card group block">

      {/* Single layer: image + overlaid text, no separate text section */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop }}>

        {/* ── BACKGROUND: real image or artistic placeholder ── */}
        {lesson.coverImage ? (
          <Image
            src={lesson.coverImage}
            alt={lesson.title}
            fill
            className="object-cover editorial-card-img"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(160deg, ${gradA} 0%, ${gradB} 100%)` }}
          >
            {/* Grain texture */}
            <div className="lesson-placeholder-grain" />

            {/* Ghost stage number watermark */}
            <span
              className="absolute right-0 bottom-0 font-black text-white select-none leading-none pointer-events-none"
              style={{ fontSize: 'clamp(4rem, 18vw, 14rem)', opacity: 0.07, lineHeight: 0.82 }}
            >
              {stageNum}
            </span>

            {/* ▶ play hint on hover */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 border border-white/40 flex items-center justify-center">
                <span className="text-white/60 text-[9px] ml-px">▶</span>
              </div>
            </div>
          </div>
        )}

        {/* ── NO OVERLAY + CENTERED TEXT (032c editorial style) ── */}
        {/* 無遮罩：圖片完整呈現，文字靠 text-shadow 保持可讀性 */}
        <div
          className="absolute inset-0 flex flex-col justify-center items-center px-6 text-center"
        >
          {/* Mission label (subtitle above title) */}
          {lesson.missionLabel && (
            <p
              className="font-mono text-[9px] uppercase text-white/80 mb-3 tracking-widest leading-none"
              style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
            >
              {lesson.missionLabel}
            </p>
          )}

          {/* Title — large & centered, text-shadow ensures legibility without heavy overlay */}
          <h3
            className="font-black text-white leading-tight"
            style={{
              fontSize: isFullWidth
                ? 'clamp(1.8rem, 3.2vw, 3rem)'
                : 'clamp(1.25rem, 2vw, 1.9rem)',
              textShadow: '0 2px 16px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.6)',
            }}
          >
            {lesson.title}
          </h3>
        </div>

      </div>
    </Link>
  )
}
