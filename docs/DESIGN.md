# DESIGN.md — aiart.tw

> **視覺系統是固定的，所有站點完全一致。**
> aiart.tw 唯一的品牌變數是 `accentColor: #FF6B9D`，從 `coach.config.ts` 讀取注入。

---

## 設計風格

**Neobrutalism** — 粗邊框、無圓角、明確陰影、高對比。
不是科技 SaaS，不是可愛插畫風，是有力度的實戰教學站。

---

## 色彩系統

```
背景        #D9D9D9
卡片/白底   #FFFFFF
正文        #000000
次文字      #4a4a4a
主色 Accent #FF6B9D  ← aiart.tw 品牌粉，從 coach.config.ts 注入

Level 1     #ff2d55
Level 2     #FFB11B
Level 3     #00b388

強調黃      #ffe600（highlight、badge）
黑底區塊    #000000（upgrade CTA、footer）
```

在程式碼中使用 accentColor：
```tsx
// 從設定讀取，不寫死 Hex
import coachConfig from '../../coach.config'
const accent = coachConfig.brand.accentColor  // '#FF6B9D'
```

---

## 邊框與陰影

```css
border: 2px solid #000
box-shadow: 4px 4px 0 #000   /* 卡片 */
box-shadow: 3px 3px 0 #000   /* 按鈕 */
box-shadow: 5px 5px 0 #000   /* 主要 hero 卡片 */
border-radius: 0              /* 全站無圓角 */
```

hover 效果：`hover:shadow-none`（陰影消失，產生按壓感）

---

## 排版

- Tailwind v4 + `next/font/google`（Noto Sans TC）
- `letter-spacing: 0`，全站不加任何 tracking utilities
- H1 字級：`clamp(2.5rem, 6vw, 5rem)`，font-weight: 900
- Body 行高：`leading-[1.9]`（繁中適讀）
- 欄寬：`max-w-6xl`（內容區）、`max-w-4xl`（文章區）

---

## 元件模式

### Level badge
```html
<!-- Level 1 badge -->
<span class="border-2 border-black px-3 py-1 font-mono text-xs font-black"
      style="background: #ff2d55; color: #fff; box-shadow: 2px 2px 0 #000">
  AI 創作力
</span>

<!-- 免費 badge -->
<span class="border-2 border-black bg-[#ffe600] px-2 py-0.5 font-mono text-xs font-black">
  免費
</span>
```

### 課程卡
```
border-2 border-black bg-white
box-shadow: 4px 4px 0 #000
hover:shadow-none transition-[box-shadow]
```

### 主要按鈕（CTA）
```html
<!-- accentColor (#FF6B9D) 從設定讀取，用 style 注入 -->
<a class="inline-flex h-11 items-center border-2 border-black px-6 font-bold text-sm text-white hover:shadow-none"
   style={{ backgroundColor: accentColor, boxShadow: '3px 3px 0 #000' }}>
  開始免費課程 →
</a>
```

### Upgrade CTA 橫幅（Level 之間）
```html
<div class="border-2 border-black bg-black p-6"
     style="box-shadow: 4px 4px 0 #4a4a4a">
  <!-- 白字 + 白框按鈕 -->
</div>
```

### 付費牆區塊
```html
<div class="border-2 border-black bg-[#ffe600] p-8 text-center"
     style="box-shadow: 5px 5px 0 #000">
  <!-- 解鎖內容 CTA -->
</div>
```

---

## 頁面節奏

### 首頁
1. Hero（大標題 + 主 CTA）
2. 三個 Level 介紹（L1 / L2 / L3）
3. 課程預覽（前幾門免費課）
4. 電子報訂閱
5. Footer

### 課程列表 /courses
1. Level 1 課程群組
2. Level 1→2 升級 CTA 橫幅
3. Level 2 課程群組
4. Level 2→3 升級 CTA 橫幅
5. Level 3 課程群組

### 定價頁 /pricing
1. 三欄定價卡（L1 / L2 / L3）
2. aicoach.tw 認證教練橫幅

---

## Section 架構原則

- 每個 section 獨立元件、獨立資料 contract
- 不用 pageSlug 或 route 決定版型
- 首頁 Hero ≠ 課程頁 Hero（分開寫）
- 共用層：`SectionShell`、`ButtonLink`、色彩 token

---

## 禁止

- 螢光科技藍、SaaS 漸層
- 廉價未來感動畫
- 過多裝飾性元素
- 任何圓角（border-radius > 0）
- 把 accentColor (#FF6B9D) 寫死在元件裡（永遠從 coach.config.ts 讀取）
