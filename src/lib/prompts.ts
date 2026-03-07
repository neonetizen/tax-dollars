import type { VerdictRequest } from "@/types";

const SYSTEM_PROMPT = `You are a civic data analyst writing a plain-English "tax receipt verdict" for a San Diego resident. Be specific, cite numbers, be balanced — note both good and concerning findings. 3-4 paragraphs. No markdown headers.`;

export function buildVerdictPrompt(req: VerdictRequest): {
  system: string;
  user: string;
} {
  const topDepts = req.deptBreakdown
    .slice(0, 5)
    .map((d) => `${d.department}: $${d.amount.toFixed(2)} (${d.percentage}%)`)
    .join("; ");

  const cipList =
    req.cipProjects.length > 0
      ? req.cipProjects
          .slice(0, 5)
          .map((p) => `${p.projectName} ($${p.amount.toLocaleString()})`)
          .join("; ")
      : "No CIP data available";

  const parts = [
    `Assessed value: $${req.assessedValue.toLocaleString()}.`,
    `Estimated city contribution: $${req.cityContribution.toFixed(2)}.`,
    `Department breakdown: ${topDepts}.`,
    `Top capital improvement projects: ${cipList}.`,
  ];

  if (req.neighborhood) {
    parts.push(`Neighborhood: ${req.neighborhood}.`);
  }
  if (req.avgResolutionDays != null) {
    parts.push(
      `Average 311 resolution time: ${req.avgResolutionDays} days (city average: ${req.cityAvgResolutionDays ?? "N/A"} days).`
    );
  }
  if (req.topIssues && req.topIssues.length > 0) {
    const issues = req.topIssues
      .map((i) => `${i.service} (${i.count} cases)`)
      .join("; ");
    parts.push(`Top issues reported: ${issues}.`);
  }

  parts.push("Write the verdict.");

  return { system: SYSTEM_PROMPT, user: parts.join(" ") };
}
