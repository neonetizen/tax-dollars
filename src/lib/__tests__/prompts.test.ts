import { describe, it, expect } from "vitest";
import { buildVerdictPrompt } from "../prompts";
import type { VerdictRequest } from "@/types";

function makeRequest(overrides: Partial<VerdictRequest> = {}): VerdictRequest {
  return {
    assessedValue: 650_000,
    cityContribution: 1_170,
    deptBreakdown: [
      { department: "Police", amount: 500, percentage: 42.74 },
      { department: "Fire-Rescue", amount: 300, percentage: 25.64 },
    ],
    cipProjects: [
      {
        projectName: "Water Main",
        projectNumber: "P-001",
        assetOwningDept: "PUD",
        amount: 5_000_000,
        fundType: "Capital",
        reportFY: "25",
      },
    ],
    ...overrides,
  };
}

describe("buildVerdictPrompt", () => {
  it("returns both system and user prompts", () => {
    const result = buildVerdictPrompt(makeRequest());
    expect(result.system).toBeTruthy();
    expect(result.user).toBeTruthy();
  });

  it("includes assessed value in user prompt", () => {
    const result = buildVerdictPrompt(makeRequest({ assessedValue: 750_000 }));
    expect(result.user).toContain("750,000");
  });

  it("includes department breakdown", () => {
    const result = buildVerdictPrompt(makeRequest());
    expect(result.user).toContain("Police");
    expect(result.user).toContain("42.74%");
  });

  it("includes CIP projects", () => {
    const result = buildVerdictPrompt(makeRequest());
    expect(result.user).toContain("Water Main");
  });

  it("includes neighborhood when provided", () => {
    const result = buildVerdictPrompt(
      makeRequest({ neighborhood: "North Park" })
    );
    expect(result.user).toContain("North Park");
  });

  it("includes resolution days when provided", () => {
    const result = buildVerdictPrompt(
      makeRequest({ avgResolutionDays: 12.5, cityAvgResolutionDays: 15.0 })
    );
    expect(result.user).toContain("12.5 days");
    expect(result.user).toContain("15 days");
  });

  it("includes top issues when provided", () => {
    const result = buildVerdictPrompt(
      makeRequest({
        topIssues: [{ service: "Potholes", count: 150 }],
      })
    );
    expect(result.user).toContain("Potholes");
    expect(result.user).toContain("150 cases");
  });

  it("handles no CIP projects gracefully", () => {
    const result = buildVerdictPrompt(makeRequest({ cipProjects: [] }));
    expect(result.user).toContain("No CIP data available");
  });

  it("ends with 'Write the verdict.'", () => {
    const result = buildVerdictPrompt(makeRequest());
    expect(result.user).toMatch(/Write the verdict\.$/);
  });
});
