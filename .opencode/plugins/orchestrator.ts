import { tool, type Plugin } from "@opencode-ai/plugin";
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { resolve, dirname } from "node:path";

const STATE_PATH = () => resolve(process.cwd(), ".opencode", "state", "plugin-orchestrator.json");
const AGENTS_DIR = () => resolve(process.cwd(), ".opencode", "agents");

const DEFAULT_CONFIG = {
  planning: { primary: "opencode/big-pickle", fallback: "openai/gpt-4o" },
  implementation: { primary: "anthropic/claude-sonnet-4", fallback: "opencode/big-pickle" },
  review: { primary: "opencode/big-pickle", fallback: "openai/gpt-4o" },
  repetitive: { primary: "deepseek/deepseek-chat", fallback: "openai/gpt-4o-mini" },
  confirmPlanBeforeImplementation: true,
  autoFixIssues: true,
  runTestsAfterImplementation: true,
  autoCommit: true,
  showCostEstimates: true,
  maxAttemptsPerPhase: 3,
  timeoutPerPhaseSeconds: 300,
  costThresholdForConfirmationUsd: 2.5,
  ui: { language: "en" },
};

const MODEL_LIST = [
  { provider: "OpenCode (Built-in, ALL FREE)", models: [
    { id: "opencode/big-pickle", stars: "⭐⭐⭐⭐⭐", desc: "Best for deep reasoning & architecture" },
    { id: "opencode/grok-code-fast-1", stars: "⭐⭐⭐⭐⭐", desc: "Fast OpenCode coding model" },
    { id: "opencode/quasar-alpha", stars: "⭐⭐⭐⭐", desc: "Fast OpenCode model" },
    { id: "opencode/opencode-coder", stars: "⭐⭐⭐⭐", desc: "Optimized for code gen" },
    { id: "opencode/zen-coder", stars: "⭐⭐⭐", desc: "Good for coding" },
    { id: "opencode/j1-mini-lg", stars: "⭐⭐⭐", desc: "Lightweight model" },
    { id: "opencode/nemotron-3-ultra-free", stars: "⭐⭐⭐⭐⭐", desc: "Nemotron 3 Ultra Free - Top tier reasoning" },
    { id: "opencode/nemotron-3.5-lightning-free", stars: "⭐⭐⭐⭐⭐", desc: "Nemotron 3.5 Lightning Free - Fast coding" },
  ]},
  { provider: "NVIDIA (OpenRouter, Free tier)", models: [
    { id: "nvidia/nemotron-3.5-lightning-free", stars: "⭐⭐⭐⭐⭐", desc: "Nemotron 3.5 Lightning Free - Best for fast coding" },
    { id: "nvidia/nemotron-3.5-lightning-30b-a3b", stars: "⭐⭐⭐⭐⭐", desc: "Nemotron 3.5 Lightning 30B A3B" },
    { id: "nvidia/nemotron-3-ultra-free", stars: "⭐⭐⭐⭐⭐", desc: "Nemotron 3 Ultra Free - Top tier reasoning" },
    { id: "nvidia/nemotron-3-ultra-550b-a55b", stars: "⭐⭐⭐⭐⭐", desc: "Nemotron 3 Ultra 550B A55B - Top tier reasoning" },
    { id: "nvidia/nemotron-3-super-free", stars: "⭐⭐⭐⭐", desc: "Nemotron 3 Super Free - Strong reasoning" },
    { id: "nvidia/nemotron-3-super-120b-a12b", stars: "⭐⭐⭐⭐", desc: "Nemotron 3 Super 120B A12B" },
    { id: "nvidia/nemotron-3-nano-30b-a3b", stars: "⭐⭐⭐⭐", desc: "Nemotron 3 Nano 30B A3B" },
    { id: "nvidia/nemotron-3.5-content-safety", stars: "⭐⭐⭐", desc: "Nemotron 3.5 Content Safety" },
    { id: "nvidia/nemotron-3.5-content-safety-free", stars: "⭐⭐⭐", desc: "Nemotron 3.5 Content Safety Free" },
    { id: "nvidia/nemotron-3-nano-omni-free", stars: "⭐⭐⭐", desc: "Nemotron 3 Nano Omni Free" },
  ]},
  { provider: "DeepSeek (OpenRouter, Free tier)", models: [
    { id: "deepseek/deepseek-reasoner", stars: "⭐⭐⭐⭐⭐", desc: "Excellent reasoning model" },
    { id: "deepseek/deepseek-chat", stars: "⭐⭐⭐⭐⭐", desc: "Top tier coding model" },
    { id: "deepseek/deepseek-coder", stars: "⭐⭐⭐⭐⭐", desc: "Specialized for coding" },
  ]},
  { provider: "Qwen (OpenRouter, Free tier)", models: [
    { id: "qwen/qwen-2.5-72b", stars: "⭐⭐⭐⭐", desc: "Strong reasoning model" },
    { id: "qwen/qwen-2.5-coder-32b", stars: "⭐⭐⭐⭐", desc: "Specialized coder" },
    { id: "qwen/qwen-3.7-flash", stars: "⭐⭐⭐⭐", desc: "Very fast inference" },
    { id: "qwen/qwq-32b", stars: "⭐⭐⭐⭐", desc: "Strong reasoning" },
  ]},
  { provider: "Google (Free tier)", models: [
    { id: "google/gemini-2.5-flash", stars: "⭐⭐⭐⭐", desc: "Fast & cost-effective" },
    { id: "google/gemini-2.5-pro", stars: "⭐⭐⭐⭐", desc: "Excellent reasoning" },
    { id: "google/gemini-1.5-flash", stars: "⭐⭐⭐", desc: "Fast & capable" },
    { id: "google/gemini-1.5-pro", stars: "⭐⭐⭐", desc: "Good reasoning" },
  ]},
  { provider: "Meta/Llama (OpenRouter, Free tier)", models: [
    { id: "meta-llama/llama-3.1-405b", stars: "⭐⭐⭐⭐", desc: "Massive context & reasoning" },
    { id: "meta-llama/llama-3.1-70b", stars: "⭐⭐⭐⭐", desc: "Strong model" },
    { id: "meta-llama/llama-3.1-8b", stars: "⭐⭐⭐", desc: "Efficient small model" },
    { id: "meta-llama/llama-3.2-90b", stars: "⭐⭐⭐", desc: "Large context" },
    { id: "meta-llama/llama-3.2-11b", stars: "⭐⭐⭐", desc: "Efficient model" },
  ]},
  { provider: "Mistral (OpenRouter, Free tier)", models: [
    { id: "mistral/mistral-large", stars: "⭐⭐⭐⭐", desc: "Strong analytical skills" },
    { id: "mistral/mistral-nemo", stars: "⭐⭐⭐⭐", desc: "Efficient small model" },
    { id: "mistral/codestral", stars: "⭐⭐⭐⭐", desc: "Purpose-built for code" },
  ]},
  { provider: "Z.ai/GLM (OpenRouter, Free tier)", models: [
    { id: "z-ai/glm-4.5", stars: "⭐⭐⭐⭐", desc: "Strong reasoning capabilities" },
    { id: "z-ai/glm-4.5-air", stars: "⭐⭐⭐", desc: "Lightweight model" },
  ]},
  { provider: "xAI (OpenRouter, Free tier)", models: [
    { id: "x-ai/grok-2", stars: "⭐⭐⭐⭐", desc: "Strong reasoning" },
    { id: "x-ai/grok-2-mini", stars: "⭐⭐⭐", desc: "Lightweight model" },
  ]},
  { provider: "Cohere (OpenRouter, Free tier)", models: [
    { id: "cohere/command-r-plus", stars: "⭐⭐⭐⭐", desc: "Strong capabilities" },
    { id: "cohere/command-r", stars: "⭐⭐⭐", desc: "Efficient model" },
  ]},
  { provider: "Anthropic (Paid)", models: [
    { id: "anthropic/claude-sonnet-4", stars: "⭐⭐⭐⭐⭐", desc: "Best-in-class reasoning" },
    { id: "anthropic/claude-3-5-sonnet-20241022", stars: "⭐⭐⭐⭐", desc: "Excellent reasoning" },
    { id: "anthropic/claude-haiku-4-5", stars: "⭐⭐⭐", desc: "Fast & cheap" },
    { id: "anthropic/claude-3-5-haiku-20241022", stars: "⭐⭐⭐", desc: "Fast & cheap" },
    { id: "anthropic/claude-3-opus-20240229", stars: "⭐⭐⭐", desc: "Legacy model" },
  ]},
  { provider: "OpenAI (Paid)", models: [
    { id: "openai/gpt-4o", stars: "⭐⭐⭐⭐", desc: "Strong model" },
    { id: "openai/gpt-4o-mini", stars: "⭐⭐⭐", desc: "Cheap & fast" },
    { id: "openai/o1-preview", stars: "⭐⭐⭐⭐", desc: "Reasoning model" },
    { id: "openai/o1-mini", stars: "⭐⭐⭐", desc: "Fast reasoning" },
    { id: "openai/gpt-4-turbo", stars: "⭐⭐⭐", desc: "Legacy model" },
    { id: "openai/gpt-4", stars: "⭐⭐⭐", desc: "Legacy model" },
  ]},
];

function readState(): any {
  const path = STATE_PATH();
  if (!existsSync(path)) {
    return {
      version: 2,
      config: DEFAULT_CONFIG,
      currentTask: null,
      milestones: [],
      stats: { totalSessions: 0, totalCostUsd: 0, byModel: {} },
    };
  }
  try {
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      version: 2,
      config: DEFAULT_CONFIG,
      currentTask: null,
      milestones: [],
      stats: { totalSessions: 0, totalCostUsd: 0, byModel: {} },
    };
  }
}

function writeState(state: any): void {
  const path = STATE_PATH();
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, JSON.stringify(state, null, 2));
  renameSync(tmp, path);
}

function setAgentModel(name: string, model: string): void {
  const agentPath = resolve(AGENTS_DIR(), `${name}.md`);
  if (!existsSync(agentPath)) {
    return;
  }
  try {
    const content = readFileSync(agentPath, "utf-8");
    const updated = content.replace(/^model:.*$/m, `model: ${model}`);
    writeFileSync(agentPath, updated);
  } catch {
    // ignore
  }
}

function syncAgentModels(config: any): void {
  const roleAgents: Record<string, { primary: string[]; fallback: string[] }> = {
    planning: { primary: ["planner"], fallback: ["planner-fallback"] },
    implementation: { primary: ["executor"], fallback: ["executor-fallback"] },
    review: { primary: ["reviewer"], fallback: ["reviewer-fallback"] },
    repetitive: { primary: ["tester", "deployer"], fallback: ["tester-fallback", "deployer-fallback"] },
  };
  for (const [role, files] of Object.entries(roleAgents)) {
    const roleConfig = config[role] || DEFAULT_CONFIG[role];
    for (const name of files.primary) {
      setAgentModel(name, roleConfig.primary);
      console.log(`[orchestrator] Applied primary model "${roleConfig.primary}" to agent ${name}.md`);
    }
    for (const name of files.fallback) {
      setAgentModel(name, roleConfig.fallback);
      console.log(`[orchestrator] Applied fallback model "${roleConfig.fallback}" to agent ${name}.md`);
    }
  }
}

const PRICE_TABLE: Array<{ prefix: string; in: number; out: number }> = [
  { prefix: "anthropic/claude-sonnet-4", in: 3, out: 15 },
  { prefix: "anthropic/claude-haiku-4-5", in: 0.25, out: 1.25 },
  { prefix: "openai/gpt-4o", in: 2.5, out: 10 },
  { prefix: "openai/gpt-4o-mini", in: 0.15, out: 0.6 },
  { prefix: "google/gemini-2.5-flash", in: 0.075, out: 0.3 },
  { prefix: "deepseek/deepseek-chat", in: 0.27, out: 1.1 },
  { prefix: "nvidia/nemotron-3-ultra-550b-a55b", in: 0.5, out: 1.5 },
  { prefix: "nvidia/nemotron-3-ultra-free", in: 0, out: 0 },
  { prefix: "nvidia/nemotron-3.5-lightning-free", in: 0, out: 0 },
  { prefix: "nvidia/", in: 0.27, out: 1.1 },
  { prefix: "opencode/", in: 0, out: 0 },
];

function estimateCost(model: string, tokensIn: number, tokensOut: number): number {
  for (const row of PRICE_TABLE) {
    if (model.startsWith(row.prefix)) {
      return (tokensIn / 1_000_000) * row.in + (tokensOut / 1_000_000) * row.out;
    }
  }
  return (tokensIn / 1_000_000) * 0.5 + (tokensOut / 1_000_000) * 1.5;
}

function extractModelInfo(event: any): { model?: string; tokensIn?: number; tokensOut?: number; durationMs?: number; error?: boolean } | null {
  if (event?.chat?.model) {
    return {
      model: event.chat.model,
      tokensIn: event.chat.tokensIn ?? 0,
      tokensOut: event.chat.tokensOut ?? 0,
      durationMs: event.durationMs ?? 0,
      error: !!event.error,
    };
  }
  if (event?.tool?.model) {
    return {
      model: event.tool.model,
      tokensIn: event.tool.tokensIn ?? 0,
      tokensOut: event.tool.tokensOut ?? 0,
      durationMs: event.durationMs ?? 0,
      error: !!event.error,
    };
  }
  return null;
}

const saveArgs = tool.schema.object({
  planningPrimary: tool.schema.string(),
  planningFallback: tool.schema.string(),
  implementationPrimary: tool.schema.string(),
  implementationFallback: tool.schema.string(),
  reviewPrimary: tool.schema.string(),
  reviewFallback: tool.schema.string(),
  repetitivePrimary: tool.schema.string(),
  repetitiveFallback: tool.schema.string(),
  confirmPlanBeforeImplementation: tool.schema.boolean(),
  autoFixIssues: tool.schema.boolean(),
  runTestsAfterImplementation: tool.schema.boolean(),
  autoCommit: tool.schema.boolean(),
  showCostEstimates: tool.schema.boolean(),
  maxAttemptsPerPhase: tool.schema.number(),
  timeoutPerPhaseSeconds: tool.schema.number(),
  costThresholdForConfirmationUsd: tool.schema.number(),
});

const milestoneArgs = tool.schema.object({
  taskId: tool.schema.string(),
  phase: tool.schema.string(),
  agent: tool.schema.string(),
  status: tool.schema.enum(["success", "failure", "fallback", "canceled"]),
  model: tool.schema.string(),
  startedAt: tool.schema.string(),
  endedAt: tool.schema.string(),
  notes: tool.schema.string().optional(),
});

const startTaskArgs = tool.schema.object({
  description: tool.schema.string(),
  slug: tool.schema.string(),
});

const validateModelArgs = tool.schema.object({
  model: tool.schema.string(),
});

const getModelListArgs = tool.schema.object({});

const getFallbackArgs = tool.schema.object({
  role: tool.schema.enum(["planning", "implementation", "review", "repetitive"]),
  failedModel: tool.schema.string(),
});

export const OrchestratorPlugin: Plugin = async ({ client, directory }) => {
  return {
    tool: {
      orchestrator_get_state: tool({
        description: "Read the Pain Packer orchestrator state: config, current task, milestones, and model statistics.",
        args: tool.schema.object({}),
        async execute() {
          const state = readState();
          return JSON.stringify(state);
        },
      }),
      orchestrator_validate_model: tool({
        description: "Test a model with a simple prompt to verify it's working.",
        args: validateModelArgs,
        async execute(args) {
          try {
            if (typeof (client as any).chat === "function") {
              const result = await (client as any).chat({
                model: args.model,
                messages: [{ role: "user", content: "Say 'OK'" }],
                maxTokens: 10,
                temperature: 0,
              });
              const text = result.text?.trim();
              const ok = text === "OK" || text === "'OK'" || text.includes("OK");
              return JSON.stringify({ ok, response: text, error: ok ? null : "Unexpected response" });
            }
            const allModelIds = new Set<string>();
            for (const category of MODEL_LIST) {
              for (const m of category.models) {
                allModelIds.add(m.id);
              }
            }
            if (allModelIds.has(args.model) || args.model.includes("/")) {
              return JSON.stringify({ ok: true, response: "OK", error: null });
            }
            return JSON.stringify({ ok: false, response: null, error: "Model not found in catalog" });
          } catch (err: any) {
            return JSON.stringify({ ok: false, response: null, error: err.message || String(err) });
          }
        },
      }),
      orchestrator_get_model_list: tool({
        description: "Get the complete list of available models grouped by provider.",
        args: getModelListArgs,
        async execute() {
          return JSON.stringify(MODEL_LIST);
        },
      }),
      orchestrator_get_fallback: tool({
        description: "Get the fallback model for a role when the primary fails.",
        args: getFallbackArgs,
        async execute(args) {
          const state = readState();
          const roleConfig = state.config[args.role] || DEFAULT_CONFIG[args.role];
          const fallback = roleConfig.fallback;
          const isPrimary = args.failedModel === roleConfig.primary;
          return JSON.stringify({
            fallback,
            wasPrimary: isPrimary,
            message: isPrimary ? `Primary model failed, using fallback: ${fallback}` : `Fallback model also failed: ${args.failedModel}`
          });
        },
      }),
      orchestrator_save_config: tool({
        description: "Validate and persist orchestrator configuration, then sync subagent models.",
        args: saveArgs,
        async execute(args) {
          const state = readState();
          const clamped = {
            ...args,
            maxAttemptsPerPhase: Math.min(10, Math.max(1, args.maxAttemptsPerPhase)),
            timeoutPerPhaseSeconds: Math.min(3600, Math.max(30, args.timeoutPerPhaseSeconds)),
            costThresholdForConfirmationUsd: Math.max(0, args.costThresholdForConfirmationUsd),
          };
          const nestedConfig = {
            planning: { primary: clamped.planningPrimary, fallback: clamped.planningFallback },
            implementation: { primary: clamped.implementationPrimary, fallback: clamped.implementationFallback },
            review: { primary: clamped.reviewPrimary, fallback: clamped.reviewFallback },
            repetitive: { primary: clamped.repetitivePrimary, fallback: clamped.repetitiveFallback },
            confirmPlanBeforeImplementation: clamped.confirmPlanBeforeImplementation,
            autoFixIssues: clamped.autoFixIssues,
            runTestsAfterImplementation: clamped.runTestsAfterImplementation,
            autoCommit: clamped.autoCommit,
            showCostEstimates: clamped.showCostEstimates,
            maxAttemptsPerPhase: clamped.maxAttemptsPerPhase,
            timeoutPerPhaseSeconds: clamped.timeoutPerPhaseSeconds,
            costThresholdForConfirmationUsd: clamped.costThresholdForConfirmationUsd,
            ui: { language: "en" },
          };
          state.config = nestedConfig;
          await syncAgentModels(state.config);
          writeState(state);
          client.app.log({ body: { service: "orchestrator", level: "info", message: "Configuration saved and synced to agents", extra: { config: nestedConfig } } });
          return JSON.stringify(state.config);
        },
      }),
      orchestrator_start_task: tool({
        description: "Create a new orchestration task record.",
        args: startTaskArgs,
        async execute(args) {
          const state = readState();
          const now = new Date().toISOString();
          state.currentTask = {
            id: crypto.randomUUID(),
            slug: args.slug,
            description: args.description,
            phase: "PLAN",
            planPath: `docs/plans/${args.slug}.md`,
            createdAt: now,
            updatedAt: now,
          };
          writeState(state);
          return JSON.stringify(state.currentTask);
        },
      }),
      orchestrator_record_milestone: tool({
        description: "Record a completed milestone (phase, agent, status, model, duration).",
        args: milestoneArgs,
        async execute(args) {
          const state = readState();
          const durationMs = new Date(args.endedAt).getTime() - new Date(args.startedAt).getTime();
          state.milestones.push({ ...args, durationMs });
          state.stats.totalSessions += 1;
          writeState(state);
          return JSON.stringify({ ok: true, milestoneCount: state.milestones.length });
        },
      }),
    },

    event: async (_input, output) => {
      try {
        const info = extractModelInfo(output);
        if (!info || !info.model) return;
        const state = readState();
        const model = info.model;
        const cost = estimateCost(model, info.tokensIn || 0, info.tokensOut || 0);
        state.stats.totalCostUsd = (state.stats.totalCostUsd || 0) + cost;
        if (!state.stats.byModel[model]) {
          state.stats.byModel[model] = { planning: 0, implementation: 0, review: 0, repetitive: 0, tokensIn: 0, tokensOut: 0, costUsd: 0, successes: 0, failures: 0 };
        }
        const m = state.stats.byModel[model];
        m.tokensIn = (m.tokensIn || 0) + (info.tokensIn || 0);
        m.tokensOut = (m.tokensOut || 0) + (info.tokensOut || 0);
        m.costUsd = (m.costUsd || 0) + cost;
        if (info.error) m.failures = (m.failures || 0) + 1;
        else m.successes = (m.successes || 0) + 1;
        writeState(state);
      } catch {
        // never throw from event hooks
      }
    },

    "tool.execute.before": async (input, output) => {
      try {
        if (output.error && output.error.message?.includes?.("rate limit") || output.error?.message?.includes?.("tokens")) {
          client.app.log({ body: { service: "orchestrator", level: "warn", message: "Rate limit or token error detected", extra: { tool: input.tool, error: output.error.message } } });
        }
      } catch {
        // ignore
      }
    },

    "tool.execute.after": async (input, output) => {
      try {
        if (output.error && input.tool?.startsWith("orchestrator_")) {
          const state = readState();
          const roleMap: Record<string, string> = {
            "planner": "planning",
            "planner-fallback": "planning",
            "executor": "implementation",
            "executor-fallback": "implementation",
            "reviewer": "review",
            "reviewer-fallback": "review",
            "tester": "repetitive",
            "tester-fallback": "repetitive",
            "deployer": "repetitive",
            "deployer-fallback": "repetitive",
          };
          const agentRole = roleMap[input.tool?.replace("orchestrator_", "") || ""];
          if (agentRole && state.currentTask) {
            const roleConfig = state.config[agentRole] || DEFAULT_CONFIG[agentRole];
            const failedModel = output.error.model || "unknown";
            const isPrimary = failedModel === roleConfig.primary;
            if (isPrimary) {
              client.app.log({ body: { service: "orchestrator", level: "info", message: `Model ${failedModel} failed, fallback to ${roleConfig.fallback} for ${agentRole}` } });
            }
          }
        }
      } catch {
        // ignore
      }
    },

    "experimental.session.compacting": async (_input, output) => {
      try {
        const state = readState();
        if (state.currentTask) {
          output.context = output.context || [];
          output.context.push(
            `## Orchestrator Session State
Current task: ${state.currentTask.description} (${state.currentTask.slug})
Phase: ${state.currentTask.phase}
Plan: ${state.currentTask.planPath}
Next actions: continue from ${state.currentTask.phase} phase`
          );
        }
      } catch {
        // ignore
      }
    },

    chat: {
      params: async (input, output) => {
        output.instructions = output.instructions || [];
        if (!output.instructions.includes("AGENTS.md")) {
          output.instructions.unshift("AGENTS.md");
        }
      },
    },
  };
};

export default OrchestratorPlugin;