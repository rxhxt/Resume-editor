"use client";

import { useState, useCallback } from "react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { generateId } from "@/lib/id";
import { useResumeStore } from "@/stores/resume-store";
import type { DragData } from "@/lib/dnd/types";
import type { Section, SectionItem, Bullet } from "@/types/resume";

export function useDragHandlers() {
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);

  const {
    tailoredResume,
    addSection,
    addItem,
    addBullet,
    reorderSections,
    reorderItems,
    reorderBullets,
  } = useResumeStore();

  const onDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    if (data) setActiveDragData(data);
  }, []);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragData(null);

      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current as DragData | undefined;
      const overData = over.data.current as Record<string, unknown> | undefined;
      if (!activeData) return;

      // Dragging from master to tailored — COPY
      if (activeData.source === "master") {
        const overSource = overData?.source as string | undefined;
        const isOverTailored =
          overSource === "tailored" ||
          over.id === "tailored-panel";

        if (!isOverTailored) return;

        if (activeData.type === "section") {
          const section = activeData.payload as Section;
          // Deep copy with new IDs
          const newSection: Section = {
            ...section,
            id: generateId(),
            sortOrder: tailoredResume?.sections.length ?? 0,
            items: section.items.map((item) => ({
              ...item,
              id: generateId(),
              bullets: item.bullets.map((b) => ({
                ...b,
                id: generateId(),
                sourceId: b.id,
              })),
            })),
          };
          addSection(newSection);
        }

        if (activeData.type === "item") {
          const item = activeData.payload as SectionItem;
          // Find or create a matching section in tailored
          const matchingSectionId = findOrCreateMatchingSection(
            activeData.sectionId,
          );
          if (!matchingSectionId) return;

          const newItem: SectionItem = {
            ...item,
            id: generateId(),
            bullets: item.bullets.map((b) => ({
              ...b,
              id: generateId(),
              sourceId: b.id,
            })),
          };
          addItem(matchingSectionId, newItem);
        }

        if (activeData.type === "bullet") {
          const bullet = activeData.payload as Bullet;
          const overType = overData?.type as string | undefined;
          const newBullet: Bullet = {
            ...bullet,
            id: generateId(),
            sourceId: bullet.id,
          };

          if (overType === "item-container") {
            // Dropped directly on an item container
            const targetSectionId = overData?.sectionId as string;
            const targetItemId = overData?.itemId as string;
            addBullet(targetSectionId, targetItemId, newBullet);
          } else if (overType === "bullet") {
            // Dropped on another bullet — add to the same item
            const targetSectionId = overData?.sectionId as string;
            const targetItemId = overData?.itemId as string;
            addBullet(targetSectionId, targetItemId, newBullet);
          } else {
            // Dropped on section, panel, or other — find first item in matching section
            const matchingSectionId = findOrCreateMatchingSection(
              activeData.sectionId,
            );
            if (!matchingSectionId) return;
            const section = useResumeStore
              .getState()
              .tailoredResume?.sections.find((s) => s.id === matchingSectionId);
            if (section && section.items.length > 0) {
              addBullet(matchingSectionId, section.items[0]!.id, newBullet);
            } else if (section) {
              // Section has no items — create one
              const masterResume = useResumeStore.getState().masterResume;
              const masterSection = masterResume?.sections.find(
                (s) => s.id === activeData.sectionId,
              );
              const masterItem = masterSection?.items.find((i) =>
                i.bullets.some((b) => b.id === bullet.id),
              );
              const newItem: SectionItem = {
                id: generateId(),
                title: masterItem?.title ?? section.title,
                subtitle: masterItem?.subtitle,
                dateRange: masterItem?.dateRange,
                location: masterItem?.location,
                bullets: [newBullet],
              };
              addItem(matchingSectionId, newItem);
            }
          }
        }

        return;
      }

      // Dragging within tailored — REORDER
      if (activeData.source === "tailored") {
        if (activeData.type === "section" && active.id !== over.id) {
          const sections = tailoredResume?.sections ?? [];
          const activePrefix = "tailored-section-";
          const activeId = String(active.id).replace(activePrefix, "");
          const overId = String(over.id).replace(activePrefix, "");
          const fromIndex = sections.findIndex((s) => s.id === activeId);
          const toIndex = sections.findIndex((s) => s.id === overId);
          if (fromIndex !== -1 && toIndex !== -1) {
            reorderSections(fromIndex, toIndex);
          }
        }

        if (activeData.type === "item" && active.id !== over.id) {
          const sectionId = activeData.sectionId;
          const section = tailoredResume?.sections.find(
            (s) => s.id === sectionId,
          );
          if (section) {
            const fromIndex = section.items.findIndex(
              (i) => `tailored-item-${i.id}` === String(active.id),
            );
            const toIndex = section.items.findIndex(
              (i) => `tailored-item-${i.id}` === String(over.id),
            );
            if (fromIndex !== -1 && toIndex !== -1) {
              reorderItems(sectionId, fromIndex, toIndex);
            }
          }
        }

        if (activeData.type === "bullet" && active.id !== over.id) {
          const sectionId = activeData.sectionId;
          const itemId = activeData.itemId;
          if (!itemId) return;

          const section = tailoredResume?.sections.find(
            (s) => s.id === sectionId,
          );
          const item = section?.items.find((i) => i.id === itemId);
          if (!item) return;

          const bulletPrefix = "tailored-bullet-";
          const activeIdx = item.bullets.findIndex(
            (b) => `tailored-bullet-${b.id}` === String(active.id),
          );
          const overIdx = item.bullets.findIndex(
            (b) => `tailored-bullet-${b.id}` === String(over.id),
          );
          if (activeIdx !== -1 && overIdx !== -1) {
            reorderBullets(sectionId, itemId, activeIdx, overIdx);
          }
        }
      }
    },
    [
      tailoredResume,
      addSection,
      addItem,
      addBullet,
      reorderSections,
      reorderItems,
      reorderBullets,
    ],
  );

  // Helper: find matching section in tailored resume, or return null
  const findOrCreateMatchingSection = useCallback(
    (masterSectionId: string): string | null => {
      const masterResume = useResumeStore.getState().masterResume;
      const masterSection = masterResume?.sections.find(
        (s) => s.id === masterSectionId,
      );
      if (!masterSection) return null;

      // Look for a section with matching type in tailored
      const existing = tailoredResume?.sections.find(
        (s) => s.type === masterSection.type,
      );
      if (existing) return existing.id;

      // Create a new section
      const newSection: Section = {
        id: generateId(),
        type: masterSection.type,
        title: masterSection.title,
        items: [],
        sortOrder: tailoredResume?.sections.length ?? 0,
      };
      addSection(newSection);
      return newSection.id;
    },
    [tailoredResume, addSection],
  );

  return { activeDragData, onDragStart, onDragEnd };
}
