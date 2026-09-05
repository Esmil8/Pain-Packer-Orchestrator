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
    for (const name of files.primary) setAgentModel(name, roleConfig.primary);
    for (const name of files.fallback) setAgentModel(name, roleConfig.fallback);
  }
}

const PRICE_TABLE: Array<{ prefix: string; in: number; out: number }> = [
  { prefix: "anthropic/claude-sonnet-4", in: 3, out: 15 },
  { prefix: "anthropic/claude-haiku-4-5", in: 0.25, out: 1.25 },
  { prefix: "openai/gpt-4o", in: 2.5, out: 10 },
  { prefix: "openai/gpt-4o-mini", in: 0.15, out: 0.6 },
  { prefix: "google/gemini-2.5-flash", in: 0.075, out: 0.3 },
  { prefix: "deepseek/deepseek-chat", in: 0.27, out: 1.1 },
  { prefix: "nvidia/nemotron-70b", in: 0.5, out: 1.5 },
  { prefix: "opencode/", in: 0.25, out: 1.0 },
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
          state.config = { ...clamped, ui: { language: "en" } };
          await syncAgentModels(state.config);
          writeState(state);
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