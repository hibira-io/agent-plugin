# Hibira agent plugin

Hibira for AI coding agents: the [Hibira MCP server](https://hibira.io/mcp-server) plus skills that teach your agent to wire Hibira realtime channels, push notifications, AI streaming, human approvals, in-app chat (Chat API) and virtual waiting rooms into your app, and the Hibira Live Chat MCP server for connecting your admin panel to Live Chat single sign-on.

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=hibira&config=eyJ1cmwiOiJodHRwczovL2hpYmlyYS5pby9tY3AifQ%3D%3D)
[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Hibira_MCP-0098FF?logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=hibira&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fhibira.io%2Fmcp%22%7D)

## Install

| Client | Skills | MCP | How |
|---|---|---|---|
| Claude Code | ✅ | ✅ | [Marketplace](#claude-code) |
| Codex CLI | ✅ | ✅ | [Marketplace](#codex-cli) |
| GitHub Copilot CLI | ✅ | ✅ | [Marketplace](#github-copilot-cli) |
| Gemini CLI | ✅ | ✅ | [Extension](#gemini-cli) |
| Cursor | ✅ | ✅ | [Plugin or one click](#cursor) |
| VS Code (Copilot Chat) | ✅ | ✅ | [Plugin or one click](#vs-code) |
| OpenCode | ✅ | ✅ | [Config](#opencode) |
| Windsurf, Cline, Kilo, Zed, Amp, Continue, … | ✅ | ✅ | [`npx skills` + MCP URL](#other-agents) |
| Claude.ai, ChatGPT | — | ✅ | [Custom connector](https://hibira.io/mcp-connectors) |

The MCP server signs in with OAuth. There is no API key to paste: the first Hibira tool call (or the client's MCP login command) opens a Hibira consent page, where you choose read only or read and write, and which apps the agent may use.

### Claude Code

```sh
claude plugin marketplace add hibira-io/agent-plugin
claude plugin install hibira@hibira
```

Then run `/mcp`, pick `hibira` and sign in.

### Codex CLI

```sh
codex plugin marketplace add hibira-io/agent-plugin
codex plugin add hibira@hibira
codex mcp login hibira
```

Or run `codex`, type `/plugins` and install **Hibira** from there.

### GitHub Copilot CLI

```sh
copilot plugin marketplace add hibira-io/agent-plugin
copilot plugin install hibira@hibira
```

### Gemini CLI

```sh
gemini extensions install https://github.com/hibira-io/agent-plugin
```

Then `/mcp auth hibira` inside Gemini CLI.

### Cursor

Whole plugin (skills and MCP):

```sh
git clone https://github.com/hibira-io/agent-plugin.git ~/.cursor/plugins/local/hibira
```

and restart Cursor. MCP only: click **Add to Cursor** above, or add to `.cursor/mcp.json`:

```json
{ "mcpServers": { "hibira": { "url": "https://hibira.io/mcp" } } }
```

### VS Code

Whole plugin: clone this repository, open the Chat view, go to **Plugins** and add the folder. MCP only: click **Install in VS Code** above, or add to `.vscode/mcp.json`:

```json
{ "servers": { "hibira": { "type": "http", "url": "https://hibira.io/mcp" } } }
```

### OpenCode

```sh
npx skills add hibira-io/agent-plugin -a opencode
```

and in `opencode.json`:

```json
{ "mcp": { "hibira": { "type": "remote", "url": "https://hibira.io/mcp" } } }
```

Then `opencode mcp auth hibira`.

### Other agents

Any agent that reads `SKILL.md` folders can take the skills with [`skills`](https://github.com/vercel-labs/skills), and any MCP client can use the server URL:

```sh
npx skills add hibira-io/agent-plugin          # add -a <agent> for one client, -g for global
npx add-mcp https://hibira.io/mcp
```

Clients that read the [Agent Plugins](https://agent-plugins.org) manifest (`plugin.json`, `mcp.json`) can load a clone of this repository directly.

## What you get

**MCP servers**

- `hibira` (`https://hibira.io/mcp`): list and create apps, read usage, get the setup guide for your SDK with your app's values filled in, send a test event and watch the debug console, publish events, send push notifications, ask a person for approval, and run waiting rooms (create, open, pause, close, admit).
- `hibira-live-chat` (`https://chat.hibira.io/mcp`): for [Hibira Live Chat](https://chat.hibira.io) owners and admins. Read the workspace's single sign-on setup, get the signing code for your stack with your workspace filled in, check the tokens your code signs (without signing anyone in), list agents and turn on "only single sign-on". It never sees your SSO secret. Each server signs in separately, the first time you use it.

**Skills**

| Skill | Use it for |
|---|---|
| `hibira-mcp-usage` | When and how to call the MCP tools safely |
| `realtime-integration` | Channels in web, mobile and backend projects (pusher-js, Laravel, Flutter, server SDKs) |
| `migrate-from-pusher` | Moving a Pusher Channels or Beams project to Hibira |
| `push-notifications` | Hibira Push for iOS, Android and browsers |
| `ai-streaming` | Resumable Vercel AI SDK chat with `@hibira-io/ai-sdk` |
| `agent-approvals` | Human-in-the-loop approvals for agents and workflows |
| `chat-api` | In-app chat with stored history, unread counts and read receipts (Chat API, beta) |
| `waiting-room` | A virtual waiting room (queue) in front of a ticket drop or flash sale, in any framework |
| `livechat-sso` | Staff open the Hibira Live Chat inbox from your own admin panel (single sign-on) |

Try: *"Add live order updates to this app with Hibira"*, *"Move this project from Pusher to Hibira"* *"Put a waiting room in front of our ticket drop page"* or *"Connect our admin panel to Hibira Live Chat single sign-on"*.

## Repository layout

| Path | For |
|---|---|
| `skills/` | The skills, shared by every client |
| `.mcp.json` | MCP server (Claude Code, Codex, Cursor, Copilot, VS Code) |
| `.claude-plugin/` | Claude Code plugin and marketplace (also read by Copilot CLI and VS Code) |
| `.codex-plugin/`, `.agents/plugins/` | Codex plugin and marketplace |
| `.cursor-plugin/` | Cursor plugin |
| `gemini-extension.json` | Gemini CLI extension |
| `plugin.json`, `mcp.json` | Agent Plugins manifest |

Run `node scripts/check.mjs` after changing a manifest: it checks that every manifest carries the same version and MCP URLs.

## License

MIT

---

### 中文摘要

Hibira 的 AI 編程助手外掛：接上 Hibira MCP 伺服器（OAuth 登入，不需 API key），並附 9 個技能，讓助手能在你的專案裡接上即時頻道、推播、AI 串流、人工審核、聊天（Chat API）與排隊等候室（建立、開放、暫停、售罄、放行，並在任何框架裡驗證 pass），也能協助從 Pusher 遷移。另含 Hibira 即時客服的 MCP 伺服器（`https://chat.hibira.io/mcp`），可幫你把自家後台接上即時客服的單一登入，讓客服從後台直接打開收件匣；它看不到你的 SSO 密鑰。支援 Claude Code、Codex、Copilot CLI、Gemini CLI、Cursor、VS Code、OpenCode，其他工具可用 `npx skills add hibira-io/agent-plugin` 加上 MCP 網址 `https://hibira.io/mcp`。
