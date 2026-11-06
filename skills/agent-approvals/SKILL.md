---
name: agent-approvals
description: Ask a person to approve an AI agent's or workflow's action through Hibira, either with the MCP request_approval tool, the signed approvals HTTP API, or the @hibira-io/approvals live inbox. Use for human-in-the-loop flows, tool-call approval, refunds, deploys or anything an agent should not do alone.
---

# Human approvals with Hibira

Three ways in, sharing one protocol (Hibira approvals protocol v1), so an inbox can show requests from all of them.

## 1. Right now, from this agent: MCP tools

`request_approval` with a title (at most 200 characters), optional details, 2 to 4 options (the first one means approved), an expiry, and optionally a channel and push interests. It returns a hosted link `https://hibira.io/approve/...`; anyone with the link can answer, and the first answer wins. Give the link to the user (or let the push notification carry it), then call `get_approval`, which waits up to 25 seconds per call, until the status is `approved`, `rejected` or `expired`. Do not take the action unless the status is `approved`.

## 2. From a server or workflow: approvals HTTP API

`POST /apps/APP_ID/approvals` and `GET /apps/APP_ID/approvals/{id}?wait=25`, signed with the app key and secret exactly like `POST /apps/APP_ID/events` (Pusher `auth_signature`, `body_md5`). Same fields and hosted page as the MCP tool. This is what the n8n, Make, Activepieces and Node-RED integrations use.

## 3. In the product: `@hibira-io/approvals`

```sh
npm install @hibira-io/approvals pusher pusher-js
```

A live inbox for reviewers (React and Vue components, 7 languages, light and dark) plus server helpers for the Vercel AI SDK (`needsApproval`), Mastra (`requireApproval`, `suspend()`) and LangGraph (`interrupt()`). The agent run stops on a tool call, `approvals.request({ calls })` opens a request, reviewers get an `approval` event on `private-hibira-approvals.{scope}.inbox`, decide (approve, edit the input, or reject with a reason), and the run resumes. The event carries no tool input, so nothing sensitive crosses the socket. The inbox calls your backend routes, never client events. Laravel/Filament projects use `hibira-io/filament-approvals`; Python uses the package's `python/` folder (LangGraph + FastAPI).

## Rules

- Authorize `private-hibira-approvals.*` in your auth route so only reviewers can subscribe.
- Treat expiry and rejection as final; do not re-ask in a loop.
- New requests are limited to about 1 per second per account.
