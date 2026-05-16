/**
 * typography.ts
 * your-site.tw 雙語字型規則手冊
 * 供 Coding Agent 在寫元件時查閱，確保全站字型一致性。
 *
 * 字型系統：
 *   英文展示 → Cormorant Garamond (--font-display)
 *   英文 UI  → DM Sans            (--font-sans)
 *   繁中標題 → Noto Serif TC      (--font-zh-serif)
 *   繁中內文 → Noto Sans TC       (--font-zh-sans)
 */

export const typographyRules = {
  cormorant: {
    description: '英文展示字 — 用於大標題、英文 eyebrow、英文引言',
    allowedWeights: [300, 400],
    displaySize: 'clamp(40px, 6vw, 72px)',
    titleSize: 'clamp(24px, 3vw, 40px)',
    eyebrowSize: '13px',
    displayLeading: 1.05,
    displayTracking: '-0.025em',
    eyebrowTracking: '0.25em',
    italic: '關鍵詞與引言用 italic，以 <em> 包裹，不加其他樣式',
    forbidden: ['font-weight 超過 400', 'font-size 小於 13px 用於展示'],
  },
  notoSerifTC: {
    description: '繁中標題字 — 用於繁中主標、副標、段落標題',
    allowedWeights: [200, 300, 400],
    displayWeight: 300,
    titleWeight: 400,
    displaySize: 'clamp(26px, 3.5vw, 44px)',
    titleSize: 'clamp(18px, 2.2vw, 26px)',
    displayLeading: 1.3,
    titleLeading: 1.5,
    displayTracking: '0.05em',
    titleTracking: '0.04em',
    forbidden: ['font-style: italic（漢字無斜體）', 'letter-spacing 負值', 'font-weight 超過 400'],
  },
  notoSansTC: {
    description: '繁中內文字 — 用於 body text、說明段落、UI 說明',
    allowedWeights: [200, 300],
    bodyWeight: 300,
    captionWeight: 200,
    bodySize: '15px',
    captionSize: '12px',
    bodyLeading: 1.9,
    bodyTracking: '0.02em',
    forbidden: ['font-weight 超過 300', 'line-height 小於 1.7'],
  },
  dmSans: {
    description: '英文 UI 字 — 用於按鈕、導覽、標籤、eyebrow、meta 資訊',
    allowedWeights: [200, 300, 400],
    buttonWeight: 300,
    bodyWeight: 300,
    buttonSize: '11px',
    buttonTracking: '0.18em',
    buttonTransform: 'uppercase',
    forbidden: ['font-weight 超過 400 在內文', 'letter-spacing 負值'],
  },
  mixedLayoutRules: {
    pattern_A: 'DM Sans eyebrow（英文）→ Noto Serif TC 主標（繁中）',
    pattern_B: 'Cormorant 大字（英文）→ Noto Serif TC 說明（繁中），兩者垂直並置',
    pattern_C: 'Cormorant italic eyebrow（英文）→ Noto Serif TC 主標（繁中）',
    forbidden: [
      '同一行內混排超過 3 個漢字 + 英文單字',
      '對繁中套用 Cormorant 字型',
      '對英文大字套用 Noto Serif TC',
    ],
  },
} as const
