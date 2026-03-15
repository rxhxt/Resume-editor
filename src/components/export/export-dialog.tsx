"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { SpinnerIcon } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useResumeStore } from "@/stores/resume-store";

const PdfPreview = dynamic(
  () => import("@/components/export/pdf-preview").then((mod) => mod.PdfPreview),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SpinnerIcon size={16} className="animate-spin" />
        Loading PDF renderer...
      </div>
    ),
  },
);

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const tailoredResume = useResumeStore((s) => s.tailoredResume);
  const masterTexSource = useResumeStore((s) => s.masterResume?.texSource);
  // Cache resume data to prevent content flash on close
  const [cachedResume] = useState(tailoredResume);
  const resume = tailoredResume ?? cachedResume;

  if (!resume) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Export PDF</DialogTitle>
          <DialogDescription>
            Preview and download your tailored resume as a PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <PdfPreview resume={resume} texSource={masterTexSource} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
