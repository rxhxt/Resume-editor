import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AiProvider = "internal" | "openai" | "anthropic" | "google";

interface SettingsStore {
  aiProvider: AiProvider;
  apiKeys: {
    openai: string;
    anthropic: string;
    google: string;
  };
  setAiProvider: (provider: AiProvider) => void;
  setApiKey: (provider: Exclude<AiProvider, "internal">, key: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      aiProvider: "internal",
      apiKeys: {
        openai: "",
        anthropic: "",
        google: "",
      },

      setAiProvider: (aiProvider) => set({ aiProvider }),

      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),
    }),
    {
      name: "resume-settings",
    },
  ),
);
