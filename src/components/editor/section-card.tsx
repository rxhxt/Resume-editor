"use client";

import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CaretDownIcon,
  CaretRightIcon,
  DotsSixVerticalIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SectionItemCard } from "@/components/editor/section-item-card";
import type { Section, SectionId } from "@/types/resume";
import type { DragData, DragSource } from "@/lib/dnd/types";

interface SectionCardProps {
  section: Section;
  source: DragSource;
  usedBulletIds?: Set<string>;
  onRemoveSection?: () => void;
  onRemoveItem?: (itemId: string) => void;
  onRemoveBullet?: (itemId: string, bulletId: string) => void;
  onUpdateBulletText?: (itemId: string, bulletId: string, text: string) => void;
}

export function SectionCard({
  section,
  source,
  usedBulletIds,
  onRemoveSection,
  onRemoveItem,
  onRemoveBullet,
  onUpdateBulletText,
}: SectionCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dragData: DragData = {
    type: "section",
    source,
    sectionId: section.id,
    payload: section,
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${source}-section-${section.id}`,
    data: dragData,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const itemIds = section.items.map((i) => `${source}-item-${i.id}`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-card shadow-sm transition-shadow",
        isDragging && "z-50 opacity-50 shadow-lg",
      )}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
        >
          <DotsSixVerticalIcon size={16} weight="bold" />
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? (
            <CaretRightIcon size={14} weight="bold" />
          ) : (
            <CaretDownIcon size={14} weight="bold" />
          )}
        </button>

        <h3 className="flex-1 text-sm font-semibold">{section.title}</h3>

        {source === "tailored" && onRemoveSection && (
          <button
            onClick={onRemoveSection}
            className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          >
            <TrashIcon size={14} />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="space-y-2 p-3">
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            {section.items.map((item) => (
              <SectionItemCard
                key={item.id}
                item={item}
                sectionId={section.id}
                sectionType={section.type}
                source={source}
                usedBulletIds={usedBulletIds}
                onRemoveItem={() => onRemoveItem?.(item.id)}
                onRemoveBullet={(bulletId) =>
                  onRemoveBullet?.(item.id, bulletId)
                }
                onUpdateBulletText={(bulletId, text) =>
                  onUpdateBulletText?.(item.id, bulletId, text)
                }
              />
            ))}
          </SortableContext>
          {section.items.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No items in this section
            </p>
          )}
        </div>
      )}
    </div>
  );
}
