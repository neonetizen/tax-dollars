import { describe, it, expect } from "vitest";
import { calculateTaxBreakdown } from "../taxCalculator";

describe("calculateTaxBreakdown", () => {
  const makeDeptMap = (entries: [string, number][]) =>
    new Map<string, number>(entries);

  it("computes base tax as 1% of assessed value", () => {
    const deptMap = makeDeptMap([["Police", 500_000]]);
    const result = calculateTaxBreakdown(650_000, deptMap, 500_000);
    expect(result.baseTax).toBe(6_500);
  });

  it("computes city contribution as 18% of base tax", () => {
    const deptMap = makeDeptMap([["Police", 500_000]]);
    const result = calculateTaxBreakdown(650_000, deptMap, 500_000);
    expect(result.cityContribution).toBe(1_170);
  });

  it("allocates to departments proportionally by spend", () => {
    const deptMap = makeDeptMap([
      ["Police", 300_000],
      ["Fire-Rescue", 200_000],
    ]);
    const total = 500_000;
    const result = calculateTaxBreakdown(1_000_000, deptMap, total);

    expect(result.departments).toHaveLength(2);

    const police = result.departments.find((d) => d.department === "Police")!;
    expect(police.percentage).toBe(60);
    expect(police.amount).toBeCloseTo(1_800 * 0.6, 2);

    const fire = result.departments.find(
      (d) => d.department === "Fire-Rescue"
    )!;
    expect(fire.percentage).toBe(40);
    expect(fire.amount).toBeCloseTo(1_800 * 0.4, 2);
  });

  it("sorts departments by amount descending", () => {
    const deptMap = makeDeptMap([
      ["Small", 100],
      ["Large", 900],
      ["Medium", 500],
    ]);
    const result = calculateTaxBreakdown(100_000, deptMap, 1_500);

    expect(result.departments[0].department).toBe("Large");
    expect(result.departments[1].department).toBe("Medium");
    expect(result.departments[2].department).toBe("Small");
  });

  it("preserves assessed value in the result", () => {
    const deptMap = makeDeptMap([["Parks", 1_000]]);
    const result = calculateTaxBreakdown(750_000, deptMap, 1_000);
    expect(result.assessedValue).toBe(750_000);
  });

  it("handles single department getting 100%", () => {
    const deptMap = makeDeptMap([["Only Dept", 1_000_000]]);
    const result = calculateTaxBreakdown(500_000, deptMap, 1_000_000);

    expect(result.departments).toHaveLength(1);
    expect(result.departments[0].percentage).toBe(100);
    expect(result.departments[0].amount).toBe(result.cityContribution);
  });

  it("handles empty department map gracefully", () => {
    const deptMap = makeDeptMap([]);
    const result = calculateTaxBreakdown(500_000, deptMap, 0);

    expect(result.departments).toHaveLength(0);
    expect(result.baseTax).toBe(5_000);
    expect(result.cityContribution).toBe(900);
  });
});
