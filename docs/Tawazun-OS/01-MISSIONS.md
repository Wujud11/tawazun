# Mission Execution Protocol

## Execution Order

Missions are executed sequentially from M01 to M30, following the roadmap in `09-ROADMAP.md`.
Never skip a mission unless explicitly instructed by the user.

## After Each Mission

After completing a mission, stop immediately and wait for the user to respond.
Do not proceed, plan ahead, or execute anything else until the user replies.

The user will reply with exactly one of the following:

- **Done** — the mission is accepted. Move on to the next mission.
- **Retry** — the mission failed or needs to be repeated. Re-execute the same mission.
- **Rollback** — something went wrong. Execute the rollback file for that mission, then stop and wait again.

Only after receiving **Done** is it permitted to advance to the next mission.

## Mission File Structure

Every mission (M01–M30) consists of four files:

| File | Location | Purpose |
|------|----------|---------|
| `Missions/MXX.md` | Mission definition | What to do, scope, and acceptance criteria |
| `Prompts/PXX.txt` | Prompt used | The exact prompt sent to the agent |
| `Tests/TXX.md` | Test checklist | How to verify the mission was completed correctly |
| `Rollbacks/RXX.md` | Rollback steps | How to undo the mission if something goes wrong |

## Rules

- Never execute another mission automatically.
- Never chain missions together without a user confirmation between them.
- Never assume **Done** — always wait for the explicit reply.
- Always use the rollback file when the user says **Rollback**, never improvise.
