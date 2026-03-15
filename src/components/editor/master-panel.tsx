"use client";

import { ArchiveIcon } from "@phosphor-icons/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/editor/section-card";
import { useResumeStore } from "@/stores/resume-store";

export function MasterPanel() {
  const masterResume = useResumeStore((s) => s.masterResume);
  const getUsedBulletIds = useResumeStore((s) => s.getUsedBulletIds);
  const usedBulletIds = getUsedBulletIds();

  if (!masterResume) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No master resume loaded</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-accent/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <ArchiveIcon
            size={16}
            weight="bold"
            className="text-muted-foreground"
          />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Master Resume
          </h2>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          Drag sections or bullets to the tailored resume
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {masterResume.sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              source="master"
              usedBulletIds={usedBulletIds}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
