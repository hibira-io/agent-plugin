---
name: waiting-room
description: Put a Hibira virtual waiting room (queue) in front of a ticket drop, flash sale, launch or any page that would fall over if everyone arrived at once. Use when the user wants a queue, waiting room, Queue-it alternative, traffic surge or bot-rush protection, or wants to create, open, pause, close (sold out), post a notice on, or let people in from a waiting room.
---

# Hibira waiting room

Visitors who reach a protected page without a pass are sent to a hosted waiting page (`https://ws.hibira.io/wait/APP_KEY/ROOM`, 7 languages). They take a queue number, watch the line move live and are let in at `admit_per_minute`. When their number comes up the page sends them back with `?hibira_pass=...`, a pass signed with the app secret. Your edge or server checks the pass, stores it in a cookie and serves the page. Nothing on the waiting page is yours to build.

Two jobs: **run the room** (create, open, pause, close, admit) and **protect the page** (check the pass). Do both.

## 1. Run the room

### With the Hibira MCP server (preferred)

| Tool | Use it for |
|---|---|
| `list_waiting_rooms` | The app's rooms with live counters (waiting, admitted, rate, state) |
| `get_waiting_room` | One room, for example to watch the queue during a drop |
| `set_waiting_room` | Create a room or change it: `admit_per_minute`, `state` (`open`, `paused`, `closed` = sold out), `starts_at`, `title`, `notice`, `return_urls`, `pass_ttl_seconds` |
| `admit_waiting_room` | Let the next N people in right now (also while paused) |

Rules:

- `return_urls` **must** include the page visitors come back to (same host, path prefix; https, or http for localhost). Otherwise the waiting page refuses to send them there.
- Create a room `paused` (or with `starts_at`) when the sale has not started; numbers are still handed out in arrival order.
- Ask the user before changing a room that has people waiting: pausing stops the line, `closed` refuses new visitors, and a big `admit_waiting_room` count can flood the page you are protecting.
- If these tools are missing, the MCP server is not connected or is older. Use the signed HTTP API instead.

### With the signed HTTP API

Signed exactly like `POST /apps/APP_ID/events`, so any Pusher server library can send it (`pusher.post({ path: '/waiting_rooms/ROOM', body })` in Node):

```
POST /apps/APP_ID/waiting_rooms/ROOM        create (admit_per_minute required) or change
GET  /apps/APP_ID/waiting_rooms/ROOM        live counters
POST /apps/APP_ID/waiting_rooms/ROOM/admit  {"count": 500}
POST /apps/APP_ID/waiting_rooms/ROOM/verify {"pass": "..."}  -> {"valid": true, ...}
```

`ROOM` is 1 to 64 letters, digits, `-` or `_`. Full reference: https://hibira.io/guides/waiting-room and https://hibira.io/llms-full.txt.

## 2. Protect the page

Look at the project first and pick the matching way in:

| Stack | How |
|---|---|
| Next.js / Vercel middleware, Cloudflare Workers, Deno, Bun | `npm install @hibira-io/waiting-room`, then `protect(request, { appKey, secret, room })` from `@hibira-io/waiting-room/server`; it returns a response to send (redirect or 403) or `null` to continue |
| Express / Node | `expressWaitingRoom({ appKey, secret, room })` from the same package; `req.hibiraPass` holds the pass |
| Laravel, Rails, Django, Spring Boot, .NET, NestJS, Symfony, WordPress, Shopify… | Use Hibira's package for that framework if https://hibira.io/guides/waiting-room lists one; otherwise write a small middleware that does the steps below |

A middleware, in any language:

1. If the request has `?hibira_pass=PASS`, verify it. If valid, set an HttpOnly, Secure, SameSite=Lax cookie `hibira_wr_ROOM` with the pass (expire it at the pass's `exp`) and redirect to the same URL without the parameter.
2. If the cookie holds a valid pass, serve the page.
3. Otherwise redirect GET requests to `https://ws.hibira.io/wait/APP_KEY/ROOM?return=<this URL, urlencoded>` (use the host `get_app` reports when the app is on a regional cluster) and answer other methods with 403.

Verify a pass: it is `PAYLOAD.SIG`, both base64url. `SIG` must equal `HMAC-SHA256(app_secret, "hibira-waitroom-pass." + PAYLOAD)` (constant-time compare). `PAYLOAD` decodes to `{"v":1,"app":"APP_ID","room":"ROOM","n":42,"tid":"...","iat":...,"exp":...}`: check `app`, `room` and that `exp` (Unix seconds) is in the future. Or skip the crypto and call `POST /apps/APP_ID/waiting_rooms/ROOM/verify`.

Protect only the pages the rush hits (the drop page, checkout), not the whole site, and never static assets the waiting page does not need.

## Test it

1. Create a room called `test` with `admit_per_minute: 1`, `state: "paused"` and `return_urls` set to the local URL (for example `http://localhost:3000/`).
2. Open the protected page: it should redirect to the waiting page with a queue number.
3. `admit_waiting_room` with `count: 1` (or `set_waiting_room` with `state: "open"`): the waiting page should send the browser back, and the page should load with the cookie set.
4. Show the user each step, then leave the test room paused (rooms are deleted in the Hibira portal, or after 30 days untouched).

## Safety

- The app **secret** signs passes. Keep it in a git-ignored env file and server-side only; never in client code, the browser or chat.
- A pass works in any browser until it expires (`pass_ttl_seconds`, default 30 minutes). If each queue number may check out once, record the pass's `tid` at checkout and refuse a repeat.
- During a secret rotation, accept passes signed with either secret until the old one expires.
- Waiting visitors are billed by the waiting room add-on (queued visitors per month), not by the app's connection limit. Point the user to the pricing page rather than quoting numbers.
