import { z } from "zod";

const bulletSchema = z.object({
  text: z.string().describe("The bullet point text"),
});

const sectionItemSchema = z.object({
  title: z.string().describe("Item title (e.g. job title, school name, project name)"),
  subtitle: z.string().optional().describe("Subtitle (e.g. company name, degree)"),
  dateRange: z.string().optional().describe("Date range (e.g. 'Jan 2022 - Present')"),
  location: z.string().optional().describe("Location (e.g. 'San Francisco, CA')"),
  bullets: z.array(bulletSchema).describe("Bullet points for this item"),
});

const sectionTypeSchema = z.enum([
  "header",
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "custom",
]);

const sectionSchema = z.object({
  type: sectionTypeSchema.describe("The type of section"),
  title: z.string().describe("Section heading as it appears in the resume"),
  items: z.array(sectionItemSchema).describe("Items within this section"),
});

const headerDataSchema = z.object({
  name: z.string().describe("Full name"),
  email: z.string().optional().describe("Email address"),
  phone: z.string().optional().describe("Phone number"),
  location: z.string().optional().describe("Location/address"),
  linkedin: z.string().optional().describe("LinkedIn URL or username"),
  github: z.string().optional().describe("GitHub URL or username"),
  website: z.string().optional().describe("Personal website URL"),
});

export const resumeStructureSchema = z.object({
  headerData: headerDataSchema.describe("Contact and personal information from the resume header"),
  sections: z.array(sectionSchema).describe("All resume sections in order"),
});

export type ResumeStructure = z.infer<typeof resumeStructureSchema>;
