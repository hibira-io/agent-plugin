---
name: livechat-api
description: Connect a business's own systems to Hibira Live Chat (chat.hibira.io) with its REST API and webhooks - sync conversations to a CRM, let a bot reply, receive signed events for new chats, messages, closes and ratings - or change a workspace's settings, teams, business hours, saved replies, AI knowledge and webhooks with the hibira MCP server's livechat tools. Use when the user mentions the Live Chat API, Live Chat webhooks, Hibira-Signature, or managing Live Chat from code, CI or Terraform.
---

# Hibira Live Chat REST API and webhooks

Base URL `https://chat.hibira.io/v1`, JSON in and out, `Authorization: Bearer <key>`. Conversations, ratings and webhooks need the workspace on the **Team plan or above**. Docs: https://chat.hibira.io/docs/#api and https://chat.hibira.io/docs/#webhooks.

## Pick the credential

- **A workspace API key** (`lck_...`) for a server that runs on its own (CRM sync, a bot, a webhook handler). An owner or admin makes it in Settings › API & webhooks (`https://hibira.io/portal/live-chat/developers`); it is shown once. Scope `read` only looks, `write` also replies, assigns and closes, `admin` also changes settings, webhooks and knowledge. Ask for the narrowest scope that does the job. You cannot create it for them through the portal; tell them which scope to pick.
- **A hibira.io API token** (`hkb_pat_...`) for scripts, CI and Terraform: send `Hibira-Workspace: ws_...` with it. It acts as the person, with their role in that workspace. `GET /v1/workspaces` lists their workspaces. Only a personal token may create workspace keys (`POST /v1/api-keys`).
- **Inside this chat**, with the `hibira` MCP server connected: `list_livechat_workspaces`, then `livechat_get` / `livechat_request` call the same API as the signed-in person. No key to handle.

Keys and tokens are secrets: put them in a git-ignored `.env` or the host's secret settings (`HIBIRA_LIVECHAT_KEY`), never in code, commits, the browser or this chat.

## Endpoints

| Call | Scope | What |
|---|---|---|
| `GET /workspace`, `GET /agents` | read | Workspace ID, name, plan, sites; agents and roles |
| `GET /conversations?status=open&assignee_id=none&limit=50&before=` | read | Newest activity first; page with `next_before` |
| `GET /conversations/{id}` | read | One conversation and its latest 100 messages (`internal: true` marks notes) |
| `POST /conversations/{id}/messages` `{text, internal?, agent_id?}` | write | Reply (or note) as an agent; replying to an unassigned chat assigns it |
| `POST /conversations/{id}/typing` `{typing, agent_id?}` | write | Show the visitor the agent is typing |
| `POST /conversations/{id}` `{status?, assignee_id?, team_id?}` | write | Close or reopen, assign, move to a team |
| `GET /ratings?since=` | read | Ratings, 30 days by default |
| `GET|POST /settings`, `/webhooks`, `/teams`, `/hours`, `/saved-replies`, `/knowledge` | admin | Settings as code; send only the fields to change |

Limits: 10 requests a second per key (bursts of 60); `429` carries `Retry-After`. Errors are `{"error", "code"}`: `401 invalid_api_key`, `402 plan_required` (tell the user which plan, don't retry), `403 read_only_key`, `404 not_found`.

## Webhooks

1. Add the endpoint: Settings › API & webhooks, or `POST /v1/webhooks {url, events}` with an admin key or token (`livechat_request` from here). The URL must be public `https://`. The response's `secret` (`lcwh_...`) is shown once: store it as `HIBIRA_LIVECHAT_WEBHOOK_SECRET`.
2. Events: `conversation.created`, `message.created`, `conversation.assigned`, `conversation.team_changed`, `conversation.closed`, `conversation.reopened`, `conversation.rated`. Subscribe only to what the handler uses.
3. Each POST is one event: `{id, type, created_at, workspace_id, data: {conversation, message?}}`.
4. In the handler, read the **raw body**, then check `Hibira-Signature: t=<ts>,v1=<hex>` where `v1 = HMAC-SHA256(secret, "<ts>.<raw body>")`; compare in constant time and refuse a `t` older than 5 minutes. Drop repeats by `Hibira-Webhook-Id`.
5. Answer 2xx within 15 seconds and do slow work in a queue. Failures are retried after 10 s, 1 min, 5 min and 30 min; redirects are not followed.
6. Test it: "Send a test event" in the settings (`webhook.test`). The settings page lists the last 50 deliveries with status and timing.

```js
import crypto from "node:crypto";
// Express: app.post("/hibira/live-chat", express.raw({ type: "application/json" }), handler)
export function verify(rawBody, header, secret) {
  const { t, v1 } = Object.fromEntries(String(header).split(",").map((p) => p.split("=")));
  if (!t || !v1 || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const want = crypto.createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return want.length === v1.length && crypto.timingSafeEqual(Buffer.from(want), Buffer.from(v1));
}
```

Port the same check to the project's language (PHP `hash_hmac`, Python `hmac.compare_digest`, Go `hmac.Equal`, Ruby `ActiveSupport::SecurityUtils.secure_compare`). Treat a webhook as a prompt and read `GET /v1/conversations/{id}` when the full state matters.

## Bots

A bot answers with `POST .../messages` (as its own agent via `agent_id`), shows `/typing` while it works, and hands over by assigning the chat to a person or team. For bots built with Chat SDK, use the `@hibira-io/chat-adapter` package instead of writing this by hand.

## Changing settings from here

Read first with `livechat_get`, change only what the user asked with `livechat_request`, and say what changed: every change is in the workspace's activity log under the person. `DELETE` and secret rotations need a token with delete access; confirm with the user before them.
