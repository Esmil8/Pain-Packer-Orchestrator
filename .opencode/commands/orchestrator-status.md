---
description: Shows current orchestrator task status and model usage statistics
agent: orchestrator
---
Call `orchestrator_get_state` and report:

1. Current task: id, description, phase, plan path, updatedAt (or "No active task").
2. Latest milestones (last 5): phase, agent, status, model, duration.
3. Statistics: total sessions, total tokens in/out, total cost USD, success/failure per model.

Render a concise English report. Never modify state.