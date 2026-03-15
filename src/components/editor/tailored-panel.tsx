"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { PencilSimpleIcon, TargetIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/editor/section-card";
import { useResumeStore } from "@/stores/resume-store";
import type { HeaderData } from "@/types/resume";

function HeaderForm() {
  const headerData = useResumeStore((s) => s.tailoredResume?.headerData);
  const updateHeaderData = useResumeStore((s) => s.updateHeaderData);

  const handleChange = (field: keyof HeaderData, value: string) => {
    updateHeaderData(field, value);
  };

  return (
    <div className="space-y-2 border-b px-4 py-3">
      <Input
        placeholder="Full Name"
        value={headerData?.name ?? ""}
        onChange={(e) => handleChange("name", e.target.value)}
        className="font-semibold"
      />
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="Email"
          type="email"
          value={headerData?.email ?? ""}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <Input
          placeholder="Phone"
          type="tel"
          value={headerData?.phone ?? ""}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        <Input
          placeholder="Location"
          value={headerData?.location ?? ""}
          onChange={(e) => handleChange("location", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Input
          placeholder="LinkedIn"
          value={headerData?.linkedin ?? ""}
          onChange={(e) => handleChange("linkedin", e.target.value)}
        />
        <Input
          placeholder="GitHub"
          value={headerData?.github ?? ""}
          onChange={(e) => handleChange("github", e.target.value)}
        />
        <Input
          placeholder="Website"
          value={headerData?.website ?? ""}
          onChange={(e) => handleChange("website", e.target.value)}
        />
      </div>
    </div>
  );
}

export function TailoredPanel() {
  const tailoredResume = useResumeStore((s) => s.tailoredResume);
  const removeSection = useResumeStore((s) => s.removeSection);
  const removeItem = useResumeStore((s) => s.removeItem);
  const removeBullet = useResumeStore((s) => s.removeBullet);
  const updateBulletText = useResumeStore((s) => s.updateBulletText);

  const { setNodeRef, isOver } = useDroppable({
    id: "tailored-panel",
    data: { type: "panel", source: "tailored" as const },
  });

  const sections = tailoredResume?.sections ?? [];
  const sectionIds = sections.map((s) => `tailored-section-${s.id}`);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <PencilSimpleIcon
            size={16}
            weight="bold"
            className="text-foreground"
          />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">
            Tailored Resume
          </h2>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Drop items here to build your resume
        </p>
      </div>
      <HeaderForm />
      <ScrollArea className="flex-1">
        <div
          ref={setNodeRef}
          className={cn(
            "min-h-full space-y-3 p-4 transition-colors",
            isOver && "bg-primary/5 ring-2 ring-inset ring-primary/10",
          )}
        >
          <SortableContext
            items={sectionIds}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <SectionCard
                  section={section}
                  source="tailored"
                  onRemoveSection={() => removeSection(section.id)}
                  onRemoveItem={(itemId) => removeItem(section.id, itemId)}
                  onRemoveBullet={(itemId, bulletId) =>
                    removeBullet(section.id, itemId, bulletId)
                  }
                  onUpdateBulletText={(itemId, bulletId, text) =>
                    updateBulletText(section.id, itemId, bulletId, text)
                  }
                />
              </motion.div>
            ))}
          </SortableContext>

          {sections.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center justify-center gap-5 py-24"
            >
              <div className="relative">
                <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 p-6">
                  <TargetIcon
                    size={36}
                    weight="bold"
                    className="text-muted-foreground/30"
                  />
                </div>
                <div className="absolute -left-2 -top-2 h-4 w-4 border-l-2 border-t-2 border-muted-foreground/20" />
                <div className="absolute -right-2 -top-2 h-4 w-4 border-r-2 border-t-2 border-muted-foreground/20" />
                <div className="absolute -bottom-2 -left-2 h-4 w-4 border-b-2 border-l-2 border-muted-foreground/20" />
                <div className="absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-muted-foreground/20" />
              </div>
              <div className="text-center">
                <p className="font-serif text-lg font-semibold text-muted-foreground/70">
                  Begin building
                </p>
                <p className="mt-1 max-w-[240px] text-sm text-muted-foreground/50">
                  Drag sections or individual bullets from your master resume
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
