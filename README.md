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

San Diego collects property taxes from hundreds of thousands of homeowners every year, but residents have almost no intuitive way to understand what they're actually funding. Budget documents are dense, portals are hard to navigate, and aggregate statistics obscure neighborhood-level reality. The result: taxpayers pay without any meaningful sense of what they got in return.

**My Tax Dollars** reframes the question. Instead of "here is the city budget," it asks: "you paid X dollars — here is your receipt, and here is what was actually delivered."

---

## What It Does

A San Diego homeowner enters their property's assessed value. The app calculates their approximate annual property tax contribution and breaks it down by city department (public safety, parks, libraries, roads, etc.). It then pulls real, current service delivery data for their neighborhood from San Diego's open datasets — think pothole repairs completed, 311 response times, code enforcement cases closed. Finally, it hands that combined picture to Claude, which renders a plain-English "value for money" verdict: what you paid for, and what the city actually delivered.

The whole experience is a single page. No account required. No backend. Just a number in, a receipt out.

---

## Data Sources

| Source | What It Provides |
|--------|-----------------|
| [San Diego County Assessor](https://www.sandiegocounty.gov/content/sdc/assessor.html) | Property assessed value baseline and tax rate calculation |
| [City of San Diego Open Data Portal](https://data.sandiego.gov) | Neighborhood-level service delivery datasets |
| [Get It Done (311) Dataset](https://data.sandiego.gov/datasets/get-it-done-311/) | Request volume and resolution times by neighborhood |
| [Street Division Services](https://data.sandiego.gov/datasets/streets-potholes/) | Pothole and road repair activity |
| [Code Enforcement Cases](https://data.sandiego.gov/datasets/code-enforcement-cases/) | Code enforcement activity by address/neighborhood |
| [San Diego Fiscal Year Budget](https://www.sandiego.gov/finance/budget) | Department-level spending allocations used to weight tax breakdowns |

---

## Architecture

```
User Input (assessed value)
        |
        v
Tax Calculator
  - Applies CA base rate (1%) + local overrides
  - Allocates contribution by department using budget weights
        |
        v
Neighborhood Data Fetcher
  - Queries San Diego Open Data Portal (Socrata API, no auth required)
  - Pulls 311, road repair, and code enforcement records for user's area
        |
        v
Claude API
  - Receives tax breakdown + service delivery data as context
  - Returns a plain-English "value for money" verdict
        |
        v
Receipt UI (React, single page)
  - Renders line-item tax breakdown
  - Renders neighborhood service stats
  - Renders Claude's verdict
```

**Stack:** React, Vite, Tailwind CSS, Anthropic Claude API (client-side via user-supplied key or proxied), San Diego Socrata Open Data API.

**Deployment:** Vercel (free tier). No backend required — all data sources are public and unauthenticated.

---

## Live Application

_Link TBD after deployment._

---

## Demo Video

_60-second walkthrough linked here._
