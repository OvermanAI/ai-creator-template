export interface CourseCard {
  id: string
  title: string
  slug: string
  summary?: string
  upgradeLevel: '1' | '2' | '3'
}

export interface CoursePreviewSectionData {
  blockType: 'coursePreviewSection'
  title: string
  subtitle?: string
  ctaLabel: string
  ctaHref: string
  courses: CourseCard[]
}
