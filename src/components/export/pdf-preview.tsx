"use client";

import { BlobProvider } from "@react-pdf/renderer";
import {
  DownloadSimpleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ResumePdfDocument } from "@/components/export/resume-pdf-document";
import type { Resume } from "@/types/resume";

interface PdfPreviewProps {
  resume: Resume;
}

export function PdfPreview({ resume }: PdfPreviewProps) {
  return (
    <BlobProvider document={<ResumePdfDocument resume={resume} />}>
      {({ url, loading, error }) => {
        if (loading) {
          return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SpinnerIcon size={16} className="animate-spin" />
              Generating PDF...
            </div>
          );
        }

        if (error) {
          return (
            <p className="text-sm text-destructive">
              Failed to generate PDF: {error.message}
            </p>
          );
        }

        if (!url) return null;

        return (
          <div className="flex w-full flex-col items-center gap-4">
            <iframe
              src={url}
              className="h-[400px] w-full rounded-md border"
              title="Resume PDF Preview"
            />
            <Button
              size="sm"
              nativeButton={false}
              className="transition-all active:scale-95"
              render={
                <a href={url} download={`${resume.name}-tailored.pdf`} />
              }
            >
              <DownloadSimpleIcon
                size={16}
                weight="bold"
                className="mr-1.5"
              />
              Download PDF
            </Button>
          </div>
        );
      }}
    </BlobProvider>
  );
}
