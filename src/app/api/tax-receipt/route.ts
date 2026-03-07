import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { calculateTaxBreakdown } from "@/lib/taxCalculator";
import type { CIPProject, TaxReceiptResponse } from "@/types";

const RequestSchema = z.object({
  assessedValue: z.number().min(50000).max(5000000),
  zipCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assessedValue } = RequestSchema.parse(body);

    // Fetch all budget rows (pre-aggregated by fiscal_year + dept)
    const { data: budgetRows, error: budgetError } = await supabase
      .from("budget_by_department")
      .select("fiscal_year, dept_name, total_spend")
      .order("fiscal_year", { ascending: false });

    if (budgetError) throw new Error(budgetError.message);
    if (!budgetRows || budgetRows.length === 0)
      throw new Error("No budget data found");

    // Use the latest fiscal year
    const latestFY = budgetRows[0].fiscal_year;

    const departmentSpendMap = new Map<string, number>();
    let totalGeneralFundSpend = 0;
    for (const row of budgetRows.filter(
      (r: { fiscal_year: string; dept_name: string; total_spend: number }) =>
        r.fiscal_year === latestFY
    )) {
      departmentSpendMap.set(row.dept_name, Number(row.total_spend));
      totalGeneralFundSpend += Number(row.total_spend);
    }

    const breakdown = calculateTaxBreakdown(
      assessedValue,
      departmentSpendMap,
      totalGeneralFundSpend
    );

    // Fetch top CIP projects for latest fiscal year
    const { data: cipRows, error: cipError } = await supabase
      .from("cip_projects")
      .select(
        "project_name, project_number_parent, asset_owning_dept, amount, fund_type, fiscal_year"
      )
      .eq("fiscal_year", latestFY)
      .order("amount", { ascending: false })
      .limit(20);

    if (cipError) throw new Error(cipError.message);

    type CIPRow = {
      project_name: string;
      project_number_parent: string | null;
      asset_owning_dept: string;
      amount: number;
      fund_type: string | null;
      fiscal_year: string;
    };
    const cipProjects: CIPProject[] = (cipRows ?? []).map((r: CIPRow) => ({
      projectName: r.project_name,
      projectNumber: r.project_number_parent ?? "",
      assetOwningDept: r.asset_owning_dept,
      amount: Number(r.amount),
      fundType: r.fund_type ?? "",
      reportFY: r.fiscal_year,
    }));

    const response: TaxReceiptResponse = { breakdown, cipProjects };
    return NextResponse.json(response);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate receipt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
