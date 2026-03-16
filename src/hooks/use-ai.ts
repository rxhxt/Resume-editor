"use client";

import { useState, useCallback } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { useSettingsStore } from "@/stores/settings-store";
import { generateId } from "@/lib/id";
import type { RelevanceScore } from "@/types/resume";
import type { AutoTailorResponse } from "@/app/api/ai/auto-tailor/route";

function useAiConfig() {
  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const apiKeys = useSettingsStore((s) => s.apiKeys);
  const apiKey =
    aiProvider !== "internal" ? apiKeys[aiProvider] : undefined;
  return { provider: aiProvider, apiKey };
}

export function useAI() {
  const [isScoring, setIsScoring] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAutoTailoring, setIsAutoTailoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRelevanceScores = useResumeStore((s) => s.setRelevanceScores);
  const setSuggestions = useResumeStore((s) => s.setSuggestions);
  const suggestions = useResumeStore((s) => s.suggestions);
  const applyAutoTailor = useResumeStore((s) => s.applyAutoTailor);
  const { provider, apiKey } = useAiConfig();

  const scoreRelevance = useCallback(
    async (bullets: Array<{ id: string; text: string }>, jobDescription: string) => {
      setIsScoring(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/relevance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bullets, jobDescription, provider, apiKey }),
        });
        if (!res.ok) throw new Error("Failed to score relevance");
        const scores = (await res.json()) as RelevanceScore[];
        setRelevanceScores(scores);
        return scores;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setIsScoring(false);
      }
    },
    [setRelevanceScores, provider, apiKey],
  );

  const improveBullet = useCallback(
    async (bulletId: string, text: string, jobDescription?: string) => {
      setIsSuggesting(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bulletText: text,
            jobDescription,
            action: jobDescription ? "reword" : "improve",
            provider,
            apiKey,
          }),
        });
        if (!res.ok) throw new Error("Failed to get suggestion");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        let suggestedText = "";
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          suggestedText += decoder.decode(value, { stream: true });
        }

        if (suggestedText) {
          const suggestion = {
            id: generateId(),
            bulletId,
            originalText: text,
            suggestedText: suggestedText.trim(),
            reason: jobDescription ? "Reworded for job relevance" : "Improved for impact",
            applied: false,
          };
          setSuggestions([...suggestions, suggestion]);
          return suggestion;
        }
        return null;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setIsSuggesting(false);
      }
    },
    [suggestions, setSuggestions, provider, apiKey],
  );

  const autoTailor = useCallback(async () => {
    const masterResume = useResumeStore.getState().masterResume;
    const jobDescription = useResumeStore.getState().jobDescription;
    if (!masterResume || !jobDescription) return null;

    setIsAutoTailoring(true);
    setError(null);
    try {
      const sections = masterResume.sections.map((section) => ({
        id: section.id,
        type: section.type,
        title: section.title,
        items: section.items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          dateRange: item.dateRange,
          location: item.location,
          bullets: item.bullets.map((b) => ({ id: b.id, text: b.text })),
        })),
      }));

      const res = await fetch("/api/ai/auto-tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections,
          jobDescription: jobDescription.description,
          provider,
          apiKey,
        }),
      });

      if (!res.ok) throw new Error("Failed to auto-tailor resume");
      const data = (await res.json()) as AutoTailorResponse;
      applyAutoTailor(data.selections);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setIsAutoTailoring(false);
    }
  }, [applyAutoTailor, provider, apiKey]);

  return {
    scoreRelevance,
    improveBullet,
    autoTailor,
    isScoring,
    isSuggesting,
    isAutoTailoring,
    error,
  };
}
