export interface LevelCard {
  level: 'l1' | 'l2' | 'l3'
  label: string
  name: string
  promise: string
  ctaLabel: string
  ctaHref: string
}

export interface LevelIntroSectionData {
  blockType: 'levelIntroSection'
  title: string
  subtitle?: string
  cards: LevelCard[]
}
