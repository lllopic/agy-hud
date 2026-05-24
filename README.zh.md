# agy-hud

一个用于 Antigravity CLI 的实时状态栏 HUD 插件，实时显示正在发生的事情——上下文使用率、活跃工具、运行中的 Agent 和待办进度。始终在你的输入下方可见。

[![License](https://img.shields.io/github/license/lllopic/agy-hud?v=2)](LICENSE)
[![Stars](https://img.shields.io/github/stars/lllopic/agy-hud)](https://github.com/lllopic/agy-hud/stargazers)

> 🌐 [English README](README.md) | 中文文档

## 安装

在 Antigravity CLI 实例中，运行以下命令：

**步骤 1：添加市场**
```
/plugin marketplace add lllopic/agy-hud
```

**步骤 2：安装插件**

<details>
<summary><strong>⚠️ Linux 用户：请先点击此处</strong></summary>

在 Linux 上，`/tmp` 通常是独立的文件系统（tmpfs），这会导致插件安装失败并报错：
```
EXDEV: cross-device link not permitted
```

**修复方法**：在安装前设置 TMPDIR：
```bash
mkdir -p ~/.cache/tmp && TMPDIR=~/.cache/tmp agy
```

然后在该会话中运行下面的安装命令。

</details>

```
/plugin install agy-hud
```

安装完成后，重新加载插件：

```
/reload-plugins
```

**步骤 3：配置状态栏**
```
/agy-hud:setup
```

<details>
<summary><strong>⚠️ Windows 用户：如果 setup 提示未找到 JavaScript 运行时，请点击此处</strong></summary>

在 Windows 上，agy-hud setup 支持的运行时是 Node.js LTS。如果 setup 提示未找到 JavaScript 运行时，请先为你的 shell 安装 Node.js：
```powershell
winget install OpenJS.NodeJS.LTS
```
然后重启 shell 并再次运行 `/agy-hud:setup`。

</details>

完成！重启 Antigravity CLI 以加载新的 statusLine 配置，HUD 将会出现。

---

## 什么是 agy-hud？

agy-hud 让你在 Antigravity CLI 会话中获得更清晰的洞察。

| 你看到的内容 | 为什么重要 |
|--------------|------------|
| **项目路径** | 知道你当前在哪个项目中（可配置 1-3 级目录深度） |
| **上下文健康度** | 在上下文窗口满之前准确了解还剩多少 |
| **工具活动** | 实时观察 Agent 读取、编辑和搜索文件 |
| **Agent 追踪** | 查看哪些子 Agent 正在运行以及它们在做什么 |
| **待办进度** | 实时跟踪任务完成情况 |

## 显示效果

### 默认（2 行）
```
[Gemini 1.5 Pro] │ my-project git:(main*)
上下文 █████░░░░░ 45%
```
- **第 1 行** — 模型名称、项目路径、git 分支
- **第 2 行** — 上下文进度条（绿 → 黄 → 红）

### 可选行（通过 `/agy-hud:configure` 启用）
```
◐ Edit: auth.ts | ✓ Read ×3 | ✓ Grep ×2        ← 工具活动
◐ explore [haiku]: 查找认证代码（2分15秒）       ← Agent 状态
▸ 修复认证漏洞（2/5）                             ← 待办进度
```

---

## 工作原理

agy-hud 使用 Antigravity CLI 原生的 **statusline API**——无需独立窗口，不需要 tmux，在任何终端都能工作。

```
Antigravity CLI → stdin JSON → agy-hud → stdout → 在终端中显示
              ↘ transcript JSONL（工具、Agent、待办）
```

**核心特性：**
- 来自 Antigravity CLI 的原生 Token 数据（非估算）
- 自动适配上下文窗口大小，包括最新的 1M 上下文会话
- 解析转录文件以获取工具/Agent 活动
- 约每 300ms 更新一次

---

## 配置

随时自定义你的 HUD：

```
/agy-hud:configure
```

引导式配置涵盖布局、语言和常用显示开关。高级选项如自定义颜色和阈值仍然保留，但你需要直接编辑配置文件来设置它们：

- **首次设置**：选择预设（完整/核心/极简），选择标签语言，然后微调各个元素
- **随时自定义**：开关各项、调整 Git 显示样式、切换布局或更改标签语言
- **保存前预览**：在提交更改前精确预览 HUD 的效果

### 预设

| 预设 | 显示内容 |
|------|----------|
| **完整（Full）** | 全部启用——工具、Agent、待办、Git、上下文、时长 |
| **核心（Essential）** | 活动行 + Git 状态，减少信息冗余 |
| **极简（Minimal）** | 仅核心——只有模型名称和上下文进度条 |

选择预设后，你可以单独开启或关闭各个元素。

### 手动配置

直接编辑 `~/.gemini/antigravity-cli/plugins/agy-hud/config.json` 来配置高级选项，如 `colors.*`、`pathLevels`、`maxWidth`、阈值覆盖、`display.timeFormat` 以及 `display.promptCacheTtlSeconds`。运行 `/agy-hud:configure` 时会保留这些手动设置，同时你仍可更改 `language`、布局和常用引导式开关。

中文 HUD 标签作为显式 opt-in 选项提供。除非你在 `/agy-hud:configure` 中选择 `中文` 或在配置中设置 `language`，否则默认使用英文。短别名 `zh` 仍然有效，新的引导式配置会写入规范值 `zh-Hans`。

### 选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `language` | `en` \| `zh` \| `zh-Hans` | `en` | HUD 标签语言。默认为英文；设为 `zh` 或 `zh-Hans` 启用简体中文标签 |
| `lineLayout` | string | `expanded` | 布局：`expanded`（多行）或 `compact`（单行） |
| `pathLevels` | 1-3 | 1 | 项目路径显示的目录层级数 |
| `maxWidth` | number \| `null` | `null` | 可选的回退宽度，仅在终端宽度检测完全失败时使用 |
| `forceMaxWidth` | boolean | false | 当设置了 `maxWidth` 时始终使用它，即使终端宽度检测返回更小的值 |
| `elementOrder` | string[] | `["project","context","usage","promptCache","memory","environment","tools","agents","todos","sessionTime"]` | 展开模式下元素的顺序。省略的条目在展开模式下隐藏。现有配置会保留其显式顺序直到更新 |
| `display.mergeGroups` | string[][] | `[["context","usage"]]` | 展开模式下相邻时应共享一行的元素分组。设为 `[]` 可禁用合并行 |
| `gitStatus.enabled` | boolean | true | 在 HUD 中显示 git 分支 |
| `gitStatus.showDirty` | boolean | true | 显示 `*` 表示未提交的更改 |
| `gitStatus.showAheadBehind` | boolean | false | 显示 `↑N ↓N` 表示领先/落后远程的提交数 |
| `gitStatus.pushWarningThreshold` | number | 0 | 当未推送提交数达到此值时，用警告色显示 ahead 计数（`0` 表示禁用） |
| `gitStatus.pushCriticalThreshold` | number | 0 | 当未推送提交数达到此值时，用严重色显示 ahead 计数（`0` 表示禁用） |
| `gitStatus.showFileStats` | boolean | false | 显示文件变更数量 `!M +A ✘D ?U` |
| `gitStatus.branchOverflow` | `truncate` \| `wrap` | `truncate` | 保持当前截断行为，或在可能时让 git 块以自己的换行边界单独换到下一行 |
| `display.showModel` | boolean | true | 显示模型名称 `[Gemini 1.5 Pro]` |
| `display.showAddedDirs` | boolean | true | 显示来自 `/add-dir` 的额外工作区目录（如 `+sparkle +lib-foo`）；空数组不显示任何内容。在两种布局中最多渲染 5 个目录（溢出显示为 `+N more`），基名截断为 24 个字符并加 `…` |
| `display.addedDirsLayout` | `inline` \| `line` | `inline` | `inline` 将目录放在项目名称旁边，每个目录带 `+name` 前缀；`line` 在单独的 `Added dirs: name1, name2` 行渲染（无 `+` 前缀，逗号分隔） |
| `display.showContextBar` | boolean | true | 显示可视化上下文进度条 `████░░░░░░` |
| `display.contextValue` | `percent` \| `tokens` \| `remaining` \| `both` | `percent` | 上下文显示格式（`45%`、`45k/200k`、剩余 `55%` 或 `45% (45k/200k)`） |
| `display.showConfigCounts` | boolean | false | 显示 CLAUDE.md、rules、MCPs、hooks 数量 |
| `display.showCost` | boolean | false | 显示会话费用（可用时） |
| `display.showOutputStyle` | boolean | false | 显示当前活动输出样式 |
| `display.showDuration` | boolean | false | 显示会话时长 `⏱️ 5m` |
| `display.showSpeed` | boolean | false | 显示输出 Token 速度 `out: 42.1 tok/s` |
| `display.showUsage` | boolean | false | 显示速率限制指标开关 |
| `display.showTokenBreakdown` | boolean | true | 在高上下文时（85%+）显示 Token 详情 |
| `display.showTools` | boolean | false | 显示工具活动行 |
| `display.showAgents` | boolean | false | 显示 Agent activity行 |
| `display.showTodos` | boolean | false | 显示待办进度行 |
| `display.showSessionName` | boolean | false | 显示会话 slug 或 `/rename` 设置的自定义标题 |
| `display.showSessionStartDate` | boolean | false | 显示 transcript 会话开始时间戳 |
| `display.showLastResponseAt` | boolean | false | 显示最后一次 assistant 响应时间距今多久 |
| `display.showClaudeCodeVersion` | boolean | false | 显示已安装的 CLI 版本 |
| `display.showMemoryUsage` | boolean | false | 在展开布局中显示近似系统 RAM 使用行 |
| `colors.context` | 颜色值 | `green` | 上下文进度条和百分比的基础颜色 |
| `colors.usage` | 颜色值 | `brightBlue` | 辅助进度条的颜色 |
| `colors.warning` | 颜色值 | `yellow` | 上下文阈值的警告颜色 |
| `colors.usageWarning` | 颜色值 | `brightMagenta` | 辅助警告颜色 |
| `colors.critical` | 颜色值 | `red` | 达到限制状态和严重阈值的颜色 |
| `colors.model` | 颜色值 | `cyan` | 模型徽章颜色，如 `[Gemini 1.5 Pro]` |
| `colors.project` | 颜色值 | `yellow` | 项目路径的颜色 |
| `colors.git` | 颜色值 | `magenta` | Git 包装文本的颜色，如 `git:(` 和 `)` |
| `colors.gitBranch` | 颜色值 | `cyan` | Git 分支和分支状态文本的颜色 |
| `colors.label` | 颜色值 | `dim` | 标签和次要元数据的颜色，如 `Context`、计数和进度文本 |
| `colors.custom` | 颜色值 | `208` | 可选自定义行的颜色 |
| `colors.barFilled` | string | `█` | 进度条填充部分使用的字符 |
| `colors.barEmpty` | string | `░` | 进度条空白部分使用的字符 |

支持的颜色名称：`dim`、`red`、`green`、`yellow`、`magenta`、`cyan`、`brightBlue`、`brightMagenta`。你也可以使用 256 色数字（`0-255`）或十六进制（`#rrggbb`）。

### 故障排查

**配置不生效？**
- 检查 JSON 语法错误：无效的 JSON 会静默回退到默认值
- 确保值有效：`pathLevels` 必须是 1、2 或 3；`lineLayout` 必须是 `expanded` 或 `compact`
- 删除配置文件并运行 `/agy-hud:configure` 重新生成

**Git 状态缺失？**
- 验证你是否在 git 仓库中
- 检查配置中的 `gitStatus.enabled` 不为 `false`

**工具/Agent/待办行缺失？**
- 这些默认隐藏——在配置中通过 `showTools`、`showAgents`、`showTodos` 启用
- 它们也仅在有活动可显示时才会出现

**HUD 设置后不显示？**
- 重启 Antigravity CLI 以加载新的 statusLine 配置

---

## 运行环境要求

- Antigravity CLI v0.1.0+
- macOS/Linux：Node.js 18+ 或 Bun
- Windows：Node.js 18+

---

## 开发

```bash
git clone https://github.com/lllopic/agy-hud
cd agy-hud
npm ci && npm run build
npm test
```

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## 致谢与声明

`agy-hud` 是基于 [Jarrod Watts](https://github.com/jarrodwatts) 开发的优秀开源项目 [claude-hud](https://github.com/jarrodwatts/claude-hud) 进行二次开发与品牌重塑的分支版本，旨在提供对 Antigravity CLI 的完美兼容与深度适配。本软件的原作部分与二次开发修改部分均在 MIT 许可证下发布。

---

## 许可证

MIT — 详见 [LICENSE](LICENSE)
