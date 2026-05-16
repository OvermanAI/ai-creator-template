import { ButtonLink } from '@/components/ButtonLink'
import { heroTokens } from './tokens'
import type { HomeHeroSectionData } from './schema'

export function HomeHeroSection({ data }: { data: HomeHeroSectionData }) {
  return (
    <section className={heroTokens.section}>
      <div className={heroTokens.grid}>

        {/* ── Left: white editorial column ── */}
        <div className={heroTokens.leftCol}>
          <div>
            <p className={heroTokens.issueTag}>/01 — YOUR_SITE.TW</p>
            <h1 className={heroTokens.headline}>{data.headline}</h1>
            <p className={heroTokens.tagline}>{data.tagline}</p>
            <div className={heroTokens.ctaRow}>
              <ButtonLink href={data.ctaHref} variant="accent">
                {data.ctaLabel}
              </ButtonLink>
              {data.secondaryCtaLabel && data.secondaryCtaHref && (
                <ButtonLink href={data.secondaryCtaHref} variant="black">
                  {data.secondaryCtaLabel}
                </ButtonLink>
              )}
            </div>
          </div>
          <div className={heroTokens.leftFooter}>
            <p className={heroTokens.idaw}>I Dream. AI Works.</p>
          </div>
        </div>

        {/* ── Right: dark brand column (desktop only) ── */}
        <div className={heroTokens.rightCol}>
          <p className={heroTokens.rightTag}>/01 — 2026</p>

          <div>
            <p
              className={heroTokens.rightBrand}
              style={{
                fontFamily: 'var(--font-display, inherit)',
                fontSize: 'clamp(5rem, 11vw, 9.5rem)',
                color: 'var(--color-accent)',
              }}
            >
              YOUR
            </p>
            <p
              className={heroTokens.rightSub}
              style={{
                fontFamily: 'var(--font-display, inherit)',
                fontSize: 'clamp(3rem, 6.5vw, 5.5rem)',
              }}
            >
              SITE.TW
            </p>
            <div className={heroTokens.rightDivider} />
            <p className={heroTokens.rightCaption}>{data.tagline}</p>
          </div>

          <p className={heroTokens.rightCredit}>[你的名字] × [你的品牌] 2026</p>
        </div>

      </div>
    </section>
  )
}
