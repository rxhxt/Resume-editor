import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getModel } from "@/lib/ai/get-model";
import type { AiProvider } from "@/stores/settings-store";

const relevanceResponseSchema = z.object({
  scores: z.array(
    z.object({
      bulletId: z.string().describe("The bullet ID"),
      score: z.number().min(0).max(100).describe("Relevance score 0-100"),
      reason: z.string().describe("Brief explanation of the score"),
    }),
  ),
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      bullets: Array<{ id: string; text: string }>;
      jobDescription: string;
      provider?: AiProvider;
      apiKey?: string;
    };

    const { bullets, jobDescription, provider, apiKey } = body;

    if (!bullets?.length || !jobDescription) {
      return NextResponse.json(
        { error: "bullets and jobDescription are required" },
        { status: 400 },
      );
    }

    const bulletList = bullets
      .map((b) => `[${b.id}]: ${b.text}`)
      .join("\n");

    const { object } = await generateObject({
      model: getModel(provider ?? "internal", apiKey),
      schema: relevanceResponseSchema,
      prompt: `You are a resume relevance scoring expert. Score each resume bullet point for relevance to the target job description.

Score 0-100:
- 70-100: Highly relevant — directly matches required skills, experience, or responsibilities
- 40-69: Somewhat relevant — related skills or transferable experience
- 0-39: Low relevance — not directly related to the job

Job Description:
${jobDescription}

Resume Bullets:
${bulletList}

Score each bullet and provide a brief reason (1 sentence).`,
    });

    return NextResponse.json(object.scores);
  } catch (error) {
    console.error("AI relevance error:", error);
    return NextResponse.json(
      { error: "Failed to score relevance" },
      { status: 500 },
    );
  }
}
