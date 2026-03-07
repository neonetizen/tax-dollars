import { describe, it, expect } from "vitest";
import { aggregateCIP, getCIPProjectsForDept, getAllCIPProjects } from "../cipAggregator";
import type { CIPProject } from "@/types";

function makeRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    amount: 500_000,
    project_number: "P-001",
    report_fy: 25,
    budget_cycle: "Adopted",
    fund_type: "Capital",
    asset_owning_dept: "Public Utilities",
    project_name: "Water Main Replacement",
    ...overrides,
  };
}

describe("aggregateCIP", () => {
  it("groups projects by department for the latest FY", () => {
    const rows = [
      makeRow({ asset_owning_dept: "Public Utilities", report_fy: 25 }),
      makeRow({ asset_owning_dept: "Transportation", report_fy: 25, project_name: "Road Repair" }),
    ];
    const result = aggregateCIP(rows);

    expect(result.size).toBe(2);
    expect(result.get("Public Utilities")).toHaveLength(1);
    expect(result.get("Transportation")).toHaveLength(1);
  });

  it("only includes latest fiscal year", () => {
    const rows = [
      makeRow({ report_fy: 24 }),
      makeRow({ report_fy: 25 }),
    ];
    const result = aggregateCIP(rows);

    const allProjects = getAllCIPProjects(result);
    expect(allProjects).toHaveLength(1);
  });

  it("only includes adopted budget cycle", () => {
    const rows = [
      makeRow({ budget_cycle: "Proposed" }),
      makeRow({ budget_cycle: "Adopted" }),
    ];
    const result = aggregateCIP(rows);

    expect(getAllCIPProjects(result)).toHaveLength(1);
  });

  it("excludes rows with zero or negative amounts", () => {
    const rows = [
      makeRow({ amount: 0 }),
      makeRow({ amount: -100 }),
      makeRow({ amount: 500 }),
    ];
    const result = aggregateCIP(rows);

    expect(getAllCIPProjects(result)).toHaveLength(1);
  });

  it("sorts projects within each department by amount descending", () => {
    const rows = [
      makeRow({ amount: 100, project_name: "Small" }),
      makeRow({ amount: 999, project_name: "Large" }),
      makeRow({ amount: 500, project_name: "Medium" }),
    ];
    const result = aggregateCIP(rows);
    const projects = result.get("Public Utilities")!;

    expect(projects[0].projectName).toBe("Large");
    expect(projects[1].projectName).toBe("Medium");
    expect(projects[2].projectName).toBe("Small");
  });

  it("returns empty map for empty input", () => {
    const result = aggregateCIP([]);
    expect(result.size).toBe(0);
  });
});

describe("getCIPProjectsForDept", () => {
  it("returns projects for an existing department", () => {
    const cipMap = new Map<string, CIPProject[]>([
      ["Police", [{ projectName: "Test", projectNumber: "1", assetOwningDept: "Police", amount: 100, fundType: "Capital", reportFY: "25" }]],
    ]);
    expect(getCIPProjectsForDept(cipMap, "Police")).toHaveLength(1);
  });

  it("returns empty array for missing department", () => {
    const cipMap = new Map<string, CIPProject[]>();
    expect(getCIPProjectsForDept(cipMap, "NonExistent")).toEqual([]);
  });
});

describe("getAllCIPProjects", () => {
  it("flattens and sorts all projects by amount descending", () => {
    const cipMap = new Map<string, CIPProject[]>([
      ["A", [{ projectName: "Small", projectNumber: "1", assetOwningDept: "A", amount: 50, fundType: "C", reportFY: "25" }]],
      ["B", [{ projectName: "Large", projectNumber: "2", assetOwningDept: "B", amount: 999, fundType: "C", reportFY: "25" }]],
    ]);
    const all = getAllCIPProjects(cipMap);

    expect(all).toHaveLength(2);
    expect(all[0].projectName).toBe("Large");
    expect(all[1].projectName).toBe("Small");
  });
});
