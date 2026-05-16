# PAYMENT-OPTIONAL-SYSTEM.md

## 設計原則：Payment Ready / Provider Later

`PAYMENT_PROVIDER=none` 時，系統完整運作。`/checkout` 頁顯示「即將開放」。
不影響 build、部署、其他頁面。

---

## 第一階段預設

```env
PAYMENT_PROVIDER=none
```

- `/checkout/[courseSlug]` 顯示「付款系統即將開放」+ 電子報 CTA
- 不需要任何金流帳號即可上線
- Purchases / Subscriptions collection 已建好，等金流接入後直接寫入

---

## 切換 Provider（上線後另開 Claude Code session）

### LemonSqueezy（推薦初期，抽成 5%，免月費）

```env
PAYMENT_PROVIDER=lemonsqueezy
LS_API_KEY=
LS_STORE_ID=
LS_WEBHOOK_SECRET=
```

設定步驟：
1. 註冊 https://lemonsqueezy.com
2. 建立 Store
3. 每個付費課程建立一個 Product，將 Product ID 填入 /admin → Courses
4. 設定 Webhook：`https://aiart.tw/api/webhooks/lemonsqueezy`

Webhook 流程：`order_created` → 寫入 Purchases → 更新 Students.level

### Payuni（台灣金流，支援信用卡 / ATM / 超商）

```env
PAYMENT_PROVIDER=payuni
PAYUNI_MERCHANT_ID=
PAYUNI_HASH_KEY=
PAYUNI_HASH_IV=
```

---

## 新增 Provider

1. `src/lib/payment/adapters/` 新增 adapter
2. `src/lib/payment/adapters/index.ts` 新增 case
3. `.env.example` 新增對應變數
