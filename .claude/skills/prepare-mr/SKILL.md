---
name: prepare-mr
description: Generate a short commit message and a PR description from the current git diff. Read-only; does not commit or push.
disable-model-invocation: true
argument-hint: "[branch|staged|<base-ref>]"
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git merge-base:*), Bash(git rev-parse:*), Bash(git branch:*), Bash(git ls-files:*)
---

# Prepare MR

Produce a commit message and a PR description that describe the actual changes in the diff.

## Scope (`$ARGUMENTS`)

- No arguments: working tree vs `HEAD` — staged + unstaged changes, plus untracked files (`git status --porcelain`, `git diff HEAD`, read new untracked files).
- `staged`: only `git diff --cached`.
- `branch`: all commits on the current branch vs its base: `git diff $(git merge-base HEAD main)...HEAD` (fall back to `origin/main`, then `dev`, if `main` is missing). Also check `git log --oneline <base>..HEAD` for intent.
- Any other value: treat it as a base ref and diff `<base>...HEAD`.

If the diff is empty, say so and stop.

## Process

1. Run `git diff --stat` for the chosen scope first to see which areas changed (`apps/api`, `apps/mobile`, `packages/shared`, `docs`, config).
2. Read the full diff. For large diffs, read the most significant files fully and skim lockfiles, generated files and pure formatting changes.
3. Identify the main purpose of the change (feature, fix, refactor, chore). If the diff mixes unrelated changes, mention it in one line after the output and suggest splitting.
4. Describe only what the diff shows. Do not invent motivation, tickets or test results.

## Output format

Output exactly this, nothing before it:

```
commit message: "<message>"
pr-description: <description>
```

### commit message

- One line, up to ~60 characters, lowercase start, no trailing period.
- Imperative or short past-tense phrase in English, matching the repo style (e.g. `fixed incorrect refresh token comparison`, `add saved routes endpoint`).
- No prefixes like `feat:` unless the repo starts using them; no body, no attribution lines.

### pr-description

- English, 1–3 sentences, plain text.
- Sentence 1: what changed and where (API / mobile / shared).
- Optional sentences 2–3: notable behavior change, migration, new env var, or breaking contract change in `@hiking/shared`.
- Always mention it if the diff contains a Prisma migration, a change to `packages/shared/runtime.js`, or new required env vars.

## Rules

- Read-only: never run `git add`, `git commit`, `git push`, or create a PR. The developer does that themselves.
- After the output block, add at most one short line of warnings (mixed concerns, leftover `console.log`/debug code, secrets in the diff). Omit it if there is nothing to report.
