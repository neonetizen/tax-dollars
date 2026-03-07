import { describe, it, expect } from "vitest";
import { aggregateBudget } from "../budgetAggregator";

function makeRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    amount: 100_000,
    report_fy: 25,
    fund_type: "General Fund",
    fund_number: "100000",
    dept_name: "Police",
    funds_center_number: "1001",
    account: "Salaried Wages",
    account_number: "500011",
    ...overrides,
  };
}

describe("aggregateBudget", () => {
  it("aggregates expense rows for the latest fiscal year", () => {
    const rows = [
      makeRow({ report_fy: 24, amount: 50_000 }),
      makeRow({ report_fy: 25, amount: 100_000, dept_name: "Police" }),
      makeRow({ report_fy: 25, amount: 200_000, dept_name: "Fire-Rescue" }),
    ];
    const result = aggregateBudget(rows);

    expect(result.fiscalYear).toBe("25");
    expect(result.departmentSpendMap.get("Police")).toBe(100_000);
    expect(result.departmentSpendMap.get("Fire-Rescue")).toBe(200_000);
    expect(result.totalGeneralFundSpend).toBe(300_000);
  });

  it("excludes non-General Fund rows", () => {
    const rows = [
      makeRow({ fund_type: "Special Revenue Fund" }),
      makeRow({ fund_type: "General Fund", amount: 50_000 }),
    ];
    const result = aggregateBudget(rows);

    expect(result.totalGeneralFundSpend).toBe(50_000);
    expect(result.departmentSpendMap.size).toBe(1);
  });

  it("excludes revenue accounts (non-5xx)", () => {
    const rows = [
      makeRow({ account_number: "400011", amount: 99_999 }),
      makeRow({ account_number: "500011", amount: 50_000 }),
    ];
    const result = aggregateBudget(rows);

    expect(result.totalGeneralFundSpend).toBe(50_000);
  });

  it("handles string amounts with commas", () => {
    const rows = [makeRow({ amount: "1,234,567" })];
    const result = aggregateBudget(rows);

    expect(result.departmentSpendMap.get("Police")).toBe(1_234_567);
  });

  it("skips rows with NaN amounts", () => {
    const rows = [
      makeRow({ amount: "not-a-number" }),
      makeRow({ amount: 100 }),
    ];
    const result = aggregateBudget(rows);

    expect(result.totalGeneralFundSpend).toBe(100);
  });

  it("sums multiple rows for the same department", () => {
    const rows = [
      makeRow({ dept_name: "Police", amount: 100 }),
      makeRow({ dept_name: "Police", amount: 200 }),
    ];
    const result = aggregateBudget(rows);

    expect(result.departmentSpendMap.get("Police")).toBe(300);
  });

  it("returns empty map for empty input", () => {
    const result = aggregateBudget([]);
    expect(result.departmentSpendMap.size).toBe(0);
    expect(result.totalGeneralFundSpend).toBe(0);
  });

  it("uses 'Unknown' for missing dept_name", () => {
    const rows = [makeRow({ dept_name: undefined })];
    const result = aggregateBudget(rows);

    expect(result.departmentSpendMap.has("Unknown")).toBe(true);
  });
});
