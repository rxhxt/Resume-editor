export type ResumeId = string;
export type SectionId = string;
export type ItemId = string;
export type BulletId = string;

export type SectionType =
  | "header"
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "certifications"
  | "custom";

export interface Bullet {
  id: BulletId;
  text: string;
  sourceId?: BulletId;
  aiSuggested?: boolean;
  originalText?: string;
}

export interface SectionItem {
  id: ItemId;
  title: string;
  subtitle?: string;
  dateRange?: string;
  location?: string;
  bullets: Bullet[];
  metadata?: Record<string, string>;
}

export interface Section {
  id: SectionId;
  type: SectionType;
  title: string;
  items: SectionItem[];
  sortOrder: number;
}

export interface HeaderData {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Resume {
  id: ResumeId;
  name: string;
  headerData?: HeaderData;
  sections: Section[];
  texSource?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company?: string;
  url?: string;
  description: string;
  createdAt: string;
}

export interface AISuggestion {
  id: string;
  bulletId: BulletId;
  originalText: string;
  suggestedText: string;
  reason: string;
  applied: boolean;
}

export interface RelevanceScore {
  bulletId: BulletId;
  score: number;
  reason: string;
}
