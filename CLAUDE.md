# CLAUDE.md

This file provides guidance to coding assistants when working with this repository.

## Project Overview

agy-hud is a statusline HUD plugin for Antigravity CLI that displays a real-time multi-line statusline. It shows context health, tool activity, agent status, and todo progress.

## Build Commands

```bash
npm ci               # Install dependencies
npm run build        # Build TypeScript to dist/
npm test             # Run test suite
```

## Architecture

### Data Flow

```
Antigravity CLI → stdin JSON → parse → render lines → stdout → Displayed below input
              ↘ transcript_path → parse JSONL → tools/agents/todos
```

**Key insight**: The statusline is invoked every ~300ms by the CLI. Each invocation:
1. Receives JSON via stdin (model, context, tokens - native accurate data)
2. Parses the transcript JSONL file for tools, agents, and todos
3. Renders multi-line output to stdout
4. The CLI displays all lines

### Data Sources

**Native from stdin JSON**:
- `model.display_name` - Current model
- `context_window.current_usage` - Token counts
- `context_window.context_window_size` - Max context
- `transcript_path` - Path to session transcript

**From transcript JSONL parsing**:
- `tool_use` blocks → tool name, input, start time
- `tool_result` blocks → completion, duration
- Running tools = `tool_use` without matching `tool_result`
- `TodoWrite` calls → todo list
- `Task` calls → agent info

**From config files**:
- MCP count from settings (mcpServers)
- Hooks count from settings (hooks)
- Rules count from CLAUDE.md/AGY.md files

### File Structure

```
src/
├── index.ts           # Entry point
├── stdin.ts           # Parse JSON input
├── transcript.ts      # Parse transcript JSONL
├── config-reader.ts   # Read MCP/rules configs
├── config.ts          # Load/validate user config
├── git.ts             # Git status (branch, dirty, ahead/behind)
├── types.ts           # TypeScript interfaces
└── render/
    ├── index.ts       # Main render coordinator
    ├── session-line.ts   # Compact mode: single line with all info
    ├── tools-line.ts     # Tool activity (opt-in)
    ├── agents-line.ts    # Agent status (opt-in)
    ├── todos-line.ts     # Todo progress (opt-in)
    ├── colors.ts         # ANSI color helpers
    └── lines/
        ├── index.ts      # Barrel export
        ├── project.ts    # Line 1: model bracket + project + git
        ├── identity.ts   # Line 2a: context bar
        ├── usage.ts      # Line 2b: usage bar (combined with identity)
        └── environment.ts # Config counts (opt-in)
```

### Context Thresholds

| Threshold | Color | Action |
|-----------|-------|--------|
| <70% | Green | Normal |
| 70-85% | Yellow | Warning |
| >85% | Red | Show token breakdown |

## Plugin Configuration

The plugin manifest is in `.antigravity-plugin/plugin.json` (metadata only - name, description, version, author).

**StatusLine configuration** must be added to the user's settings via `/agy-hud:setup`.

## Dependencies

- **Runtime**: Node.js 18+ or Bun
- **Build**: TypeScript 5, ES2022 target, NodeNext modules
