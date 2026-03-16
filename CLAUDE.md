# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A drag-and-drop resume editor that allows users to visually build, customize, and export professional resumes.

## Commands

```bash
yarn dev              # Development server (localhost:3000)
yarn build            # Production build
yarn fix              # ESLint + Prettier auto-fix
```

## Tech Stack

- **Frontend**: Next.js 15 App Router, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Drag & Drop**: dnd-kit for drag-and-drop interactions
- **State**: Zustand (client state), nuqs (URL state)
- **Export**: react-pdf or html2canvas for PDF generation

## UI Conventions

- Buttons: icon with `size-4 mr-1.5` and `weight="bold"`
- Buttons placed next to each other must use the same size — never mix `size="sm"` with default size in the same row
- Page containers: `max-w-7xl mx-auto` with `p-4 md:p-6`
- Use theme CSS variables (`bg-background`, `bg-card`, etc.), not hardcoded colors
- All enums and categorical data should use badges with the hue-based color system — call `getBadgeColors(hue)` and apply to `style` prop, never hardcode Tailwind color classes
- Use `EmptyState` component for empty states
- Virtualize long lists with `@tanstack/react-virtual`
- EXCLUSIVELY use Phosphor icons (`@phosphor-icons/react`), NEVER Lucide
- Always suffix Phosphor icon imports with 'Icon' (e.g., `UserIcon`, `GearIcon`)
- Import icons from `@phosphor-icons/react/ssr` when needed for SSR
- NEVER add Cancel buttons to forms
- Use `tailwind-merge` and `clsx` for conditional classes
- Use `class-variance-authority` (cva) for component variants

## Design Standards

- Use shadcn/ui as the component library — customize via `/src/components/ui/*.tsx`
- State persistence: use nuqs for dialogs, filters, and shareable state
- Dialog close animations: cache fetched data in `useState` to prevent content flash during close

## IMPORTANT - Things Claude Gets Wrong

- **Badges in selects**: NEVER remove badge components when replacing a `<Select>` with a searchable combobox. Build custom comboboxes (Popover + Command) that render the badge in both the trigger and dropdown items
- **Dialog close animations**: Cache fetched data in `useState` to prevent content flash during close
- **Button sizing**: Buttons placed next to each other MUST use the same size — never mix sizes in the same row

## Key Patterns

### Form Pattern
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
```

### Sheet/Dialog with nuqs
```typescript
import { useQueryState } from "nuqs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const [selectedId, setSelectedId] = useQueryState("selectedId");

<Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
  <SheetContent className="w-full sm:max-w-xl">
    {/* Content */}
  </SheetContent>
</Sheet>
```

### Responsive Layout
```typescript
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {/* Content */}
  </div>
</div>
```

## Data Display & Advanced UI

- `@tanstack/react-table` for complex data tables with sorting, filtering, pagination
- `@tanstack/react-virtual` for virtualizing large lists
- `recharts` for charts and data visualization
- `react-day-picker` for date selection (integrated with shadcn Calendar)
- `framer-motion` for animations and transitions
- `cmdk` for command palette / search interfaces (integrated with shadcn Command)
- `react-resizable-panels` for resizable layout sections

## Code Quality

- Lint only the files you changed: `npx eslint --fix src/path/to/file.tsx`
- Only run `yarn fix` (full codebase lint) before creating a pull request
- Use `@/` import aliases, never relative imports for cross-directory imports
- Import order: external packages → `@/` aliases → relative imports
- All files must end with a newline character
- Avoid `any` type — use proper TypeScript types
- Server vs Client components: use `"use client"` only when needed (hooks, event handlers, browser APIs)
- Use toast notifications (sonner) for user feedback, never `alert()`
