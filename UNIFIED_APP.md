# Adika Unified App Architecture

## One product, two shells, one backend

```
┌─────────────────────┐     ┌──────────────────────────┐
│ Expo Android APK    │     │ Telegram Mini App (Web)  │
│ Marketplace grid    │     │ Same listings + Tools    │
│ Tools Hub tab       │     │ Advisor + 8 tool tiles   │
│ Listing detail      │     │ FAB post, bottom nav     │
└──────────┬──────────┘     └────────────┬─────────────┘
           │                             │
           └──────────┬──────────────────┘
                      ▼
              Render Flask API
              + Supabase Postgres
```

## Feature map

| Feature | Mini App | Expo (this repo) |
|---------|----------|------------------|
| Listings grid SELL/BUY | ✅ | ✅ Tab ገበያ |
| Categories መኪና/ቤት/ንግድ | ✅ | ✅ |
| Listing detail + call | ✅ | ✅ /listing/[id] |
| Budget Advisor | ✅ | ✅ Tab AI — opens API advisor |
| 8 Tools (duty, loan, …) | ✅ | ✅ Tools grid → same web tools |
| Post listing | ✅ | Tab ለጥፍ (Phase-1 form) |
| Inbox / bot | ✅ | Tab Inbox → Telegram |

## Why tools open web URL

Complex flows (OCR, PDF contract, QR cadastre) already work in Mini App HTML.
Expo opens `https://adika-y37t.onrender.com/explorer?tool=...` until each tool is ported natively.

## Next native ports (priority)

1. Duty + Loan calculators (pure forms + /api/calculate-*)
2. Advisor chat UI → POST /api/advisor/chat
3. Post listing form → POST /api/post-listing
