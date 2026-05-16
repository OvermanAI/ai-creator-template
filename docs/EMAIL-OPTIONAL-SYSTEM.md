# EMAIL-OPTIONAL-SYSTEM.md

## 設計原則：Email Ready / Provider Later

`EMAIL_PROVIDER=none` 時，訂閱資料寫入 DB，不寄信，全站正常運作。
不影響 build、部署、電子報收單功能。

---

## 第一階段預設

```env
EMAIL_PROVIDER=none
```

- `POST /api/newsletter` 正常寫入 NewsletterSubscribers collection
- 不寄出任何 email
- 不需要任何 email 帳號即可上線
- Email template contract 與 adapter 邊界已預先定義好

---

## 切換 Provider（上線後另開 Claude Code session）

### Resend（推薦初期，免費方案 3,000 封/月）

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@aiart.tw
```

用途：歡迎信、課程上架通知、transactional email

### Kit（前身 ConvertKit，電子報受眾管理）

```env
EMAIL_PROVIDER=kit
KIT_API_KEY=
KIT_TAG_ID=
```

用途：名單標籤管理、自動化序列信

### AgentMail（Agent 原生 Email）

```env
EMAIL_PROVIDER=agentmail
AGENTMAIL_API_KEY=
AGENTMAIL_INBOX_ID=
AGENTMAIL_FROM_EMAIL=
```

用途：Agent follow-up、收件匣 / thread 工作流

---

## 新增 Provider

1. `src/lib/email/adapters/` 新增 adapter
2. `src/lib/email/adapters/index.ts` 新增 case
3. `.env.example` 新增對應變數
