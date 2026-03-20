"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  FileArrowDownIcon,
  FileIcon,
  FilePdfIcon,
  ClipboardTextIcon,
  GearIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobDescriptionInput } from "@/components/ai/job-description-input";
import { ExportDialog } from "@/components/export/export-dialog";
import { SettingsSidebar } from "@/components/layout/settings-sidebar";
import { useResumeStore } from "@/stores/resume-store";
import { generateTexSource } from "@/lib/export/generate-tex";
import type { Resume } from "@/types/resume";

function estimatePageCount(resume: Resume): number {
  let height = 0;

  if (resume.headerData?.name) height += 24;
  const contactCount = [
    resume.headerData?.email,
    resume.headerData?.phone,
    resume.headerData?.location,
    resume.headerData?.linkedin,
    resume.headerData?.github,
    resume.headerData?.website,
  ].filter(Boolean).length;
  if (contactCount > 0) height += 13;
  height += 8;

  for (const section of resume.sections) {
    height += 27;

    if (section.type === "summary") {
      const totalChars = section.items
        .flatMap((item) => item.bullets.map((b) => b.text))
        .join(" ").length;
      const lines = Math.ceil(totalChars / 85);
      height += lines * 11.2;
    } else if (section.type === "skills") {
      height += section.items.length * 13;
    } else {
      for (const item of section.items) {
        height += 14;
        if (item.subtitle || item.location) height += 12;
        height += 4;
        for (const bullet of item.bullets) {
          const lines = Math.max(1, Math.ceil(bullet.text.length / 85));
          height += lines * 11.2 + 2;
        }
      }
    }
  }

  const usableHeight = 794;
  return Math.max(1, Math.ceil(height / usableHeight));
}

export function AppHeader() {
  const router = useRouter();
  const [, setJdOpen] = useQueryState("jd");
  const [, setSettingsOpen] = useQueryState("settings");
  const [exportOpen, setExportOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const reset = useResumeStore((s) => s.reset);
  const tailoredResume = useResumeStore((s) => s.tailoredResume);

  const estimatedPages = useMemo(() => {
    if (!tailoredResume || tailoredResume.sections.length === 0) return 0;
    return estimatePageCount(tailoredResume);
  }, [tailoredResume]);

  const handleGoHome = () => {
    reset();
    setConfirmOpen(false);
    router.push("/");
  };

  const handleCopyLatex = async () => {
    if (!tailoredResume) return;
    const tex = generateTexSource(tailoredResume);
    await navigator.clipboard.writeText(tex);
    setCopied(true);
    toast.success("LaTeX copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmOpen(true)}
            >
              <ArrowLeftIcon size={16} weight="bold" className="mr-1.5" />
              New Resume
            </Button>
            <div className="h-5 w-px bg-border" />
            <FilePdfIcon size={20} weight="bold" className="text-primary" />
            <h1 className="text-sm font-semibold tracking-tight">
              DraftCV
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSettingsOpen("open")}
              className="transition-colors"
            >
              <GearIcon size={16} weight="bold" className="mr-1.5" />
              Settings
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setJdOpen("open")}
              className="transition-colors"
            >
              <ClipboardTextIcon size={16} weight="bold" className="mr-1.5" />
              Paste JD
            </Button>
            <div className="ml-1 flex items-center gap-1.5 border-l pl-3">
              {estimatedPages > 0 && (
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                    estimatedPages > 1
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <FileIcon size={12} weight="bold" />
                  ~{estimatedPages} {estimatedPages === 1 ? "page" : "pages"}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyLatex}
                className="transition-all active:scale-95"
              >
                {copied ? (
                  <CheckIcon
                    size={16}
                    weight="bold"
                    className="mr-1.5 text-emerald-600"
                  />
                ) : (
                  <CopyIcon size={16} weight="bold" className="mr-1.5" />
                )}
                {copied ? "Copied!" : "Copy LaTeX"}
              </Button>
              <Button
                size="sm"
                onClick={() => setExportOpen(true)}
                className="transition-all active:scale-95"
              >
                <FileArrowDownIcon
                  size={16}
                  weight="bold"
                  className="mr-1.5"
                />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>
      <JobDescriptionInput />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <SettingsSidebar />
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start over?</DialogTitle>
            <DialogDescription>
              This will clear your current resume and all tailoring progress.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button size="sm" variant="destructive" onClick={handleGoHome}>
              Start Over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
