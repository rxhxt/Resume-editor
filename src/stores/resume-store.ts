import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "@/lib/id";
import type {
  Resume,
  HeaderData,
  Section,
  SectionItem,
  Bullet,
  JobDescription,
  AISuggestion,
  RelevanceScore,
  SectionId,
  ItemId,
  BulletId,
} from "@/types/resume";

export type UploadStatus = "idle" | "uploading" | "parsing" | "done" | "error";

interface ResumeStore {
  // Master resume
  masterResume: Resume | null;
  setMasterResume: (resume: Resume) => void;

  // Tailored resume
  tailoredResume: Resume | null;
  initTailoredResume: (name: string) => void;
  updateHeaderData: (field: keyof HeaderData, value: string) => void;

  // Section operations (tailored)
  addSection: (section: Section) => void;
  removeSection: (sectionId: SectionId) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;

  // Item operations (tailored)
  addItem: (sectionId: SectionId, item: SectionItem, index?: number) => void;
  removeItem: (sectionId: SectionId, itemId: ItemId) => void;
  reorderItems: (sectionId: SectionId, fromIndex: number, toIndex: number) => void;

  // Bullet operations (tailored)
  addBullet: (
    sectionId: SectionId,
    itemId: ItemId,
    bullet: Bullet,
    index?: number,
  ) => void;
  removeBullet: (
    sectionId: SectionId,
    itemId: ItemId,
    bulletId: BulletId,
  ) => void;
  reorderBullets: (
    sectionId: SectionId,
    itemId: ItemId,
    fromIndex: number,
    toIndex: number,
  ) => void;
  updateBulletText: (
    sectionId: SectionId,
    itemId: ItemId,
    bulletId: BulletId,
    text: string,
  ) => void;

  // Track used bullets
  getUsedBulletIds: () => Set<string>;

  // Job description
  jobDescription: JobDescription | null;
  setJobDescription: (jd: JobDescription | null) => void;

  // AI
  suggestions: AISuggestion[];
  relevanceScores: RelevanceScore[];
  setSuggestions: (suggestions: AISuggestion[]) => void;
  setRelevanceScores: (scores: RelevanceScore[]) => void;
  applySuggestion: (suggestionId: string) => void;

  // Upload
  uploadStatus: UploadStatus;
  uploadError: string | null;
  setUploadStatus: (status: UploadStatus, error?: string) => void;

  // Auto-tailor
  applyAutoTailor: (selections: Array<{
    sectionId: string;
    itemIds: string[];
    bulletIds: string[];
  }>) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  masterResume: null,
  tailoredResume: null,
  jobDescription: null,
  suggestions: [],
  relevanceScores: [],
  uploadStatus: "idle" as UploadStatus,
  uploadError: null,
};

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMasterResume: (resume) => set({ masterResume: resume }),

      initTailoredResume: (name) => {
        const master = get().masterResume;
        set({
          tailoredResume: {
            id: generateId(),
            name,
            headerData: master?.headerData
              ? { ...master.headerData }
              : undefined,
            sections: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateHeaderData: (field, value) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          return {
            tailoredResume: {
              ...state.tailoredResume,
              headerData: {
                ...state.tailoredResume.headerData,
                name: state.tailoredResume.headerData?.name ?? "",
                [field]: value,
              },
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      addSection: (section) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          return {
            tailoredResume: {
              ...state.tailoredResume,
              sections: [...state.tailoredResume.sections, section],
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      removeSection: (sectionId) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          return {
            tailoredResume: {
              ...state.tailoredResume,
              sections: state.tailoredResume.sections.filter(
                (s) => s.id !== sectionId,
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      reorderSections: (fromIndex, toIndex) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          const sections = [...state.tailoredResume.sections];
          const [moved] = sections.splice(fromIndex, 1);
          if (!moved) return state;
          sections.splice(toIndex, 0, moved);
          return {
            tailoredResume: {
              ...state.tailoredResume,
              sections: sections.map((s, i) => ({ ...s, sortOrder: i })),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      addItem: (sectionId, item, index) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          return {
            tailoredResume: {
              ...state.tailoredResume,
              sections: state.tailoredResume.sections.map((section) => {
                if (section.id !== sectionId) return section;
                const items = [...section.items];
                if (index !== undefined) {
                  items.splice(index, 0, item);
                } else {
                  items.push(item);
                }
                return { ...section, items };
              }),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      removeItem: (sectionId, itemId) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          return {
            tailoredResume: {
              ...state.tailoredResume,
              sections: state.tailoredResume.sections.map((section) => {
                if (section.id !== sectionId) return section;
                return {
                  ...section,
                  items: section.items.filter((item) => item.id !== itemId),
                };
              }),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      reorderItems: (sectionId, fromIndex, toIndex) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          return {
            tailoredResume: {
              ...state.tailoredResume,
              sections: state.tailoredResume.sections.map((section) => {
                if (section.id !== sectionId) return section;
                const items = [...section.items];
                const [moved] = items.splice(fromIndex, 1);
                if (!moved) return section;
                items.splice(toIndex, 0, moved);
                return { ...section, items };
              }),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      addBullet: (sectionId, itemId, bullet, index) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          return {
            tailoredResume: {
              ...state.tailoredResume,
              sections: state.tailoredResume.sections.map((section) => {
                if (section.id !== sectionId) return section;
                return {
                  ...section,
                  items: section.items.map((item) => {
                    if (item.id !== itemId) return item;
                    const bullets = [...item.bullets];
                    if (index !== undefined) {
                      bullets.splice(index, 0, bullet);
                    } else {
                      bullets.push(bullet);
                    }
                    return { ...item, bullets };
                  }),
                };
              }),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      removeBullet: (sectionId, itemId, bulletId) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          return {
            tailoredResume: {
              ...state.tailoredResume,
              sections: state.tailoredResume.sections.map((section) => {
                if (section.id !== sectionId) return section;
                return {
                  ...section,
                  items: section.items.map((item) => {
                    if (item.id !== itemId) return item;
                    return {
                      ...item,
                      bullets: item.bullets.filter((b) => b.id !== bulletId),
                    };
                  }),
                };
              }),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      reorderBullets: (sectionId, itemId, fromIndex, toIndex) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          return {
            tailoredResume: {
              ...state.tailoredResume,
              sections: state.tailoredResume.sections.map((section) => {
                if (section.id !== sectionId) return section;
                return {
                  ...section,
                  items: section.items.map((item) => {
                    if (item.id !== itemId) return item;
                    const bullets = [...item.bullets];
                    const [moved] = bullets.splice(fromIndex, 1);
                    if (!moved) return item;
                    bullets.splice(toIndex, 0, moved);
                    return { ...item, bullets };
                  }),
                };
              }),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      updateBulletText: (sectionId, itemId, bulletId, text) =>
        set((state) => {
          if (!state.tailoredResume) return state;
          return {
            tailoredResume: {
              ...state.tailoredResume,
              sections: state.tailoredResume.sections.map((section) => {
                if (section.id !== sectionId) return section;
                return {
                  ...section,
                  items: section.items.map((item) => {
                    if (item.id !== itemId) return item;
                    return {
                      ...item,
                      bullets: item.bullets.map((b) =>
                        b.id === bulletId ? { ...b, text } : b,
                      ),
                    };
                  }),
                };
              }),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      getUsedBulletIds: () => {
        const state = get();
        const ids = new Set<string>();
        if (!state.tailoredResume) return ids;
        for (const section of state.tailoredResume.sections) {
          for (const item of section.items) {
            for (const bullet of item.bullets) {
              if (bullet.sourceId) {
                ids.add(bullet.sourceId);
              }
            }
          }
        }
        return ids;
      },

      setJobDescription: (jd) => set({ jobDescription: jd }),

      setSuggestions: (suggestions) => set({ suggestions }),
      setRelevanceScores: (relevanceScores) => set({ relevanceScores }),

      applySuggestion: (suggestionId) =>
        set((state) => {
          const suggestion = state.suggestions.find(
            (s) => s.id === suggestionId,
          );
          if (!suggestion || !state.tailoredResume) return state;

          return {
            suggestions: state.suggestions.map((s) =>
              s.id === suggestionId ? { ...s, applied: true } : s,
            ),
            tailoredResume: {
              ...state.tailoredResume,
              sections: state.tailoredResume.sections.map((section) => ({
                ...section,
                items: section.items.map((item) => ({
                  ...item,
                  bullets: item.bullets.map((b) =>
                    b.id === suggestion.bulletId
                      ? {
                          ...b,
                          text: suggestion.suggestedText,
                          originalText: b.originalText ?? b.text,
                        }
                      : b,
                  ),
                })),
              })),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      setUploadStatus: (uploadStatus, error) =>
        set({ uploadStatus, uploadError: error ?? null }),

      applyAutoTailor: (selections) =>
        set((state) => {
          if (!state.masterResume || !state.tailoredResume) return state;

          const usedBulletIds = new Set<string>();
          for (const section of state.tailoredResume.sections) {
            for (const item of section.items) {
              for (const bullet of item.bullets) {
                if (bullet.sourceId) usedBulletIds.add(bullet.sourceId);
              }
            }
          }

          let updatedTailored = { ...state.tailoredResume };
          let sections = [...updatedTailored.sections];

          for (const sel of selections) {
            const masterSection = state.masterResume.sections.find(
              (s) => s.id === sel.sectionId,
            );
            if (!masterSection) continue;

            // Find or create matching section in tailored
            let tailoredSection = sections.find(
              (s) => s.type === masterSection.type,
            );
            if (!tailoredSection) {
              tailoredSection = {
                id: generateId(),
                type: masterSection.type,
                title: masterSection.title,
                items: [],
                sortOrder: sections.length,
              };
              sections = [...sections, tailoredSection];
            }

            const selectedBulletIds = new Set(sel.bulletIds);
            const selectedItemIds = new Set(sel.itemIds);

            for (const masterItem of masterSection.items) {
              if (!selectedItemIds.has(masterItem.id)) continue;

              // Filter bullets to only selected ones that aren't already used
              const newBullets: Bullet[] = masterItem.bullets
                .filter(
                  (b) =>
                    selectedBulletIds.has(b.id) && !usedBulletIds.has(b.id),
                )
                .map((b) => ({
                  ...b,
                  id: generateId(),
                  sourceId: b.id,
                }));

              if (newBullets.length === 0) continue;

              // Mark these as used
              for (const b of newBullets) {
                if (b.sourceId) usedBulletIds.add(b.sourceId);
              }

              // Check if this item already exists in tailored (by matching title)
              const existingItem = tailoredSection.items.find(
                (i) => i.title === masterItem.title && i.subtitle === masterItem.subtitle,
              );

              if (existingItem) {
                // Append new bullets to existing item
                sections = sections.map((s) =>
                  s.id === tailoredSection!.id
                    ? {
                        ...s,
                        items: s.items.map((i) =>
                          i.id === existingItem.id
                            ? { ...i, bullets: [...i.bullets, ...newBullets] }
                            : i,
                        ),
                      }
                    : s,
                );
              } else {
                // Create new item
                const newItem: SectionItem = {
                  id: generateId(),
                  title: masterItem.title,
                  subtitle: masterItem.subtitle,
                  dateRange: masterItem.dateRange,
                  location: masterItem.location,
                  bullets: newBullets,
                };
                sections = sections.map((s) =>
                  s.id === tailoredSection!.id
                    ? { ...s, items: [...s.items, newItem] }
                    : s,
                );
              }
            }
          }

          return {
            tailoredResume: {
              ...updatedTailored,
              sections,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      reset: () => set(initialState),
    }),
    {
      name: "resume-editor-storage",
      partialize: (state) => ({
        masterResume: state.masterResume,
        tailoredResume: state.tailoredResume,
        jobDescription: state.jobDescription,
      }),
    },
  ),
);
