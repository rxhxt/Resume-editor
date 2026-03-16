"use client";

import type { DragData } from "@/lib/dnd/types";
import type { Section, SectionItem, Bullet } from "@/types/resume";

interface DragOverlayContentProps {
  data: DragData;
}

export function DragOverlayContent({ data }: DragOverlayContentProps) {
  if (data.type === "bullet") {
    const bullet = data.payload as Bullet;
    return (
      <div className="max-w-sm rounded-md border bg-card px-3 py-2 text-sm shadow-lg">
        {bullet.text}
      </div>
    );
  }

  if (data.type === "item") {
    const item = data.payload as SectionItem;
    return (
      <div className="max-w-sm rounded-md border bg-card p-3 shadow-lg">
        <p className="font-medium">{item.title}</p>
        {item.subtitle && (
          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {item.bullets.length} bullet{item.bullets.length !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  if (data.type === "section") {
    const section = data.payload as Section;
    return (
      <div className="max-w-sm rounded-lg border bg-card p-3 shadow-lg">
        <p className="font-semibold">{section.title}</p>
        <p className="text-xs text-muted-foreground">
          {section.items.length} item{section.items.length !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  return null;
}
