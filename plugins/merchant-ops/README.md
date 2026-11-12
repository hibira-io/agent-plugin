# Hibira merchant ops plugin

For store and event teams, not developers: run a sale day and read your customer service at a glance, from the chat with your AI assistant.

| Skill | Command | What it does |
|---|---|---|
| `sale-day-runbook` | `/sale-day` | Sets up the waiting room for a flash sale, ticket drop or launch, writes the team's runbook, opens the live waiting room panel at sale time, proposes rate changes, notices and sold-out, and keeps an eye on the Live Chat queue. Every change asks you first. |
| `support-digest` | `/support-digest` | Yesterday's (or any period's) Live Chat in one sheet: conversations, solved by the assistant alone, handoffs, unanswered, first reply times, ratings, top questions, knowledge base gaps with ready-to-import answers, and chats that need follow-up. |

It uses the Hibira MCP server (`https://hibira.io/mcp`, waiting rooms) and the Hibira Live Chat MCP server (`https://chat.hibira.io/mcp`). Both sign in with OAuth; there is no key to paste.

Reading Live Chat conversations uses the Live Chat REST API with a **read** API key (Team and Business plans, created at https://chat.hibira.io/portal/developers). Keep it in an environment variable such as `HIBIRA_LIVECHAT_KEY`; the skills never ask for it in chat. Without a key, the digest falls back to the Reports page (Business) and the runbook asks the person on chat.

## Install

### Claude Code

```sh
claude plugin marketplace add hibira-io/agent-plugin
claude plugin install hibira-merchant-ops@hibira
```

Then run `/mcp` and sign in to `hibira` and `hibira-live-chat`.

### Other clients

Copy `skills/` into your client's skills folder, and add the two MCP URLs above as connectors.

## 中文摘要

给商家和活动团队用的插件（不是给开发者的）：

- **开卖日 runbook**（`/sale-day`）：帮你建好等候室、写团队用的检查清单，开卖时打开等候室即时面板，按网站状况建议调放行速度、发公告、售罄关闭，同时留意 Live Chat 排队。每次改动都会先问你。
- **每日客服摘要**（`/support-digest`）：把昨天（或任何时段）的 Live Chat 整理成一张表：对话数、AI 独立解决、转人工、未回复、首次回复时间、评分、热门问题、知识库缺口（附可直接导入的答案）和待跟进对话。

读取对话需要 Live Chat 的只读 API key（Team 以上方案），放在环境变量里，不要贴进对话。
