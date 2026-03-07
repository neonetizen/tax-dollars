import { describe, it, expect } from "vitest";
import { aggregateNeighborhoods } from "../neighborhoodAggregator";

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    comm_plan_name: "North Park",
    case_age_days: 5,
    service_name: "Pothole",
    case_record_type: "Service Request",
    ...overrides,
  };
}

describe("aggregateNeighborhoods", () => {
  it("groups rows by canonicalized neighborhood name", () => {
    const rows = [
      makeRow({ comm_plan_name: "north park" }),
      makeRow({ comm_plan_name: "NORTH PARK" }),
      makeRow({ comm_plan_name: "North Park" }),
    ];
    const { neighborhoodMap } = aggregateNeighborhoods(rows);

    expect(neighborhoodMap.size).toBe(1);
    expect(neighborhoodMap.get("North Park")!.totalCases).toBe(3);
  });

  it("computes average resolution days correctly", () => {
    const rows = [
      makeRow({ case_age_days: 10 }),
      makeRow({ case_age_days: 20 }),
    ];
    const { neighborhoodMap } = aggregateNeighborhoods(rows);
    const stats = neighborhoodMap.get("North Park")!;

    expect(stats.avgResolutionDays).toBe(15);
  });

  it("computes city-wide average resolution days", () => {
    const rows = [
      makeRow({ comm_plan_name: "A", case_age_days: 10 }),
      makeRow({ comm_plan_name: "B", case_age_days: 30 }),
    ];
    const { cityAvgResolutionDays } = aggregateNeighborhoods(rows);

    expect(cityAvgResolutionDays).toBe(20);
  });

  it("collects top services sorted by count", () => {
    const rows = [
      makeRow({ service_name: "Pothole" }),
      makeRow({ service_name: "Pothole" }),
      makeRow({ service_name: "Graffiti" }),
      makeRow({ service_name: "Pothole" }),
      makeRow({ service_name: "Graffiti" }),
      makeRow({ service_name: "Streetlight" }),
    ];
    const { neighborhoodMap } = aggregateNeighborhoods(rows);
    const top = neighborhoodMap.get("North Park")!.topServices;

    expect(top[0].service).toBe("Pothole");
    expect(top[0].count).toBe(3);
    expect(top[1].service).toBe("Graffiti");
    expect(top[1].count).toBe(2);
  });

  it("limits top services to 5", () => {
    const services = ["A", "B", "C", "D", "E", "F", "G"];
    const rows = services.map((s) => makeRow({ service_name: s }));
    const { neighborhoodMap } = aggregateNeighborhoods(rows);
    const top = neighborhoodMap.get("North Park")!.topServices;

    expect(top.length).toBeLessThanOrEqual(5);
  });

  it("returns sorted neighborhoods list", () => {
    const rows = [
      makeRow({ comm_plan_name: "Pacific Beach" }),
      makeRow({ comm_plan_name: "Barrio Logan" }),
      makeRow({ comm_plan_name: "La Jolla" }),
    ];
    const { neighborhoodsList } = aggregateNeighborhoods(rows);

    expect(neighborhoodsList).toEqual(["Barrio Logan", "La Jolla", "Pacific Beach"]);
  });

  it("skips rows with empty neighborhood name", () => {
    const rows = [
      makeRow({ comm_plan_name: "" }),
      makeRow({ comm_plan_name: "  " }),
      makeRow({ comm_plan_name: "Valid" }),
    ];
    const { neighborhoodMap } = aggregateNeighborhoods(rows);

    expect(neighborhoodMap.size).toBe(1);
    expect(neighborhoodMap.has("Valid")).toBe(true);
  });

  it("handles string case_age_days", () => {
    const rows = [makeRow({ case_age_days: "7.5" })];
    const { neighborhoodMap } = aggregateNeighborhoods(rows);

    expect(neighborhoodMap.get("North Park")!.avgResolutionDays).toBe(7.5);
  });

  it("returns empty results for empty input", () => {
    const result = aggregateNeighborhoods([]);
    expect(result.neighborhoodMap.size).toBe(0);
    expect(result.neighborhoodsList).toEqual([]);
    expect(result.cityAvgResolutionDays).toBe(0);
  });
});
