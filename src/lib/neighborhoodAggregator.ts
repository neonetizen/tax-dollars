import type { NeighborhoodStats } from "@/types";

interface GIDRow {
  comm_plan_name: string;
  case_age_days: number | string;
  service_name: string;
  case_record_type: string;
  [key: string]: unknown;
}

interface NeighborhoodResult {
  neighborhoodMap: Map<string, NeighborhoodStats>;
  neighborhoodsList: string[];
  cityAvgResolutionDays: number;
}

function canonicalizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function aggregateNeighborhoods(rows: GIDRow[]): NeighborhoodResult {
  const statsAccumulator = new Map<
    string,
    {
      totalDays: number;
      caseCount: number;
      services: Map<string, number>;
      types: Record<string, number>;
    }
  >();

  let cityTotalDays = 0;
  let cityTotalCases = 0;

  for (const row of rows) {
    const rawName = row.comm_plan_name;
    if (!rawName || String(rawName).trim() === "") continue;

    const name = canonicalizeName(String(rawName));
    const days =
      typeof row.case_age_days === "string"
        ? parseFloat(row.case_age_days)
        : row.case_age_days;
    const validDays = !isNaN(days) ? days : 0;

    if (!statsAccumulator.has(name)) {
      statsAccumulator.set(name, {
        totalDays: 0,
        caseCount: 0,
        services: new Map(),
        types: {},
      });
    }

    const acc = statsAccumulator.get(name)!;
    acc.totalDays += validDays;
    acc.caseCount += 1;

    const service = String(row.service_name || "Unknown").trim();
    acc.services.set(service, (acc.services.get(service) || 0) + 1);

    const recordType = String(row.case_record_type || "Unknown").trim();
    acc.types[recordType] = (acc.types[recordType] || 0) + 1;

    cityTotalDays += validDays;
    cityTotalCases += 1;
  }

  const neighborhoodMap = new Map<string, NeighborhoodStats>();

  for (const [name, acc] of statsAccumulator) {
    const topServices = [...acc.services.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([service, count]) => ({ service, count }));

    neighborhoodMap.set(name, {
      name,
      avgResolutionDays:
        acc.caseCount > 0
          ? Math.round((acc.totalDays / acc.caseCount) * 10) / 10
          : 0,
      totalCases: acc.caseCount,
      topServices,
      casesByType: acc.types,
    });
  }

  const neighborhoodsList = [...neighborhoodMap.keys()].sort();
  const cityAvgResolutionDays =
    cityTotalCases > 0
      ? Math.round((cityTotalDays / cityTotalCases) * 10) / 10
      : 0;

  return { neighborhoodMap, neighborhoodsList, cityAvgResolutionDays };
}
