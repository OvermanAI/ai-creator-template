# FONTS.md

字體系統規則。優先順序：`CLAUDE.md` > `docs/DESIGN.md` > 本文件

---

## 核心原則

**不直接引用外部字體 CDN（fonts.googleapis.com 等）。**
字型統一透過 `next/font/google` 自託管。

`next/font/google` 在 build time 下載字型檔，serve 時走自己的 CDN。
使用者瀏覽器不會發送任何 Google 請求，無隱私疑慮，不影響 Core Web Vitals。

---

## aiart.tw 預設字體：Noto Sans TC

```ts
// app/layout.tsx
import { Noto_Sans_TC } from 'next/font/google'

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-zh-sans',
  display: 'swap',
  preload: false,  // 繁中字型檔大，不預載
})
```

- weight 900 是 Neobrutalism H1 的必要字重
- `preload: false` 避免大型繁中字型拖慢 LCP

---

## 排版規則

### 字距

- **`letter-spacing: 0`** — 全站不加任何 tracking utilities（`tracking-wide` 等禁止使用）
- Neobrutalism 的視覺力量依賴緊湊字距，不加任何 tracking

### 行高

- 內文：`leading-[1.9]`（繁中長段落適讀）
- 標題：`leading-tight`（1.1–1.25）

### H1 字級

```css
font-size: clamp(2.5rem, 6vw, 5rem);
font-weight: 900;
```

### 欄寬

- 內容區：`max-w-6xl`
- 文章區：`max-w-4xl`

---

## 繁中標題斷行原則

- 最多 2–3 行
- 桌機：每行 12–18 全形字為目標
- 手機：每行 8–12 全形字為目標
- 中英混排詞組（如「AI Agent」「Midjourney」）不可被切斷

實作：用 `<br />` 配合 Tailwind responsive 做手機與桌機分版斷行：

```html
<h1>
  用 AI 開創<br className="sm:hidden" />
  你的一人藝術事業
</h1>
```

---

## 禁止

- 直接引用 `fonts.googleapis.com`
- 使用任何第三方字體 CDN
- 加任何 `tracking-*` utilities
- 用 `max-w-[Nch]` 強制截斷行寬
