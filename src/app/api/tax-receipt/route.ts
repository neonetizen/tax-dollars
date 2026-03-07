import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { calculateTaxBreakdown } from "@/lib/taxCalculator";
import type { CIPProject, TaxReceiptResponse } from "@/types";

const requestSchema = z.object({
  assessedValue: z.number().min(50000).max(5000000),
  zipCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const { assessedValue } = requestSchema.parse(raw);

    // ── Budget by department ────────────────────────────────────────────────
    const { data: budgetRows, error: budgetErr } = await supabase
      .from("budget_by_department")
      .select("fiscal_year, dept_name, total_spend")
      .order("fiscal_year", { ascending: false });

    if (budgetErr) throw new Error(`budget query failed: ${budgetErr.message}`);
    if (!budgetRows || budgetRows.length === 0)
      throw new Error("No budget data found");

    const latestFY = budgetRows[0].fiscal_year;
    const fyRows = budgetRows.filter((r) => r.fiscal_year === latestFY);

    const departmentSpendMap = new Map<string, number>();
    let totalGeneralFundSpend = 0;
    for (const row of fyRows) {
      departmentSpendMap.set(row.dept_name, row.total_spend);
      totalGeneralFundSpend += row.total_spend;
    }

    // ── CIP projects ────────────────────────────────────────────────────────
    const { data: cipRows, error: cipErr } = await supabase
      .from("cip_projects")
      .select(
        "project_name, project_number_parent, asset_owning_dept, amount, fund_type, fiscal_year"
      )
      .order("amount", { ascending: false })
      .limit(50);

    if (cipErr) throw new Error(`cip query failed: ${cipErr.message}`);

    const cipProjects: CIPProject[] = (cipRows ?? []).map((r) => ({
      projectName: r.project_name,
      projectNumber: r.project_number_parent,
      assetOwningDept: r.asset_owning_dept,
      amount: r.amount,
      fundType: r.fund_type,
      reportFY: r.fiscal_year,
    }));

    // ── Tax calculation ─────────────────────────────────────────────────────
    const breakdown = calculateTaxBreakdown(
      assessedValue,
      departmentSpendMap,
      totalGeneralFundSpend
    );

    const response: TaxReceiptResponse = { breakdown, cipProjects };
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
