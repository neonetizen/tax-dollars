import type { CIPProject } from "@/types";
import { DISTRICT_TO_NEIGHBORHOODS } from "./districtMap";

interface CIPRow {
  project_title: string;
  asset_owning_dept: string;
  amount: number | string;
  council_district: number | string;
  [key: string]: unknown;
}

export function aggregateCIP(
  rows: CIPRow[]
): Map<number, CIPProject[]> {
  const districtMap = new Map<number, CIPProject[]>();

  for (const row of rows) {
    const district =
      typeof row.council_district === "string"
        ? parseInt(row.council_district, 10)
        : row.council_district;

    if (isNaN(district) || district < 1 || district > 9) continue;

    const amount =
      typeof row.amount === "string"
        ? parseFloat(row.amount.replace(/,/g, ""))
        : row.amount;

    if (isNaN(amount)) continue;

    const project: CIPProject = {
      projectTitle: String(row.project_title || "Untitled Project").trim(),
      assetOwningDept: String(row.asset_owning_dept || "Unknown").trim(),
      amount,
      councilDistrict: district,
    };

    if (!districtMap.has(district)) {
      districtMap.set(district, []);
    }
    districtMap.get(district)!.push(project);
  }

  // Sort projects within each district by amount descending
  for (const projects of districtMap.values()) {
    projects.sort((a, b) => b.amount - a.amount);
  }

  return districtMap;
}

export function getCIPProjectsForNeighborhood(
  cipData: Map<number, CIPProject[]>,
  neighborhood: string
): CIPProject[] {
  for (const [district, neighborhoods] of DISTRICT_TO_NEIGHBORHOODS) {
    if (
      neighborhoods.some(
        (n) => n.toLowerCase() === neighborhood.toLowerCase()
      )
    ) {
      return cipData.get(district) || [];
    }
  }
  return [];
}
