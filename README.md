# agy-hud

A real-time statusline HUD for Antigravity CLI that shows what's happening — context usage, active tools, running agents, and todo progress. Always visible below your input.

[![License](https://img.shields.io/github/license/lllopic/agy-hud?v=2)](LICENSE)
[![Stars](https://img.shields.io/github/stars/lllopic/agy-hud)](https://github.com/lllopic/agy-hud/stargazers)

> 🌐 English | [中文文档](README.zh.md)

## Install

Inside an Antigravity CLI instance, run the following commands:

**Step 1: Add the marketplace**
```
/plugin marketplace add lllopic/agy-hud
```

**Step 2: Install the plugin**

<details>
<summary><strong>⚠️ Linux users: Click here first</strong></summary>

On Linux, `/tmp` is often a separate filesystem (tmpfs), which causes plugin installation to fail with:
```
EXDEV: cross-device link not permitted
```

**Fix**: Set TMPDIR before installing:
```bash
mkdir -p ~/.cache/tmp && TMPDIR=~/.cache/tmp agy
```

Then run the install command below in that session.

</details>

```
/plugin install agy-hud
```

After that, reload plugins:

```
/reload-plugins
```


**Step 3: Configure the statusline**
```
/agy-hud:setup
```

<details>
<summary><strong>⚠️ Windows users: Click here if setup says no JavaScript runtime was found</strong></summary>

On Windows, Node.js LTS is the supported runtime for agy-hud setup. If setup says no JavaScript runtime was found, install Node.js for your shell first:
```powershell
winget install OpenJS.NodeJS.LTS
```
Then restart your shell and run `/agy-hud:setup` again.

</details>

Done! Restart Antigravity CLI to load the new statusLine config, then the HUD will appear.

---

## What is agy-hud?

agy-hud gives you better insights into what's happening in your Antigravity CLI session.

| What You See | Why It Matters |
|--------------|----------------|
| **Project path** | Know which project you're in (configurable 1-3 directory levels) |
| **Context health** | Know exactly how full your context window is before it's too late |
| **Tool activity** | Watch the agent read, edit, and search files as it happens |
| **Agent tracking** | See which subagents are running and what they're doing |
| **Todo progress** | Track task completion in real-time |

## What You See

### Default (2 lines)
```
[Gemini 1.5 Pro] │ my-project git:(main*)
Context █████░░░░░ 45%
```
- **Line 1** — Model name, project path, git branch
- **Line 2** — Context bar (green → yellow → red)

### Optional lines (enable via `/agy-hud:configure`)
```
◐ Edit: auth.ts | ✓ Read ×3 | ✓ Grep ×2        ← Tools activity
◐ explore [haiku]: Finding auth code (2m 15s)    ← Agent status
▸ Fix authentication bug (2/5)                   ← Todo progress
```

---

## How It Works

agy-hud uses Antigravity CLI's native **statusline API** — no separate window, no tmux required, works in any terminal.

```
Antigravity CLI → stdin JSON → agy-hud → stdout → displayed in your terminal
              ↘ transcript JSONL (tools, agents, todos)
```

**Key features:**
- Native token data from Antigravity CLI (not estimated)
- Scales with reported context window size, including newer 1M-context sessions
- Parses the transcript for tool/agent activity
- Updates every ~300ms

---

## Configuration

Customize your HUD anytime:

```
/agy-hud:configure
```

The guided flow handles layout, language, and common display toggles. Advanced overrides such as custom colors and thresholds are preserved there, but you set them by editing the config file directly:

- **First time setup**: Choose a preset (Full/Essential/Minimal), pick a label language, then fine-tune individual elements
- **Customize anytime**: Toggle items on/off, adjust git display style, switch layouts, or change label language
- **Preview before saving**: See exactly how your HUD will look before committing changes

### Presets

| Preset | What's Shown |
|--------|--------------|
| **Full** | Everything enabled — tools, agents, todos, git, context, duration |
| **Essential** | Activity lines + git status, minimal info clutter |
| **Minimal** | Core only — just model name and context bar |

After choosing a preset, you can turn individual elements on or off.

### Manual Configuration

Edit `~/.gemini/antigravity-cli/plugins/agy-hud/config.json` directly for advanced settings such as `colors.*`, `pathLevels`, `maxWidth`, threshold overrides, `display.timeFormat`, and `display.promptCacheTtlSeconds`. Running `/agy-hud:configure` preserves those manual settings while still letting you change `language`, layout, and the common guided toggles.

Chinese HUD labels are available as an explicit opt-in. English stays the default unless you choose `中文` in `/agy-hud:configure` or set `language` in config. The short `zh` alias remains valid, and new guided config writes the canonical `zh-Hans` value.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `language` | `en` \| `zh` \| `zh-Hans` | `en` | HUD label language. English is the default; set `zh` or `zh-Hans` to enable Simplified Chinese labels. |
| `lineLayout` | string | `expanded` | Layout: `expanded` (multi-line) or `compact` (single line) |
| `pathLevels` | 1-3 | 1 | Directory levels to show in project path |
| `maxWidth` | number \| `null` | `null` | Optional fallback width used only when terminal width detection fails completely |
| `forceMaxWidth` | boolean | false | Always use `maxWidth` when it is set, even if terminal width detection returns a smaller value |
| `elementOrder` | string[] | `["project","context","usage","promptCache","memory","environment","tools","agents","todos","sessionTime"]` | Expanded-mode element order. Omit entries to hide them in expanded mode. Existing configs keep their explicit order until updated. |
| `display.mergeGroups` | string[][] | `[["context","usage"]]` | Expanded-mode groups that should share a line when adjacent. Set `[]` to disable merged lines. |
| `gitStatus.enabled` | boolean | true | Show git branch in HUD |
| `gitStatus.showDirty` | boolean | true | Show `*` for uncommitted changes |
| `gitStatus.showAheadBehind` | boolean | false | Show `↑N ↓N` for ahead/behind remote |
| `gitStatus.pushWarningThreshold` | number | 0 | Color the ahead count with the warning color at or above this unpushed-commit count (`0` disables it) |
| `gitStatus.pushCriticalThreshold` | number | 0 | Color the ahead count with the critical color at or above this unpushed-commit count (`0` disables it) |
| `gitStatus.showFileStats` | boolean | false | Show file change counts `!M +A ✘D ?U` |
| `gitStatus.branchOverflow` | `truncate` \| `wrap` | `truncate` | Keep current truncation behavior or let the git block wrap onto its own line boundary when possible |
| `display.showModel` | boolean | true | Show model name `[Gemini 1.5 Pro]` |
| `display.showAddedDirs` | boolean | true | Show extra workspace directories from `/add-dir` (e.g. `+sparkle +lib-foo`); empty array renders nothing. In both layouts at most 5 dirs render (overflow shown as `+N more`) and basenames are truncated to 24 chars with `…` |
| `display.addedDirsLayout` | `inline` \| `line` | `inline` | `inline` puts dirs next to the project name with a `+name` prefix per dir; `line` renders them on a separate `Added dirs: name1, name2` line (no `+` prefix, comma-separated) |
| `display.showContextBar` | boolean | true | Show visual context bar `████░░░░░░` |
| `display.contextValue` | `percent` \| `tokens` \| `remaining` \| `both` | `percent` | Context display format (`45%`, `45k/200k`, `55%` remaining, or `45% (45k/200k)`) |
| `display.showConfigCounts` | boolean | false | Show CLAUDE.md, rules, MCPs, hooks counts |
| `display.showCost` | boolean | false | Show session cost when available |
| `display.showOutputStyle` | boolean | false | Show the active output style from settings files |
| `display.showDuration` | boolean | false | Show session duration `⏱️ 5m` |
| `display.showSpeed` | boolean | false | Show output token speed `out: 42.1 tok/s` |
| `display.showUsage` | boolean | false | Show rate limit usage metrics |
| `display.showTokenBreakdown` | boolean | true | Show token details at high context (85%+) |
| `display.showTools` | boolean | false | Show tools activity line |
| `display.showAgents` | boolean | false | Show agents activity line |
| `display.showTodos` | boolean | false | Show todos progress line |
| `display.showSessionName` | boolean | false | Show session slug or custom title from `/rename` |
| `display.showSessionStartDate` | boolean | false | Show the transcript session start timestamp |
| `display.showLastResponseAt` | boolean | false | Show how long ago the last assistant response was written |
| `display.showClaudeCodeVersion` | boolean | false | Show the installed CLI version |
| `display.showMemoryUsage` | boolean | false | Show an approximate system RAM usage line in expanded layout |
| `colors.context` | color value | `green` | Base color for the context bar and context percentage |
| `colors.usage` | color value | `brightBlue` | Base color for usage bars and percentages below warning thresholds |
| `colors.warning` | color value | `yellow` | Warning color for context thresholds and usage warning text |
| `colors.usageWarning` | color value | `brightMagenta` | Warning color for usage bars and percentages near their threshold |
| `colors.critical` | color value | `red` | Critical color for limit-reached states and critical thresholds |
| `colors.model` | color value | `cyan` | Color for the model badge such as `[Gemini 1.5 Pro]` |
| `colors.project` | color value | `yellow` | Color for the project path |
| `colors.git` | color value | `magenta` | Color for git wrapper text such as `git:(` and `)` |
| `colors.gitBranch` | color value | `cyan` | Color for the git branch and branch status text |
| `colors.label` | color value | `dim` | Color for labels and secondary metadata such as `Context`, counts, and progress text |
| `colors.custom` | color value | `208` | Color for the optional custom line |
| `colors.barFilled` | string | `█` | Character used for the filled portion of progress bars |
| `colors.barEmpty` | string | `░` | Character used for the empty portion of progress bars |

Supported color names: `dim`, `red`, `green`, `yellow`, `magenta`, `cyan`, `brightBlue`, `brightMagenta`. You can also use a 256-color number (`0-255`) or hex (`#rrggbb`).

### Troubleshooting

**Config not applying?**
- Check for JSON syntax errors: invalid JSON silently falls back to defaults
- Ensure valid values: `pathLevels` must be 1, 2, or 3; `lineLayout` must be `expanded` or `compact`
- Delete config and run `/agy-hud:configure` to regenerate

**Git status missing?**
- Verify you're in a git repository
- Check `gitStatus.enabled` is not `false` in config

**Tool/agent/todo lines missing?**
- These are hidden by default — enable with `showTools`, `showAgents`, `showTodos` in config
- They also only appear when there's activity to show

**HUD not appearing after setup?**
- Restart Antigravity CLI so it picks up the new statusLine config

---

## Requirements

- Antigravity CLI v0.1.0+
- macOS/Linux: Node.js 18+ or Bun
- Windows: Node.js 18+

---

## Development

```bash
git clone https://github.com/lllopic/agy-hud
cd agy-hud
npm ci && npm run build
npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Attribution

`agy-hud` is a rebranded fork of the excellent [claude-hud](https://github.com/jarrodwatts/claude-hud) project by [Jarrod Watts](https://github.com/jarrodwatts), adapted for first-class compatibility with the Antigravity CLI. Both the original work and these modifications are licensed under the MIT License.

---

## License

MIT — see [LICENSE](LICENSE)
