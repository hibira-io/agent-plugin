---
name: hibira-mcp-usage
description: How and when to use the Hibira MCP server (hibira.io/mcp) safely. Use when the task needs the user's real Hibira account, such as listing or creating apps, reading usage, sending a test event, watching the debug console, reading channels and presence members, configuring webhooks, rotating an app secret, deleting an app, publishing events, sending push notifications, asking a person for approval running a waiting room or testing Chat API conversations.
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
| `list_channels` | read | Occupied channels right now with subscriber and presence user counts, busiest first (Free plan: busiest 10 only) |
| `get_presence_members` | read | Who is in a presence channel: user IDs, `user_info` and the member count |
| `get_webhooks` | read | Webhook endpoints, their event types and the latest deliveries (status, error, response) |
| `set_webhooks` | write | Replace the webhook endpoint list (send the full list) |
| `test_webhook` | write | Send a sample signed webhook to a saved endpoint |
| `rotate_app_secret` | write, destructive | A new app secret, returned **once**; the old one keeps working for `grace_minutes` (default 24 hours) |
| `delete_app` | write, destructive | Delete an app for good |
| `create_conversation` | write | Chat API (beta): create a conversation with members |
| `send_message` | write | Chat API: send a message as a member (delivered live and pushed) |
| `list_conversations` | read | Chat API: a user's conversations with unread counts |
| `list_messages` | read | Chat API: a conversation's newest messages |

## Typical flow: wire Hibira into the current project

1. `list_apps`. If there is no suitable app, confirm with the user, then `create_app`.
2. `get_integration_guide` with the SDK that matches the project (look at the project first: Laravel, Next.js, Flutter...). Follow its prompt; it already holds the right host, port, TLS setting and cluster.
3. Write the code. Put the app ID, key and host in the project's env config and add placeholders to `.env.example`.
4. `send_test_event` (or `publish_event`) on a channel the code subscribes to, and `watch_debug_events` to confirm the client connected and received it.

## Typical flow: debug "my client gets nothing"

1. `get_app` to check the app is enabled and the origin is allowed.
2. `list_channels` (use `prefix`) to see whether the client is actually subscribed; for presence channels, `get_presence_members` shows who joined and with what `user_info`.
3. `watch_debug_events` while the user reloads the page, then `send_test_event` on the channel.
4. For webhook problems, `get_webhooks` shows the latest deliveries with the HTTP status and response; after a fix, `test_webhook` checks it. When changing endpoints, call `get_webhooks` first and send the whole list to `set_webhooks`, keeping the ones the user did not ask to change.

## Safety

- **Secrets.** `create_app` and `rotate_app_secret` return the app secret once. Write it straight into a git-ignored env file (for example `.env.local`) or the secret store the old one came from, and never print it in chat, commit it, or put it in client-side code. Other tools never return secrets; if the user lost theirs, rotate it.
- **Destructive tools need the user's yes and the app's name.** `delete_app` and `rotate_app_secret` take `confirm`, which must be the app's exact name. Before calling them, tell the user which app (name and ID from `list_apps`) and what will happen, and wait for them to agree. Never guess the app, never delete or rotate an app the user did not ask about, and if `confirm` is rejected, stop and ask instead of retrying with another name.
  - `delete_app` cannot be undone: the key and secret stop working and clients can no longer connect. Afterwards, remove the app's credentials from the project's env files.
  - `rotate_app_secret` with the default grace period keeps the old secret working for 24 hours; update every server's `PUSHER_APP_SECRET` and redeploy within it. `grace_minutes: 0` breaks every server still on the old secret at once, so use it only when the user asks (for example, a leaked secret).
- **Writes cost quota.** `send_test_event`, `publish_event` and `send_push` count toward the plan's daily limits. Do not loop them. Tool calls are rate limited (about 5 per second per token).
- **Confirm before acting on production.** Ask before `create_app`, before `update_app` on an app that is in use (disabling an app or narrowing allowed origins drops live clients), and before `send_push` to real users.
- **Chat messages reach real users.** Ask before `send_message` on a production app; use `push: "never"` and fixed test user IDs when testing. See the `chat-api` skill.
- **Waiting rooms hold real people.** Ask before pausing, closing or admitting a large batch from a room with people in it. See the `waiting-room` skill.
- **Approvals are for people.** Use `request_approval` when a person must decide; share the link it returns and poll with `get_approval`. The first answer wins.
