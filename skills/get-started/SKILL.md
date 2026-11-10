---
name: get-started
description: First-run setup for Hibira. Use right after the plugin is installed, or when the user asks how to start with Hibira: sign in to the Hibira MCP server, pick or create an app, and send a first test event so they see realtime working.
---

# Get started with Hibira

Hibira is hosted realtime for apps: Pusher-compatible WebSocket channels, push notifications, human approvals and virtual waiting rooms. This skill takes a new user from "installed" to "first event delivered" in a few minutes.

## 1. Sign in

The `hibira` MCP server signs in with OAuth. The first Hibira tool call opens a Hibira consent page, where the user signs in (or creates a free account at https://hibira.io) and chooses read only or read and write access, and which apps the agent may use. Never ask for a password, key or token in chat.

Call `get_account` to confirm the connection. Tell the user their plan and how many apps they have.

## 2. Pick an app

Call `list_apps`.

- One or more apps: ask which one to use, or pick the only one.
- No apps: offer to create one. Ask for a name, then call `create_app` (needs read and write access). The secret is returned once: if you are working in a project, write it into a git-ignored env file; otherwise tell the user it is shown once and where to find the app in the console. Never repeat the secret in chat.

## 3. Get the setup guide for their stack

Ask what they build with (for example Laravel, Next.js, plain JavaScript, Flutter, Swift, Android, Python, Go). Call `get_integration_guide` with that SDK and the app ID. The guide already holds the right host, key and cluster. If you can edit the user's project, follow the guide there; otherwise show the key steps.

## 4. Send a first event

Call `send_test_event` on a channel the user's page subscribes to (the guide's example uses one), or on `test-channel` if nothing is wired yet, and say where to see it arrive: their page, or the app's debug console at https://hibira.io/console. If the user has a client connected, `watch_debug_events` for a few seconds to confirm delivery.

## What to suggest next

- Live updates, chat, presence or online counts: the `realtime-integration` skill.
- Moving from Pusher: the `migrate-from-pusher` skill.
- Push notifications: the `push-notifications` skill.
- Streaming AI answers or asking a person to approve an agent's action: the `ai-streaming` and `agent-approvals` skills.
- A queue for a ticket drop or flash sale: the `waiting-room` skill.

Docs: https://hibira.io/guides. Ask before any write on an app that is already in use; see the `hibira-mcp-usage` skill for the safety rules.
