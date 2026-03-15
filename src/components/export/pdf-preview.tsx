"use client";

import { useMemo } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import {
  DownloadSimpleIcon,
  SpinnerIcon,
  FileCodeIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ResumePdfDocument } from "@/components/export/resume-pdf-document";
import type { Resume } from "@/types/resume";

interface PdfPreviewProps {
  resume: Resume;
  texSource?: string;
}

export function PdfPreview({ resume, texSource }: PdfPreviewProps) {
  const texBlobUrl = useMemo(() => {
    if (!texSource) return null;
    const blob = new Blob([texSource], { type: "text/x-tex" });
    return URL.createObjectURL(blob);
  }, [texSource]);

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
            <div className="flex gap-2">
              <Button
                size="sm"
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
              {texBlobUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  render={
                    <a
                      href={texBlobUrl}
                      download={`${resume.name}.tex`}
                    />
                  }
                >
                  <FileCodeIcon
                    size={16}
                    weight="bold"
                    className="mr-1.5"
                  />
                  Download TeX
                </Button>
              )}
            </div>
          </div>
        );
      }}
    </BlobProvider>
  );
}
