"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResumeStore } from "@/stores/resume-store";
import type { BulletId } from "@/types/resume";

interface RelevanceBadgeProps {
  bulletId: BulletId;
}

export function RelevanceBadge({ bulletId }: RelevanceBadgeProps) {
  const relevanceScores = useResumeStore((s) => s.relevanceScores);
  const jobDescription = useResumeStore((s) => s.jobDescription);

  if (!jobDescription || relevanceScores.length === 0) return null;

  const scoreData = relevanceScores.find((s) => s.bulletId === bulletId);
  if (!scoreData) return null;

  const { score, reason } = scoreData;

  const colorClass =
    score >= 70
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : score >= 40
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            "inline-flex shrink-0 cursor-default items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
            colorClass,
          )}
        >
          {score}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
