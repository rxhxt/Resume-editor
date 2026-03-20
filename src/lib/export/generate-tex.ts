import type { Resume, Section, SectionItem } from "@/types/resume";

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, (m) => `\\${m}`)
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/–/g, "--")
    .replace(/—/g, "---")
    .replace(/'/g, "'")
    .replace(/'/g, "`")
    .replace(/"/g, "``")
    .replace(/"/g, "''")
    .replace(/…/g, "\\ldots{}")
    .replace(/≈/g, "\\textasciitilde{}")
    .replace(/∼/g, "\\textasciitilde{}");
}

function generateBullets(bullets: { text: string }[]): string {
  if (bullets.length === 0) return "";
  const items = bullets
    .map((b) => `    \\item ${escapeLatex(b.text)}`)
    .join("\n");
  return `\\vspace{-10pt}\n\\begin{itemize}\n${items}\n\\end{itemize}`;
}

function generateExperienceItem(item: SectionItem): string {
  const companyParts = [item.subtitle, item.location].filter(Boolean);
  const company = escapeLatex(companyParts.join(", "));
  const date = item.dateRange ? escapeLatex(item.dateRange) : "";
  const title = item.title ? escapeLatex(item.title) : "";

  let out = "";
  out += `\\noindent\\begin{tabular*}{\\textwidth}{@{\\extracolsep{\\fill}} l r}\n`;
  out += `\\textbf{${company}} & \\textit{(${date})} \\\\\n`;
  out += `\\end{tabular*}\n`;
  if (title) {
    out += `\\textit{${title}} \\\\\n`;
  }
  out += generateBullets(item.bullets);
  return out;
}

function generateProjectItem(item: SectionItem): string {
  const title = escapeLatex(item.title);
  const subtitle = item.subtitle ? escapeLatex(item.subtitle) : "";

  let out = "";
  out += `\\noindent\\begin{tabular*}{\\textwidth}{@{\\extracolsep{\\fill}} l r}\n`;
  out += `\\textbf{${title}} & \\textit{${subtitle}} \\\\\n`;
  out += `\\end{tabular*}\n`;
  out += generateBullets(item.bullets);
  return out;
}

function generateEducationItem(item: SectionItem): string {
  const title = escapeLatex(item.title);
  const date = item.dateRange ? escapeLatex(item.dateRange) : "";
  const subtitle = item.subtitle ? escapeLatex(item.subtitle) : "";
  const gpa = item.bullets.map((b) => escapeLatex(b.text)).join(", ");

  let out = "";
  out += `\\noindent\\begin{tabular*}{\\textwidth}{@{\\extracolsep{\\fill}} l r}\n`;
  out += `\\textbf{${title}} & \\textit{(${date})} \\\\\n`;
  out += `\\end{tabular*}\n`;
  if (subtitle || gpa) {
    out += subtitle;
    if (gpa) out += ` \\hspace{0.5cm}${gpa}`;
    out += "\n";
  }
  return out;
}

function generateSection(section: Section): string {
  let out = `\\section*{${escapeLatex(section.title)}}\n`;

  if (section.type === "summary") {
    const allText = section.items
      .flatMap((item) => item.bullets.map((b) => escapeLatex(b.text)))
      .join(" ");
    out += allText + "\n";
  } else if (section.type === "skills") {
    const lines = section.items.map((item) => {
      const label = escapeLatex(item.title);
      const values = item.bullets.map((b) => escapeLatex(b.text)).join(", ");
      return `\\textbf{${label}:} ${values}`;
    });
    out += lines.join(" \\\\[2pt]\n") + "\n";
  } else if (section.type === "experience") {
    out += section.items.map(generateExperienceItem).join("\n");
  } else if (section.type === "projects") {
    out += section.items.map(generateProjectItem).join("\n");
  } else if (section.type === "education") {
    out += section.items.map(generateEducationItem).join("\n");
  } else {
    out += section.items.map(generateExperienceItem).join("\n");
  }

  return out;
}

export function generateTexSource(resume: Resume): string {
  const name = escapeLatex(resume.headerData?.name ?? resume.name);
  const contactParts: string[] = [];

  if (resume.headerData?.phone)
    contactParts.push(escapeLatex(resume.headerData.phone));
  if (resume.headerData?.location)
    contactParts.push(escapeLatex(resume.headerData.location));
  if (resume.headerData?.email)
    contactParts.push(
      `\\href{mailto:${resume.headerData.email}}{${escapeLatex(resume.headerData.email)}}`,
    );
  if (resume.headerData?.linkedin)
    contactParts.push(
      `\\href{https://${resume.headerData.linkedin.replace(/^https?:\/\//, "")}}{${escapeLatex(resume.headerData.linkedin.replace(/^https?:\/\//, ""))}}`,
    );
  if (resume.headerData?.github)
    contactParts.push(
      `\\href{https://${resume.headerData.github.replace(/^https?:\/\//, "")}}{${escapeLatex(resume.headerData.github.replace(/^https?:\/\//, ""))}}`,
    );
  if (resume.headerData?.website)
    contactParts.push(
      `\\href{https://${resume.headerData.website.replace(/^https?:\/\//, "")}}{${escapeLatex(resume.headerData.website.replace(/^https?:\/\//, ""))}}`,
    );

  const contactLine = contactParts.join(" \\textbar\\ \n    ");

  const sections = [...resume.sections]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(generateSection)
    .join("\n");

  return `\\documentclass[a4paper,10.5pt]{article}
\\usepackage[left=0.5in, right=0.5in, top=0.4in, bottom=0.5in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{setspace}
\\usepackage{xcolor}
\\renewcommand{\\baselinestretch}{0.82}
\\setlength{\\parskip}{0.4ex}
\\setlist[itemize]{leftmargin=*, itemsep=1ex, topsep=0.7ex, parsep=0ex, partopsep=0ex}
\\pagecolor{white}
\\color{black}
\\titleformat{\\section}[block]{\\normalfont\\large\\bfseries}{\\thesection}{1em}{}
\\titlespacing*{\\section}{0pt}{1.2ex plus .2ex minus .2ex}{0.8ex plus .1ex}
\\titleformat{\\section}{\\normalfont\\large\\bfseries}{}{5em}{}[\\titlerule]
\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    urlcolor=blue,
    pdfborder={0 0 0},
}

\\begin{document}
\\sloppy

\\begin{center}
    {\\LARGE \\textbf{${name}}} \\\\ \\vspace{1pt}
    {\\small ${contactLine}}
\\end{center}

${sections}

\\vspace*{-1ex}
\\noindent\\makebox[\\linewidth]{\\rule{\\linewidth}{0.4pt}}
\\end{document}
`;
}
