export interface BudgetRow {
  amount: number | string;
  report_fy: number | string;
  fund_type: string;
  dept_name: string;
  account_number: number | string;
  [key: string]: unknown;
}

export interface BudgetResult {
  departmentSpendMap: Map<string, number>;
  totalGeneralFundSpend: number;
  fiscalYear: string;
}

function isExpenseAccount(accountNumber: string | number): boolean {
  return String(accountNumber).startsWith("5");
}

export function aggregateBudget(rows: Record<string, unknown>[]): BudgetResult {
  const fiscalYears = [
    ...new Set(rows.map((r) => String(r.report_fy ?? ""))),
  ].sort();
  const latestFY = fiscalYears[fiscalYears.length - 1];

  const departmentSpendMap = new Map<string, number>();
  let totalGeneralFundSpend = 0;

  for (const raw of rows) {
    const row = raw as unknown as BudgetRow;

    if (
      String(row.report_fy) !== latestFY ||
      !String(row.fund_type ?? "").toLowerCase().includes("general") ||
      !isExpenseAccount(row.account_number ?? "")
    ) {
      continue;
    }

    const amount =
      typeof row.amount === "string"
        ? parseFloat(row.amount.replace(/,/g, ""))
        : Number(row.amount);

    if (isNaN(amount)) continue;

    const dept = String(row.dept_name ?? "Unknown").trim() || "Unknown";
    departmentSpendMap.set(dept, (departmentSpendMap.get(dept) || 0) + amount);
    totalGeneralFundSpend += amount;
  }

  return { departmentSpendMap, totalGeneralFundSpend, fiscalYear: latestFY };
}
