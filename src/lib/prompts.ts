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
    req.zipCode ? `ZIP code: ${req.zipCode}.` : null,
    `Assessed value: $${req.assessedValue.toLocaleString()}.`,
    `Estimated city contribution: $${req.cityContribution.toFixed(2)}.`,
    `Department breakdown: ${topDepts}.`,
    `Top capital improvement projects: ${cipList}.`,
    "Write the verdict.",
  ].filter(Boolean);

  return { system: SYSTEM_PROMPT, user: parts.join(" ") };
}
