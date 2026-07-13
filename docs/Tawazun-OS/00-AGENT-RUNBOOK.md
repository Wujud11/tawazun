# Agent Runbook

## How to Start a Mission

When the user sends a mission ID (e.g. `M01`), locate and read these four files before doing anything else:

```
docs/Tawazun-OS/Missions/M01.md
docs/Tawazun-OS/Prompts/P01.txt
docs/Tawazun-OS/Tests/T01.md
docs/Tawazun-OS/Rollbacks/R01.md
```

Do not begin editing until all four files have been read.

---

## Execution Rules

- Execute only the mission that was requested. Do not plan, preview, or begin the next mission.
- Modify only the files explicitly listed in the mission's **Files that may be modified** section.
- If a file is not listed there, do not touch it.
- Follow the prompt file's **Implementation Tasks** in exact order.

---

## After Completing the Mission

Report the following before stopping:

1. **Files changed** — list every file created, modified, or deleted
2. **Commands run** — list every terminal command executed
3. **Test result** — run each step in the linked test file and report Pass / Fail / Partial
4. **Blockers or risks** — flag anything incomplete, ambiguous, or potentially harmful

Then stop. Do not continue to the next mission automatically.
Wait for the user to reply with: **Done**, **Retry**, or **Rollback**.

---

## Response Handling

| User says | Action |
|-----------|--------|
| **Done** | Confirm and wait for the next mission ID |
| **Retry** | Fix only the current mission — do not advance |
| **Rollback** | Read the linked rollback file and follow it exactly — do not improvise |

---

## Clarification Rule

If the mission file is incomplete, contradictory, or ambiguous, ask exactly one concise clarification question before making any edits. Do not guess. Do not proceed on assumptions.

---

## Hard Limits

These actions are never permitted without explicit written approval from the user:

- Destructive Git commands (`reset --hard`, `push --force`, branch deletion)
- Deploying to any environment
- Generating or inserting API keys, credentials, tokens, or secrets
- Inventing banking data, company data, or production integrations
- Modifying files outside the mission's allowed file list
- Chaining missions together without a user confirmation between them

---

## File Lookup Reference

For mission `MXX`, the linked files are always:

| File | Path |
|------|------|
| Mission | `docs/Tawazun-OS/Missions/MXX.md` |
| Prompt | `docs/Tawazun-OS/Prompts/PXX.txt` |
| Test | `docs/Tawazun-OS/Tests/TXX.md` |
| Rollback | `docs/Tawazun-OS/Rollbacks/RXX.md` |
