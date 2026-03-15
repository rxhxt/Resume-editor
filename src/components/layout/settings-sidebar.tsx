"use client";

import { useQueryState } from "nuqs";
import { KeyIcon } from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useSettingsStore,
  type AiProvider,
} from "@/stores/settings-store";

const providers: Array<{ value: AiProvider; label: string; description: string }> = [
  { value: "internal", label: "Internal", description: "Uses the server's built-in API key" },
  { value: "openai", label: "OpenAI", description: "GPT-4o" },
  { value: "anthropic", label: "Anthropic", description: "Claude Sonnet" },
  { value: "google", label: "Google", description: "Gemini 2.5 Flash" },
];

export function SettingsSidebar() {
  const [settingsOpen, setSettingsOpen] = useQueryState("settings");
  const aiProvider = useSettingsStore((s) => s.aiProvider);
  const apiKeys = useSettingsStore((s) => s.apiKeys);
  const setAiProvider = useSettingsStore((s) => s.setAiProvider);
  const setApiKey = useSettingsStore((s) => s.setApiKey);

  const isOpen = settingsOpen === "open";

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) void setSettingsOpen(null);
      }}
    >
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure your AI provider and API keys.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 px-4 pb-4 pt-2">
          <div className="flex flex-col gap-3">
            <Label>AI Provider</Label>
            <div className="flex flex-col gap-2">
              {providers.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setAiProvider(p.value)}
                  className={`flex flex-col items-start rounded-lg border p-3 text-left transition-colors ${
                    aiProvider === p.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="text-sm font-medium">{p.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {aiProvider !== "internal" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="api-key">
                {providers.find((p) => p.value === aiProvider)?.label} API Key
              </Label>
              <div className="relative">
                <KeyIcon
                  size={16}
                  weight="bold"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeys[aiProvider]}
                  onChange={(e) => setApiKey(aiProvider, e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally in your browser and sent directly
                to the provider. It is never stored on our servers.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
