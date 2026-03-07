/**
 * Seed script: reads the two source CSVs and populates Supabase tables.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   npm run seed
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL       — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY      — service role key (bypasses RLS for bulk insert)
 */

import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const BATCH_SIZE = 500;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseAmount(raw: unknown): number {
  if (typeof raw === "number") return raw;
  const n = parseFloat(String(raw ?? "").replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

async function upsertBatch<T extends object>(
  table: string,
  rows: T[],
  onConflict: string
) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict });
    if (error) throw new Error(`${table} upsert failed: ${error.message}`);
    process.stdout.write(
      `\r  ${table}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} rows`
    );
  }
  process.stdout.write("\n");
}

async function insertBatch<T extends object>(table: string, rows: T[]) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).insert(batch);
    if (error) throw new Error(`${table} insert failed: ${error.message}`);
    process.stdout.write(
      `\r  ${table}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} rows`
    );
  }
  process.stdout.write("\n");
}

// ---------------------------------------------------------------------------
// budget_by_department
// ---------------------------------------------------------------------------

async function seedBudget() {
  console.log("Seeding budget_by_department…");

  const filePath = path.join(
    process.cwd(),
    "public/data/actuals_operating_datasd.csv"
  );
  if (!fs.existsSync(filePath)) {
    console.error(`  File not found: ${filePath}`);
    process.exit(1);
  }

  // Map: `${fy}|${dept}` → total_spend
  const spendMap = new Map<string, { fiscal_year: string; dept_name: string; total_spend: number }>();

  await new Promise<void>((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: "utf8" });
    Papa.parse(stream, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      step: ({ data }: { data: Record<string, unknown> }) => {
        const fundType = String(data.fund_type ?? "").toLowerCase();
        if (!fundType.includes("general")) return;

        const accountNumber = String(data.account_number ?? "");
        if (!accountNumber.startsWith("5")) return;

        const amount = parseAmount(data.amount);
        if (amount <= 0) return;

        const fy = String(data.report_fy ?? "").trim();
        const dept = String(data.dept_name ?? "Unknown").trim();
        const key = `${fy}|${dept}`;

        if (!spendMap.has(key)) {
          spendMap.set(key, { fiscal_year: fy, dept_name: dept, total_spend: 0 });
        }
        spendMap.get(key)!.total_spend += amount;
      },
      complete: () => resolve(),
      error: (err: Error) => reject(err),
    });
  });

  const rows = [...spendMap.values()];
  console.log(`  Aggregated ${rows.length} (fiscal_year, dept) pairs`);
  await upsertBatch("budget_by_department", rows, "fiscal_year,dept_name");
  console.log("  budget_by_department done.");
}

// ---------------------------------------------------------------------------
// cip_projects
// ---------------------------------------------------------------------------

async function seedCIP() {
  console.log("Seeding cip_projects…");

  const filePath = path.join(
    process.cwd(),
    "public/data/actuals_capital_ptd_datasd.csv"
  );
  if (!fs.existsSync(filePath)) {
    console.error(`  File not found: ${filePath}`);
    process.exit(1);
  }

  // Aggregate child rows into parent projects:
  // key: `${report_fy}|${project_number_parent}`
  const projectMap = new Map<
    string,
    {
      fiscal_year: string;
      asset_owning_dept: string;
      project_name: string;
      project_number_parent: string;
      amount: number;
      fund_type: string;
    }
  >();

  await new Promise<void>((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: "utf8" });
    Papa.parse(stream, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      step: ({ data }: { data: Record<string, unknown> }) => {
        const amount = parseAmount(data.amount);
        if (amount <= 0) return;

        const fy = String(data.report_fy ?? "").trim();
        const parent = String(data.project_number_parent ?? "").trim();
        const key = `${fy}|${parent}`;

        if (!projectMap.has(key)) {
          projectMap.set(key, {
            fiscal_year: fy,
            asset_owning_dept: String(
              data.asset_owning_dept ?? "Unknown"
            ).trim(),
            project_name: String(
              data.project_name ?? "Untitled Project"
            ).trim(),
            project_number_parent: parent,
            amount: 0,
            fund_type: String(data.fund_type ?? "").trim(),
          });
        }
        projectMap.get(key)!.amount += amount;
      },
      complete: () => resolve(),
      error: (err: Error) => reject(err),
    });
  });

  // Filter out zero-amount aggregations (shouldn't happen, but guard anyway)
  const rows = [...projectMap.values()].filter((r) => r.amount > 0);
  console.log(`  Aggregated ${rows.length} parent projects`);

  // Clear existing rows before re-seeding (cip_projects has no UNIQUE constraint)
  const { error: deleteError } = await supabase
    .from("cip_projects")
    .delete()
    .neq("id", 0);
  if (deleteError)
    throw new Error(`cip_projects clear failed: ${deleteError.message}`);

  await insertBatch("cip_projects", rows);
  console.log("  cip_projects done.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await seedBudget();
  await seedCIP();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
