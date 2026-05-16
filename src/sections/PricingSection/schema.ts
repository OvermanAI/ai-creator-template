export interface PricingTier {
  level: 'l1' | 'l2' | 'l3'
  label: string
  name: string
  price: string
  priceNote?: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  highlighted?: boolean
}

export interface PricingSectionData {
  blockType: 'pricingSection'
  title: string
  subtitle?: string
  tiers: PricingTier[]
}
