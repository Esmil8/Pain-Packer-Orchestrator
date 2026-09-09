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

## Step 3: Print the FULL Model Reference Block

**ALWAYS print this block BEFORE calling the question tool.** The user needs to see all available models with their star ratings so they can use "Type your own answer" to enter any `provider/model` ID from this list.

Output this EXACT content to the user:

---

## 📋 PLANNING Models (Deep Reasoning, Architecture, Strategy)

### ⭐⭐⭐⭐⭐ Top Tier (Best for complex planning)
- **opencode/big-pickle** (OpenCode Zen) — *Free, built-in*
- **opencode/nemotron-3-ultra-free** (OpenCode Zen) — *Free, built-in*
- **nvidia/nemotron-3-ultra-550b-a55b** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-ultra-free** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-super-free** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-super-120b-a12b** (OpenRouter) — *Free tier available*
- **deepseek/deepseek-reasoner** (OpenRouter) — *Free tier available*
- **anthropic/claude-sonnet-4** (Anthropic) — *Paid*
- **openai/o1-preview** (OpenAI) — *Paid*

### ⭐⭐⭐⭐ Excellent
- **z-ai/glm-4.5** (OpenRouter) — *Free tier available*
- **google/gemini-2.5-pro** (Google) — *Free tier available*
- **meta-llama/llama-3.1-405b** (OpenRouter) — *Free tier available*
- **qwen/qwen-2.5-72b** (OpenRouter) — *Free tier available*
- **mistral/mistral-large** (OpenRouter) — *Free tier available*
- **x-ai/grok-2** (OpenRouter) — *Free tier available*
- **cohere/command-r-plus** (OpenRouter) — *Free tier available*
- **anthropic/claude-3-5-sonnet-20241022** (Anthropic) — *Paid*

### ⭐⭐⭐ Good
- **openai/gpt-4o** (OpenAI) — *Paid*
- **anthropic/claude-3-opus-20240229** (Anthropic) — *Paid*

---

## 💻 IMPLEMENTATION Models (Coding, Code Generation, Refactoring)

### ⭐⭐⭐⭐⭐ Top Tier (Best for coding)
- **opencode/nemotron-3.5-lightning-free** (OpenCode Zen) — *Free, built-in*
- **nvidia/nemotron-3.5-lightning-free** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3.5-lightning-30b-a3b** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-nano-30b-a3b** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-nano-omni-free** (OpenRouter) — *Free tier available*
- **deepseek/deepseek-chat** (OpenRouter) — *Free tier available*
- **deepseek/deepseek-coder** (OpenRouter) — *Free tier available*
- **opencode/grok-code-fast-1** (OpenCode Zen) — *Free, built-in*

### ⭐⭐⭐⭐ Excellent
- **opencode/opencode-coder** (OpenCode Zen) — *Free, built-in*
- **qwen/qwen-2.5-coder-32b** (OpenRouter) — *Free tier available*
- **qwen/qwen-3.7-flash** (OpenRouter) — *Free tier available*
- **mistral/codestral** (OpenRouter) — *Free tier available*
- **meta-llama/llama-3.1-70b** (OpenRouter) — *Free tier available*
- **google/gemini-2.5-flash** (Google) — *Free tier available*
- **opencode/quasar-alpha** (OpenCode Zen) — *Free, built-in*
- **anthropic/claude-3-5-sonnet-20241022** (Anthropic) — *Paid*

### ⭐⭐⭐ Good
- **openai/gpt-4o-mini** (OpenAI) — *Paid, cheap*
- **meta-llama/llama-3.1-8b** (OpenRouter) — *Free tier available*
- **openai/gpt-4o** (OpenAI) — *Paid*

---

## 🔍 REVIEW Models (Code Analysis, Security, Quality, Architecture Review)

### ⭐⭐⭐⭐⭐ Top Tier
- **opencode/big-pickle** (OpenCode Zen) — *Free, built-in*
- **opencode/nemotron-3-ultra-free** (OpenCode Zen) — *Free, built-in*
- **nvidia/nemotron-3-ultra-550b-a55b** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-ultra-free** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-super-free** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-super-120b-a12b** (OpenRouter) — *Free tier available*
- **anthropic/claude-sonnet-4** (Anthropic) — *Paid*

### ⭐⭐⭐⭐ Excellent
- **deepseek/deepseek-reasoner** (OpenRouter) — *Free tier available*
- **z-ai/glm-4.5** (OpenRouter) — *Free tier available*
- **qwen/qwen-2.5-72b** (OpenRouter) — *Free tier available*
- **google/gemini-2.5-pro** (Google) — *Free tier available*
- **meta-llama/llama-3.1-405b** (OpenRouter) — *Free tier available*
- **mistral/mistral-large** (OpenRouter) — *Free tier available*
- **openai/gpt-4o** (OpenAI) — *Paid*
- **x-ai/grok-2** (OpenRouter) — *Free tier available*
- **cohere/command-r-plus** (OpenRouter) — *Free tier available*

### ⭐⭐⭐ Good
- **anthropic/claude-3-5-sonnet-20241022** (Anthropic) — *Paid*

---

## ⚡ REPETITIVE TASKS Models (DTOs, Tests, CRUD, Boilerplate, Docs)

### ⭐⭐⭐⭐⭐ Top Tier (Fastest & Cheapest)
- **opencode/nemotron-3.5-lightning-free** (OpenCode Zen) — *Free, built-in*
- **nvidia/nemotron-3.5-lightning-free** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3.5-lightning-30b-a3b** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-nano-30b-a3b** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-nano-omni-free** (OpenRouter) — *Free tier available*
- **opencode/grok-code-fast-1** (OpenCode Zen) — *Free, built-in*

### ⭐⭐⭐⭐ Excellent
- **deepseek/deepseek-chat** (OpenRouter) — *Free tier available*
- **deepseek/deepseek-coder** (OpenRouter) — *Free tier available*
- **qwen/qwen-3.7-flash** (OpenRouter) — *Free tier available*
- **mistral/mistral-nemo** (OpenRouter) — *Free tier available*
- **google/gemini-2.5-flash** (Google) — *Free tier available*
- **opencode/quasar-alpha** (OpenCode Zen) — *Free, built-in*
- **qwen/qwen-2.5-coder-32b** (OpenRouter) — *Free tier available*

### ⭐⭐⭐ Good (Cost-effective)
- **openai/gpt-4o-mini** (OpenAI) — *Paid, very cheap*
- **opencode/zen-coder** (OpenCode Zen) — *Free, built-in*
- **meta-llama/llama-3.1-8b** (OpenRouter) — *Free tier available*
- **meta-llama/llama-3.2-11b** (OpenRouter) — *Free tier available*
- **anthropic/claude-3-5-haiku-20241022** (Anthropic) — *Paid, cheap*
- **z-ai/glm-4.5-air** (OpenRouter) — *Free tier available*

---

## 🎯 FALLBACK Models (Universal fallbacks for any category)

### ⭐⭐⭐⭐⭐ Best Universal Fallbacks
- **opencode/nemotron-3-ultra-free** (OpenCode Zen) — *Free, built-in*
- **opencode/nemotron-3.5-lightning-free** (OpenCode Zen) — *Free, built-in*
- **nvidia/nemotron-3-ultra-550b-a55b** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-ultra-free** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3.5-lightning-free** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3.5-lightning-30b-a3b** (OpenRouter) — *Free tier available*
- **deepseek/deepseek-chat** (OpenRouter) — *Free tier available*
- **opencode/big-pickle** (OpenCode Zen) — *Free, built-in*
- **google/gemini-2.5-flash** (Google) — *Free tier available*
- **opencode/grok-code-fast-1** (OpenCode Zen) — *Free, built-in*

### ⭐⭐⭐⭐ Good Universal Fallbacks
- **anthropic/claude-sonnet-4** (Anthropic) — *Paid*
- **qwen/qwen-2.5-72b** (OpenRouter) — *Free tier available*
- **meta-llama/llama-3.1-70b** (OpenRouter) — *Free tier available*
- **openai/gpt-4o-mini** (OpenAI) — *Paid, cheap*

---

## 🏷️ By Provider (Quick Reference)

**OpenCode (Built-in, ALL FREE):**
- opencode/big-pickle ⭐⭐⭐⭐⭐
- opencode/grok-code-fast-1 ⭐⭐⭐⭐⭐
- opencode/quasar-alpha ⭐⭐⭐⭐
- opencode/opencode-coder ⭐⭐⭐⭐
- opencode/zen-coder ⭐⭐⭐
- opencode/j1-mini-lg ⭐⭐⭐
- opencode/nemotron-3-ultra-free ⭐⭐⭐⭐⭐
- opencode/nemotron-3.5-lightning-free ⭐⭐⭐⭐⭐

**NVIDIA (OpenRouter, Free tier):**
- nvidia/nemotron-3.5-lightning-free ⭐⭐⭐⭐⭐
- nvidia/nemotron-3.5-lightning-30b-a3b ⭐⭐⭐⭐⭐
- nvidia/nemotron-3-ultra-free ⭐⭐⭐⭐⭐
- nvidia/nemotron-3-ultra-550b-a55b ⭐⭐⭐⭐⭐
- nvidia/nemotron-3-super-free ⭐⭐⭐⭐
- nvidia/nemotron-3-super-120b-a12b ⭐⭐⭐⭐
- nvidia/nemotron-3-nano-30b-a3b ⭐⭐⭐⭐
- nvidia/nemotron-3.5-content-safety ⭐⭐⭐
- nvidia/nemotron-3.5-content-safety-free ⭐⭐⭐
- nvidia/nemotron-3-nano-omni-free ⭐⭐⭐

**DeepSeek (OpenRouter, Free tier):**
- deepseek/deepseek-reasoner ⭐⭐⭐⭐⭐
- deepseek/deepseek-chat ⭐⭐⭐⭐⭐
- deepseek/deepseek-coder ⭐⭐⭐⭐⭐

**Qwen (OpenRouter, Free tier):**
- qwen/qwen-2.5-72b ⭐⭐⭐⭐
- qwen/qwen-2.5-coder-32b ⭐⭐⭐⭐
- qwen/qwen-3.7-flash ⭐⭐⭐⭐
- qwen/qwq-32b ⭐⭐⭐⭐

**Google (Free tier):**
- google/gemini-2.5-flash ⭐⭐⭐⭐
- google/gemini-2.5-pro ⭐⭐⭐⭐
- google/gemini-1.5-flash ⭐⭐⭐
- google/gemini-1.5-pro ⭐⭐⭐

**Meta/Llama (OpenRouter, Free tier):**
- meta-llama/llama-3.1-405b ⭐⭐⭐⭐
- meta-llama/llama-3.1-70b ⭐⭐⭐⭐
- meta-llama/llama-3.1-8b ⭐⭐⭐
- meta-llama/llama-3.2-90b ⭐⭐⭐
- meta-llama/llama-3.2-11b ⭐⭐⭐

**Mistral (OpenRouter, Free tier):**
- mistral/mistral-large ⭐⭐⭐⭐
- mistral/mistral-nemo ⭐⭐⭐⭐
- mistral/codestral ⭐⭐⭐⭐

**Z.ai/GLM (OpenRouter, Free tier):**
- z-ai/glm-4.5 ⭐⭐⭐⭐
- z-ai/glm-4.5-air ⭐⭐⭐

**xAI (OpenRouter, Free tier):**
- x-ai/grok-2 ⭐⭐⭐⭐
- x-ai/grok-2-mini ⭐⭐⭐

**Cohere (OpenRouter, Free tier):**
- cohere/command-r-plus ⭐⭐⭐⭐
- cohere/command-r ⭐⭐⭐

**Anthropic (Paid):**
- anthropic/claude-sonnet-4 ⭐⭐⭐⭐⭐
- anthropic/claude-3-5-sonnet-20241022 ⭐⭐⭐⭐
- anthropic/claude-haiku-4-5 ⭐⭐⭐
- anthropic/claude-3-5-haiku-20241022 ⭐⭐⭐
- anthropic/claude-3-opus-20240229 ⭐⭐⭐

**OpenAI (Paid):**
- openai/gpt-4o ⭐⭐⭐⭐
- openai/gpt-4o-mini ⭐⭐⭐
- openai/o1-preview ⭐⭐⭐⭐
- openai/o1-mini ⭐⭐⭐
- openai/gpt-4-turbo ⭐⭐⭐
- openai/gpt-4 ⭐⭐⭐

---

> **TIP**: You can type ANY `provider/model` ID from the list above in the "Type your own answer" field. For example: `nvidia/nemotron-3-ultra-free`, `opencode/big-pickle`, `deepseek/deepseek-chat`, etc.

---

## Step 4: Call `question` tool to collect ALL settings

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
2. Print "Configuration saved and synced to all agents."

If answer["Save"] === "Cancel":
- Print "Setup cancelled. No changes applied."
