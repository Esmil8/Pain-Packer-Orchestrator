---
description: Opens the Pain Packer orchestrator configuration UI in chat
agent: orchestrator
---
# Orchestrator Setup Wizard

Execute this setup wizard step by step.

---

## Step 1: Load State

Call `orchestrator_get_state` to get the current configuration. Store the result.

---

## Step 2: Show Current Config Summary

If a saved config exists (state.config differs from DEFAULT_CONFIG), print this summary table:

```
┌─────────────────┬──────────────────────────────────┬──────────────────────────────────┐
│ Role            │ Primary                          │ Fallback                         │
├─────────────────┼──────────────────────────────────┼──────────────────────────────────┤
│ Planning        │ {planning.primary}               │ {planning.fallback}              │
│ Implementation  │ {implementation.primary}         │ {implementation.fallback}        │
│ Review          │ {review.primary}                 │ {review.fallback}                │
│ Repetitive      │ {repetitive.primary}             │ {repetitive.fallback}            │
└─────────────────┴──────────────────────────────────┴──────────────────────────────────┘
Workflow: confirm={confirmPlanBeforeImplementation} | auto-fix={autoFixIssues} | tests={runTestsAfterImplementation} | commit={autoCommit} | costs={showCostEstimates}
Max Attempts: {maxAttemptsPerPhase} | Timeout: {timeoutPerPhaseSeconds}s | Cost Threshold: ${costThresholdForConfirmationUsd}
```

---

## Step 3: Fetch the Dynamic Model List

**Call `orchestrator_get_model_list` to get the current available models.** Do NOT use a hardcoded list.

The tool returns the models grouped by provider (e.g., `[{ "provider": "nvidia", "models": [{ "id": "nvidia/nemotron-3-ultra-free", "provider": "nvidia", "available": true }, ...] }, ...]`).

Print a condensed reference to the user from the returned list, formatted like:

```
## Available Models (by provider)

**nvidia:** nvidia/nemotron-3-ultra-550b-a55b, nvidia/nemotron-3-ultra-free, nvidia/nemotron-3.5-lightning-free
**deepseek:** deepseek/deepseek-chat, deepseek/deepseek-reasoner
...
```

Then offer the top candidates for each role in the `question` tool options (prefer `opencode/*` built-in models which are free).

---

## Step 4: Call `question` tool to collect ALL settings

**CRITICAL**: You MUST call the `question` tool with a `questions` array parameter. Each element in the array is an object with `header`, `question`, and `options`. Use the models returned by `orchestrator_get_model_list` for the options (prefer free models). Build the options for each role dynamically:

- **Plan Primary** — "Select Planning Primary model (deep reasoning, architecture)"
- **Plan Fallback** — "Select Planning Fallback model"
- **Impl Primary** — "Select Implementation Primary model (coding, code generation)"
- **Impl Fallback** — "Select Implementation Fallback model"
- **Review Primary** — "Select Review Primary model (code analysis, security, quality)"
- **Review Fallback** — "Select Review Fallback model"
- **Rep Primary** — "Select Repetitive/Doc Primary model (DTOs, tests, CRUD, boilerplate)"
- **Rep Fallback** — "Select Repetitive/Doc Fallback model"
- **Confirm Plan** — "Should the orchestrator pause for plan approval before implementation?" → `Yes (Recommended)` / `No`
- **Max Attempts** — "Max retry attempts per phase (on failure)" → `3 (Recommended)` / `1` / `2` / `5`
- **Timeout** — "Timeout per phase in seconds" → `300 (Recommended)` / `120` / `600` / `900`
- **Cost Limit** — "Cost threshold in USD (pause if exceeded)" → `2.5 (Recommended)` / `1.0` / `5.0` / `10.0`
- **Save** — "Save this configuration?" → `Save (Recommended)` / `Cancel`

Each model option should include the model id in the label and a short description (provider + purpose).

---

## Step 5: Process Answers

Map the answers from Step 4 to a config object:

```
config = {
  planning: {
    primary: answer["Plan Primary"],
    fallback: answer["Plan Fallback"]
  },
  implementation: {
    primary: answer["Impl Primary"],
    fallback: answer["Impl Fallback"]
  },
  review: {
    primary: answer["Review Primary"],
    fallback: answer["Review Fallback"]
  },
  repetitive: {
    primary: answer["Rep Primary"],
    fallback: answer["Rep Fallback"]
  },
  confirmPlanBeforeImplementation: (answer["Confirm Plan"] === "Yes (Recommended)"),
  maxAttemptsPerPhase: parseInt(answer["Max Attempts"]),
  timeoutPerPhaseSeconds: parseInt(answer["Timeout"]),
  costThresholdForConfirmationUsd: parseFloat(answer["Cost Limit"])
}
```

---

## Step 6: Save

If answer["Save"] === "Save (Recommended)":
1. Call `orchestrator_save_config` with the mapped config values:
   - `planningPrimary`, `planningFallback`
   - `implementationPrimary`, `implementationFallback`
   - `reviewPrimary`, `reviewFallback`
   - `repetitivePrimary`, `repetitiveFallback`
   - `confirmPlanBeforeImplementation`
   - `autoFixIssues: true`
   - `runTestsAfterImplementation: true`
   - `autoCommit: true`
   - `showCostEstimates: true`
   - `maxAttemptsPerPhase`
   - `timeoutPerPhaseSeconds`
   - `costThresholdForConfirmationUsd`
2. If the tool returns `{ "ok": false, "error": "..." }`, show the error to the user and ask them to re-select a valid model.
3. On success, print "Configuration saved and synced to all agents."

If answer["Save"] === "Cancel":
- Print "Setup cancelled. No changes applied."