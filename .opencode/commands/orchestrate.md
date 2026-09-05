---
description: Starts the full Pain Packer orchestration flow: plan -> review -> implement -> review -> test -> commit -> docs
agent: orchestrator
---
Orchestrate this task: $ARGUMENTS

Follow the orchestration flow defined in the `orchestrator-workflow` skill.

1. Call `orchestrator_get_state`.
2. Create a `todowrite` checklist with all phases: PLAN, PLAN_REVIEW, IMPLEMENT, REVIEW, TEST, COMMIT, DOCS.
3. Execute phases in order, delegating each to its subagent (with fallbacks):
   - PLAN → `planner` (fallback: `planner-fallback`)
   - PLAN_REVIEW → show plan, ask via `question` with options: Approve / Modify / Cancel
   - IMPLEMENT → `executor` (fallback: `executor-fallback`)
   - REVIEW → `reviewer` (fallback: `reviewer-fallback`)
   - TEST → `tester` (fallback: `tester-fallback`) — only if config.runTestsAfterImplementation
   - COMMIT → `deployer` (fallback: `deployer-fallback`) — only if config.autoCommit
   - DOCS → update README.md and docs/ai-docs/
4. Record milestones via `orchestrator_record_milestone` after each phase.
5. Finish with cost summary if config.showCostEstimates.