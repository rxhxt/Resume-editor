import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getModel } from "@/lib/ai/get-model";
import type { AiProvider } from "@/stores/settings-store";

const autoTailorResponseSchema = z.object({
  selections: z.array(
    z.object({
      sectionId: z.string().describe("The section ID to include"),
      itemIds: z.array(z.string()).describe("Item IDs to include from this section"),
      bulletIds: z.array(z.string()).describe("Bullet IDs to include from these items"),
    }),
  ),
  reasoning: z.string().describe("Brief explanation of why these elements were selected"),
});

export type AutoTailorResponse = z.infer<typeof autoTailorResponseSchema>;

interface MasterSection {
  id: string;
  type: string;
  title: string;
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
    dateRange?: string;
    location?: string;
    bullets: Array<{ id: string; text: string }>;
  }>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sections: MasterSection[];
      jobDescription: string;
      provider?: AiProvider;
      apiKey?: string;
    };

    const { sections, jobDescription, provider, apiKey } = body;

    if (!sections?.length || !jobDescription) {
      return NextResponse.json(
        { error: "sections and jobDescription are required" },
        { status: 400 },
      );
    }

    // Format sections with IDs for the AI to reference
    const formattedSections = sections
      .map((section) => {
        const items = section.items
          .map((item) => {
            const bullets = item.bullets
              .map((b) => `      - [${b.id}] ${b.text}`)
              .join("\n");
            const header = [
              item.title,
              item.subtitle,
              item.dateRange,
              item.location,
            ]
              .filter(Boolean)
              .join(" | ");
            return `    [${item.id}] ${header}\n${bullets}`;
          })
          .join("\n\n");
        return `[${section.id}] ${section.title} (${section.type})\n${items}`;
      })
      .join("\n\n---\n\n");

    const { object } = await generateObject({
      model: getModel(provider ?? "internal", apiKey),
      schema: autoTailorResponseSchema,
      prompt: `You are an expert resume consultant. Given a master resume and a target job description, select the most relevant sections, items, and bullet points to create a strong tailored resume.

Think like a recruiter reviewing this resume for the job. Your goal is to build the strongest possible tailored resume by selecting elements that:
1. Directly match required skills and qualifications
2. Demonstrate relevant experience and achievements
3. Show transferable skills that apply to the role
4. Present a coherent narrative of the candidate's fit

Important rules:
- You are ONLY selecting elements — do NOT modify any text
- Reference elements by their IDs (shown in brackets)
- Include complete items when most of their bullets are relevant
- For skills sections, include the most relevant skill groups
- Aim for a focused, 1-page resume worth of content — don't include everything
- Every selected bulletId must belong to a selected itemId, and every selected itemId must belong to a selected sectionId

Job Description:
${jobDescription}

Master Resume Sections:
${formattedSections}

Select the sections, items, and bullets that would create the strongest tailored resume for this job.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("AI auto-tailor error:", error);
    return NextResponse.json(
      { error: "Failed to auto-tailor resume" },
      { status: 500 },
    );
  }
}
