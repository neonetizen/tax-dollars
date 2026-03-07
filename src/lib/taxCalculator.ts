import type { DepartmentSpend, TaxBreakdown } from "@/types";

const CA_BASE_RATE = 0.01;
const CITY_GF_SHARE = 0.18;

export function calculateTaxBreakdown(
  assessedValue: number,
  departmentSpendMap: Map<string, number>,
  totalGeneralFundSpend: number
): TaxBreakdown {
  const baseTax = assessedValue * CA_BASE_RATE;
  const cityContribution = baseTax * CITY_GF_SHARE;

  const departments: DepartmentSpend[] = [];

  for (const [department, spend] of departmentSpendMap) {
    const percentage = spend / totalGeneralFundSpend;
    const amount = cityContribution * percentage;
    departments.push({
      department,
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round(percentage * 10000) / 100,
    });
  }

  departments.sort((a, b) => b.amount - a.amount);

  return {
    assessedValue,
    baseTax,
    cityContribution,
    departments,
  };
}
