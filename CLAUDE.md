# CLAUDE.md

This file provides guidance to Claude Code when building this repository.

## CUSTOMIZATION CHECKLIST

When forking this template for a new site, update these in order:

1. **`coach.config.ts`** — brand name, tagline, accent color, domain, level names
2. **`site.config.json`** — navigation links (add/remove pages as needed)
3. **`src/payload/seed-data.ts`** — replace placeholder lessons with real ones
4. **`content/courses/l2/`** and **`content/courses/l3/`** — write your actual course outlines using the example files as templates
5. **`.env.local`** (copy from `.env.example`) — fill in API keys (PAYLOAD_SECRET, BETTER_AUTH_SECRET, email/payment providers)
6. **`src/components/lessons/LessonLP.tsx`** — update instructor bio section (section 5) with your own info and photo
7. **`src/app/(frontend)/page.tsx`** — hero image (currently uses a placeholder bg color)
8. **Deploy to Vercel** (see Vercel section below)

---

## 這是什麼

**Agent-native Creator Monetization Template**

定位：幫助創作者用 AI 把技能變成可以賣的一人事業。
核心流程：獲客（收名單）→ 信任建立（免費課程）→ 課程變現（L1 / L2 / L3 升級路徑）。

**Tech Stack**
- Next.js 15 App Router
- Payload CMS v3（embedded in Next.js）
- Neon PostgreSQL（透過 Vercel Integration 自動建立）
- Better Auth（學員認證）
- Tailwind CSS v4
- Vercel（部署）

**品牌設定點（唯一修改位置）**
```ts
// coach.config.ts
brand: {
  name: 'YOUR_SITE.tw',
  tagline: '你的品牌標語',
  accentColor: '#FF6B9D',
  domain: 'your-site.tw',
}
```

---

## 指令

```bash
npm install
npm run dev              # 啟動開發伺服器 :3000
npm run build
npm run generate:types   # 修改 Payload collections 後執行
npm run generate:importmap

# 初始化
npm run bootstrap        # DB schema + admin 帳號
npm run seed             # 寫入初始內容到 Payload DB

# 課程同步（Markdown → Payload DB）
npm run sync-lessons     # 同步 content/courses/ 到資料庫

# 部署
gh repo create your-site-tw --private --source=. --push
vercel link
vercel integration add neon   # 自動建立 Neon project + 注入 DATABASE_URL
vercel env pull .env.local
vercel deploy
vercel deploy --prod
```

---

## 架構

### 雙層路由

```
app/(frontend)/   ← 獲客層：首頁、課程預覽、定價、Blog、電子報
app/(student)/    ← 變現層：登入、學員後台、結帳佔位
app/(payload)/    ← Payload CMS 管理後台 /admin
```

### 資料流

```
coach.config.ts（品牌唯一設定點）
      ↓
site.config.json（nav、features）
      ↓ (npm run seed)
Payload CMS DB（SQLite 本機 / Neon Postgres prod）
      ↓ (queries.ts with withDatabaseFallback)
Next.js App Router pages
```

- 所有 query 用 `unstable_cache`，revalidate: 300
- `withDatabaseFallback()` 包住每個 Payload 呼叫，DB 不通時降級到 seed JSON

### sync-lessons 工作流

課程內容以 Markdown 撰寫，存放在 `content/courses/l2/` 和 `content/courses/l3/`。
執行 `npm run sync-lessons` 解析 Markdown → 寫入 Payload `lessons` collection。

格式範例：`content/courses/l2/001-example-course.md`

### 資料庫

- 本機：SQLite（PAYLOAD_DATABASE_PROVIDER=sqlite，預設）
- Prod：Neon Postgres（PAYLOAD_DATABASE_PROVIDER=postgres + DATABASE_URL）
- Schema 由 `PAYLOAD_DATABASE_PUSH=true` 自動推送，不需手動 migration

### 認證（兩套完全分離，不互通）

| 用途 | 系統 | 路徑 |
|---|---|---|
| 學員登入 | Better Auth | `/auth/login`、`/api/auth/[...all]` |
| CMS 管理 | Payload Users | `/admin` |

Better Auth 設定：
- Email magic link（必要，第一階段唯一登入方式）
- Google OAuth 條件式載入：`GOOGLE_CLIENT_ID` 存在才啟用，不存在不崩潰
  ```ts
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
      : {}),
  }
  ```
- 學員 level 欄位：`guest | l1 | l2 | l3 | coach`

### Email：Provider Later

`EMAIL_PROVIDER=none` → 訂閱寫入 DB，不寄信，全站正常運作。
切換：`EMAIL_PROVIDER=resend | kit | agentmail`
Adapter 位置：`src/lib/email/adapters/`

### 金流：Provider Later

`PAYMENT_PROVIDER=none` → `/checkout` 顯示「即將開放」，全站正常運作。
切換：`PAYMENT_PROVIDER=lemonsqueezy | payuni`
Adapter 位置：`src/lib/payment/adapters/`

---

## Payload Collections

**獲客層**
- `Users`（CMS 管理員）、`Media`、`Categories`、`Posts`、`Pages`
- `NewsletterSubscribers`（email, name, subscribedAt）

**變現層**
- `Students`（email, name, level: guest/l1/l2/l3/coach, betterAuthId）
- `Lessons`（title, slug, summary, upgradeLevel: '1'|'2'|'3', accessLevel: free/paid, price, order, category, tools, chapters）
- `Purchases`（studentEmail, courseId→lessons, provider, amount, paidAt）
- `Subscriptions`（studentEmail, provider, status, level, currentPeriodEnd）

注意：`Courses.ts` collection 存在但未使用（未在 payload.config.ts 中載入）。實際課程資料用 `Lessons` collection。

**Global**
- `SiteSettings`（brandName, tagline, navigation）

---

## 設計系統（Neobrutalism）

### CSS Variables（app/globals.css）

```css
:root {
  --color-bg: #D9D9D9;
  --color-card: #FFFFFF;
  --color-text: #000000;
  --color-text-muted: #4a4a4a;
  --color-l1: #ff2d55;
  --color-l2: #FFB11B;
  --color-l3: #00b388;
  --color-highlight: #ffe600;
  /* --color-accent 由 layout.tsx 從 coach.config.ts 注入，不在此寫死 */
}
```

### 規則

- `border-radius: 0` 全站禁止圓角
- `letter-spacing: 0` 全站
- Neobrutalism card：`border-2 border-black` + `box-shadow: N px N px 0 #000` + `hover:shadow-none`
- H1：`clamp(2.5rem, 6vw, 5rem)`，`font-weight: 900`
- body：`line-height: 1.9`
- accent 色永遠從 `var(--color-accent)` 讀取，不寫死 Hex
- 字體：`next/font/google`（Noto Sans TC）

### layout.tsx accent 注入

```tsx
import coachConfig from '../coach.config'

<html
  lang="zh-Hant"
  style={{ '--color-accent': coachConfig.brand.accentColor } as React.CSSProperties}
>
```

---

## 頁面清單

### app/(frontend)/

| 路由 | 內容 |
|---|---|
| `/` | Hero → Level Grid → Free Course List → Newsletter |
| `/build` | Build 類別課程（L1/L2/L3） |
| `/sell` | Sell 類別課程（L1/L2/L3） |
| `/courses` | 所有課程按 upgradeLevel 分 L1/L2/L3 |
| `/courses/[slug]` | 課程詳情（免費課顯示內容；付費課→付費牆） |
| `/lessons/[slug]` | 單堂課頁面（LP 風格，含付費牆） |
| `/pricing` | L1/L2/L3 三欄定價 + 電子報 CTA |
| `/blog` | Posts 極簡列表 |
| `/blog/[slug]` | Post 詳情 |

### app/(student)/

| 路由 | 內容 |
|---|---|
| `/auth/login` | Email magic link 表單（必要）+ Google OAuth 按鈕（GOOGLE_CLIENT_ID 存在才顯示） |
| `/auth/register` | 學員註冊 |
| `/dashboard` | 需 Better Auth session，顯示 email + level |
| `/checkout/[courseSlug]` | 顯示「付款系統即將開放」+ 電子報 CTA |

---

## Vercel 部署

### 標準流程

```bash
gh repo create your-site-tw --private --source=. --push
vercel link
vercel integration add neon
vercel env pull .env.local
vercel deploy --prod
```

### 環境變數（必須用 REST API 設定，不能用 echo pipe）

```bash
VERCEL_TOKEN=$(cat "$HOME/Library/Application Support/com.vercel.cli/auth.json" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
PROJECT_ID=$(cat .vercel/project.json | python3 -c "import sys,json; print(json.load(sys.stdin)['projectId'])")
TEAM_ID=$(cat .vercel/project.json | python3 -c "import sys,json; print(json.load(sys.stdin)['orgId'])")

curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"PAYLOAD_DATABASE_PROVIDER","value":"postgres","type":"plain","target":["production"]}'
```

**注意：** `echo "postgres" | vercel env add` 帶換行符會導致 production 回落到 SQLite。

---

## Git 設定（必做，否則 Vercel 部署會 BLOCKED）

```bash
git config user.name "OvermanAI"
git config user.email "doyen@opand.com"
```

---

## 核心約束

- `PAYMENT_PROVIDER=none` + `EMAIL_PROVIDER=none` 下必須完整啟動
- 第一階段 `/checkout` 一律顯示「即將開放」佔位
- Payload Users ≠ 學員，兩套系統不互通
- 所有文案從 Payload 讀取，不寫死在元件
- 全站無圓角，`letter-spacing: 0`，accent 色從 `coach.config.ts` 讀取
- 開發工具優先使用 Claude Code，必要時也可以用 Codex 接手
