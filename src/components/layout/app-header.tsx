"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import {
  FileArrowDownIcon,
  FilePdfIcon,
  ClipboardTextIcon,
  GearIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { JobDescriptionInput } from "@/components/ai/job-description-input";
import { ExportDialog } from "@/components/export/export-dialog";
import { SettingsSidebar } from "@/components/layout/settings-sidebar";

export function AppHeader() {
  const [, setJdOpen] = useQueryState("jd");
  const [, setSettingsOpen] = useQueryState("settings");
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <FilePdfIcon size={22} weight="bold" className="text-primary" />
            <div className="h-5 w-px bg-border" />
            <h1 className="text-base font-semibold">ResumeForge</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSettingsOpen("open")}
            >
              <GearIcon size={16} weight="bold" className="mr-1.5" />
              Settings
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setJdOpen("open")}
            >
              <ClipboardTextIcon size={16} weight="bold" className="mr-1.5" />
              Paste Job Description
            </Button>
            <div className="ml-1 border-l pl-3">
              <Button size="sm" onClick={() => setExportOpen(true)}>
                <FileArrowDownIcon
                  size={16}
                  weight="bold"
                  className="mr-1.5"
                />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>
      <JobDescriptionInput />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <SettingsSidebar />
    </>
  );
}
