"use client";

import { useState } from "react";
import {
  LightbulbIcon,
  CheckIcon,
  XIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useAI } from "@/hooks/use-ai";
import type { BulletId } from "@/types/resume";

interface SuggestionPopoverProps {
  bulletId: BulletId;
  bulletText: string;
}

export function SuggestionPopover({ bulletId, bulletText }: SuggestionPopoverProps) {
  const [open, setOpen] = useState(false);
  const suggestions = useResumeStore((s) => s.suggestions);
  const applySuggestion = useResumeStore((s) => s.applySuggestion);
  const setSuggestions = useResumeStore((s) => s.setSuggestions);
  const jobDescription = useResumeStore((s) => s.jobDescription);
  const { improveBullet, isSuggesting } = useAI();

  const existingSuggestion = suggestions.find(
    (s) => s.bulletId === bulletId && !s.applied,
  );

  const handleGenerate = async () => {
    await improveBullet(bulletId, bulletText, jobDescription?.description);
  };

  const handleAccept = (suggestionId: string) => {
    applySuggestion(suggestionId);
    setOpen(false);
  };

  const handleDismiss = (suggestionId: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== suggestionId));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="text-muted-foreground hover:text-amber-500"
        title="AI suggestion"
      >
        <LightbulbIcon size={14} weight={existingSuggestion ? "fill" : "regular"} />
      </PopoverTrigger>
      <PopoverContent className="w-80" side="left" align="start">
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">AI Suggestion</p>

          {existingSuggestion ? (
            <>
              <div className="rounded-md bg-muted/50 p-2 text-sm">
                {existingSuggestion.suggestedText}
              </div>
              <p className="text-xs text-muted-foreground">
                {existingSuggestion.reason}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(existingSuggestion.id)}
                >
                  <CheckIcon size={14} weight="bold" className="mr-1.5" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDismiss(existingSuggestion.id)}
                >
                  <XIcon size={14} weight="bold" className="mr-1.5" />
                  Dismiss
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {jobDescription
                  ? "AI will reword this bullet for the target job."
                  : "AI will improve this bullet for impact."}
              </p>
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isSuggesting}
              >
                {isSuggesting ? (
                  <SpinnerIcon size={14} weight="bold" className="mr-1.5 animate-spin" />
                ) : (
                  <LightbulbIcon size={14} weight="bold" className="mr-1.5" />
                )}
                {isSuggesting ? "Generating..." : "Generate Suggestion"}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
