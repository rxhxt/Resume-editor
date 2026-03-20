"use client";

import { useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import {
  MagnifyingGlassIcon,
  SpinnerIcon,
  LinkIcon,
  LightningIcon,
} from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useResumeStore } from "@/stores/resume-store";
import { useAI } from "@/hooks/use-ai";
import { generateId } from "@/lib/id";

export function JobDescriptionInput() {
  const [sheetOpen, setSheetOpen] = useQueryState("jd");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const masterResume = useResumeStore((s) => s.masterResume);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const setJobDescription = useResumeStore((s) => s.setJobDescription);
  const relevanceScores = useResumeStore((s) => s.relevanceScores);
  const { scoreRelevance, autoTailor, isScoring, isAutoTailoring } = useAI();

  const isOpen = sheetOpen === "open";
  const hasScores = relevanceScores.length > 0;

  // Pre-fill from persisted job description when sheet opens
  useEffect(() => {
    if (isOpen && jobDescription) {
      setText(jobDescription.description);
      setUrl(jobDescription.url ?? "");
    }
  }, [isOpen, jobDescription]);

  const handleAnalyze = async () => {
    if (!text.trim() || !masterResume) return;

    const jd = {
      id: generateId(),
      title: "Job Description",
      url: url.trim() || undefined,
      description: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setJobDescription(jd);

    // Collect all bullets from master resume
    const bullets: Array<{ id: string; text: string }> = [];
    for (const section of masterResume.sections) {
      for (const item of section.items) {
        for (const bullet of item.bullets) {
          bullets.push({ id: bullet.id, text: bullet.text });
        }
      }
    }

    if (bullets.length > 0) {
      await scoreRelevance(bullets, text.trim());
    }

    await setSheetOpen(null);
  };

  const handleAutoTailor = async () => {
    const result = await autoTailor();
    if (result) {
      await setSheetOpen(null);
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) void setSheetOpen(null);
      }}
    >
      <SheetContent className="flex w-full flex-col sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Paste Job Description</SheetTitle>
          <SheetDescription>
            Paste the target job description to score your resume bullets for
            relevance.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="job-url">Job Posting URL</Label>
            <div className="relative">
              <LinkIcon
                size={16}
                weight="bold"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="job-url"
                type="url"
                placeholder="https://example.com/jobs/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              placeholder="Paste the full job description here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-[300px] resize-none overflow-y-auto"
            />
          </div>

          {jobDescription && (
            <p className="text-xs text-muted-foreground">
              Previously analyzed job description loaded. Paste a new one to
              re-analyze.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={handleAnalyze}
              disabled={!text.trim() || isScoring || isAutoTailoring}
            >
              {isScoring ? (
                <SpinnerIcon
                  size={16}
                  weight="bold"
                  className="mr-1.5 animate-spin"
                />
              ) : (
                <MagnifyingGlassIcon
                  size={16}
                  weight="bold"
                  className="mr-1.5"
                />
              )}
              {isScoring ? "Analyzing..." : "Analyze Relevance"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleAutoTailor}
              disabled={!hasScores || isAutoTailoring || isScoring}
            >
              {isAutoTailoring ? (
                <SpinnerIcon
                  size={16}
                  weight="bold"
                  className="mr-1.5 animate-spin"
                />
              ) : (
                <LightningIcon
                  size={16}
                  weight="bold"
                  className="mr-1.5"
                />
              )}
              {isAutoTailoring ? "Tailoring..." : "Auto-Tailor Resume"}
            </Button>

            {!hasScores && jobDescription && (
              <p className="text-xs text-muted-foreground">
                Analyze relevance first to enable auto-tailoring.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
