import { SectionShell } from '@/components/SectionShell'
import { pageHeroTokens } from './tokens'
import type { PageHeroSectionData } from './schema'

export function PageHeroSection({ data }: { data: PageHeroSectionData }) {
  return (
    <SectionShell className={pageHeroTokens.wrapper}>
      <h1 className={pageHeroTokens.title}>{data.title}</h1>
      {data.intro && <p className={pageHeroTokens.intro}>{data.intro}</p>}
    </SectionShell>
  )
}
