---
description: Opens the Pain Packer orchestrator configuration UI in chat
agent: orchestrator
---
# Orchestrator Setup Wizard

Execute this setup wizard step by step. Each step uses the `question` tool to show interactive UI.

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

## Step 3: Call `question` tool to collect ALL settings

**CRITICAL**: You MUST call the `question` tool with a `questions` array parameter. Each element in the array is an object with `header`, `question`, and `options`. Here is the EXACT call you must make:

```
question({
  questions: [
    {
      "header": "Plan Primary",
      "question": "Select Planning Primary model (deep reasoning, architecture)",
      "options": [
        { "label": "opencode/big-pickle", "description": "Free, built-in. Best for deep reasoning & architecture" },
        { "label": "opencode/nemotron-3-ultra-free", "description": "Free, built-in. Top tier reasoning" },
        { "label": "nvidia/nemotron-3-ultra-550b-a55b", "description": "OpenRouter. Top tier reasoning" },
        { "label": "nvidia/nemotron-3-ultra-free", "description": "OpenRouter. Top tier reasoning" },
        { "label": "deepseek/deepseek-reasoner", "description": "OpenRouter. Excellent reasoning" },
        { "label": "anthropic/claude-sonnet-4", "description": "Anthropic. Best-in-class reasoning" },
        { "label": "google/gemini-2.5-pro", "description": "Google. Excellent reasoning" },
        { "label": "z-ai/glm-4.5", "description": "OpenRouter. Strong reasoning" }
      ]
    },
    {
      "header": "Plan Fallback",
      "question": "Select Planning Fallback model",
      "options": [
        { "label": "nvidia/nemotron-3-ultra-550b-a55b", "description": "OpenRouter. Top tier reasoning" },
        { "label": "nvidia/nemotron-3-ultra-free", "description": "OpenRouter. Top tier reasoning" },
        { "label": "opencode/big-pickle", "description": "Free, built-in. Best for deep reasoning" },
        { "label": "deepseek/deepseek-reasoner", "description": "OpenRouter. Excellent reasoning" },
        { "label": "google/gemini-2.5-pro", "description": "Google. Excellent reasoning" },
        { "label": "anthropic/claude-sonnet-4", "description": "Anthropic. Best-in-class reasoning" }
      ]
    },
    {
      "header": "Impl Primary",
      "question": "Select Implementation Primary model (coding, code generation)",
      "options": [
        { "label": "opencode/nemotron-3.5-lightning-free", "description": "Free, built-in. Fastest coding model" },
        { "label": "nvidia/nemotron-3.5-lightning-free", "description": "OpenRouter. Fast coding" },
        { "label": "deepseek/deepseek-chat", "description": "OpenRouter. Top tier coding" },
        { "label": "deepseek/deepseek-coder", "description": "OpenRouter. Specialized for coding" },
        { "label": "opencode/grok-code-fast-1", "description": "Free, built-in. Fast coding" },
        { "label": "qwen/qwen-2.5-coder-32b", "description": "OpenRouter. Specialized coder" },
        { "label": "mistral/codestral", "description": "OpenRouter. Purpose-built for code" }
      ]
    },
    {
      "header": "Impl Fallback",
      "question": "Select Implementation Fallback model",
      "options": [
        { "label": "deepseek/deepseek-chat", "description": "OpenRouter. Top tier coding" },
        { "label": "deepseek/deepseek-coder", "description": "OpenRouter. Specialized for coding" },
        { "label": "opencode/grok-code-fast-1", "description": "Free, built-in. Fast coding" },
        { "label": "qwen/qwen-2.5-coder-32b", "description": "OpenRouter. Specialized coder" },
        { "label": "mistral/codestral", "description": "OpenRouter. Purpose-built for code" },
        { "label": "google/gemini-2.5-flash", "description": "Google. Fast & capable" }
      ]
    },
    {
      "header": "Review Primary",
      "question": "Select Review Primary model (code analysis, security, quality)",
      "options": [
        { "label": "opencode/big-pickle", "description": "Free, built-in. Best for code review & analysis" },
        { "label": "nvidia/nemotron-3-ultra-550b-a55b", "description": "OpenRouter. Deep analysis" },
        { "label": "anthropic/claude-sonnet-4", "description": "Anthropic. Best-in-class code review" },
        { "label": "deepseek/deepseek-reasoner", "description": "OpenRouter. Strong analytical reasoning" },
        { "label": "qwen/qwen-2.5-72b", "description": "OpenRouter. Strong review capabilities" },
        { "label": "google/gemini-2.5-pro", "description": "Google. Excellent for review" }
      ]
    },
    {
      "header": "Review Fallback",
      "question": "Select Review Fallback model",
      "options": [
        { "label": "nvidia/nemotron-3-ultra-550b-a55b", "description": "OpenRouter. Deep analysis" },
        { "label": "opencode/big-pickle", "description": "Free, built-in. Best for code review" },
        { "label": "deepseek/deepseek-reasoner", "description": "OpenRouter. Strong analytical reasoning" },
        { "label": "qwen/qwen-2.5-72b", "description": "OpenRouter. Strong review capabilities" },
        { "label": "google/gemini-2.5-pro", "description": "Google. Excellent for review" },
        { "label": "anthropic/claude-sonnet-4", "description": "Anthropic. Best-in-class code review" }
      ]
    },
    {
      "header": "Rep Primary",
      "question": "Select Repetitive/Doc Primary model (DTOs, tests, CRUD, boilerplate)",
      "options": [
        { "label": "opencode/nemotron-3.5-lightning-free", "description": "Free, built-in. Fastest for repetitive tasks" },
        { "label": "nvidia/nemotron-3.5-lightning-free", "description": "OpenRouter. Fastest for repetitive tasks" },
        { "label": "opencode/grok-code-fast-1", "description": "Free, built-in. Optimized for speed" },
        { "label": "deepseek/deepseek-chat", "description": "OpenRouter. Fast & reliable" },
        { "label": "qwen/qwen-3.7-flash", "description": "OpenRouter. Very fast inference" },
        { "label": "google/gemini-2.5-flash", "description": "Google. Fast & cost-effective" }
      ]
    },
    {
      "header": "Rep Fallback",
      "question": "Select Repetitive/Doc Fallback model",
      "options": [
        { "label": "opencode/grok-code-fast-1", "description": "Free, built-in. Optimized for speed" },
        { "label": "opencode/nemotron-3.5-lightning-free", "description": "Free, built-in. Fastest for repetitive tasks" },
        { "label": "deepseek/deepseek-chat", "description": "OpenRouter. Fast & reliable" },
        { "label": "qwen/qwen-3.7-flash", "description": "OpenRouter. Very fast inference" },
        { "label": "google/gemini-2.5-flash", "description": "Google. Fast & cost-effective" }
      ]
    },
    {
      "header": "Confirm Plan",
      "question": "Should the orchestrator pause for plan approval before implementation?",
      "options": [
        { "label": "Yes (Recommended)", "description": "Pause and show plan for approval before coding" },
        { "label": "No", "description": "Skip plan approval, go straight to implementation" }
      ]
    },
    {
      "header": "Max Attempts",
      "question": "Max retry attempts per phase (on failure)",
      "options": [
        { "label": "3 (Recommended)", "description": "Default: 3 attempts" },
        { "label": "1", "description": "No retries" },
        { "label": "2", "description": "2 attempts" },
        { "label": "5", "description": "5 attempts" }
      ]
    },
    {
      "header": "Timeout",
      "question": "Timeout per phase in seconds",
      "options": [
        { "label": "300 (Recommended)", "description": "5 minutes per phase" },
        { "label": "120", "description": "2 minutes (fast, may timeout on large tasks)" },
        { "label": "600", "description": "10 minutes (for complex tasks)" },
        { "label": "900", "description": "15 minutes (very complex tasks)" }
      ]
    },
    {
      "header": "Cost Limit",
      "question": "Cost threshold in USD (pause if exceeded)",
      "options": [
        { "label": "2.5 (Recommended)", "description": "$2.50 USD" },
        { "label": "1.0", "description": "$1.00 USD (strict)" },
        { "label": "5.0", "description": "$5.00 USD (generous)" },
        { "label": "10.0", "description": "$10.00 USD (very generous)" }
      ]
    },
    {
      "header": "Save",
      "question": "Save this configuration?",
      "options": [
        { "label": "Save (Recommended)", "description": "Apply and persist these settings" },
        { "label": "Cancel", "description": "Discard changes" }
      ]
    }
  ]
})
```

---

## Step 4: Process Answers

Map the answers from Step 3 to a config object:

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

## Step 5: Save

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
2. Print "Configuration saved and synced to all agents."

If answer["Save"] === "Cancel":
- Print "Setup cancelled. No changes applied."
