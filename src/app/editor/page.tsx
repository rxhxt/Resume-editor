"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { AppHeader } from "@/components/layout/app-header";
import { MasterPanel } from "@/components/editor/master-panel";
import { TailoredPanel } from "@/components/editor/tailored-panel";
import { DragOverlayContent } from "@/components/editor/drag-overlay-content";
import { useDragHandlers } from "@/hooks/use-drag-handlers";
import { useResumeStore } from "@/stores/resume-store";

export default function EditorPage() {
  const router = useRouter();
  const masterResume = useResumeStore((s) => s.masterResume);
  const { activeDragData, onDragStart, onDragEnd } = useDragHandlers();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (hydrated && !masterResume) {
      router.push("/");
    }
  }, [hydrated, masterResume, router]);

  // Use pointerWithin first (best for cross-container), fall back to rectIntersection
  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return rectIntersection(args);
  };

  if (!hydrated || !masterResume) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-screen flex-col bg-accent/20"
    >
      <AppHeader />
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel defaultSize={50} minSize={30}>
            <MasterPanel />
          </ResizablePanel>
          <ResizableHandle withHandle className="hover:bg-accent transition-colors" />
          <ResizablePanel defaultSize={50} minSize={30}>
            <TailoredPanel />
          </ResizablePanel>
        </ResizablePanelGroup>

        <DragOverlay>
          {activeDragData ? (
            <DragOverlayContent data={activeDragData} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
