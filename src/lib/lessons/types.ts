export type LessonCategory = 'build' | 'sell'
export type LessonLevel = 'beginner' | 'easy' | 'medium'
export type LessonAccessLevel = 'free' | 'paid'
export type LessonUpgradeLevel = '1' | '2' | '3'

export type LessonCard = {
  slug: string
  title: string
  summary: string
  missionLabel: string          // 任務標籤，例如「AI 生圖任務」
  category: LessonCategory
  upgradeLevel: LessonUpgradeLevel
  level: LessonLevel            // 難度星等
  tools: string[]               // 使用工具，例如 ['Midjourney', 'ChatGPT']
  durationMinutes: number
  outcome: string               // 完成後你能做什麼
  accessLevel: LessonAccessLevel
  order: number
  price: number                 // 課程定價（NTD），免費課程為 0
  coverImage?: string           // 課程封面圖 URL（由 npm run images 自動填入）
  videoUrl?: string             // 付費課程影片 embed URL（YouTube / Vimeo）
}
