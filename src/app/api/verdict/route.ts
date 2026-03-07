import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { VerdictRequest } from "@/types";
import {
  buildSingleVerdictPrompt,
  buildComparisonVerdictPrompt,
} from "@/lib/prompts";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerdictRequest;

    const isComparison = !!body.comparisonNeighborhood && !!body.comparisonStats;
    const { system, user } = isComparison
      ? buildComparisonVerdictPrompt(body)
      : buildSingleVerdictPrompt(body);

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
    const message =
      err instanceof Error ? err.message : "Failed to generate verdict";
    return NextResponse.json({ verdict: "", error: message }, { status: 500 });
  }
}
