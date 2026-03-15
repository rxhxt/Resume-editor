import type { Section, SectionItem, Bullet, SectionId, ItemId } from "@/types/resume";

export type DragType = "section" | "item" | "bullet";
export type DragSource = "master" | "tailored";

export interface DragData {
  type: DragType;
  source: DragSource;
  sectionId: SectionId;
  itemId?: ItemId;
  payload: Section | SectionItem | Bullet;
}
