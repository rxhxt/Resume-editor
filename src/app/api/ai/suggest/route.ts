import { streamText } from "ai";
import { getModel } from "@/lib/ai/get-model";
import type { AiProvider } from "@/stores/settings-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      bulletText: string;
      jobDescription?: string;
      action: "improve" | "reword";
      provider?: AiProvider;
      apiKey?: string;
    };

    const { bulletText, jobDescription, action, provider, apiKey } = body;

    if (!bulletText) {
      return Response.json({ error: "bulletText is required" }, { status: 400 });
    }

    let prompt: string;

    if (action === "reword" && jobDescription) {
      prompt = `You are a resume writing expert. Reword the following resume bullet point to be more relevant to the target job description. Keep it concise (1-2 sentences), use strong action verbs, and include metrics where possible.

Original bullet: "${bulletText}"

Target job description:
${jobDescription}

Return ONLY the reworded bullet point text, nothing else.`;
    } else {
      prompt = `You are a resume writing expert. Improve the following resume bullet point to be more impactful. Use strong action verbs, quantify results where possible, and make it concise (1-2 sentences).

Original bullet: "${bulletText}"

Return ONLY the improved bullet point text, nothing else.`;
    }

    const result = streamText({
      model: getModel(provider ?? "internal", apiKey),
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI suggest error:", error);
    return Response.json({ error: "Failed to generate suggestion" }, { status: 500 });
  }
}
