# WEBSITE_LAUNCH_SEO.md

新網站上線後的最小 SEO 操作清單。目標不是做完整 SEO，而是讓 Google 知道網站存在、社群分享正常、品牌可被搜尋。

---

## 前提：程式碼必須先備妥

上線前確認以下四個檔案存在且正確：

### 1. `app/opengraph-image.tsx`（動態 OG 圖片）

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '網站名稱 — 一句話描述'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex',
      flexDirection: 'column', justifyContent: 'center',
      alignItems: 'flex-start', backgroundColor: '#000000', padding: '80px' }}>
      <div style={{ fontSize: '72px', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
        網站名稱
      </div>
      <div style={{ fontSize: '28px', color: '#ffffff', opacity: 0.8, marginTop: '24px' }}>
        一句話描述
      </div>
    </div>,
    { ...size }
  )
}
```

### 2. `src/lib/site/metadata.ts`（加入 og:image + 驗證碼支援）

`getRootMetadata()` 必須包含：

```ts
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION

return {
  metadataBase: new URL(baseUrl),
  title: { default: config.siteName, template: `%s | ${config.siteName}` },
  description: config.metadata?.description,
  ...(googleVerification && {
    verification: { google: googleVerification },
  }),
  openGraph: {
    title: config.siteName,
    description: config.metadata?.description,
    url: baseUrl,
    siteName: config.siteName,
    locale: 'zh_TW',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: config.siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: config.siteName,
    description: config.metadata?.description,
    images: ['/opengraph-image'],
  },
}
```

### 3. `app/robots.ts`

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://yourdomain.com'
  return {
    rules: { userAgent: '*', allow: '/' },
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### 4. `app/sitemap.ts`

靜態核心頁面 + 動態 CMS 內容：

```ts
import type { MetadataRoute } from 'next'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://yourdomain.com'

  return [
    { url: `${baseUrl}/` },
    { url: `${baseUrl}/blog` },
    // 加入所有導航頁面
    // ...動態頁面從 Payload 查詢
  ]
}
```

### 5. `site.config.json`（必填）

```json
{
  "siteName": "網站名稱",
  "domain": "yourdomain.com",
  "metadata": {
    "titleTemplate": "%s | 網站名稱",
    "description": "清楚描述網站用途的一句話（120字以內）"
  }
}
```

---

## 上線當天操作流程

### Step 1：部署

```bash
git add app/opengraph-image.tsx app/sitemap.ts src/lib/site/metadata.ts
git commit -m "feat: minimum SEO — og:image, sitemap, search console ready"
git push origin main
# Vercel 自動部署，等待約 2 分鐘
```

### Step 2：Google Search Console 新增網站

1. 前往 [https://search.google.com/search-console](https://search.google.com/search-console)
2. 點「新增資源」→「網址前置字元」
3. 輸入完整網址，例如 `https://aicoach.tw`
4. 驗證方式選「HTML 標記」
5. 複製 `content="..."` 裡的驗證碼

### Step 3：加入驗證碼並重新部署

```bash
# 用 Vercel CLI 加入環境變數（不需手動到 Vercel 後台）
echo "你的驗證碼" | vercel env add GOOGLE_SITE_VERIFICATION production

# 重新部署
vercel deploy --prod
```

### Step 4：回 Search Console 完成驗證

部署完成後（約 2–3 分鐘）：
1. 回到 Search Console
2. 點「驗證」→ 出現「已驗證擁有權」✅

### Step 5：提交 Sitemap

1. 左側選「Sitemap」
2. 輸入 `sitemap.xml`
3. 點「提交」

---

## 完成標準

| 項目 | 驗證方式 |
|---|---|
| robots.txt 可開啟 | `https://yourdomain.com/robots.txt` |
| sitemap.xml 可開啟 | `https://yourdomain.com/sitemap.xml` |
| OG 圖片正常 | `https://yourdomain.com/opengraph-image` |
| 社群分享預覽正常 | [https://cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator) 或 Facebook Sharing Debugger |
| Google 驗證通過 | Search Console 顯示「已驗證擁有權」|
| Sitemap 已提交 | Search Console → Sitemap 顯示「成功」|

---

## 注意事項

- `GOOGLE_SITE_VERIFICATION` 只需加入 `production` 環境，不需要 preview
- Sitemap 提交後 Google 不會立即索引，通常 1–7 天內開始爬取
- 首頁必須有真實的 HTML 文字內容（品牌名稱 + 描述），不能是純圖片或純動畫
- 不要過度 SEO：新網站初期不需要 structured data、keyword stuffing、大量假內容
