export interface FaqItem {
  question: string
  answer: string
}

export interface FaqSectionData {
  blockType: 'faqSection'
  title: string
  items: FaqItem[]
}
