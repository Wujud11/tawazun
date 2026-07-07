# Prompt Engine Specification

## Overview

Every mission (M01–M30) has exactly one corresponding prompt file (P01–P30), located in `Prompts/`.

## Rules

- Prompt files must never contain project planning, roadmap notes, or design decisions.
- Prompt files contain execution instructions only — what the AI must do, not why.
- One prompt per mission. No exceptions.
- Prompts are written before the mission is executed, not during.

## Required Template

Every prompt file must follow this exact structure, in this exact order:

---

**1. Mission ID**
State the mission identifier (e.g. M03) and its title.

**2. Goal**
One or two sentences describing the single outcome this mission must achieve.

**3. Read Files**
List every file the AI must read before making any changes.

**4. Constraints**
List everything the AI must not do during this mission.
Be explicit: no unrelated edits, no package installs, no content changes, no renames, etc.

**5. Tasks**
Numbered list of the exact steps the AI must execute, in order.

**6. Validation**
List the checks that confirm the mission was completed correctly.
These map directly to the test file (TXX.md) for this mission.

**7. Expected Output**
Describe the exact state of the project after a successful mission:
which files were created, modified, or deleted.

**8. Stop**
The AI must stop here.
Do not continue to the next mission.
Do not suggest next steps.
Wait for the user to reply with: Done, Retry, or Rollback.

---

## Enforcement

The AI must never continue automatically after completing a mission.
It must always stop after the final step and wait for the user's explicit command.
Chaining missions together without a user confirmation between them is not permitted.
