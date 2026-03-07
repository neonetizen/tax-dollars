import type { VerdictRequest } from "@/types";

const SYSTEM_PROMPT = `You are a civic data analyst writing a plain-English "tax receipt verdict" for a San Diego resident. Be specific, cite numbers, be balanced — note both good and concerning findings. 3-4 paragraphs. No markdown headers.`;

export function buildSingleVerdictPrompt(req: VerdictRequest): {
  system: string;
  user: string;
} {
  const topDepts = req.deptBreakdown
    .slice(0, 5)
    .map((d) => `${d.department}: $${d.amount.toFixed(2)} (${d.percentage}%)`)
    .join("; ");

  const topIssues = req.topIssues
    .map((i) => `${i.service} (${i.count} cases)`)
    .join("; ");

  const cipList =
    req.cipProjects.length > 0
      ? req.cipProjects
          .slice(0, 5)
          .map((p) => `${p.projectTitle} ($${p.amount.toLocaleString()})`)
          .join("; ")
      : "No CIP data available for this area";

  const user = `Assessed value: $${req.assessedValue.toLocaleString()}. Estimated city contribution: $${req.cityContribution.toFixed(2)}. Department breakdown: ${topDepts}. Neighborhood: ${req.neighborhood}. Average 311 resolution time: ${req.avgResolutionDays} days (city average: ${req.cityAvgResolutionDays} days). Top issues reported: ${topIssues}. Local CIP projects: ${cipList}. Write the verdict.`;

  return { system: SYSTEM_PROMPT, user };
}

export function buildComparisonVerdictPrompt(req: VerdictRequest): {
  system: string;
  user: string;
} {
  const topDepts = req.deptBreakdown
    .slice(0, 5)
    .map((d) => `${d.department}: $${d.amount.toFixed(2)} (${d.percentage}%)`)
    .join("; ");

  const formatStats = (
    name: string,
    avgDays: number,
    topIssues: { service: string; count: number }[],
    cipProjects: { projectTitle: string; amount: number }[]
  ) => {
    const issues = topIssues
      .map((i) => `${i.service} (${i.count})`)
      .join("; ");
    const cip =
      cipProjects.length > 0
        ? cipProjects
            .slice(0, 3)
            .map((p) => `${p.projectTitle} ($${p.amount.toLocaleString()})`)
            .join("; ")
        : "No CIP data";
    return `Avg 311 resolution: ${avgDays} days. Top issues: ${issues}. CIP projects: ${cip}`;
  };

  const neighborhoodAStats = formatStats(
    req.neighborhood,
    req.avgResolutionDays,
    req.topIssues,
    req.cipProjects
  );

  const neighborhoodBStats = req.comparisonStats
    ? formatStats(
        req.comparisonNeighborhood!,
        req.comparisonStats.avgResolutionDays,
        req.comparisonStats.topServices,
        req.comparisonCipProjects || []
      )
    : "";

  const user = `Compare two neighborhoods on the same $${req.assessedValue.toLocaleString()} assessed value / $${req.cityContribution.toFixed(2)} city contribution. Department breakdown: ${topDepts}. Neighborhood A (${req.neighborhood}): ${neighborhoodAStats}. Neighborhood B (${req.comparisonNeighborhood}): ${neighborhoodBStats}. Write a balanced comparison highlighting where each neighborhood gets better or worse service delivery for the same tax dollar.`;

  return { system: SYSTEM_PROMPT, user };
}
