# Pain Packer Orchestrator Workflow Skill

This skill defines the standard operating procedure for the Pain Packer autonomous agent orchestrator.

## Workflow Phases

The orchestration follows this strict sequence:

1. **PLAN** — Planner creates a milestone-based plan.
2. **PLAN_REVIEW** — Human approves, modifies, or cancels the plan.
3. **IMPLEMENT** — Executor implements milestones in order.
4. **REVIEW** — Reviewer validates implementation against plan and conventions.
5. **TEST** — Tester runs the project test suite (optional, config-driven).
6. **COMMIT** — Deployer creates branch, commits, pushes, opens PR (optional, config-driven).
7. **DOCS** — Documentation is updated (README, ai-docs).

Each phase is a gate. The Orchestrator controls progression.

## Plan Format

The Planner must output a plan at `docs/plans/<slug>.md` with this structure:

```markdown
# <Task Title>

## Goal
One paragraph describing the objective.

## Context
Key repository facts, constraints, existing patterns, relevant files.

## Milestones
Ordered steps, each becomes one Conventional Commit:

1. **scope**: Brief description
   - files: [list of files to create/modify]
   - verification: how to verify this milestone

2. **scope**: ...
   ...

## Test Strategy
How to test the implementation (unit, integration, manual).

## Risks
Known risks, unknowns, dependencies.
```

Rules:
- English only.
- One logical change per milestone = one commit.
- No implementation code in the plan.
- Verification criteria must be concrete (e.g., "run `npm test` and see X pass").

## Security Gates

The following actions require explicit human confirmation via the `question` tool:

- Database migrations or schema changes.
- Destructive shell commands: `rm -rf`, `git push --force`, `drop database`, `npm uninstall` of production deps.
- Dependency upgrades that could break the build.
- Any command that modifies production infrastructure.

The Orchestrator must pause and ask before executing these.

## Commit Rules

- **Conventional Commits**: `type(scope): subject`
- **Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`
- **Language**: English only.
- **Mood**: Imperative, lowercase, no trailing period.
- **Scope**: Required, lowercase, describes the module/feature.
- **One commit per milestone** (one logical change).
- No secrets, keys, or credentials in commit messages.

Example: `feat(appointments): add appointment creation endpoint`

## Delegation Protocol

The Orchestrator delegates to subagents via the `task` tool:

- **planner** / **planner-fallback** — Planning model.
- **executor** / **executor-fallback** — Implementation model.
- **reviewer** / **reviewer-fallback** — Review model.
- **tester** / **tester-fallback** — Repetitive task model.
- **deployer** / **deployer-fallback** — Repetitive task model.

Fallback flow: on failure or timeout, the Orchestrator retries **once** with the `-fallback` twin. If that also fails, the phase is marked `failure` and the Orchestrator stops (unless the skill specifies otherwise).

## Progress Reporting

The Orchestrator maintains a live `todowrite` checklist with one entry per phase:

- `PLAN` — Planning
- `PLAN_REVIEW` — Plan review
- `IMPLEMENT` — Implementation
- `REVIEW` — Code review
- `TEST` — Testing
- `COMMIT` — Commit & deploy
- `DOCS` — Documentation

Subagents return strict JSON as specified in their agent prompts. The Orchestrator validates the JSON shape before proceeding.

## Configuration

All toggles come from the persisted config (`.opencode/state/plugin-orchestrator.json`):

- `confirmPlanBeforeImplementation` — Gate after PLAN.
- `autoFixIssues` — If REVIEW finds issues, loop back to IMPLEMENT (up to `maxAttemptsPerPhase`).
- `runTestsAfterImplementation` — Skip TEST phase if false.
- `autoCommit` — Skip COMMIT phase if false (print commit message instead).
- `showCostEstimates` — Print cost summary at the end.
- `maxAttemptsPerPhase` — Max fix loops for IMPLEMENT→REVIEW.
- `timeoutPerPhaseSeconds` — Per-phase timeout.
- `costThresholdForConfirmationUsd` — Unused in v2; reserved for future.

## Documentation Generation

After successful COMMIT, the Orchestrator updates:

- `README.md` — High-level project overview, usage, architecture.
- `docs/ai-docs/<module>.md` — Per-module technical docs (interfaces, data flow, decisions).
- `docs/ai-docs/INDEX.md` — Module index with links.

Format: Markdown with Mermaid diagrams where helpful. English only.