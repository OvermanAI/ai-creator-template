# START.md

把以下提示詞複製貼上到新的 Claude Code 對話，就可以開始了。

---

```
請先閱讀 CLAUDE.md。讀完後，依文件中的技術架構與設計系統，從頭建立 aiart.tw 網站。

請以 Claude Code 主導整個流程：專案初始化、collections、頁面、環境變數、資料庫、部署、smoke test。
人只負責瀏覽器授權，不要把任何技術步驟留給使用者手動操作。

請採連續執行模式。只有在以下情況才暫停：
1. 需要在瀏覽器授權（GitHub、Vercel、Neon）
2. 需要提供帳號密碼或外部憑證

---

目標：建立一個可立即上線的 AI 藝術教練網站

這是「獲客 + 課程變現」網站。第一階段核心是展示課程、建立信任、收集名單。
金流與 Email 採 Provider Later 模式（PAYMENT_PROVIDER=none、EMAIL_PROVIDER=none），網站仍須完整運作。

EMAIL_PROVIDER=none 時，電子報訂閱表單仍正常運作，email 寫入 DB。
訂閱成功後頁面只顯示「已加入候補名單，課程開放時將第一時間在此通知你」，
不顯示任何暗示確認信已寄出的文字（因為沒有 email provider，不會寄信）。

架構原則（全部依 CLAUDE.md 執行）：
- Section First：每個 section 獨立元件、獨立資料 contract，page 只負責組裝
- Payload First：所有內容從 Payload block data 讀取，禁止在元件中寫死繁中字串
- Provider Later：Payment / Email / Google OAuth 全為可選，缺少時不影響 build
- Neobrutalism：border-2 border-black + box-shadow: N px N px 0 #000，全站 border-radius: 0，letter-spacing: 0，accent 色從 coach.config.ts 注入

專案初始化：用 create-payload-app 搭配 Next.js 15 template 建立基礎，再依 CLAUDE.md 架構完整補全。
本機資料庫用 SQLite，prod 用 Neon（透過 vercel integration add neon 自動建立）。
GitHub CLI 與 Vercel CLI 已安裝並登入，優先使用 CLI。

---

驗收標準（全部通過才算完成）：
- npm run build 0 error
- 首頁可顯示，品牌名稱從 coach.config.ts 讀取（非寫死）
- /courses 顯示課程或「課程即將上架」
- /pricing L1/L2/L3 三欄定價顯示
- /auth/login 顯示 Email magic link 表單
- /dashboard 未登入時導向 /auth/login
- /checkout/[slug] 顯示「付款系統即將開放」
- /admin Payload CMS 可進入
- POST /api/newsletter 回傳 200
- 全站無圓角、letter-spacing: 0、accentColor 從設定讀取
- vercel deploy --prod 成功，生產網址可正常瀏覽
```

---

## 上線後：接入 Google OAuth、金流、Email

另開 Claude Code session：

- **Google OAuth**：在 Google Cloud Console 建立 OAuth 憑證，加入 Vercel 環境變數 `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- **金流**：`PAYMENT_PROVIDER=lemonsqueezy`（或 payuni）
- **Email**：`EMAIL_PROVIDER=resend`（或其他）
