"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadSimpleIcon, FileIcon, SpinnerIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/stores/resume-store";
import { useSettingsStore } from "@/stores/settings-store";

export function UploadZone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const { uploadStatus, uploadError, setUploadStatus, setMasterResume } =
    useResumeStore();
  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const apiKeys = useSettingsStore((s) => s.apiKeys);

  const handleFile = useCallback(
    async (file: File) => {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/x-tex",
      ];
      const isTexFile = file.name.endsWith(".tex");
      if (!validTypes.includes(file.type) && !isTexFile) {
        setUploadStatus("error", "Please upload a PDF, DOCX, or TeX file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus("error", "File too large. Maximum size is 10MB.");
        return;
      }

      setUploadStatus("uploading");

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (aiProvider !== "internal") {
          formData.append("provider", aiProvider);
          formData.append("apiKey", apiKeys[aiProvider]);
        }

        const response = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = (await response.json()) as { error?: string };
          throw new Error(error.error ?? "Failed to parse resume");
        }

        setUploadStatus("parsing");
        const resume = (await response.json()) as Parameters<
          typeof setMasterResume
        >[0];
        setMasterResume(resume);
        setUploadStatus("done");
      } catch (err) {
        setUploadStatus(
          "error",
          err instanceof Error ? err.message : "Upload failed",
        );
      }
    },
    [setUploadStatus, setMasterResume, aiProvider, apiKeys],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const isLoading = uploadStatus === "uploading" || uploadStatus === "parsing";

  return (
    <label
      htmlFor="resume-file-input"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-16 transition-all duration-200 md:py-20",
        isDragOver
          ? "scale-[1.01] border-primary/60 bg-primary/5 shadow-lg shadow-primary/5 ring-2 ring-primary/20"
          : "border-muted-foreground/25 bg-muted/30 hover:border-muted-foreground/50 hover:bg-muted/50",
        isLoading && "pointer-events-none opacity-60",
      )}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <SpinnerIcon
              size={48}
              className="animate-spin text-muted-foreground"
            />
            <p className="font-serif text-sm text-muted-foreground">
              {uploadStatus === "uploading"
                ? "Uploading resume..."
                : "Parsing resume with AI..."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              className="rounded-2xl bg-accent p-5"
              animate={
                isDragOver
                  ? { scale: 1.1, rotate: -3 }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {isDragOver ? (
                <FileIcon size={32} weight="bold" className="text-primary" />
              ) : (
                <UploadSimpleIcon
                  size={32}
                  weight="bold"
                  className="text-muted-foreground"
                />
              )}
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-medium">
                Click or drop your master resume
              </p>
              <p className="text-sm text-muted-foreground">PDF, DOCX, or TeX</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        id="resume-file-input"
        type="file"
        accept=".pdf,.docx,.tex,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/x-tex"
        onChange={handleFileInput}
        className="hidden"
      />
      {uploadStatus === "error" && uploadError && (
        <p className="text-sm text-destructive">{uploadError}</p>
      )}
    </label>
  );
}
