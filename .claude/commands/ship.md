---
description: Full git workflow - stage, commit, push, and create PR with safety guards
allowed-tools: Bash(git:*), Bash(gh:*), Read, Grep, AskUserQuestion
---

# /ship - Full Git Workflow

Safely stage, commit, push, and create a PR with step-by-step confirmation.

## Step 0: Safety Check

**CRITICAL: Check if on a protected branch. If yes, STOP immediately.**

```bash
git branch --show-current
```

Protected branches (NEVER push to these):
- `main`
- `master`
- `production`

If on a protected branch, output:
```
⛔ BLOCKED: You are on '${branch}' which is a protected branch.

Please create a new branch first:
  git checkout -b your-feature-branch

Then run /ship again.
```
**STOP HERE if on protected branch. Do not proceed.**

---

## Step 1: Show Status

Get current state:
```bash
git branch --show-current
git status --porcelain
git log main..HEAD --oneline 2>/dev/null || git log origin/main..HEAD --oneline
git diff --stat main 2>/dev/null || git diff --stat origin/main
```

Output format:
```
🚀 /ship - Full Git Workflow

⛔ SAFETY CHECK
✅ Branch: [branch-name] (not protected)

📊 STATUS
• Uncommitted changes: [X files modified / no uncommitted changes]
• Commits ahead of main: [N commits / no new commits]
• Files changed: [summary from git diff --stat]
```

---

## Step 2: Stage Changes (if uncommitted changes exist)

If there are uncommitted changes, ask user to confirm staging:

```
─────────────────────────────────

📁 STEP 1: Stage Changes

Command:
  git add -A

Summary: Stages all modified/new/deleted files for commit
```

Use AskUserQuestion to confirm, then run:
```bash
git add -A
```

If no uncommitted changes, skip to Step 4 (Push).

---

## Step 3: Commit (if changes were staged)

Generate a commit message based on the staged changes using conventional commits format (feat:, fix:, chore:, docs:, refactor:, etc.)

```
─────────────────────────────────

💾 STEP 2: Commit Changes

Command:
  git commit -m "[generated-message]"

Summary: Creates a commit with the above message
```

Use AskUserQuestion to:
1. Show the generated commit message
2. Ask if user wants to edit it
3. Confirm before committing

Then run:
```bash
git commit -m "[final-message]"
```

---

## Step 4: Pull Latest from Main (Rebase)

```
─────────────────────────────────

🔄 STEP 3: Pull Latest from Main

Command:
  git fetch origin main
  git rebase origin/main

Summary: Rebases your commits on top of the latest main branch
         (Ensures your branch is up-to-date before pushing)
```

Use AskUserQuestion to confirm, then run:
```bash
git fetch origin main && git rebase origin/main
```

**If rebase conflicts occur:**
```
⚠️ REBASE CONFLICT

There are merge conflicts that need to be resolved manually.

Files with conflicts:
[list conflicting files]

To resolve:
1. Fix conflicts in the listed files
2. Run: git add <resolved-files>
3. Run: git rebase --continue
4. Then run /ship again

To abort the rebase:
  git rebase --abort
```
**STOP HERE if conflicts. Do not proceed.**

---

## Step 5: Push to Remote

```
─────────────────────────────────

📤 STEP 4: Push to Remote

Command:
  git push -u origin [branch-name]

Summary: Pushes your branch to GitHub as a new/updated remote branch
         (Creates upstream tracking for future pushes)

Note: If branch was already pushed, may need --force-with-lease after rebase
```

Use AskUserQuestion to confirm, then run:
```bash
git push -u origin $(git branch --show-current)
```

If push is rejected (branch diverged after rebase), ask user to confirm force push:
```bash
git push --force-with-lease origin $(git branch --show-current)
```

---

## Step 6: Create Pull Request

First, gather info for the PR:

1. **Generate Summary** from commits:
```bash
git log main..HEAD --pretty=format:"- %s" 2>/dev/null || git log origin/main..HEAD --pretty=format:"- %s"
```

2. **Ask user to verify/edit the summary**

Then show the PR creation:
```
─────────────────────────────────

📝 STEP 5: Create Pull Request

Title: [generated from branch name or first commit]

Body:
## Summary
[verified summary]

Command:
  gh pr create --base main --title "..." --body "..."

Summary: Creates a PR targeting the main branch
```

Use AskUserQuestion to confirm, then create PR:
```bash
gh pr create --base main --title "[title]" --body "$(cat <<'EOF'
## Summary
[summary]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Final Output

After successful PR creation:
```
─────────────────────────────────

✅ Done!

PR created: [PR URL from gh output]

Next steps:
• Request reviewers on GitHub
• Monitor CI checks
• Address any review feedback
```

---

## Error Handling

If any step fails:
1. Show the error message clearly
2. Suggest how to fix it
3. Do NOT proceed to the next step

Common errors:
- **Push rejected**: Branch may need to be rebased on main
  - Solution: Run `git fetch origin main && git rebase origin/main`, resolve any conflicts, then push with `--force-with-lease`
- **gh not authenticated**: Run `gh auth login`
- **No commits**: Nothing to push, need to make changes first
- **PR already exists**: A PR for this branch already exists
  - Solution: The existing PR URL will be shown. Push updates to the same branch to update the PR
- **Remote branch doesn't exist**: First time pushing this branch
  - Solution: Use `git push -u origin <branch-name>` to create the remote branch

---

## Edge Cases

### Nothing to Ship
If there are no uncommitted changes AND no unpushed commits:
```
ℹ️ Nothing to ship!

Your branch '[branch-name]' is up to date with remote.
No uncommitted changes detected.

Make some changes first, then run /ship again.
```
**STOP HERE. Do not proceed.**

### PR Already Exists
Before creating a new PR, check if one already exists:
```bash
gh pr list --head $(git branch --show-current) --json url --jq '.[0].url'
```

If a PR exists:
```
ℹ️ PR already exists for this branch!

Existing PR: [PR URL]

Your pushed changes have been added to this PR.
```
**STOP HERE after pushing. Do not create a new PR.**

### User Cancels at Any Step
If user selects "Cancel" or "No" at any confirmation:
```
🛑 Shipping cancelled.

Your changes are still safe locally.
Run /ship again when you're ready.
```
**STOP HERE. Do not proceed to next steps.**

---

## Quick Reference

| Step | Command | Purpose |
|------|---------|---------|
| Safety | `git branch --show-current` | Check not on protected branch |
| Status | `git status --porcelain` | Show uncommitted changes |
| Stage | `git add -A` | Stage all changes |
| Commit | `git commit -m "..."` | Create commit |
| Rebase | `git fetch && git rebase origin/main` | Update with latest main |
| Push | `git push -u origin <branch>` | Push to remote |
| PR | `gh pr create --base main` | Create pull request |
