---
description: Opens the Pain Packer orchestrator configuration UI in chat
agent: orchestrator
---
Run the orchestrator setup wizard. Follow this exact flow:

1. Call `orchestrator_get_state` and get the current config.
2. **CHECK**: Does saved config exist? (Compare state.config with DEFAULT_CONFIG - if different, config exists).
3. Print the model reference block (always shown).

---

## 📋 PLANNING Models (Deep Reasoning, Architecture, Strategy)

### ⭐⭐⭐⭐⭐ Top Tier (Best for complex planning)
- **opencode/big-pickle** (OpenCode Zen) — *Free, built-in*
- **nvidia/nemotron-3-ultra-550b-a55b** (OpenRouter) — *Free tier available*
- **deepseek/deepseek-reasoner** (OpenRouter) — *Free tier available*
- **anthropic/claude-sonnet-4** (Anthropic) — *Paid*
- **openai/o1-preview** (OpenAI) — *Paid*

### ⭐⭐⭐⭐ Excellent
- **z-ai/glm-4.5** (OpenRouter) — *Free tier available*
- **google/gemini-2.5-pro** (Google) — *Free tier available*
- **meta-llama/llama-3.1-405b** (OpenRouter) — *Free tier available*
- **qwen/qwen-2.5-72b** (OpenRouter) — *Free tier available*
- **mistral/mistral-large** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-3-ultra** (OpenRouter) — *Free tier available*
- **x-ai/grok-2** (OpenRouter) — *Free tier available*
- **cohere/command-r-plus** (OpenRouter) — *Free tier available*
- **anthropic/claude-3-5-sonnet-20241022** (Anthropic) — *Paid*

### ⭐⭐⭐ Good
- **openai/gpt-4o** (OpenAI) — *Paid*
- **anthropic/claude-3-opus-20240229** (Anthropic) — *Paid*

---

## 💻 IMPLEMENTATION Models (Coding, Code Generation, Refactoring)

### ⭐⭐⭐⭐⭐ Top Tier (Best for coding)
- **nvidia/nemotron-3.5-lightning** (OpenRouter) — *Free tier available*
- **nvidia/nemotron-70b** (OpenRouter) — *Free tier available*
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
- **nvidia/nemotron-3-ultra-550b-a55b** (OpenRouter) — *Free tier available*
- **anthropic/claude-sonnet-4** (Anthropic) — *Paid*

### ⭐⭐⭐⭐ Excellent
- **deepseek/deepseek-reasoner** (OpenRouter) — *Free tier available*
- **z-ai/glm-4.5** (OpenRouter) — *Free tier available*
- **qwen/qwen-2.5-72b** (OpenRouter) — *Free tier available*
- **google/gemini-2.5-pro** (Google) — *Free tier available*
- **meta-llama/llama-3.1-405b** (OpenRouter) — *Free tier available*
- **mistral/mistral-large** (OpenRouter) — *Free tier available*
- **openai/gpt-4o** (OpenAI) — *Paid*
- **nvidia/nemotron-3-ultra** (OpenRouter) — *Free tier available*
- **x-ai/grok-2** (OpenRouter) — *Free tier available*
- **cohere/command-r-plus** (OpenRouter) — *Free tier available*

### ⭐⭐⭐ Good
- **anthropic/claude-3-5-sonnet-20241022** (Anthropic) — *Paid*

---

## ⚡ REPETITIVE TASKS Models (DTOs, Tests, CRUD, Boilerplate, Docs)

### ⭐⭐⭐⭐⭐ Top Tier (Fastest & Cheapest)
- **nvidia/nemotron-3.5-lightning** (OpenRouter) — *Free tier available*
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
- **nvidia/nemotron-3-ultra-550b-a55b** (OpenRouter) — *Free tier available*
- **deepseek/deepseek-chat** (OpenRouter) — *Free tier available*
- **opencode/big-pickle** (OpenCode Zen) — *Free, built-in*
- **google/gemini-2.5-flash** (Google) — *Free tier available*
- **nvidia/nemotron-3.5-lightning** (OpenRouter) — *Free tier available*
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

**NVIDIA (OpenRouter, Free tier):**
- nvidia/nemotron-3.5-lightning ⭐⭐⭐⭐⭐
- nvidia/nemotron-3-ultra-550b-a55b ⭐⭐⭐⭐⭐
- nvidia/nemotron-3-ultra ⭐⭐⭐⭐
- nvidia/nemotron-70b ⭐⭐⭐⭐⭐

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

## ⚡ CONDITIONAL SETUP FLOW

### A. FIRST TIME SETUP (No saved config - state.config === DEFAULT_CONFIG)

1. Call `orchestrator_get_model_list` for validation replacement flow.
2. **PRINT THE MODEL REFERENCE BLOCK** (full list from lines 13-203 above).
3. Call `question` tool **ONCE** with ALL 13 questions (8 model selectors + 5 config options).
3. **VALIDATION LOOP** for each of the 8 selected models:
   a. Call `orchestrator_validate_model` with the selected model.
   b. If `ok: true` → mark as ✅ Valid.
   c. If `ok: false` → show: `⚠️ El modelo '<model>' no está disponible. Error: <error>. ¿Quieres continuar con este modelo? (Sí/No)`
   d. If user chooses **"No"**: Show replacement selector using `question` with `custom: true` and full model list (flattened from `orchestrator_get_model_list`, grouped by provider). Validate replacement. Repeat until valid or user confirms.
   e. If user chooses **"Sí"**: Mark as ⚠️ Invalid (user confirmed).
4. Show summary table with all 8 models and validation status.
5. If Confirm = "Save Configuration": call `orchestrator_save_config`.
6. Print "Configuration saved." + applied summary with validation status.

### B. EXISTING CONFIG (state.config differs from DEFAULT_CONFIG)

1. Show current config summary in a nice table format:
   ```
   ┌─────────────────┬──────────────────────────────────┬──────────────────────────────────┐
   │ Role            │ Primary                          │ Fallback                         │
   ├─────────────────┼──────────────────────────────────┼──────────────────────────────────┤
   │ Planning        │ opencode/big-pickle              │ nvidia/nemotron-3-ultra-550b... │
   │ Implementation  │ anthropic/claude-sonnet-4        │ opencode/big-pickle              │
   │ Review          │ opencode/big-pickle              │ openai/gpt-4o                    │
   │ Repetitive      │ deepseek/deepseek-chat           │ openai/gpt-4o-mini               │
   └─────────────────┴──────────────────────────────────┴──────────────────────────────────┘
   Workflow Toggles: ✅ confirm plan | ✅ auto-fix | ✅ run tests | ✅ auto-commit | ✅ show costs
   Max Attempts: 3 | Timeout: 300s | Cost Threshold: $2.50
   ```

2. **PRINT THE MODEL REFERENCE BLOCK** (full list from lines 13-203 above - all providers with stars) so user sees all available models before choosing.

3. Ask user what to modify using `question` tool:
   ```json
   {
     "header": "Modify Section",
     "question": "¿Qué sección quieres modificar?",
     "options": [
       { "label": "Planning Models", "description": "Change Plan Primary and Plan Fallback models" },
       { "label": "Implementation Models", "description": "Change Impl Primary and Impl Fallback models" },
       { "label": "Review Models", "description": "Change Review Primary and Review Fallback models" },
       { "label": "Repetitive Models", "description": "Change Rep Primary and Rep Fallback models" },
       { "label": "Workflow Toggles", "description": "Change workflow toggle settings" },
       { "label": "Numeric Settings", "description": "Change max attempts, timeout, cost threshold" },
       { "label": "All (Full Reconfigure)", "description": "Reconfigure everything from scratch" },
       { "label": "Cancel", "description": "Exit without changes" }
     ]
   }
   ```

4. **PRINT THE MODEL REFERENCE BLOCK AGAIN** before showing section-specific questions (user needs to see options).

5. Based on selection, show ONLY the relevant questions:
   - **Planning Models** → Questions 1, 2 (Plan Primary, Plan Fallback)
   - **Implementation Models** → Questions 3, 4 (Impl Primary, Impl Fallback)
   - **Review Models** → Questions 5, 6 (Review Primary, Review Fallback)
   - **Repetitive Models** → Questions 7, 8 (Rep Primary, Rep Fallback)
   - **Workflow Toggles** → Question 9
   - **Numeric Settings** → Questions 10, 11, 12
   - **All** → All 13 questions

4. For model changes: Run **VALIDATION LOOP** (same as first-time setup) for the modified models only.
5. Show updated summary table with changes highlighted.
6. Ask confirmation: `¿Guardar cambios? (Sí/No)`
7. If "Sí": call `orchestrator_save_config` with merged config (unchanged values preserved).
8. Print result.

---

The single `question` call must contain these 13 items in its `questions` array. **Use the exact options arrays defined below for each selector.**

### 1. Plan Primary — PLANNING Models (Deep Reasoning, Architecture)
```json
{
  "header": "Plan Primary",
  "question": "Select Planning Primary model",
  "custom": true,
  "options": [
    { "label": "opencode/big-pickle (OpenCode Zen) ⭐⭐⭐⭐⭐", "description": "OpenCode Big Pickle - Best for deep reasoning & architecture" },
    { "label": "nvidia/nemotron-3-ultra-550b-a55b (OpenRouter) ⭐⭐⭐⭐⭐", "description": "Nemotron 3 Ultra 550B - Top tier reasoning" },
    { "label": "deepseek/deepseek-reasoner (OpenRouter) ⭐⭐⭐⭐⭐", "description": "DeepSeek Reasoner - Excellent reasoning model" },
    { "label": "anthropic/claude-sonnet-4 (Anthropic) ⭐⭐⭐⭐⭐", "description": "Claude Sonnet 4 - Best-in-class reasoning" },
    { "label": "google/gemini-2.5-pro (Google) ⭐⭐⭐⭐", "description": "Gemini 2.5 Pro - Excellent reasoning" },
    { "label": "meta-llama/llama-3.1-405b (Meta) ⭐⭐⭐⭐", "description": "Llama 3.1 405B - Massive context & reasoning" },
    { "label": "qwen/qwen-2.5-72b (Qwen) ⭐⭐⭐⭐", "description": "Qwen 2.5 72B - Strong reasoning model" },
    { "label": "z-ai/glm-4.5 (OpenRouter) ⭐⭐⭐⭐", "description": "GLM 4.5 - Strong reasoning capabilities" }
  ]
}
```

### 2. Plan Fallback — PLANNING Models (same list as Plan Primary)
```json
{
  "header": "Plan Fallback",
  "question": "Select Planning Fallback model",
  "custom": true,
  "options": [
    { "label": "nvidia/nemotron-3-ultra-550b-a55b (OpenRouter) ⭐⭐⭐⭐⭐", "description": "Nemotron 3 Ultra 550B - Top tier reasoning" },
    { "label": "deepseek/deepseek-reasoner (OpenRouter) ⭐⭐⭐⭐⭐", "description": "DeepSeek Reasoner - Excellent reasoning model" },
    { "label": "opencode/big-pickle (OpenCode Zen) ⭐⭐⭐⭐⭐", "description": "OpenCode Big Pickle - Best for deep reasoning & architecture" },
    { "label": "google/gemini-2.5-pro (Google) ⭐⭐⭐⭐", "description": "Gemini 2.5 Pro - Excellent reasoning" },
    { "label": "meta-llama/llama-3.1-405b (Meta) ⭐⭐⭐⭐", "description": "Llama 3.1 405B - Massive context & reasoning" },
    { "label": "qwen/qwen-2.5-72b (Qwen) ⭐⭐⭐⭐", "description": "Qwen 2.5 72B - Strong reasoning model" },
    { "label": "anthropic/claude-sonnet-4 (Anthropic) ⭐⭐⭐⭐⭐", "description": "Claude Sonnet 4 - Best-in-class reasoning" },
    { "label": "z-ai/glm-4.5 (OpenRouter) ⭐⭐⭐⭐", "description": "GLM 4.5 - Strong reasoning capabilities" }
  ]
}
```

### 3. Impl Primary — IMPLEMENTATION Models (Coding, Code Generation)
```json
{
  "header": "Impl Primary",
  "question": "Select Implementation Primary model",
  "custom": true,
  "options": [
    { "label": "nvidia/nemotron-3.5-lightning (OpenRouter) ⭐⭐⭐⭐⭐", "description": "Nemotron 3.5 Lightning - Best for fast coding" },
    { "label": "nvidia/nemotron-70b (OpenRouter) ⭐⭐⭐⭐⭐", "description": "Nemotron 70B - Excellent code generation" },
    { "label": "deepseek/deepseek-chat (OpenRouter) ⭐⭐⭐⭐⭐", "description": "DeepSeek Chat - Top tier coding model" },
    { "label": "deepseek/deepseek-coder (OpenRouter) ⭐⭐⭐⭐⭐", "description": "DeepSeek Coder - Specialized for coding" },
    { "label": "opencode/grok-code-fast-1 (OpenCode Zen) ⭐⭐⭐⭐", "description": "Grok Code Fast 1 - Fast OpenCode coding model" },
    { "label": "opencode/opencode-coder (OpenCode Zen) ⭐⭐⭐⭐", "description": "OpenCode Coder - Optimized for code gen" },
    { "label": "qwen/qwen-2.5-coder-32b (Qwen) ⭐⭐⭐⭐", "description": "Qwen 2.5 Coder 32B - Specialized coder" },
    { "label": "mistral/codestral (Mistral) ⭐⭐⭐⭐", "description": "Codestral - Purpose-built for code" }
  ]
}
```

### 4. Impl Fallback — IMPLEMENTATION Models (same list as Impl Primary)
```json
{
  "header": "Impl Fallback",
  "question": "Select Implementation Fallback model",
  "custom": true,
  "options": [
    { "label": "deepseek/deepseek-chat (OpenRouter) ⭐⭐⭐⭐⭐", "description": "DeepSeek Chat - Top tier coding model" },
    { "label": "deepseek/deepseek-coder (OpenRouter) ⭐⭐⭐⭐⭐", "description": "DeepSeek Coder - Specialized for coding" },
    { "label": "nvidia/nemotron-3.5-lightning (OpenRouter) ⭐⭐⭐⭐⭐", "description": "Nemotron 3.5 Lightning - Best for fast coding" },
    { "label": "opencode/grok-code-fast-1 (OpenCode Zen) ⭐⭐⭐⭐", "description": "Grok Code Fast 1 - Fast OpenCode coding model" },
    { "label": "opencode/opencode-coder (OpenCode Zen) ⭐⭐⭐⭐", "description": "OpenCode Coder - Optimized for code gen" },
    { "label": "qwen/qwen-2.5-coder-32b (Qwen) ⭐⭐⭐⭐", "description": "Qwen 2.5 Coder 32B - Specialized coder" },
    { "label": "mistral/codestral (Mistral) ⭐⭐⭐⭐", "description": "Codestral - Purpose-built for code" },
    { "label": "google/gemini-2.5-flash (Google) ⭐⭐⭐⭐", "description": "Gemini 2.5 Flash - Fast & capable coding" }
  ]
}
```

### 5. Review Primary — REVIEW Models (Code Analysis, Security, Quality)
```json
{
  "header": "Review Primary",
  "question": "Select Review Primary model",
  "custom": true,
  "options": [
    { "label": "opencode/big-pickle (OpenCode Zen) ⭐⭐⭐⭐⭐", "description": "OpenCode Big Pickle - Best for code review & analysis" },
    { "label": "nvidia/nemotron-3-ultra-550b-a55b (OpenRouter) ⭐⭐⭐⭐⭐", "description": "Nemotron 3 Ultra 550B - Deep analysis capabilities" },
    { "label": "anthropic/claude-sonnet-4 (Anthropic) ⭐⭐⭐⭐⭐", "description": "Claude Sonnet 4 - Best-in-class code review" },
    { "label": "deepseek/deepseek-reasoner (OpenRouter) ⭐⭐⭐⭐", "description": "DeepSeek Reasoner - Strong analytical reasoning" },
    { "label": "qwen/qwen-2.5-72b (Qwen) ⭐⭐⭐⭐", "description": "Qwen 2.5 72B - Strong review capabilities" },
    { "label": "google/gemini-2.5-pro (Google) ⭐⭐⭐⭐", "description": "Gemini 2.5 Pro - Excellent for review" },
    { "label": "meta-llama/llama-3.1-405b (Meta) ⭐⭐⭐⭐", "description": "Llama 3.1 405B - Massive context for review" },
    { "label": "mistral/mistral-large (Mistral) ⭐⭐⭐⭐", "description": "Mistral Large - Strong analytical skills" }
  ]
}
```

### 6. Review Fallback — REVIEW Models (same list as Review Primary)
```json
{
  "header": "Review Fallback",
  "question": "Select Review Fallback model",
  "custom": true,
  "options": [
    { "label": "nvidia/nemotron-3-ultra-550b-a55b (OpenRouter) ⭐⭐⭐⭐⭐", "description": "Nemotron 3 Ultra 550B - Deep analysis capabilities" },
    { "label": "anthropic/claude-sonnet-4 (Anthropic) ⭐⭐⭐⭐⭐", "description": "Claude Sonnet 4 - Best-in-class code review" },
    { "label": "opencode/big-pickle (OpenCode Zen) ⭐⭐⭐⭐⭐", "description": "OpenCode Big Pickle - Best for code review & analysis" },
    { "label": "deepseek/deepseek-reasoner (OpenRouter) ⭐⭐⭐⭐", "description": "DeepSeek Reasoner - Strong analytical reasoning" },
    { "label": "qwen/qwen-2.5-72b (Qwen) ⭐⭐⭐⭐", "description": "Qwen 2.5 72B - Strong review capabilities" },
    { "label": "google/gemini-2.5-pro (Google) ⭐⭐⭐⭐", "description": "Gemini 2.5 Pro - Excellent for review" },
    { "label": "meta-llama/llama-3.1-405b (Meta) ⭐⭐⭐⭐", "description": "Llama 3.1 405B - Massive context for review" },
    { "label": "mistral/mistral-large (Mistral) ⭐⭐⭐⭐", "description": "Mistral Large - Strong analytical skills" }
  ]
}
```

### 7. Rep Primary — REPETITIVE TASKS Models (DTOs, Tests, CRUD, Boilerplate)
```json
{
  "header": "Rep Primary",
  "question": "Select Repetitive/Doc Primary model",
  "custom": true,
  "options": [
    { "label": "nvidia/nemotron-3.5-lightning (OpenRouter) ⭐⭐⭐⭐⭐", "description": "Nemotron 3.5 Lightning - Fastest for repetitive tasks" },
    { "label": "opencode/grok-code-fast-1 (OpenCode Zen) ⭐⭐⭐⭐⭐", "description": "Grok Code Fast 1 - Optimized for speed" },
    { "label": "deepseek/deepseek-chat (OpenRouter) ⭐⭐⭐⭐", "description": "DeepSeek Chat - Fast & reliable" },
    { "label": "deepseek/deepseek-coder (OpenRouter) ⭐⭐⭐⭐", "description": "DeepSeek Coder - Good for boilerplate" },
    { "label": "qwen/qwen-3.7-flash (Qwen) ⭐⭐⭐⭐", "description": "Qwen 3.7 Flash - Very fast inference" },
    { "label": "mistral/mistral-nemo (Mistral) ⭐⭐⭐⭐", "description": "Mistral Nemo - Efficient small model" },
    { "label": "google/gemini-2.5-flash (Google) ⭐⭐⭐⭐", "description": "Gemini 2.5 Flash - Fast & cost-effective" },
    { "label": "opencode/quasar-alpha (OpenCode Zen) ⭐⭐⭐⭐", "description": "Quasar Alpha - Fast OpenCode model" }
  ]
}
```

### 8. Rep Fallback — REPETITIVE TASKS Models (same list as Rep Primary)
```json
{
  "header": "Rep Fallback",
  "question": "Select Repetitive/Doc Fallback model",
  "custom": true,
  "options": [
    { "label": "opencode/grok-code-fast-1 (OpenCode Zen) ⭐⭐⭐⭐⭐", "description": "Grok Code Fast 1 - Optimized for speed" },
    { "label": "nvidia/nemotron-3.5-lightning (OpenRouter) ⭐⭐⭐⭐⭐", "description": "Nemotron 3.5 Lightning - Fastest for repetitive tasks" },
    { "label": "deepseek/deepseek-chat (OpenRouter) ⭐⭐⭐⭐", "description": "DeepSeek Chat - Fast & reliable" },
    { "label": "deepseek/deepseek-coder (OpenRouter) ⭐⭐⭐⭐", "description": "DeepSeek Coder - Good for boilerplate" },
    { "label": "qwen/qwen-3.7-flash (Qwen) ⭐⭐⭐⭐", "description": "Qwen 3.7 Flash - Very fast inference" },
    { "label": "mistral/mistral-nemo (Mistral) ⭐⭐⭐⭐", "description": "Mistral Nemo - Efficient small model" },
    { "label": "google/gemini-2.5-flash (Google) ⭐⭐⭐⭐", "description": "Gemini 2.5 Flash - Fast & cost-effective" },
    { "label": "opencode/quasar-alpha (OpenCode Zen) ⭐⭐⭐⭐", "description": "Quasar Alpha - Fast OpenCode model" }
  ]
}
```

### 9. Workflow Toggles — Multi-select
```json
{
  "header": "Workflow Toggles",
  "question": "Select Workflow Toggles",
  "multiple": true,
  "options": [
    { "label": "confirm plan before implementation (Recommended)", "description": "Pause to review plan before coding" },
    { "label": "auto-fix issues (Recommended)", "description": "Automatically fix issues found in review" },
    { "label": "run tests after implementation (Recommended)", "description": "Run test suite after implementation" },
    { "label": "auto-commit (Recommended)", "description": "Automatically commit and push changes" },
    { "label": "show cost estimates (Recommended)", "description": "Display cost estimates in summary" }
  ]
}
```

### 10. Max Attempts — Single-select numeric
```json
{
  "header": "Max Attempts",
  "question": "Enter Max Attempts per phase",
  "options": [
    { "label": "3 (Recommended)", "description": "Default max attempts per phase (3)" },
    { "label": "1", "description": "1 attempt" },
    { "label": "2", "description": "2 attempts" },
    { "label": "5", "description": "5 attempts" }
  ]
}
```

### 11. Timeout Seconds — Single-select numeric
```json
{
  "header": "Timeout Seconds",
  "question": "Enter Timeout Seconds per phase",
  "options": [
    { "label": "300 (Recommended)", "description": "Default timeout in seconds (300)" },
    { "label": "120", "description": "120 seconds" },
    { "label": "600", "description": "600 seconds" },
    { "label": "900", "description": "900 seconds" }
  ]
}
```

### 12. Cost Threshold USD — Single-select numeric
```json
{
  "header": "Cost Threshold USD",
  "question": "Enter Cost Threshold USD",
  "options": [
    { "label": "2.5 (Recommended)", "description": "Default cost threshold in USD ($2.50)" },
    { "label": "1.0", "description": "$1.00 USD" },
    { "label": "5.0", "description": "$5.00 USD" },
    { "label": "10.0", "description": "$10.00 USD" }
  ]
}
```

### 13. Confirm — Single-select
```json
{
  "header": "Confirm",
  "question": "Confirm configuration setup",
  "options": [
    { "label": "Save Configuration (Recommended)", "description": "Save settings and apply configuration" },
    { "label": "Cancel", "description": "Cancel setup and discard changes" }
  ]
}
```

---

**CRITICAL:** All 8 model selectors (1-8) MUST have `custom: true` enabled (or equivalent "Type your own answer" option) so users can enter any `provider/model` ID from the reference block at step 2.

The `question` tool call should include all 13 questions in a single array. The user submits all answers at once.