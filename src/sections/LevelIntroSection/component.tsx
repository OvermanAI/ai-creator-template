import { SectionShell } from '@/components/SectionShell'
import { ButtonLink } from '@/components/ButtonLink'
import { levelTokens, levelColorVar } from './tokens'
import type { LevelIntroSectionData } from './schema'

export function LevelIntroSection({ data }: { data: LevelIntroSectionData }) {
  return (
    <SectionShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-0">
        <div>
          <p className="font-mono text-[11px] uppercase text-[var(--color-text-muted)] mb-4">
            升級路徑
          </p>
          <h2 className="text-4xl font-black">{data.title}</h2>
          {data.subtitle && (
            <p className="mt-3 text-[var(--color-text-muted)] max-w-xl">{data.subtitle}</p>
          )}
        </div>
      </div>

      <div className={levelTokens.grid}>
        {data.cards.map((card) => (
          <div key={card.level} className={levelTokens.card}>
            {/* Thin level color bar */}
            <div
              className={levelTokens.bar}
              style={{ background: levelColorVar[card.level] }}
            />
            <span className={levelTokens.label}>{card.label}</span>
            <h3 className={levelTokens.name}>{card.name}</h3>
            <p className={levelTokens.promise}>{card.promise}</p>
            <ButtonLink href={card.ctaHref} variant="black">
              {card.ctaLabel}
            </ButtonLink>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
