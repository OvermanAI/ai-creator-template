# START_Prompt.md

把以下提示詞複製貼上到新的 Claude Code 對話，就可以開始了。
**使用前先把 `aivideo-tw` 換成你的站名。**

---

```
請先閱讀 CLAUDE.md。讀完後，依文件中的技術架構與設計系統，為這個已 clone 好的母版完成客製化與部署。

請以 Claude Code 主導整個流程：品牌設定、coach.config、seed-data、環境變數、資料庫、部署、smoke test。
人只負責瀏覽器授權，不要把任何技術步驟留給使用者手動操作。

請採連續執行模式。只有在以下情況才暫停：
1. 需要在瀏覽器授權（GitHub、Vercel、Neon）
2. 需要提供帳號密碼或外部憑證

---

## 第一步：從 GitHub template 建立新站

執行以下指令（已包含 clone）：

\`\`\`bash
gh repo create aivideo-tw --private --template OvermanAI/ai-creator-template --clone
cd aivideo-tw
\`\`\`

---

## 目標

建立一個可立即上線的 AI 教練網站（獲客 + 課程變現）。
第一階段核心：展示課程、建立信任、收集名單。

金流與 Email 採 Provider Later 模式（PAYMENT_PROVIDER=none、EMAIL_PROVIDER=none），網站仍須完整運作。

EMAIL_PROVIDER=none 時，電子報訂閱表單仍正常運作，email 寫入 DB。
訂閱成功後頁面只顯示「已加入候補名單，課程開放時將第一時間在此通知你」，
不顯示任何暗示確認信已寄出的文字。

---

## 架構原則（全部依 CLAUDE.md 執行）

- **Section First**：每個 section 獨立元件、獨立資料 contract，page 只負責組裝
- **Payload First**：所有內容從 Payload block data 讀取，禁止在元件中寫死繁中字串
- **Provider Later**：Payment / Email / Google OAuth 全為可選，缺少時不影響 build
- **Neobrutalism**：border-2 border-black + box-shadow offset，全站 border-radius: 0，letter-spacing: 0，accent 色從 coach.config.ts 注入

---

## 客製化步驟（clone 後依序完成）

1. **修改 `coach.config.ts`**：填入新站品牌名稱、tagline、accentColor、domain
2. **修改 `src/payload/seed-data.ts`**：換成新站的初始課程與頁面內容
3. **設定 Git 身份**（否則 Vercel 部署會被 BLOCKED）：
   \`\`\`bash
   git config user.name "OvermanAI"
   git config user.email "doyen@opand.com"
   \`\`\`
4. **安裝依賴**：`npm install`
5. **初始化 DB + 管理員帳號**：`npm run bootstrap`
6. **寫入 seed 內容**：`npm run seed`
7. **本機驗收**：`npm run build` 0 error，`npm run dev` 正常瀏覽
8. **部署**：
   \`\`\`bash
   vercel link
   vercel integration add neon   # 自動建立 Neon + 注入 DATABASE_URL
   vercel env pull .env.local
   vercel deploy --prod
   \`\`\`

---

## 驗收標準（全部通過才算完成）

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
