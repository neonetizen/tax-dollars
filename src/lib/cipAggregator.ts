import type { CIPProject } from "@/types";

export interface CIPRow {
  amount: number | string;
  project_number: string;
  report_fy: number | string;
  budget_cycle: string;
  fund_type: string;
  asset_owning_dept: string;
  project_name: string;
  [key: string]: unknown;
}

export function aggregateCIP(rows: Record<string, unknown>[]): Map<string, CIPProject[]> {
  const deptMap = new Map<string, CIPProject[]>();

  const fiscalYears = [...new Set(rows.map((r) => String(r.report_fy ?? "")))].sort();
  const latestFY = fiscalYears[fiscalYears.length - 1];

  for (const raw of rows) {
    const row = raw as unknown as CIPRow;

    if (String(row.report_fy) !== latestFY) continue;
    if (String(row.budget_cycle ?? "").toLowerCase() !== "adopted") continue;

    const amount =
      typeof row.amount === "string"
        ? parseFloat(row.amount.replace(/,/g, ""))
        : Number(row.amount);

    if (isNaN(amount) || amount <= 0) continue;

    const dept = String(row.asset_owning_dept || "Unknown").trim();

    const project: CIPProject = {
      projectName: String(row.project_name || "Untitled Project").trim(),
      projectNumber: String(row.project_number || "").trim(),
      assetOwningDept: dept,
      amount,
      fundType: String(row.fund_type || "").trim(),
      reportFY: String(row.report_fy),
    };

    if (!deptMap.has(dept)) {
      deptMap.set(dept, []);
    }
    deptMap.get(dept)!.push(project);
  }

  for (const projects of deptMap.values()) {
    projects.sort((a, b) => b.amount - a.amount);
  }

  return deptMap;
}

export function getCIPProjectsForDept(
  cipData: Map<string, CIPProject[]>,
  department: string
): CIPProject[] {
  return cipData.get(department) || [];
}

export function getAllCIPProjects(
  cipData: Map<string, CIPProject[]>
): CIPProject[] {
  const all: CIPProject[] = [];
  for (const projects of cipData.values()) {
    all.push(...projects);
  }
  return all.sort((a, b) => b.amount - a.amount);
}
