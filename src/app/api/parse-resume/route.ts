import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import type { Resume, Section, SectionItem, Bullet, SectionType } from "@/types/resume";
import { structureResumeText } from "@/lib/parse/structure-resume";
import type { AiProvider } from "@/stores/settings-store";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const provider = (formData.get("provider") as AiProvider) ?? undefined;
    const apiKey = (formData.get("apiKey") as string) ?? undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = "";

    const isTexFile = file.name.endsWith(".tex") || file.type === "text/x-tex";
    let texSource: string | undefined;

    if (file.type === "application/pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
      const data = await pdfParse(buffer);
      rawText = data.text;
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } else if (isTexFile) {
      texSource = buffer.toString("utf-8");
      // Strip LaTeX commands to extract plain text for AI parsing
      rawText = texSource
        .replace(/%.*$/gm, "") // remove comments
        .replace(/\\(?:begin|end)\{[^}]*\}/g, "") // remove \begin{...} and \end{...}
        .replace(/\\(?:documentclass|usepackage|pagestyle|thispagestyle|setlength|newcommand|renewcommand|definecolor|hypersetup|geometry|fancyhf|fancyfoot|fancyhead)\{[^}]*\}(?:\{[^}]*\})*/g, "") // remove preamble commands
        .replace(/\\(?:vspace|hspace|hfill|vfill|noindent|centering|raggedright|raggedleft|newpage|clearpage|smallskip|medskip|bigskip|\\)/g, "") // remove formatting commands
        .replace(/\\(?:textbf|textit|emph|underline|href)\{([^}]*)\}/g, "$1") // unwrap text styling
        .replace(/\\(?:section|subsection|subsubsection)\*?\{([^}]*)\}/g, "\n$1\n") // convert sections to plain text
        .replace(/\\item\s*/g, "• ") // convert \item to bullet
        .replace(/\{|\}/g, "") // remove remaining braces
        .replace(/\\\w+/g, "") // remove remaining commands
        .replace(/\n{3,}/g, "\n\n") // collapse multiple blank lines
        .trim();
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, DOCX, or TeX file." },
        { status: 400 },
      );
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the file" },
        { status: 400 },
      );
    }

    // Try Gemini-based structuring first, fall back to heuristic
    let resume: Resume;
    try {
      const structured = await structureResumeText(rawText, provider, apiKey);
      resume = {
        id: nanoid(),
        name: file.name.replace(/\.(pdf|docx|tex)$/i, ""),
        headerData: structured.headerData,
        texSource,
        sections: structured.sections.map((s, i) => ({
          id: nanoid(),
          type: s.type,
          title: s.title,
          sortOrder: i,
          items: s.items.map((item) => ({
            id: nanoid(),
            title: item.title,
            subtitle: item.subtitle,
            dateRange: item.dateRange,
            location: item.location,
            bullets: item.bullets.map((b) => ({
              id: nanoid(),
              text: b.text,
            })),
          })),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (aiError) {
      console.warn("Gemini parsing failed, falling back to heuristic:", aiError);
      resume = parseResumeText(rawText, file.name);
      if (texSource) resume.texSource = texSource;
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 },
    );
  }
}

// Heuristic fallback parser
function parseResumeText(text: string, fileName: string): Resume {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let currentItem: SectionItem | null = null;

  const sectionKeywords: Record<string, SectionType> = {
    experience: "experience",
    "work experience": "experience",
    "professional experience": "experience",
    employment: "experience",
    education: "education",
    "academic background": "education",
    projects: "projects",
    "personal projects": "projects",
    skills: "skills",
    "technical skills": "skills",
    certifications: "certifications",
    certificates: "certifications",
    summary: "summary",
    objective: "summary",
    "professional summary": "summary",
  };

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    const matchedType = Object.entries(sectionKeywords).find(
      ([keyword]) =>
        lowerLine === keyword ||
        lowerLine.startsWith(keyword + ":") ||
        lowerLine.startsWith(keyword + " "),
    );

    if (matchedType) {
      if (currentItem && currentSection) {
        currentSection.items.push(currentItem);
        currentItem = null;
      }
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        id: nanoid(),
        type: matchedType[1],
        title: line,
        items: [],
        sortOrder: sections.length,
      };
      continue;
    }

    if (!currentSection) {
      if (sections.length === 0 && !currentSection) {
        continue;
      }
    }

    if (currentSection) {
      const isBullet =
        line.startsWith("•") ||
        line.startsWith("-") ||
        line.startsWith("●") ||
        line.startsWith("◦") ||
        line.startsWith("*");

      if (isBullet) {
        const bulletText = line.replace(/^[•\-●◦*]\s*/, "").trim();
        if (bulletText) {
          const bullet: Bullet = { id: nanoid(), text: bulletText };
          if (currentItem) {
            currentItem.bullets.push(bullet);
          } else {
            currentItem = {
              id: nanoid(),
              title: currentSection.title,
              bullets: [bullet],
            };
          }
        }
      } else if (
        currentSection.type === "skills" ||
        currentSection.type === "summary"
      ) {
        const bullet: Bullet = { id: nanoid(), text: line };
        if (!currentItem) {
          currentItem = {
            id: nanoid(),
            title: currentSection.title,
            bullets: [],
          };
        }
        currentItem.bullets.push(bullet);
      } else {
        if (currentItem) {
          currentSection.items.push(currentItem);
        }
        currentItem = {
          id: nanoid(),
          title: line,
          bullets: [],
        };
      }
    }
  }

  if (currentItem && currentSection) {
    currentSection.items.push(currentItem);
  }
  if (currentSection) {
    sections.push(currentSection);
  }

  if (sections.length === 0) {
    sections.push({
      id: nanoid(),
      type: "custom",
      title: "Resume Content",
      sortOrder: 0,
      items: [
        {
          id: nanoid(),
          title: "Content",
          bullets: lines.map((line) => ({
            id: nanoid(),
            text: line,
          })),
        },
      ],
    });
  }

  return {
    id: nanoid(),
    name: fileName.replace(/\.(pdf|docx|tex)$/i, ""),
    sections,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
