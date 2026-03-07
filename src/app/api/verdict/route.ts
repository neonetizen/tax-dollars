import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildVerdictPrompt } from "@/lib/prompts";
import { z } from "zod";

const verdictRequestSchema = z.object({
  assessedValue: z.number().min(0),
  cityContribution: z.number().min(0),
  deptBreakdown: z.array(
    z.object({
      department: z.string(),
      amount: z.number(),
      percentage: z.number(),
    })
  ),
  cipProjects: z.array(
    z.object({
      projectName: z.string(),
      projectNumber: z.string(),
      assetOwningDept: z.string(),
      amount: z.number(),
      fundType: z.string(),
      reportFY: z.string(),
    })
  ),
  neighborhood: z.string().optional(),
  avgResolutionDays: z.number().optional(),
  cityAvgResolutionDays: z.number().optional(),
  topIssues: z
    .array(z.object({ service: z.string(), count: z.number() }))
    .optional(),
  comparisonNeighborhood: z.string().optional(),
  comparisonStats: z
    .object({
      name: z.string(),
      avgResolutionDays: z.number(),
      totalCases: z.number(),
      topServices: z.array(
        z.object({ service: z.string(), count: z.number() })
      ),
      casesByType: z.record(z.string(), z.number()),
    })
    .optional(),
  comparisonCipProjects: z
    .array(
      z.object({
        projectName: z.string(),
        projectNumber: z.string(),
        assetOwningDept: z.string(),
        amount: z.number(),
        fundType: z.string(),
        reportFY: z.string(),
      })
    )
    .optional(),
});

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic();
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const body = verdictRequestSchema.parse(raw);

    const anthropic = getAnthropicClient();
    const { system, user } = buildVerdictPrompt(body);

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system,
      messages: [{ role: "user", content: user }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const verdict = textBlock ? textBlock.text : "Unable to generate verdict.";

    return NextResponse.json({ verdict });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { verdict: "", error: "Invalid request data" },
        { status: 400 }
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to generate verdict";
    return NextResponse.json({ verdict: "", error: message }, { status: 500 });
  }
}
