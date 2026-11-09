---
name: hibira-mcp-usage
description: How and when to use the Hibira MCP server (hibira.io/mcp) safely. Use when the task needs the user's real Hibira account, such as listing or creating apps, reading usage, sending a test event, watching the debug console, publishing events, sending push notifications, asking a person for approval or running a waiting room.
---

# Using the Hibira MCP server

This plugin registers one remote MCP server, `hibira`, at `https://hibira.io/mcp`. It signs in with OAuth: the first call opens a Hibira consent page in the browser, where the user picks read only or read and write and which apps the agent may touch. You never pass a key or token in tool parameters.

If the Hibira tools are missing from your tool list, the server is not connected. Ask the user to run `/mcp` and sign in to `hibira`, or add it by hand with `claude mcp add --transport http hibira https://hibira.io/mcp`. Without it, fall back to the other skills and https://hibira.io/guides.

## Tools

| Tool | Needs | Use it for |
|---|---|---|
| `get_account` | read | Plan, account-wide limits, totals and the WebSocket endpoint |
| `list_apps` | read | Apps with their IDs, keys, allowed origins and today's usage (never secrets) |
| `get_app` | read | One app: host, port, cluster, env variable names, live counters on paid plans |
| `get_usage` | read | Daily events and peak connections, for the account or one app |
| `get_integration_guide` | read | The setup prompt for one SDK (html, javascript, laravel, php, node, python, go, ruby, java, dotnet, swift, android, flutter, plus push guides) with the app's ID and key filled in |
| `watch_debug_events` | read | Listen to an app's debug console for up to 30 seconds |
| `get_approval` | read | Status of an approval request, waiting up to 25 seconds |
| `create_app` | write | A new app. Returns the secret **once** |
| `update_app` | write | Name, allowed origins, client events, enabled |
| `send_test_event` | write | Publish one test event (counts toward quota) |
| `publish_event` | write | Publish an event to up to 100 channels, for example to stream an agent's progress |
| `send_push` | write | A push notification to interests or user IDs through the app's Push instance |
| `request_approval` | write | Ask a person to approve something, with a hosted answer link |
| `list_waiting_rooms` | read | The app's waiting rooms with live queue counters |
| `get_waiting_room` | read | One waiting room's live counters |
| `set_waiting_room` | write | Create a waiting room or change its rate, state (open, paused, closed), start time, title, notice or return URLs |
| `admit_waiting_room` | write | Let the next N people in now |

## Typical flow: wire Hibira into the current project

1. `list_apps`. If there is no suitable app, confirm with the user, then `create_app`.
2. `get_integration_guide` with the SDK that matches the project (look at the project first: Laravel, Next.js, Flutter...). Follow its prompt; it already holds the right host, port, TLS setting and cluster.
3. Write the code. Put the app ID, key and host in the project's env config and add placeholders to `.env.example`.
4. `send_test_event` (or `publish_event`) on a channel the code subscribes to, and `watch_debug_events` to confirm the client connected and received it.

## Safety

- **Secrets.** `create_app` returns the app secret once. Write it straight into a git-ignored env file (for example `.env.local`) and never print it in chat, commit it, or put it in client-side code. Other tools never return secrets; if the user lost theirs, they rotate it in the portal.
- **Writes cost quota.** `send_test_event`, `publish_event` and `send_push` count toward the plan's daily limits. Do not loop them. Tool calls are rate limited (about 5 per second per token).
- **Confirm before acting on production.** Ask before `create_app`, before `update_app` on an app that is in use (disabling an app or narrowing allowed origins drops live clients), and before `send_push` to real users.
- **Waiting rooms hold real people.** Ask before pausing, closing or admitting a large batch from a room with people in it. See the `waiting-room` skill.
- **Approvals are for people.** Use `request_approval` when a person must decide; share the link it returns and poll with `get_approval`. The first answer wins.
