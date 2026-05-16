import { SectionShell } from '@/components/SectionShell'
import { ButtonLink } from '@/components/ButtonLink'
import { pricingTokens, levelColor } from './tokens'
import type { PricingSectionData } from './schema'

export function PricingSection({ data }: { data: PricingSectionData }) {
  return (
    <SectionShell>
      <h2 className="text-4xl font-black">{data.title}</h2>
      {data.subtitle && (
        <p className="mt-4 text-xl text-[var(--color-text-muted)]">{data.subtitle}</p>
      )}
      <div className={pricingTokens.grid}>
        {data.tiers.map((tier) => (
          <div
            key={tier.level}
            className={tier.highlighted ? pricingTokens.cardHighlighted : pricingTokens.card}
            style={{ borderTopColor: levelColor[tier.level], borderTopWidth: 6 }}
          >
            <span className={pricingTokens.label} style={{ color: levelColor[tier.level] }}>
              {tier.label}
            </span>
            <h3 className={pricingTokens.name}>{tier.name}</h3>
            <div>
              <span className={pricingTokens.price}>{tier.price}</span>
              {tier.priceNote && (
                <span className={`${pricingTokens.priceNote} ${tier.highlighted ? 'text-gray-400' : 'text-[var(--color-text-muted)]'}`}>
                  {' '}{tier.priceNote}
                </span>
              )}
            </div>
            <ul className={pricingTokens.featureList}>
              {tier.features.map((f, i) => (
                <li key={i} className={pricingTokens.featureItem}>
                  <span>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <ButtonLink
              href={tier.ctaHref}
              variant={tier.highlighted ? 'accent' : 'black'}
            >
              {tier.ctaLabel}
            </ButtonLink>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}
