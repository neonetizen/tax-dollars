# My Tax Dollars

> A receipt for your San Diego property taxes

---

## Team

| Name | Role |
|------|------|
| Justin Pelak | Claude Expert |
| Michael Corn | Claude Expert |

---

## Problem Statement

San Diego collects property taxes from hundreds of thousands of homeowners every year, but residents have almost no intuitive way to understand what they're actually funding. Budget documents are dense, portals are hard to navigate, and aggregate statistics obscure how money is allocated. The result: taxpayers pay without any meaningful sense of what they got in return.

**My Tax Dollars** reframes the question. Instead of "here is the city budget," it asks: "you paid X dollars — here is your receipt."

---

## What It Does

A San Diego homeowner enters their property's assessed value. The app calculates their approximate annual property tax contribution and breaks it down by city department (public safety, parks, libraries, roads, etc.) and capital improvement projects. Finally, it hands that combined picture to Claude, which renders a plain-English "tax receipt verdict" explaining where the money went.

The whole experience is a single page. No account required. Just a number in, a receipt out.

---

## Data Sources

| Source | What It Provides |
|--------|-----------------|
| [San Diego County Assessor](https://www.sandiegocounty.gov/content/sdc/assessor.html) | Property assessed value baseline and tax rate calculation |
| [City of San Diego Open Data Portal](https://data.sandiego.gov) | Operating budget actuals and capital improvement project data |
| [San Diego Fiscal Year Budget](https://www.sandiego.gov/finance/budget) | Department-level spending allocations used to weight tax breakdowns |

Raw CSVs from `data.sandiego.gov` are pre-processed by `scripts/seed-supabase.ts` and stored in two Supabase tables: `budget_by_department` and `cip_projects`. The app queries these at request time — no raw CSVs are shipped to the browser.

---

## Architecture

```
User Input (assessed value + zip code)
        |
        v
/api/tax-receipt (Next.js API route)
  - Queries Supabase: budget_by_department, cip_projects tables
  - Calls taxCalculator.ts: assessedValue × 0.01 × 0.18 → per-dept breakdown
  - Returns TaxReceiptResponse (breakdown + CIP projects)
        |
        v
/api/verdict (Next.js API route)
  - Receives structured JSON (tax breakdown + CIP data)
  - Sends to Claude claude-haiku-4-5-20251001 via Anthropic SDK
  - Returns a plain-English "tax receipt verdict"
        |
        v
Receipt UI (React, single page)
  - Renders line-item tax breakdown
  - Renders capital improvement projects
  - Renders department chart (bar, donut, treemap, list views)
  - Renders Claude's verdict
```

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts, Supabase, Zod, Anthropic Claude SDK.

**Deployment:** Vercel. Supabase hosts pre-processed budget and CIP data (seeded from raw CSVs via `npm run seed`). Required environment variables: `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Key File Structure

```
src/
  app/
    page.tsx                        # Root page
    api/
      tax-receipt/route.ts          # Supabase data fetch + tax calculation
      verdict/route.ts              # Claude proxy (server-side only)
  components/
    InputForm.tsx                   # Assessed value + zip code input
    TaxReceipt.tsx                  # Main receipt display
    DepartmentChart.tsx             # Bar / donut / treemap / list chart views
    VerdictPanel.tsx                # Claude's plain-English verdict
    HeroHeader.tsx
    Disclaimer.tsx
  lib/
    taxCalculator.ts                # assessedValue → TaxBreakdown
    budgetAggregator.ts             # CSV rows → Map<dept_name, spend> (used by seed)
    prompts.ts                      # Claude prompt templates
    supabase.ts                     # Supabase client
  types/index.ts                    # All shared TypeScript interfaces
  context/AppContext.tsx            # useReducer + Context provider
scripts/
  seed-supabase.ts                  # Parses CSVs and populates Supabase tables
  test-receipt.ts                   # Manual API smoke test
public/data/                        # Raw CSVs (local reference; not served to browser)
```

## Testing

Unit and component tests use **Vitest** + `@testing-library/react`.

```bash
npm test              # run all tests
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

---

## Live Application

https://tax-dollars-inky.vercel.app