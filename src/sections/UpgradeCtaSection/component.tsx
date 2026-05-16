import { SectionShell } from '@/components/SectionShell'
import { ButtonLink } from '@/components/ButtonLink'
import { upgradeCtaTokens } from './tokens'
import type { UpgradeCtaSectionData } from './schema'

export function UpgradeCtaSection({ data }: { data: UpgradeCtaSectionData }) {
  return (
    <SectionShell dark>
      <div className={upgradeCtaTokens.inner}>
        <h2 className={upgradeCtaTokens.headline}>{data.headline}</h2>
        <ButtonLink href={data.ctaHref} variant="accent">
          {data.ctaLabel}
        </ButtonLink>
      </div>
    </SectionShell>
  )
}
