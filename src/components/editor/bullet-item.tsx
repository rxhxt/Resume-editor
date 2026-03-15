"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DotsSixVerticalIcon,
  TrashIcon,
  PencilSimpleIcon,
  CheckIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { RelevanceBadge } from "@/components/ai/relevance-badge";
import { SuggestionPopover } from "@/components/ai/suggestion-popover";
import type { Bullet, SectionId, ItemId } from "@/types/resume";
import type { DragData, DragSource } from "@/lib/dnd/types";

interface BulletItemProps {
  bullet: Bullet;
  sectionId: SectionId;
  itemId: ItemId;
  source: DragSource;
  isUsed?: boolean;
  onRemove?: () => void;
  onUpdateText?: (text: string) => void;
}

export function BulletItem({
  bullet,
  sectionId,
  itemId,
  source,
  isUsed,
  onRemove,
  onUpdateText,
}: BulletItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(bullet.text);

  const dragData: DragData = {
    type: "bullet",
    source,
    sectionId,
    itemId,
    payload: bullet,
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${source}-bullet-${bullet.id}`,
    data: dragData,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editText.trim() && editText !== bullet.text) {
      onUpdateText?.(editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(bullet.text);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        isDragging && "z-50 opacity-50",
        isUsed && source === "master" && "opacity-40",
        source === "tailored" && "hover:bg-muted/50",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
      >
        <DotsSixVerticalIcon size={14} weight="bold" />
      </button>

      {isEditing ? (
        <div className="flex flex-1 items-start gap-1">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") handleCancel();
            }}
            className="flex-1 resize-none rounded border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            rows={2}
            autoFocus
          />
          <button
            onClick={handleSave}
            className="mt-1 text-muted-foreground hover:text-foreground"
          >
            <CheckIcon size={14} weight="bold" />
          </button>
          <button
            onClick={handleCancel}
            className="mt-1 text-muted-foreground hover:text-foreground"
          >
            <XIcon size={14} weight="bold" />
          </button>
        </div>
      ) : (
        <>
          {source === "master" && (
            <RelevanceBadge bulletId={bullet.id} />
          )}
          <span className="flex-1 leading-relaxed">{bullet.text}</span>
          {source === "tailored" && (
            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <SuggestionPopover bulletId={bullet.id} bulletText={bullet.text} />
              <button
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <PencilSimpleIcon size={14} />
              </button>
              <button
                onClick={onRemove}
                className="text-muted-foreground hover:text-destructive"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
