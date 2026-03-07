/**
 * Test script: queries Supabase and calculates a dummy tax receipt.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/test-receipt.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ASSESSED_VALUE = 650_000;
const CA_BASE_RATE = 0.01;
const CITY_GF_SHARE = 0.18;

async function main() {
  // ── 1. Budget by department ──────────────────────────────────────────────
  console.log("Querying budget_by_department…");
  const { data: budgetRows, error: budgetErr } = await supabase
    .from("budget_by_department")
    .select("fiscal_year, dept_name, total_spend")
    .order("fiscal_year", { ascending: false });

  if (budgetErr) {
    console.error("budget_by_department error:", budgetErr.message);
    process.exit(1);
  }

  if (!budgetRows || budgetRows.length === 0) {
    console.error("No budget rows returned — has the seed script been run?");
    process.exit(1);
  }

  // Find the latest fiscal year
  const latestFY = budgetRows[0].fiscal_year;
  console.log(`  Latest fiscal year: ${latestFY}`);

  const fyRows = budgetRows.filter((r) => r.fiscal_year === latestFY);
  console.log(`  Departments in FY${latestFY}: ${fyRows.length}`);

  // Build spend map
  const departmentSpendMap = new Map<string, number>();
  let totalGeneralFundSpend = 0;
  for (const row of fyRows) {
    departmentSpendMap.set(row.dept_name, row.total_spend);
    totalGeneralFundSpend += row.total_spend;
  }

  // ── 2. Calculate tax breakdown ───────────────────────────────────────────
  const baseTax = ASSESSED_VALUE * CA_BASE_RATE;
  const cityContribution = baseTax * CITY_GF_SHARE;

  const departments = Array.from(departmentSpendMap.entries())
    .map(([dept, spend]) => {
      const pct = spend / totalGeneralFundSpend;
      return {
        department: dept,
        amount: Math.round(cityContribution * pct * 100) / 100,
        percentage: Math.round(pct * 10000) / 100,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  console.log("\n── Tax Receipt ────────────────────────────────────────────");
  console.log(`  Assessed value:     $${ASSESSED_VALUE.toLocaleString()}`);
  console.log(`  Base tax (1%):      $${baseTax.toLocaleString()}`);
  console.log(`  City contribution:  $${cityContribution.toFixed(2)}`);
  console.log(`  Total GF spend:     $${Math.round(totalGeneralFundSpend).toLocaleString()}`);
  console.log("\n  Top 10 departments:");
  for (const d of departments.slice(0, 10)) {
    console.log(
      `    ${d.department.padEnd(40)} $${d.amount.toFixed(2).padStart(8)}  (${d.percentage}%)`
    );
  }

  // ── 3. CIP projects ──────────────────────────────────────────────────────
  console.log("\nQuerying cip_projects…");
  const { data: cipRows, error: cipErr } = await supabase
    .from("cip_projects")
    .select("project_name, project_number_parent, asset_owning_dept, amount, fund_type, fiscal_year")
    .order("amount", { ascending: false })
    .limit(5);

  if (cipErr) {
    console.error("cip_projects error:", cipErr.message);
    process.exit(1);
  }

  console.log(`  Top 5 CIP projects:`);
  for (const p of cipRows ?? []) {
    console.log(
      `    [${p.fiscal_year}] ${p.project_name.slice(0, 45).padEnd(45)} $${Math.round(p.amount).toLocaleString()}`
    );
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
