# Currency Exchange Rate API Research & Integration Plan

Research and integrate the **ExchangeRate-API** open free service (`https://open.er-api.com/v6/latest/USD`) to provide live estimated FX rate displays in the UI, cached server-side for 24 hours with an automatic fallback to Vixora's approved fixed commercial pricing contract.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices were confirmed during Phase 1 clarification:

- **Confirmed Decision 1 (Primary Goal)**: Display live estimated converted prices in the UI as informative metadata, while keeping payment checkout amounts server-authoritative to prevent price tampering.
- **Confirmed Decision 2 (API Provider)**: Use **ExchangeRate-API** (`https://open.er-api.com/v6/latest/USD`), an ultra-reliable free-tier FX service requiring zero API keys.
- **Confirmed Decision 3 (24-Hour Server Caching)**: Proxy requests through `/api/exchange-rates` on Express (`server.ts`) with a 24-hour server memory cache and graceful fallback to approved fixed prices in `coursePricing.ts`.

---

## 1. Research & Technical Specifications

### A. ExchangeRate-API Provider Analysis
- **Endpoint**: `GET https://open.er-api.com/v6/latest/USD`
- **Authentication**: None required (keyless open endpoint).
- **Update Frequency**: Daily (24-hour cycle matching `time_next_update_unix`).
- **Response Format**:
```json
{
  "result": "success",
  "provider": "https://www.exchangerate-api.com",
  "time_last_update_unix": 1710000000,
  "time_next_update_unix": 1710086400,
  "base_code": "USD",
  "conversion_rates": {
    "USD": 1,
    "NGN": 1450.25,
    "EUR": 0.91,
    "GBP": 0.78
  }
}
```

### B. Security & Rate-Limiting Protection
- Direct client-side calls to third-party APIs can leak user IP addresses, encounter CORS blocks, or trigger rate limits.
- Routing requests through Express `/api/exchange-rates` ensures:
  1. Single API call per 24 hours across all active users.
  2. Automatic fallbacks if third-party servers undergo downtime.
  3. Strict zero-trust separation between UI estimation displays and Paystack payment initialization.

---

## 2. User Experience & Visual Design

- **Subtle Live FX Indicator**:
  - In `CurrencySwitcher.tsx`, display an unboxed, quiet indicator showing live FX status (e.g. `1 USD = ₦1,450.25 · Live FX Rate`).
  - No static pill capsules or decorative green pulsing dots.
- **Course Pricing Display**:
  - When switching currencies (NGN ₦ / USD $), display both the approved commercial price and a quiet estimated live conversion note where helpful.

---

## 3. Key Technical Decisions & Trade-Offs

- **Server-Side Memory Cache (`/api/exchange-rates`)**:
  - *Chosen Approach*: Cache FX rates in memory for 24 hours (`86,400,000 ms`).
  - *Why*: Prevents unnecessary external network overhead, abides by ExchangeRate-API fair-use terms, and guarantees Instant 0ms response latency for clients.
- **Graceful Fallback**:
  - *Chosen Approach*: If the external API call fails or times out, serve the approved commercial pricing defaults from `src/data/coursePricing.ts`.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│           ExchangeRate-API Open Endpoint               │
│         (https://open.er-api.com/v6/latest/USD)         │
└──────────────────────────┬─────────────────────────────┘
                           │ 24-Hour Fetch
                           ▼
┌────────────────────────────────────────────────────────┐
│          Express Backend Server (/api/exchange-rates)  │
│        - 24-Hour Memory Cache                          │
│        - Fallback to src/data/coursePricing.ts         │
└──────────────────────────┬─────────────────────────────┘
                           │ JSON Rates Payload
                           ▼
┌────────────────────────────────────────────────────────┐
│            Client Context & UI Components              │
│       - src/context/CurrencyContext.tsx               │
│       - src/components/CurrencySwitcher.tsx            │
└────────────────────────────────────────────────────────┘
```

### Affected Files & Components:
1. `server.ts`: Add `/api/exchange-rates` endpoint with 24-hour caching and fallback.
2. `src/context/CurrencyContext.tsx`: Fetch FX rates from `/api/exchange-rates` on mount and expose live rate calculation helpers.
3. `src/components/CurrencySwitcher.tsx`: Render quiet live FX rate attribution.

---

## Plan Approval Request
Please review the plan above and let me know if you would like to proceed with implementation or make any adjustments!
