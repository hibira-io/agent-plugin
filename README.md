# Hibira agent plugin

Hibira for Claude Code: the [Hibira MCP server](https://hibira.io/mcp-server) plus skills that teach your coding agent to wire Hibira realtime channels, push notifications, AI streaming and human approvals into your app.

## Install (Claude Code)

```sh
claude plugin marketplace add hibira-io/agent-plugin
claude plugin install hibira@hibira
```

Then run `/mcp`, pick `hibira` and sign in. The consent page lets you choose read only or read and write, and which apps the agent may use. No API key is stored in your project.

## What you get

**MCP server** `hibira` (`https://hibira.io/mcp`, OAuth): list and create apps, read usage, get the setup guide for your SDK with your app's values filled in, send a test event and watch the debug console, publish events, send push notifications, and ask a person for approval.

**Skills**

| Skill | Use it for |
|---|---|
| `hibira-mcp-usage` | When and how to call the MCP tools safely |
| `realtime-integration` | Channels in web, mobile and backend projects (pusher-js, Laravel, Flutter, server SDKs) |
| `migrate-from-pusher` | Moving a Pusher Channels or Beams project to Hibira |
| `push-notifications` | Hibira Push for iOS, Android and browsers |
| `ai-streaming` | Resumable Vercel AI SDK chat with `@hibira-io/ai-sdk` |
| `agent-approvals` | Human-in-the-loop approvals for agents and workflows |

Try: *"Add live order updates to this app with Hibira"* or *"Move this project from Pusher to Hibira"*.

## Other agents

The MCP server works in any MCP client:

- Cursor `.cursor/mcp.json`: `{"mcpServers": {"hibira": {"url": "https://hibira.io/mcp"}}}`
- VS Code `.vscode/mcp.json`: `{"servers": {"hibira": {"type": "http", "url": "https://hibira.io/mcp"}}}`
- Claude and ChatGPT: add a custom connector with `https://hibira.io/mcp` ([guide](https://hibira.io/mcp-connectors))

The skills are plain `SKILL.md` folders under `skills/` and can be copied into any agent that reads them.

## License

MIT

---

### 中文摘要

Hibira 的 Claude Code 外掛：安裝後自動接上 Hibira MCP 伺服器（OAuth 登入，不需 API key），並附 6 個技能，讓 AI 助手能在你的專案裡接上即時頻道、推播、AI 串流與人工審核，也能協助從 Pusher 遷移。安裝：`claude plugin marketplace add hibira-io/agent-plugin`，再 `claude plugin install hibira@hibira`。
