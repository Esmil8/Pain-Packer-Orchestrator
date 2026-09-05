# Pain Packer Orchestrator — Implementation Plan v2 (Plugin-Native)

> **Status:** Draft for approval
> **Date:** 2026-09-04
> **Language:** This document, all code, identifiers, prompts, commit messages, and UI output are **English only** (per `AGENTS.md`).
>
> **Goal:** Rebuild the Pain Packer Orchestrator as a **native OpenCode plugin** with a **chat-rendered configuration UI**. No `npm`/`pnpm` scaffold, no `src/` + `scripts/` build pipeline, no external runtime besides OpenCode itself. Distribution = copy the `.opencode/` folder into any project.

---

## 1. Executive summary

Version 1 was implemented as a console application: a `pnpm` project with `src/`, `scripts/`, a build step (`dist/`), vitest, eslint, and a terminal banner UI. The user rejected this approach. All of that logic can be expressed with **OpenCode native primitives** and zero build step:

- **Plugin** (`.opencode/plugins/orchestrator.ts`) — runs inside OpenCode (Bun). Defines the config schema, exposes custom **tools** that agents call, persists state, hooks events for statistics, and keeps subagent `model:` frontmatter in sync with the user's selections.
- **Commands** (`.opencode/commands/*.md`) — `/orchestrator setup`, `/orchestrate`, `/orchestrator status`.
- **Agents** (`.opencode/agents/*.md`) — `orchestrator` (primary dispatcher) + subagents `planner`, `executor`, `reviewer`, `tester`, `deployer`, plus a `*-fallback` twin per model-bounded role.
- **Skill** (`.opencode/skills/orchestrator-workflow/SKILL.md`) — the standard operating procedure: plan → review → implement → review code → test → commit → docs.
- **State** (`.opencode/state/plugin-orchestrator.json`) — config + current task + milestone log + statistics. Allows resuming after a restart.

The interactive "UI" the user wants (selectors, checkboxes, numeric fields, buttons) is implemented with OpenCode's **native `question` tool**, which renders an interactive multi-part form in the chat panel. This is the only first-class interactive UI OpenCode offers, so all controls map onto it (see §3).

**What is removed:** `src/`, `scripts/`, `tests/`, `dist/`, `config/`, root `state/`, root `package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.js`, `.orchestrator-config.json`, pnpm files, and `node_modules`. The project becomes a thin envelope: `opencode.json`, `AGENTS.md`, `docs/`, `README.md`, and `.opencode/` (with its own minimal `.package.json` only if needed for types).

---

## 2. Architecture

```mermaid
flowchart TB
    U([User]) -->|"/orchestrator setup"| SUI
    U -->|"/orchestrate &lt;task&gt;"| O
    U -->|"/orchestrator status"| ST

    subgraph OPENCODE["OpenCode (project .opencode/)"]
        CMD["Commands<br/>orchestrator-setup.md · orchestrate.md · orchestrator-status.md"]
        O["ORCHESTRATOR (primary agent)<br/>.opencode/agents/orchestrator.md<br/>Dispatcher — runs the workflow, owns the question UI"]
        PL["Plugin orchestrator.ts<br/>schema · tools · hooks · stats · frontmatter sync"]

        subgraph AGENTS["Subagents (delegation via task tool)"]
            P["planner.md / planner-fallback.md<br/>= config.planning"]
            E["executor.md / executor-fallback.md<br/>= config.implementation"]
            R["reviewer.md / reviewer-fallback.md<br/>= config.review"]
            T["tester.md / tester-fallback.md<br/>= config.repetitive"]
            G["deployer.md / deployer-fallback.md<br/>= config.repetitive"]
        end

        SK["Skill<br/>orchestrator-workflow/SKILL.md"]
        ST["orchestrator-status.md"]
        SUI["orchestrator-setup.md"]
    end

    STATE[".opencode/state/plugin-orchestrator.json<br/>config · current task · milestones · stats"]

    SUI --> O
    ST --> O
    O -->|question tool (UI forms)| U
    O --> PL
    O --> SK
    O -->|task/planner| P
    O -->|task/executor| E
    O -->|task/reviewer| R
    O -->|task/tester| T
    O -->|git commit·push·PR| G
    PL -->|read/write| STATE
    O -->|extract/copy| PL
```

### 2.1 How the pieces cooperate

| Concern | Owner | Mechanism |
|---|---|---|
| Config schema + validation | Plugin | `tool.schema.*` (zod-backed, built into OpenCode) + explicit bounds in `execute` |
| Persistent state | Plugin | `fs` read/write of `.opencode/state/plugin-orchestrator.json` |
| Model selection UI | Orchestrator agent | `question` tool (single/multi-select + custom answers) |
| Plan approval UI | Orchestrator agent | `question` tool — "Approve / Modify / Cancel" |
| Delegation & fallbacks | Orchestrator agent | `task` tool → `planner`/`planner-fallback`, etc. |
| Stats (tokens/duration/success) | Plugin | `event` + `tool.execute.after` hooks; persisted in state |
| Progress display | Orchestrator agent | `todowrite` checklist + step messages (no console bar) |
| Where the subagents' models come from | Plugin `save` tool | rewrites `model:` in `.opencode/agents/*.md` frontmatter |
| Workflow rules | Skill | `SKILL.md` loaded via `skill` tool |

---

## 3. Native UI mapping (important)

OpenCode does **not** render arbitrary HTML forms in the chat. Its first-class interactive UI is the **`question` tool**:

- A single call renders a **multi-part form** (multiple `questions`), each with a **header**, the **question text**, and a list of **options**; the user can navigate between questions before submitting.
- Each question supports **single-select**, **multi-select** (checkboxes), and a **"type your own answer"** free-text input (used for numeric fields and arbitrary model IDs).
- The TUI has **no progress bar widget**; the native progress substitute is the **`todowrite` checklist**, which renders live in the UI. The plan treats "barra de progreso" as "best-effort": a phase checklist that updates in real time.

Mapping of requested controls:

| Requested control | Native implementation |
|---|---|
| Planning primary/fallback selector | `question` single-select, options = curated model list, one question each |
| Implementation primary/fallback selector | same |
| Review primary/fallback selector | same |
| Repetitive Tasks primary/fallback selector | same |
| Confirm plan before implementation | `question` multi-select (checkbox list of all 5 optional toggles) |
| Auto-fix issues | same multi-select |
| Run tests after implementation | same multi-select |
| Auto-commit | same multi-select |
| Show cost estimates | same multi-select |
| Max attempts per phase (number) | `question` free-text question with default shown |
| Timeout per phase (seconds, number) | `question` free-text question with default shown |
| Cost threshold for confirmation ($, number) | `question` free-text question with default shown |
| **Save Configuration** button | final `question` — options `Save Configuration` / `Cancel` |
| **Approve / Modify / Cancel** (plan) | `question` — options `Approve`, `Modify`, `Cancel`; "custom" answer = modification instructions |

Every control the user listed therefore has a native equivalent. No custom rendering, no HTML.

---

## 4. Target file structure

```
<project root>/
├── opencode.json                          # instructions + plugin registration
├── AGENTS.md                              # project conventions (unchanged)
├── README.md                              # usage guide (new)
├── docs/
│   └── plans/orchestrator-implementation-plan.md   # this document
└── .opencode/
    ├── package.json                       # dev-time helper only, no deps (optional)
    ├── .gitignore                         # keep state/ local? (see §7.8)
    ├── agents/
    │   ├── orchestrator.md                # primary dispatcher
    │   ├── planner.md                     # model: <planning primary>
    │   ├── planner-fallback.md            # model: <planning fallback>
    │   ├── executor.md                    # model: <implementation primary>
    │   ├── executor-fallback.md           # model: <implementation fallback>
    │   ├── reviewer.md                    # model: <review primary>
    │   ├── reviewer-fallback.md           # model: <review fallback>
    │   ├── tester.md                      # model: <repetitive primary>
    │   ├── tester-fallback.md             # model: <repetitive fallback>
    │   ├── deployer.md                    # model: <repetitive primary>
    │   └── deployer-fallback.md           # model: <repetitive fallback>
    ├── commands/
    │   ├── orchestrator-setup.md          # /orchestrator setup
    │   ├── orchestrate.md                 # /orchestrate $ARGUMENTS
    │   └── orchestrator-status.md         # /orchestrator status
    ├── plugins/
    │   └── orchestrator.ts                # THE plugin
    ├── skills/
    │   └── orchestrator-workflow/
    │       └── SKILL.md                   # standard operating procedure
    └── state/
        └── plugin-orchestrator.json       # persisted config + milestones + stats
```

Everything under `.opencode/` is self-contained. Installation = copy `.opencode/` (and the `README.md` instructions) into a target project; OpenCode auto-loads plugins, commands, agents, and skills from these directories on startup.

---

## 5. State shape (`.opencode/state/plugin-orchestrator.json`)

```jsonc
{
  "version": 2,
  "config": {
    "planning":    { "primary": "opencode/big-pickle",     "fallback": "openai/gpt-4o" },
    "implementation": { "primary": "anthropic/claude-sonnet-4", "fallback": "opencode/big-pickle" },
    "review":      { "primary": "opencode/big-pickle",     "fallback": "openai/gpt-4o" },
    "repetitive":  { "primary": "deepseek/deepseek-chat",  "fallback": "openai/gpt-4o-mini" },

    "confirmPlanBeforeImplementation": true,
    "autoFixIssues": true,
    "runTestsAfterImplementation": true,
    "autoCommit": true,
    "showCostEstimates": true,

    "maxAttemptsPerPhase": 3,
    "timeoutPerPhaseSeconds": 300,
    "costThresholdForConfirmationUsd": 2.5,

    "ui": { "language": "en" }
  },
  "currentTask": null | {
    "id": "abc123",
    "slug": "implement-appointments-module",
    "description": "Implement the appointments module",
    "phase": "PLAN | PLAN_REVIEW | IMPLEMENT | REVIEW | TEST | COMMIT | DOCS | DONE | FAILED",
    "planPath": "docs/plans/implement-appointments-module.md",
    "createdAt": "2026-09-04T19:00:00.000Z",
    "updatedAt": "2026-09-04T19:05:00.000Z"
  },
  "milestones": [
    {
      "taskId": "abc123",
      "phase": "IMPLEMENT",
      "agent": "executor",
      "status": "success | failure | fallback",
      "model": "anthropic/claude-sonnet-4",
      "startedAt": "…",
      "endedAt": "…",
      "durationMs": 42000,
      "notes": "…"
    }
  ],
  "stats": {
    "totalSessions": 3,
    "totalCostUsd": 0.42,
    "byModel": {
      "opencode/big-pickle": {
        "planning": 2, "implementation": 1, "review": 3, "repetitive": 0,
        "tokensIn": 18230, "tokensOut": 4120, "costUsd": 0.31, "successes": 5, "failures": 1
      }
    }
  }
}
```

Rules:
- Written atomically (`write tmp + rename`) by the plugin only.
- `currentTask` lets `/orchestrator status` and a restarted session resume the last task.
- `milestones` is an append-only log; every phase completion (success, failure, or fallback) appends one entry.
- `stats.byModel` is derived incrementally from `event`/`tool.execute.after` hooks (see §6.4).

---

## 6. The plugin (`.opencode/plugins/orchestrator.ts`)

### 6.1 Responsibilities

1. Define the config schema via `tool.schema.*` (zod-backed, bundled with OpenCode — no external dependency).
2. Expose tools the agents call:
   - `orchestrator_get_state` — return parsed state JSON (config + currentTask + stats).
   - `orchestrator_save_config` — validate + persist config to state, sync subagent frontmatter models, return new state.
   - `orchestrator_record_milestone` — append `{phase, agent, status, model, startedAt, endedAt}`; return updated state.
   - `orchestrator_start_task` — create `currentTask` for a slug/description.
3. Hooks:
   - `event` — track token usage, cost, success/failure, and duration per model (feeds `stats`).
   - `tool.execute.before` — mark orchestration milestone start time / detect rate-limit+token errors for retry signal.
   - `tool` — register the four tools above.
   - `experimental.session.compacting` — inject current task + phase + next steps so a compacted/restarted session can resume.
   - `chat.params` — no longer injects the `/orchestrate` marker; keeps config instructions pinned to `AGENTS.md`.
4. `client.app.log()` for structured logs instead of `console.log` (documented OpenCode practice).

### 6.2 No external dependencies

- Imports: `import { tool, type Plugin } from "@opencode-ai/plugin"` (bundled with OpenCode), plus `node:fs`/`node:path` (available in Bun).
- All arg schemas are built with `tool.schema.object({...})` so validation is native zod — no separate `zod` dependency and no manual validator.
- No `.opencode/package.json` dependencies needed. (Keep an empty `.opencode/package.json` only if a future feature needs external packages; document this.)

### 6.3 Tool argument schemas (zo-schemas)

```ts
const booleanOpts = [tool.schema.boolean(), tool.schema.boolean()]; // not literal — see full impl
// Simpler and explicit:
const saveArgs = tool.schema.object({
  planningPrimary:    tool.schema.string(),
  planningFallback:   tool.schema.string(),
  implementationPrimary: tool.schema.string(),
  implementationFallback: tool.schema.string(),
  reviewPrimary:      tool.schema.string(),
  reviewFallback:     tool.schema.string(),
  repetitivePrimary:  tool.schema.string(),
  repetitiveFallback: tool.schema.string(),
  confirmPlanBeforeImplementation: tool.schema.boolean(),
  autoFixIssues:       tool.schema.boolean(),
  runTestsAfterImplementation: tool.schema.boolean(),
  autoCommit:          tool.schema.boolean(),
  showCostEstimates:   tool.schema.boolean(),
  maxAttemptsPerPhase: tool.schema.number(),
  timeoutPerPhaseSeconds: tool.schema.number(),
  costThresholdForConfirmationUsd: tool.schema.number(),
});
```

`execute` additionally clamps: `maxAttemptsPerPhase ∈ [1,10]`, `timeoutPerPhaseSeconds ∈ [30,3600]`, `costThresholdUsd ≥ 0`.

### 6.4 Headless frontmatter sync (core of `orchestrator_save_config`)

After persisting `config`, rewrite the `model:` line of the agent files so OpenCode genuinely uses the selected models on the next delegation:

```ts
const ROLE_AGENTS: Record<"planning"|"implementation"|"review"|"repetitive", { primary: string[]; fallback: string[] }> = {
  planning:      { primary: ["planner"],          fallback: ["planner-fallback"] },
  implementation:{ primary: ["executor"],         fallback: ["executor-fallback"] },
  review:        { primary: ["reviewer"],         fallback: ["reviewer-fallback"] },
  repetitive:    { primary: ["tester","deployer"], fallback: ["tester-fallback","deployer-fallback"] },
};

for (const [role, files] of Object.entries(ROLE_AGENTS)) {
  for (const name of files.primary)   await setAgentModel(name, config[role].primary);
  for (const name of files.fallback)  await setAgentModel(name, config[role].fallback);
}
```

`setAgentModel(name, model)` reads `.opencode/agents/{name}.md`, regex-replaces `^model: .*$` → `model: {model}`, writes back. If the target agent file is missing, log a warning (the agents ship with the plugin, so this is a guard, not the happy path).

### 6.5 Statistics backfill

`event` hook detects usage payloads (same shape as v1: `event.{chat|tool}.{model,tokensIn,tokensOut}` with optional `durationMs`/`error`). For each recognized model, update `state.stats.byModel[model]`:
- `tokensIn/tokensOut` accumulate; cost is interpolated from a small bundled price table (see appendix) keyed by model prefix (`anthropic/`, `openai/`, `deepseek/`, `opencode/` + name): `costUsd ≈ (tokensIn×in$/1M) + (tokensOut×out$/1M)`.
- `successes/failures` increment per payload that carries `error`.
- `ui.showCostEstimate` uses `stats.totalCostUsd` printed by the orchestrator at the end of `/orchestrate`.

Because event payload fields aren't guaranteed across versions, the plugin wraps extraction in try/catch and never throws into the session (log via `client.app.log`).

### 6.6 Reference skeleton (spec — full source lives in the appendix)

```ts
import { tool, type Plugin } from "@opencode-ai/plugin";
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { resolve, dirname } from "node:path";

const STATE_PATH = () => resolve(process.cwd(), ".opencode", "state", "plugin-orchestrator.json");
const AGENTS_DIR = () => resolve(process.cwd(), ".opencode", "agents");

function readState(): any { /* read+parse or return defaultState({version:2, config:DEFAULT_CONFIG, currentTask:null, milestones:[], stats:{...}}) */ }
function writeState(state: any): void { /* atomic: tmp file + renameSync */ }
function setAgentModel(name: string, model: string): void { /* regex replace model: line */ }

export const OrchestratorPlugin: Plugin = async ({ client, directory }) => {
  return {
    tool: {
      orchestrator_get_state: tool({
        description: "Read the Pain Packer orchestrator state: config, current task, milestones, and model statistics.",
        args: tool.schema.object({}),
        async execute() { return JSON.stringify(readState().config && readState()); },
      }),
      orchestrator_save_config: tool({
        description: "Validate and persist orchestrator configuration, then sync subagent models.",
        args: saveArgs,
        async execute(args) {
          const state = readState();
          state.config = { ...args, ui: { language: "en" } };
          // clamp numeric bounds
          await syncAgentModels(state.config);
          writeState(state);
          return JSON.stringify(state.config);
        },
      }),
      orchestrator_start_task: tool({ ... }),
      orchestrator_record_milestone: tool({ ... }),
    },

    event: async (input, output) => { /* stats backfill (§6.5) */ },

    "experimental.session.compacting": async (_input, output) => {
      // inject resumable summary: current task, phase, next phase, open decisions
    },
  };
};
```

Full source is specified in **Appendix B** (implementation reference).

---

## 7. Agents (`.opencode/agents/*.md`)

### 7.1 Common frontmatter rules

- `mode`: `primary` only for `orchestrator`; `subagent` for all role agents.
- `model:` is written by the plugin at setup time (defaults ship pre-filled in the files).
- `tools`/`permission` restrict each role to what it needs (see per-agent).
- Body: role instructions in English, referencing the skill (`skill` tool) where relevant.

### 7.2 `orchestrator.md` (Dispatcher, primary)

```yaml
---
description: Orchestrator dispatcher for the autonomous Pain Packer workflow
mode: primary
tools:
  read: true
  write: true
  edit: true
  bash: true
  glob: true
  grep: true
  task: true
  question: true
  todowrite: true
  skill: true
---
You are the Orchestrator Dispatcher...
```

Body instructions (English):
1. Load `orchestrator-workflow` skill; load state via `orchestrator_get_state`.
2. Create/update a `todowrite` checklist with one item per phase (PLAN, PLAN_REVIEW, IMPLEMENT, REVIEW, TEST, COMMIT, DOCS) — this is the live progress UI.
3. Phase PLAN → delegate to `planner` via `task`; on failure/timeout retry with `planner-fallback`; call `orchestrator_record_milestone` after each.
4. Phase PLAN_REVIEW → render the plan, then `question` with options `Approve`, `Modify`, `Cancel`. `Modify` (or a custom typed answer) → send feedback back to `planner` and re-plan; `Cancel` → `orchestrator_record_milestone(status: canceled)`, stop.
5. Phase IMPLEMENT → `executor` (+ `executor-fallback`), then `reviewer` (+ fallback). If `config.autoFixIssues`, loop review→fix up to `config.maxAttemptsPerPhase`.
6. Phase TEST → `tester` (+ fallback) always; if `config.runTestsAfterImplementation` is false, skip.
7. Phase COMMIT → `deployer` when `config.autoCommit`; otherwise print the prepared Conventional Commit message and let the user run it (still via `deployer` advice).
8. Phase DOCS → update `README.md`/`docs/ai-docs/` (docsgen logic lives in the skill, orchestrated by the agent).
9. Finish with cost summary if `config.showCostEstimates`; mark task DONE.

### 7.3 `planner.md` / `planner-fallback.md`

```yaml
---
description: Creates a milestone-based implementation plan in English
mode: subagent
model: <planning primary>            # <- plugin-managed
---
```
- Reads the task, the repo surface (glob/grep/read), AGENTS.md conventions.
- Outputs ONLY a plan at `docs/plans/<slug>.md` matching the SKILL plan format (§8.3).
- Returns `{ok, planPath, summary}` JSON.

### 7.4 `executor.md` / `executor-fallback.md`

```yaml
---
description: Implements the approved plan
mode: subagent
model: <implementation primary>
---
```
- Executes plan milestones in order; early returns; conventions from AGENTS.md.
- Never runs destructive git commands; leaves commits to `deployer`.
- Returns `{ok, filesChanged: string[], summary}` JSON.

### 7.5 `reviewer.md` / `reviewer-fallback.md`

```yaml
---
description: Reviews implementation against plan and conventions
mode: subagent
model: <review primary>
---
```
- Reviews diff vs. plan; checks errors, dead code, security, conventions.
- Returns `{ok, issues: [{severity, file, line, suggestion}]}` JSON.

### 7.6 `tester.md` / `tester-fallback.md`

```yaml
---
description: Runs the project test suite and reports failures
mode: subagent
model: <repetitive primary>
---
```
- Runs the project's test command (detected from package.json / README / AGENTS.md), reports JSON: `{ok, commandRun, failures, outputTail}`.

### 7.7 `deployer.md` / `deployer-fallback.md`

```yaml
---
description: Creates branch, commits (Conventional Commits, English), pushes, opens PR
mode: subagent
model: <repetitive primary>
---
```
- One commit per milestone, Conventional Commits `type(scope): subject`, English, no secrets.
- `auto_push`/`auto_pr` per config; destructive-force pushes forbidden.

### 7.8 Missing pieces vs v1

- `tester`/`deployer` **do** carry a model now (from `repetitive`), because fallbacks need twin files anyway — simpler and consistent.
- No `-fallback` for DOCS; docs generation runs inline in the orchestrator using the skill rules.

---

## 8. Skill (`.opencode/skills/orchestrator-workflow/SKILL.md`)

Standard operating procedure loaded by all agents via `skill`. Contents (English):

### 8.1 Workflow phases
`PLAN → PLAN_REVIEW → IMPLEMENT → REVIEW → TEST → COMMIT → DOCS`

- Gates between phases as booleans from config (`confirmPlanBeforeImplementation`, `autoFixIssues`, `runTestsAfterImplementation`, `autoCommit`, `showCostEstimates`).
- On any subagent failure: retry with `*-fallback` once; if still failing, stop and record milestone failure.

### 8.2 Security gates
- Migrations, destructive `bash` (`rm -rf`, `git push --force`, `drop database`, dependency upgrades): must pass a `question` confirmation before proceeding.
- Never log/expose secrets.

### 8.3 Plan format (used by planner)
```markdown
# <Task Title>
## Goal
## Context (repo facts, constraints)
## Milestones (ordered steps: scope, files, verification)
1. … (one commit = one milestone)
## Test Strategy
## Risks
```

### 8.4 Commit rules
- Conventional Commits `feat|fix|docs|test|refactor|chore|perf(scope): subject`.
- English, imperative, lowercase, no trailing period; one logical change per commit = one milestone.

### 8.5 Progress reporting
- Orchestrator mirrors phase state in `todowrite`; subagents return strict JSON `{ok, …}`.

---

## 9. Commands (`.opencode/commands/*.md`)

### 9.1 `orchestrator-setup.md` → `/orchestrator setup`

```markdown
---
description: Opens the Pain Packer orchestrator configuration UI in chat
agent: orchestrator
---
Run the orchestrator setup wizard. Follow THE_SETUP_FLOW (do not invent a different one):

1. Call `orchestrator_get_state`; show the current config summary.
2. Ask ONE `question` call containing these questions (navigable form):
   - 8 single-select model questions with options = [the curated model list below] (a custom answer is allowed for any provider/model id):
     Planning primary / Planning fallback / Implementation primary / Implementation fallback /
     Review primary / Review fallback / Repetitive primary / Repetitive fallback
   - 1 multi-select (checkboxes) question: "Optional workflow toggles" with the 5 options:
     confirm plan before implementation / auto-fix issues / run tests after implementation / auto-commit / show cost estimates
   - 3 free-text (custom answer) numeric questions with defaults shown:
     max attempts per phase (default 3) / timeout per phase seconds (default 300) / cost threshold confirmation USD (default 2.5)
3. Ask the final confirmation `question`: options "Save Configuration" and "Cancel".
4. On Save: call `orchestrator_save_config` with every field; print "Configuration saved." and the applied summary.
5. On Cancel: print "Setup cancelled, no changes made." and stop.

Curated model list (options for the selectors):
- opencode/big-pickle
- opencode/grok-code-fast-1
- opencode/quasar-alpha
- opencode/j1-mini-lg
- anthropic/claude-sonnet-4
- anthropic/claude-haiku-4-5
- openai/gpt-4o
- openai/gpt-4o-mini
- google/gemini-2.5-flash
- deepseek/deepseek-chat
- nvidia/nemotron-70b
```

`agent: orchestrator` in frontmatter means the wizard runs through the dispatcher, so it controls the `question` calls and the save tool — entirely within OpenCode, no terminal UI.

### 9.2 `orchestrate.md` → `/orchestrate <task>`

```markdown
---
description: Starts the full Pain Packer orchestration flow: plan -> review -> implement -> review -> test -> commit -> docs
agent: orchestrator
---
Orchestrate this task: $ARGUMENTS

Follow the orchestration flow defined in the `orchestrator-workflow` skill.
Start by calling `orchestrator_get_state`, create the `todowrite` checklist,
then execute the phases, delegating each to its subagent (with fallbacks),
approving the plan via the question UI, and finishing with the cost summary.
```

### 9.3 `orchestrator-status.md` → `/orchestrator status`

```markdown
---
description: Shows current orchestrator task status and model usage statistics
agent: orchestrator
---
Call `orchestrator_get_state` and report:
1. current task: id, description, phase, plan path, updatedAt
2. latest milestones (last 5): phase, agent, status, model, duration
3. statistics: total sessions, tokens, cost usd, success/failure per model
Render concise English report. Never modify state.
```

---

## 10. `README.md` (project root, new)

Sections: what it is; install (copy `.opencode/` into target project; OpenCode loads everything automatically on the next launch); usage (`/orchestrator setup` → `/orchestrate "<task>"` → `/orchestrator status`); configuration explained; security gates; persistence/resume; troubleshooting (plugin load errors visible in `client.app.log`). English only.

---

## 11. `opencode.json` (tweak)

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["AGENTS.md"],
  "plugin": [".opencode/plugins/orchestrator.ts"]
}
```

Unchanged in substance (`plugin` is redundant because `.opencode/plugins/` auto-loads, but harmless and explicit). Keep.

---

## 12. Teardown of the v1 console app (performed during implementation)

Delete from the project root (keep `AGENTS.md`, `docs/`, `opencode.json`):
- `src/`, `scripts/`, `tests/`, `dist/`, `config/`, `state/` (root), `node_modules/`
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.js`
- `.orchestrator-config.json`, `.orchestrator-config.json.test`
- `.opencode/node_modules/`, `.opencode/package.json`, `.opencode/package-lock.json`

Update root `.gitignore` to the minimal set (`node_modules/`, `dist/`, `.opencode/state/plugin-orchestrator.json` if we decide state stays local — default: commit a `.gitkeep` but ignore churned stats; see §5 note). Then `git add -A` and a single `chore(orchestrator): replace console-app scaffold with native plugin` commit.

---

## 13. Implementation steps (ordered, each producing one English commit)

| # | Step | Artifact(s) | Verify | Commit |
|---|---|---|---|---|
| 1 | Teardown v1 console app (§12), keep `opencode.json` + `AGENTS.md` + `docs/` | deleted files, `.gitignore` | `ls` clean; `opencode` starts with no plugin errors | `chore(orchestrator): remove console-app scaffold` |
| 2 | State layer: default state + `fs` read/write + atomic write in plugin | `.opencode/state/plugin-orchestrator.json` (+ `.gitkeep`) | opencode launches; file created on first save | `feat(orchestrator): add persisted state layer` |
| 3 | Plugin skeleton: types, `orchestrator_get_state` tool, event/stats hook, compaction hook | `.opencode/plugins/orchestrator.ts` | `/orchestrator status` prints default stats | `feat(orchestrator): add plugin with state and stats hooks` |
| 4 | Agents (6 + 4 fallback twins) with default models | `.opencode/agents/*.md` | agents appear in opencode agent picker | `feat(orchestrator): add worksteam agents` |
| 5 | `orchestrator_save_config` tool + frontmatter sync | plugin update | `orchestrator_save_config` rewrites agent `model:` | `feat(orchestrator): sync selected models to agents` |
| 6 | Skill + `/orchestrator setup` + `/orchestrate` + `/orchestrator status` commands | `.opencode/skills/…`, `.opencode/commands/*.md` | manual smoke tests (§14) | `feat(orchestrator): add workflow skill and commands` |
| 7 | README | `README.md` | prose review | `docs(orchestrator): add usage readme` |

---

## 14. Verification (no unit-test harness by design)

Because the plugin runs inside OpenCode, verification is manual in the TUI:

1. Fresh launch → no plugin load errors (`/help` clean; logcloud).
2. `/orchestrator setup` → the multi-part form appears; select models; toggles; numeric fields; **Save Configuration** → state file updated AND agent `model:` frontmatter updated. **Cancel** path leaves state untouched.
3. `/orchestrate "Implement greet endpoint"` → checklist renders, planner runs, plan shown, `Approve/Modify/Cancel` works; modify path re-plans; implementation + review + test + commit + docs run; cost summary printed; milestones logged in state; `/orchestrator status` reflects it.
4. Restart opencode → `/orchestrator status` reports the resumed `currentTask`.
5. Kill a subagent mid-run → orchestrator retries the `*-fallback` twin and records status `fallback`.

---

## 15. Risks & limitations

- **No literal progress bar** — TUI renders no custom progress widgets; we expose live phase progress via the `todowrite` checklist. (Documented in README.)
- **`question` is sequential, not a blocking modal** — the setup form is one multi-part `question` call, matching the requested selectors/checkboxes/numbers, but OpenCode renders it as a form, not a control panel with separate buttons.
- **Event payload shape** for token data can vary across OpenCode versions; the stats backfill is defensive (try/catch, optional fields) and never blocks the session.
- **Agent frontmatter sync** rewrites files on save; a manual edit to `model:` is overwritten next save. Documented.
- **`@opencode-ai/plugin` import** — documented OpenCode module; if resolution ever fails, fall back to plain object tool descriptors (no type import) or add `.opencode/package.json` with the dep.

---

## Appendix A — Default config (DEFAULT_CONFIG)

```jsonc
{
  "planning":       { "primary": "opencode/big-pickle",    "fallback": "openai/gpt-4o" },
  "implementation": { "primary": "anthropic/claude-sonnet-4","fallback": "opencode/big-pickle" },
  "review":         { "primary": "opencode/big-pickle",    "fallback": "openai/gpt-4o" },
  "repetitive":     { "primary": "deepseek/deepseek-chat", "fallback": "openai/gpt-4o-mini" },
  "confirmPlanBeforeImplementation": true,
  "autoFixIssues": true,
  "runTestsAfterImplementation": true,
  "autoCommit": true,
  "showCostEstimates": true,
  "maxAttemptsPerPhase": 3,
  "timeoutPerPhaseSeconds": 300,
  "costThresholdForConfirmationUsd": 2.5,
  "ui": { "language": "en" }
}
```

## Appendix B — Plugin reference implementation

Spec target for `.opencode/plugins/orchestrator.ts` (~200 lines):

- `DEFAULT_CONFIG` (Appendix A).
- `readState()` / `writeState(state)` with tmp-file atomic rename under `.opencode/state/`.
- `setAgentModel(name, model)` — regex `^(model):.*$` replacement.
- `syncAgentModels(config)` — ROLE_AGENTS map (§6.4).
- `PRICE_TABLE` — `[{prefix:"anthropic/claude-sonnet-4",in:3,out:15}, {prefix:"opencode/big-pickle",in:0.25,out:1},{prefix:"openai/gpt-4o",in:2.5,out:10},{prefix:"deepseek/deepseek-chat",in:0.27,out:1.1}...]` ($/1M) with a `estimateCost(model, tin, tout)` that falls back to `0.5/1.5`.
- Tools:
  - `orchestrator_get_state` → `JSON.stringify(state)`.
  - `orchestrator_save_config` → validate/clamp → `syncAgentModels` → `writeState` → returns applied config JSON.
  - `orchestrator_start_task` → `{description, slug}`; sets `currentTask`; returns task JSON.
  - `orchestrator_record_milestone` → `{taskId, phase, agent, status, model, startedAt, endedAt, notes}`; appends and persists; returns state JSON.
- Hooks:
  - `event`: stats backfill (§6.5), wrapped in try/catch.
  - `tool.execute.before`: capture timestamp for milestone durations; detect rate-limit/token errors to surface fallback advice via `client.app.log` (v1 parity).
  - `experimental.session.compacting`: inject `Current orchestration task: <slug>`, `Phase: <phase>`, `Plan: <path>`, `Next actions: …`.

---

## Appendix C — Mermaid diagram for README

Same diagram as §2 (`flowchart TB`) with a simplified label set; README references it directly.