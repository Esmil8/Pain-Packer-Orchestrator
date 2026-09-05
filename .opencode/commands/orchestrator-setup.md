---
description: Opens the Pain Packer orchestrator configuration UI in chat
agent: orchestrator
---
Run the orchestrator setup wizard. Follow this exact flow:

1. Call `orchestrator_get_state` and show the current config summary.
2. Print the following reference block as markdown text:

💡 **Available Models Reference:** Use these exact names if you select the 'Type your own answer' option below.

**OpenCode (built-in / Zen):**
- opencode/big-pickle
- opencode/grok-code-fast-1
- opencode/quasar-alpha
- opencode/j1-mini-lg
- opencode/opencode-coder
- opencode/zen-coder

**Anthropic:**
- anthropic/claude-sonnet-4
- anthropic/claude-haiku-4-5
- anthropic/claude-3-5-sonnet-20241022
- anthropic/claude-3-5-haiku-20241022
- anthropic/claude-3-opus-20240229

**OpenAI:**
- openai/gpt-4o
- openai/gpt-4o-mini
- openai/gpt-4-turbo
- openai/gpt-4
- openai/o1-preview
- openai/o1-mini

**Google:**
- google/gemini-2.5-flash
- google/gemini-2.5-pro
- google/gemini-1.5-pro
- google/gemini-1.5-flash

**DeepSeek:**
- deepseek/deepseek-chat
- deepseek/deepseek-coder
- deepseek/deepseek-reasoner

**NVIDIA:**
- nvidia/nemotron-70b
- nvidia/nemotron-3-ultra

**Meta (via OpenRouter/Providers):**
- meta-llama/llama-3.1-405b
- meta-llama/llama-3.1-70b
- meta-llama/llama-3.1-8b
- meta-llama/llama-3.2-90b
- meta-llama/llama-3.2-11b

**Mistral:**
- mistral/mistral-large
- mistral/mistral-nemo
- mistral/codestral

**Qwen:**
- qwen/qwen-2.5-72b
- qwen/qwen-2.5-coder-32b
- qwen/qwq-32b

**Z.ai (GLM):**
- z-ai/glm-4.5
- z-ai/glm-4.5-air

**xAI:**
- x-ai/grok-2
- x-ai/grok-2-mini

**Cohere:**
- cohere/command-r-plus
- cohere/command-r

3. Call the `question` tool **ONCE** with an array containing ALL 13 questions below. The user will navigate between tabs and submit all answers at once.
4. Process the single response object containing all answers, then call `orchestrator_save_config` with the collected fields.
5. On "Save Configuration": print "Configuration saved." + applied summary.
6. On "Cancel": print "Setup cancelled, no changes made." and stop.

---

The single `question` call must contain these 13 items in its `questions` array:

1. **Plan Primary** — single-select, curated model list (custom answer enabled)
2. **Plan Fallback** — single-select, curated model list (custom answer enabled)
3. **Impl Primary** — single-select, curated model list (custom answer enabled)
4. **Impl Fallback** — single-select, curated model list (custom answer enabled)
5. **Review Primary** — single-select, curated model list (custom answer enabled)
6. **Review Fallback** — single-select, curated model list (custom answer enabled)
7. **Rep Primary** — single-select, curated model list (custom answer enabled)
8. **Rep Fallback** — single-select, curated model list (custom answer enabled)
9. **Workflow Toggles** — multi-select (checkboxes):
   - confirm plan before implementation
   - auto-fix issues
   - run tests after implementation
   - auto-commit
   - show cost estimates
10. **Max Attempts** — free-text numeric, default 3
11. **Timeout Seconds** — free-text numeric, default 300
12. **Cost Threshold USD** — free-text numeric, default 2.5
13. **Confirm** — single-select: "Save Configuration", "Cancel"

---

Curated model list (9 options shown in UI; **custom answer enabled** — type any `provider/model`):

1. opencode/big-pickle
2. opencode/grok-code-fast-1
3. anthropic/claude-sonnet-4
4. anthropic/claude-haiku-4-5
5. openai/gpt-4o
6. openai/gpt-4o-mini
7. google/gemini-2.5-flash
8. deepseek/deepseek-chat
9. nvidia/nemotron-70b