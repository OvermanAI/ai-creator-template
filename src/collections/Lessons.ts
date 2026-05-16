import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'upgradeLevel', 'accessLevel', 'order'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'missionLabel',
      type: 'text',
      admin: {
        description: '任務標籤，例如「AI 生圖任務」',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: '建造 Build', value: 'build' },
        { label: '銷售 Sell', value: 'sell' },
      ],
    },
    {
      name: 'upgradeLevel',
      type: 'select',
      required: true,
      options: [
        { label: 'Level 1 — AI 創作力（免費）', value: '1' },
        { label: 'Level 2 — 開課賺錢（付費）', value: '2' },
        { label: 'Level 3 — 升級 OPC（高階）', value: '3' },
      ],
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: [
        { label: '入門 ★☆☆', value: 'beginner' },
        { label: '簡單 ★★☆', value: 'easy' },
        { label: '中等 ★★★', value: 'medium' },
      ],
      defaultValue: 'beginner',
    },
    {
      name: 'tools',
      type: 'array',
      fields: [
        {
          name: 'tool',
          type: 'text',
        },
      ],
      admin: {
        description: '使用工具，例如 Midjourney、ChatGPT',
      },
    },
    {
      name: 'durationMinutes',
      type: 'number',
      defaultValue: 30,
    },
    {
      name: 'outcome',
      type: 'text',
      admin: {
        description: '完成後你能做什麼',
      },
    },
    {
      name: 'accessLevel',
      type: 'select',
      required: true,
      options: [
        { label: '免費', value: 'free' },
        { label: '付費', value: 'paid' },
      ],
      defaultValue: 'free',
    },
    {
      name: 'price',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: '單課定價（NTD），免費課程填 0',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'coverImage',
      type: 'text',
      admin: {
        description: '封面圖 URL，例如 /images/lessons/slug.webp（由 npm run images 自動填入）',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description: '單一影片 URL（L1 免費課用）。L2/L3 多章節課程請用下方 chapters。',
      },
    },
    {
      name: 'chapters',
      type: 'array',
      admin: {
        description: 'L2/L3 多章節課程。有填則自動啟用章節導覽模式，忽略上方 videoUrl。',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { description: '章節名稱，例如「前言」「Ch1 知：理解 AI 的能力與限制」' },
        },
        {
          name: 'units',
          type: 'array',
          admin: { description: '本章節的單元（每支影片建議 30 分鐘以內）' },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { description: '單元名稱，例如「1-1 看見 AI 應用的四個層次」' },
            },
            {
              name: 'videoUrl',
              type: 'text',
              admin: { description: 'YouTube embed URL：https://www.youtube.com/embed/VIDEO_ID' },
            },
            {
              name: 'durationMinutes',
              type: 'number',
              defaultValue: 0,
              admin: { description: '影片時長（分鐘），可填小數，例如 22.93 = 22分56秒' },
            },
            {
              name: 'isFreePreview',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: '勾選後，未購買的訪客也能觀看此單元（試看）' },
            },
            {
              name: 'type',
              type: 'select',
              defaultValue: 'video',
              options: [
                { label: '▶ 教學影片', value: 'video' },
                { label: '🛠 AI 實做', value: 'practice' },
              ],
              admin: { description: '單元類型：教學影片 或 AI 實做（文字型，不需影片）' },
            },
            {
              name: 'practiceContent',
              type: 'textarea',
              admin: {
                description: 'AI 實做單元內容（type=practice 時填寫）。格式：\ntopic: 實做主題\ncase: 案例分享\nprompts:\n  - 提示詞1\n  - 提示詞2',
                condition: (data: Record<string, unknown>) => data?.type === 'practice',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor({}),
    },
  ],
}
