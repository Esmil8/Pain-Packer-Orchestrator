# Project Conventions (Pain Packer Orchestrator)

This document defines the coding conventions and patterns that all agents must follow when generating code in this project.

## Language

- All code, identifiers, function names, class names, variable names: **English only**
- All comments and documentation strings: **English only**
- Commit messages: **English only** (Conventional Commits)
- Terminal/UI output: **English only**
- API endpoints, DTOs, schema: **English only**

## TypeScript Style

- Use `const` by default, `let` only when reassignment is needed
- Prefer `type` over `interface` for simple shapes
- Use Zod for runtime validation schemas
- Use `async/await` over Promise chains
- Early returns to reduce nesting
- No `any` - use `unknown` or proper types
- Explicit return types for public functions

## File Organization

- One main export per file (default or named)
- Co-locate types with their usage
- Test files: `*.test.ts` next to source or in `tests/`
- Scripts in `scripts/` use `.mts` extension

## Git / Commits

- Conventional Commits: `type(scope): subject`
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`
- Scope: module name (e.g., `appointments`, `orchestrator`, `config`)
- Subject: imperative mood, lowercase, no period
- One logical change per commit

## Error Handling

- Use Result types or throw typed errors
- Never swallow errors silently
- Log context with structured data
- Validation at boundaries (input/output)

## Testing

- Unit tests for pure logic (config, registry, cache, gates)
- Integration tests for git/run tools (mocked)
- Test file naming: `*.test.ts`
- Use Vitest

## OpenCode Agent Patterns

- Agents receive context via `task` tool delegation
- Subagents must return structured output (JSON when possible)
- Use native tools: `read`, `write`, `edit`, `bash`, `glob`, `grep`, `question`
- No external dependencies in agent prompts unless documented

## Configuration

- `.orchestrator-config.json` is the single source of truth for models/workflow
- `apply-config` syncs config to agent frontmatter
- All paths relative to project root