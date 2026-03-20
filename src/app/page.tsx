"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  FilePdfIcon,
  UploadSimpleIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { UploadZone } from "@/components/upload/upload-zone";
import { useResumeStore } from "@/stores/resume-store";

const steps = [
  {
    icon: UploadSimpleIcon,
    label: "Upload",
    description: "PDF, DOCX, or TeX",
  },
  {
    icon: SlidersHorizontalIcon,
    label: "Tailor",
    description: "Drag & drop to customize",
  },
  {
    icon: FilePdfIcon,
    label: "Export",
    description: "Download polished PDF",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Home() {
  const router = useRouter();
  const { masterResume, uploadStatus, initTailoredResume } = useResumeStore();

  useEffect(() => {
    if (uploadStatus === "done" && masterResume) {
      initTailoredResume("Tailored Resume");
      router.push("/editor");
    }
  }, [uploadStatus, masterResume, initTailoredResume, router]);

  return (
    <main className="grain-overlay dot-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 md:px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-10"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-4"
        >
          <div className="rounded-2xl bg-primary p-3">
            <FilePdfIcon
              size={32}
              weight="bold"
              className="text-primary-foreground"
            />
          </div>
          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            DraftCV
          </h1>
          <div className="ornamental-rule w-48">
            <span className="text-xs text-muted-foreground/30">&#x25C6;</span>
          </div>
          <p className="max-w-xl text-center text-base font-light text-muted-foreground md:text-lg">
            Upload your comprehensive resume and build tailored versions with
            drag & drop
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full">
          <UploadZone />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid w-full grid-cols-3 gap-3"
        >
          {steps.map((step) => (
            <div
              key={step.label}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-5 text-center"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-accent">
                <step.icon
                  size={20}
                  weight="bold"
                  className="text-foreground"
                />
              </div>
              <span className="text-sm font-semibold">{step.label}</span>
              <span className="text-xs text-muted-foreground">
                {step.description}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
