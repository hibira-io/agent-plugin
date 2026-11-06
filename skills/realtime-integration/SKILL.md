---
name: realtime-integration
description: Add Hibira realtime channels (WebSockets, Pusher protocol) to a web, mobile or backend project. Use when building live updates, chat, notifications in the page, online counts, presence, collaborative features or dashboards with Hibira, or when choosing between public, private, presence and large presence channels.
---

# Hibira realtime integration

Hibira is a hosted WebSocket service that speaks the **Pusher Channels protocol**. Any Pusher Channels library that lets you set the host works: `pusher-js`, Laravel Echo, and the official server libraries for Node, PHP, Python, Go, Ruby, Java and .NET. You point them at Hibira instead of pusher.com.

## Get the exact setup

If the Hibira MCP server is connected, call `get_integration_guide` for the project's SDK and follow it: it carries the app's real ID, key, host and cluster. Otherwise the guides are at https://hibira.io/guides. Hibira's own packages:

| Stack | Package |
|---|---|
| Any web page, no build step | `<script src="https://hibira.io/embed/v1.js" data-key=... data-host=... async>` |
| Laravel | `composer require hibira-io/laravel` then `php artisan hibira:install` |
| Flutter / Dart | `flutter pub add hibira` (the official pusher_channels_flutter cannot change its host) |
| Large rooms | `@hibira-io/large-presence` |

## Connection settings

Always pass host, port and TLS. The libraries default to pusher.com and silently connect there otherwise.

- Host: `ws.hibira.io` (or the regional host `get_app` reports, `ws-<cluster>.hibira.io`), port 443, TLS on.
- Cluster: the app's cluster (`hkg`, `tyo` or `sin`). Libraries that require a cluster ignore it once the host is set, but still need a value.

```js
import Pusher from 'pusher-js';

const pusher = new Pusher(import.meta.env.VITE_HIBIRA_KEY, {
  cluster: 'hkg',
  wsHost: 'ws.hibira.io',
  wsPort: 443,
  wssPort: 443,
  forceTLS: true,
  enabledTransports: ['ws', 'wss'],
  channelAuthorization: { endpoint: '/broadcasting/auth', transport: 'ajax' },
});
```

```js
// server
const Pusher = require('pusher');
const hibira = new Pusher({
  appId: process.env.HIBIRA_APP_ID,
  key: process.env.HIBIRA_KEY,
  secret: process.env.HIBIRA_SECRET,
  host: 'ws.hibira.io',
  port: '443',
  useTLS: true,
});
await hibira.trigger('orders', 'order-shipped', { id: 1024 });
```

## Rules

1. Look at the project first and follow its conventions for config, env variables and where integrations live.
2. One shared client per process (a module, service or provider), not one per request or component.
3. **The app secret stays on the server.** Browser and mobile code only get the key. Never commit real values; add placeholders to `.env.example`.
4. Unsubscribe and unbind when a component or widget is disposed.
5. Pick the channel type:
   - `orders`: public, anyone with the key can listen.
   - `private-...`: the client asks your backend's auth route, which checks the session and signs with the secret (`pusher.authorizeChannel()`).
   - `presence-...`: private plus a member list with user info; fine up to a few hundred members.
   - `presence-large-...`: up to 100,000 members; subscribers get a count, a sample and batched deltas once a second. Use `@hibira-io/large-presence` (or `window.Hibira.largePresence` with the embed script).
6. Client events (`client-...`) must be turned on in the app settings and only work on private and presence channels.
7. The browser origin must be in the app's allowed origins, or the connection is refused. Add `http://localhost:<port>` for local development.
8. Channel history (Hobby plan and up, turned on per app) lets a client catch up after a reconnect with `pusher:rewind`.
9. Webhooks are Pusher-compatible (`X-Pusher-Signature`), so `pusher.webhook(request)` and existing handlers work unchanged. Endpoints must be public https.

## Verify

Publish a test event (MCP `send_test_event`, or the Debug console on the app page) on a channel the code subscribes to and watch it arrive. Tell the user which files changed and where to fill in the secret.
