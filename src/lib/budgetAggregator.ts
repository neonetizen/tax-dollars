interface BudgetRow {
  fiscal_year: number | string;
  fund_type: string;
  department_name: string;
  account_type: string;
  amount: number | string;
  [key: string]: unknown;
}

interface BudgetResult {
  departmentSpendMap: Map<string, number>;
  totalGeneralFundSpend: number;
  fiscalYear: string;
}

export function aggregateBudget(rows: BudgetRow[]): BudgetResult {
  // Find the latest complete fiscal year
  const fiscalYears = [
    ...new Set(rows.map((r) => String(r.fiscal_year))),
  ].sort();
  const latestFY = fiscalYears[fiscalYears.length - 1];

  const departmentSpendMap = new Map<string, number>();
  let totalGeneralFundSpend = 0;

  for (const row of rows) {
    if (
      String(row.fiscal_year) !== latestFY ||
      !String(row.fund_type).toLowerCase().includes("general") ||
      !String(row.account_type).toLowerCase().includes("expense")
    ) {
      continue;
    }

    const amount =
      typeof row.amount === "string"
        ? parseFloat(row.amount.replace(/,/g, ""))
        : row.amount;

    if (isNaN(amount)) continue;

    const dept = row.department_name?.trim() || "Unknown";
    departmentSpendMap.set(dept, (departmentSpendMap.get(dept) || 0) + amount);
    totalGeneralFundSpend += amount;
  }

  return { departmentSpendMap, totalGeneralFundSpend, fiscalYear: latestFY };
}
