import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { z } from "zod";
import { aggregateBudget, type BudgetResult } from "@/lib/budgetAggregator";
import { calculateTaxBreakdown } from "@/lib/taxCalculator";
import type { CIPProject, TaxReceiptResponse } from "@/types";

const requestSchema = z.object({
  assessedValue: z.number().min(50000).max(5000000),
  zipCode: z.string().optional(),
});

interface AggregatedData {
  budget: BudgetResult;
  cipProjects: CIPProject[];
}

let cached: AggregatedData | null = null;

function loadData(): AggregatedData {
  if (cached) return cached;

  const budgetPath = path.join(
    process.cwd(),
    "public/data/actuals_operating_datasd.csv"
  );
  const budgetCsv = fs.readFileSync(budgetPath, "utf-8");
  const budgetParsed = Papa.parse<Record<string, unknown>>(budgetCsv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  const budget = aggregateBudget(budgetParsed.data);

  const cipPath = path.join(
    process.cwd(),
    "public/data/actuals_capital_ptd_datasd.csv"
  );
  const cipCsv = fs.readFileSync(cipPath, "utf-8");
  const cipParsed = Papa.parse<Record<string, unknown>>(cipCsv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const projectAgg = new Map<
    string,
    {
      amount: number;
      projectNumber: string;
      assetOwningDept: string;
      fundType: string;
      reportFY: string;
    }
  >();

  for (const row of cipParsed.data) {
    const accountNumber = String(row.account_number ?? "");
    if (!accountNumber.startsWith("5")) continue;

    const amt =
      typeof row.amount === "number"
        ? row.amount
        : parseFloat(String(row.amount ?? "").replace(/,/g, ""));
    if (isNaN(amt) || amt <= 0) continue;

    const name = String(row.project_name ?? "").trim();
    if (!name) continue;

    const existing = projectAgg.get(name);
    if (existing) {
      existing.amount += amt;
    } else {
      projectAgg.set(name, {
        amount: amt,
        projectNumber: String(row.project_number_parent ?? ""),
        assetOwningDept: String(row.asset_owning_dept ?? "Unknown"),
        fundType: String(row.fund_type ?? ""),
        reportFY: String(row.report_fy ?? ""),
      });
    }
  }

  const cipProjects: CIPProject[] = Array.from(projectAgg.entries())
    .map(([projectName, d]) => ({
      projectName,
      projectNumber: d.projectNumber,
      assetOwningDept: d.assetOwningDept,
      amount: Math.round(d.amount * 100) / 100,
      fundType: d.fundType,
      reportFY: d.reportFY,
    }))
    .sort((a, b) => b.amount - a.amount);

  cached = { budget, cipProjects };
  return cached;
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const { assessedValue } = requestSchema.parse(raw);

    const { budget, cipProjects } = loadData();
    const breakdown = calculateTaxBreakdown(
      assessedValue,
      budget.departmentSpendMap,
      budget.totalGeneralFundSpend
    );

    const response: TaxReceiptResponse = {
      breakdown,
      cipProjects: cipProjects.slice(0, 50),
    };

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to generate tax receipt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
