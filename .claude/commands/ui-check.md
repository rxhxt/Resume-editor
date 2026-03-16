---
description: Check UI patterns for icons, colors, responsiveness, and shadcn usage
allowed-tools: Bash(grep:*), Bash(git diff:*), Grep, Read
---

# UI Pattern Checker

Run comprehensive UI pattern checks on changed files. Report findings by severity.

## Steps

1. **Get changed files** (TypeScript/TSX only):
   ```bash
   git diff --name-only main...HEAD -- '*.tsx' '*.ts' 2>/dev/null || git diff --name-only HEAD~5 -- '*.tsx' '*.ts'
   ```

2. **Run these checks on changed files:**

### Critical Checks (Must Fix)

**Lucide Icons** - Should use Phosphor icons only:
```bash
grep -rn 'from "lucide-react"' --include="*.tsx" --include="*.ts" src/
```
- Fix: Replace with `import { XxxIcon } from "@phosphor-icons/react"`

**Missing Icon Suffix** - Phosphor imports must end with `Icon`:
```bash
grep -rn '@phosphor-icons/react' --include="*.tsx" src/ | grep -v 'Icon' | grep -v 'import type'
```

### Warning Checks (Should Fix)

**Hardcoded Colors** - Breaks dark mode:
```bash
grep -rn -E '(bg-white|bg-black|text-white|text-black|bg-gray-[0-9])' --include="*.tsx" src/
```
- Fix: Use `bg-background`, `bg-card`, `text-foreground`, etc.

**Non-Responsive Grids** - Fixed columns without breakpoints:
```bash
grep -rn 'grid-cols-[2-9]' --include="*.tsx" src/ | grep -v -E '(sm:|md:|lg:|xl:)'
```
- Fix: Add responsive prefixes like `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

**Raw HTML Buttons** - Should use shadcn Button:
```bash
grep -rn '<button' --include="*.tsx" src/ | grep -v 'components/ui'
```
- Fix: Use `<Button>` from `@/components/ui/button`

**useState for Dialogs** - Should use nuqs for URL persistence:
```bash
grep -rn 'useState.*[Dd]ialog\|useState.*[Ss]heet\|useState.*[Mm]odal' --include="*.tsx" src/
```
- Fix: Use `useQueryState` from `nuqs` for dialog open state

## Output Format

Report findings like this:

```
🔍 UI Pattern Check Results

❌ CRITICAL (must fix before PR)
   src/components/header.tsx:5
   → Lucide icon: import { User } from "lucide-react"
   → Fix: import { UserIcon } from "@phosphor-icons/react"

⚠️ WARNINGS (should fix)
   src/app/page.tsx:42
   → Hardcoded color: bg-white
   → Fix: Use bg-background or bg-card

✅ PASSED
   • No Lucide icons in new code
   • All Phosphor icons have Icon suffix

📊 Summary: X critical, Y warnings
```

If no issues found, report:
```
✅ UI Check Passed - No issues found
```
