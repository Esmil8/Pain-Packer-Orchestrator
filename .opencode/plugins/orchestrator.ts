import { tool, type Plugin } from "@opencode-ai/plugin";
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { resolve, dirname } from "node:path";

const STATE_PATH = () => resolve(process.cwd(), ".opencode", "state", "plugin-orchestrator.json");
const AGENTS_DIR = () => resolve(process.cwd(), ".opencode", "agents");

const DEFAULT_CONFIG = {
  planning: { primary: "opencode/big-pickle", fallback: "nvidia/nemotron-3-ultra-550b-a55b" },
  implementation: { primary: "opencode/nemotron-3.5-lightning-free", fallback: "deepseek/deepseek-chat" },
  review: { primary: "opencode/big-pickle", fallback: "nvidia/nemotron-3-ultra-550b-a55b" },
  repetitive: { primary: "opencode/nemotron-3.5-lightning-free", fallback: "opencode/grok-code-fast-1" },
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

type ModelEntry = { id: string; provider: string; available: boolean };
type ModelCategory = { provider: string; models: ModelEntry[] };

function normalizeModelId(modelId: string): string {
  const id = modelId.trim();
  if (!id) return id;
  return id.includes("/") ? id : `opencode/${id}`;
}

let modelCache: ModelCategory[] | null = null;
let modelCacheTimestamp = 0;
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

async function discoverModels(client: any): Promise<ModelCategory[]> {
  const now = Date.now();
  if (modelCache && now - modelCacheTimestamp < MODEL_CACHE_TTL_MS) {
    return modelCache;
  }

  try {
    const providers = await client.config?.providers();
    const list = providers?.providers ?? providers?.data?.providers ?? providers?.data;
    if (Array.isArray(list) && list.length > 0) {
      const categories: ModelCategory[] = [];
      for (const provider of list) {
        const models = provider.models;
        if (!models || Object.keys(models).length === 0) continue;
        const entries: ModelEntry[] = Object.entries(models).map(([key, m]: [string, any]) => ({
          id: normalizeModelId((m?.id ?? key) as string),
          provider: provider.id ?? key.split("/")[0] ?? "unknown",
          available: true,
        }));
        categories.push({ provider: provider.name ?? provider.id, models: entries });
      }
      if (categories.length > 0) {
        modelCache = categories;
        modelCacheTimestamp = now;
        return modelCache;
      }
    }
  } catch {
    // fall through to curated fallback
  }

  return getCuratedFallback();
}

function getCuratedFallback(): ModelCategory[] {
  return [
    { provider: "OpenCode", models: [
      { id: "opencode/big-pickle", provider: "opencode", available: true },
      { id: "opencode/grok-code-fast-1", provider: "opencode", available: true },
      { id: "opencode/nemotron-3-ultra-free", provider: "opencode", available: true },
      { id: "opencode/nemotron-3.5-lightning-free", provider: "opencode", available: true },
    ]},
    { provider: "NVIDIA", models: [
      { id: "nvidia/nemotron-3-ultra-550b-a55b", provider: "nvidia", available: true },
      { id: "nvidia/nemotron-3-ultra-free", provider: "nvidia", available: true },
      { id: "nvidia/nemotron-3.5-lightning-free", provider: "nvidia", available: true },
    ]},
    { provider: "DeepSeek", models: [
      { id: "deepseek/deepseek-chat", provider: "deepseek", available: true },
      { id: "deepseek/deepseek-reasoner", provider: "deepseek", available: true },
    ]},
    { provider: "Google", models: [
      { id: "google/gemini-2.5-flash", provider: "google", available: true },
      { id: "google/gemini-2.5-pro", provider: "google", available: true },
    ]},
    { provider: "Anthropic", models: [
      { id: "anthropic/claude-sonnet-4", provider: "anthropic", available: true },
      { id: "anthropic/claude-haiku-4-5", provider: "anthropic", available: true },
    ]},
    { provider: "OpenAI", models: [
      { id: "openai/gpt-4o", provider: "openai", available: true },
      { id: "openai/gpt-4o-mini", provider: "openai", available: true },
    ]},
  ];
}

async function validateModelViaAPI(modelId: string): Promise<{ ok: boolean; response?: string; error?: string }> {
  const provider = modelId.split("/")[0] ?? "unknown";
  const endpoints: Record<string, string> = {
    opencode: "https://api.opencode.ai/v1/chat/completions",
    anthropic: "https://api.anthropic.com/v1/messages",
    openai: "https://api.openai.com/v1/chat/completions",
    google: "https://generativelanguage.googleapis.com/v1beta/models",
  };
  const endpoint = endpoints[provider] || `https://openrouter.ai/api/v1/chat/completions`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: "Say OK" }],
        max_tokens: 10,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = await res.json() as any;
    const text = data.choices?.[0]?.message?.content?.trim()
      ?? data.content?.[0]?.text?.trim()
      ?? "";
    if (text.includes("OK")) {
      return { ok: true, response: text };
    }
    return { ok: false, response: text, error: "Unexpected response" };
  } catch (err: any) {
    return { ok: false, error: err.message || String(err) };
  }
}

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
    const normalized = normalizeModelId(model);
    let updated: string;
    if (/^model:.*$/m.test(content)) {
      updated = content.replace(/^model:.*$/m, `model: ${normalized}`);
    } else {
      updated = content.replace(/^mode:\s*[\w-]+$/m, (match: string) => `${match}\nmodel: ${normalized}`);
    }
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
    }
    for (const name of files.fallback) {
      setAgentModel(name, roleConfig.fallback);
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
        description: "Test a model with a simple prompt to verify it's working. Sends 'Say OK' and checks the response.",
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
            return JSON.stringify(await validateModelViaAPI(args.model as string));
          } catch (err: any) {
            return JSON.stringify({ ok: false, response: null, error: err.message || String(err) });
          }
        },
      }),
      orchestrator_get_model_list: tool({
        description: "Get the complete list of available models grouped by provider. Uses dynamic discovery with 5-minute cache.",
        args: getModelListArgs,
        async execute() {
          const categories = await discoverModels(client);
          return JSON.stringify(categories);
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
          const normalized = {
            planningPrimary: normalizeModelId(clamped.planningPrimary),
            planningFallback: normalizeModelId(clamped.planningFallback),
            implementationPrimary: normalizeModelId(clamped.implementationPrimary),
            implementationFallback: normalizeModelId(clamped.implementationFallback),
            reviewPrimary: normalizeModelId(clamped.reviewPrimary),
            reviewFallback: normalizeModelId(clamped.reviewFallback),
            repetitivePrimary: normalizeModelId(clamped.repetitivePrimary),
            repetitiveFallback: normalizeModelId(clamped.repetitiveFallback),
          };
          const modelFields: Array<[string, string]> = [
            ["planningPrimary", normalized.planningPrimary],
            ["planningFallback", normalized.planningFallback],
            ["implementationPrimary", normalized.implementationPrimary],
            ["implementationFallback", normalized.implementationFallback],
            ["reviewPrimary", normalized.reviewPrimary],
            ["reviewFallback", normalized.reviewFallback],
            ["repetitivePrimary", normalized.repetitivePrimary],
            ["repetitiveFallback", normalized.repetitiveFallback],
          ];
          const knownModels = new Set<string>();
          const categories = await discoverModels(client);
          for (const category of categories) {
            for (const m of category.models) {
              knownModels.add(m.id);
            }
          }
          if (knownModels.size > 0) {
            const unknown = modelFields.filter(([field, model]) => !knownModels.has(model));
            if (unknown.length > 0) {
              const names = unknown.map(([field, model]) => `${field}=${model}`).join(", ");
              return JSON.stringify({
                ok: false,
                error: `Unknown models: ${names}. Run orchestrator_get_model_list first or validate with orchestrator_validate_model.`,
              });
            }
          }
          const nestedConfig = {
            planning: { primary: normalized.planningPrimary, fallback: normalized.planningFallback },
            implementation: { primary: normalized.implementationPrimary, fallback: normalized.implementationFallback },
            review: { primary: normalized.reviewPrimary, fallback: normalized.reviewFallback },
            repetitive: { primary: normalized.repetitivePrimary, fallback: normalized.repetitiveFallback },
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
          return JSON.stringify({ ok: true, config: state.config });
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