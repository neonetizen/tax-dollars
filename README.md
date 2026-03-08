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

The whole experience is a single page. No account required. No backend. Just a number in, a receipt out.

---

## Data Sources

| Source | What It Provides |
|--------|-----------------|
| [San Diego County Assessor](https://www.sandiegocounty.gov/content/sdc/assessor.html) | Property assessed value baseline and tax rate calculation |
| [City of San Diego Open Data Portal](https://data.sandiego.gov) | Operating budget actuals and capital improvement project data |
| [San Diego Fiscal Year Budget](https://www.sandiego.gov/finance/budget) | Department-level spending allocations used to weight tax breakdowns |

---

## Architecture

```
User Input (assessed value)
        |
        v
Tax Calculator
  - Applies CA base rate (1%) + city share (~18%)
  - Allocates contribution by department using budget weights
        |
        v
Claude API
  - Receives tax breakdown + CIP data as context
  - Returns a plain-English "tax receipt verdict"
        |
        v
Receipt UI (React, single page)
  - Renders line-item tax breakdown
  - Renders capital improvement projects
  - Renders Claude's verdict
```

**Stack:** Next.js 14+ App Router, TypeScript, Tailwind CSS, PapaParse, Recharts, Anthropic Claude API.

**Deployment:** Vercel (free tier). No backend required beyond the thin API route for Claude.

---

## Live Application

_Link TBD after deployment._