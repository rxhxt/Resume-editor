import { generateObject } from "ai";
import { getModel } from "@/lib/ai/get-model";
import { resumeStructureSchema } from "./resume-schema";
import type { ResumeStructure } from "./resume-schema";
import type { AiProvider } from "@/stores/settings-store";

export async function structureResumeText(
  rawText: string,
  provider?: AiProvider,
  apiKey?: string,
): Promise<ResumeStructure> {
  const { object } = await generateObject({
    model: getModel(provider ?? "internal", apiKey),
    schema: resumeStructureSchema,
    prompt: `Parse the following resume text into structured sections. Identify the person's contact information for the header, then break the rest into logical sections (experience, education, skills, projects, certifications, summary, etc.).

For each section, identify individual items (e.g., each job, each school, each project) with their title, subtitle, date range, location, and bullet points.

Important rules:
- Preserve the original text as closely as possible — do not rewrite or embellish
- Each bullet point should be a single achievement or responsibility
- If a section doesn't fit standard types, use "custom" as the type
- Skills sections may have items with bullets listing individual skills
- Summary/objective sections should have one item with the summary text as bullets

Resume text:
${rawText}`,
  });

  return object;
}
