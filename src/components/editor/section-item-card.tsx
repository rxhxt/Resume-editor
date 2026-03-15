"use client";

import { useCallback } from "react";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  BriefcaseIcon,
  GraduationCapIcon,
  MapPinIcon,
  CalendarIcon,
  DotsSixVerticalIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { BulletItem } from "@/components/editor/bullet-item";
import type { SectionItem, SectionId, SectionType } from "@/types/resume";
import type { DragData, DragSource } from "@/lib/dnd/types";

interface SectionItemCardProps {
  item: SectionItem;
  sectionId: SectionId;
  sectionType: SectionType;
  source: DragSource;
  usedBulletIds?: Set<string>;
  onRemoveItem?: () => void;
  onRemoveBullet?: (bulletId: string) => void;
  onUpdateBulletText?: (bulletId: string, text: string) => void;
}

export function SectionItemCard({
  item,
  sectionId,
  sectionType,
  source,
  usedBulletIds,
  onRemoveItem,
  onRemoveBullet,
  onUpdateBulletText,
}: SectionItemCardProps) {
  const dragData: DragData = {
    type: "item",
    source,
    sectionId,
    payload: item,
  };

  const sortableId = `${source}-item-${item.id}`;
  const {
    attributes,
    listeners,
    setNodeRef: sortableSetNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    data: dragData,
  });

  const droppableId = `${source}-item-drop-${item.id}`;
  const { setNodeRef: droppableSetNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { type: "item-container", source, sectionId, itemId: item.id },
  });

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      sortableSetNodeRef(node);
      droppableSetNodeRef(node);
    },
    [sortableSetNodeRef, droppableSetNodeRef],
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const ItemIcon =
    sectionType === "education" ? GraduationCapIcon : BriefcaseIcon;

  const bulletIds = item.bullets.map((b) => `${source}-bullet-${b.id}`);

  return (
    <div
      ref={mergedRef}
      style={style}
      className={cn(
        "group/item rounded-md border bg-card p-3 transition-colors",
        isOver && source === "tailored" && "border-primary/50 bg-primary/5",
        isDragging && "z-50 opacity-50",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          >
            <DotsSixVerticalIcon size={16} weight="bold" />
          </button>
          <ItemIcon
            size={16}
            weight="bold"
            className="mt-0.5 shrink-0 text-muted-foreground"
          />
          <div>
            <p className="font-medium leading-tight">{item.title}</p>
            {item.subtitle && (
              <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            )}
          </div>
        </div>
        {source === "tailored" && onRemoveItem && (
          <button
            onClick={onRemoveItem}
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/item:opacity-100"
          >
            <TrashIcon size={14} />
          </button>
        )}
      </div>

      {(item.dateRange ?? item.location) && (
        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {item.dateRange && (
            <span className="flex items-center gap-1">
              <CalendarIcon size={12} />
              {item.dateRange}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPinIcon size={12} />
              {item.location}
            </span>
          )}
        </div>
      )}

      <SortableContext items={bulletIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {item.bullets.map((bullet) => (
            <BulletItem
              key={bullet.id}
              bullet={bullet}
              sectionId={sectionId}
              itemId={item.id}
              source={source}
              isUsed={usedBulletIds?.has(bullet.id)}
              onRemove={() => onRemoveBullet?.(bullet.id)}
              onUpdateText={(text) => onUpdateBulletText?.(bullet.id, text)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
