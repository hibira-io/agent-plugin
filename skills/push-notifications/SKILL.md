---
name: push-notifications
description: Send push notifications to iOS, Android and browsers with Hibira Push (Beams-compatible). Use when adding device registration, interests, authenticated users, a service worker for Web Push, or sending notifications from a backend or agent.
---

# Hibira Push

Hibira Push delivers to iOS (APNs), Android (FCM) and browsers (Web Push). It speaks the Pusher Beams v1 HTTP API. Every app gets one push instance when push is enabled on its app page (Push notifications); that page shows the **instance ID** and **secret key** and takes the APNs `.p8` key and the FCM service account.

## Client SDKs

| Platform | Package | Notes |
|---|---|---|
| Web | `npm install @hibira-io/push-web` | Serve `/service-worker.js` at the site root containing `importScripts('https://cdn.jsdelivr.net/npm/@hibira-io/push-web@1/dist/service-worker.js')`. Chrome, Edge, Firefox, Opera, Safari 16.4+ |
| iOS / macOS | Swift package `https://github.com/hibira-io/hibira-push-ios`, product `HibiraPush` | iOS 15+. Enable the Push Notifications capability |
| Android | `hibira-push-android` via JitPack | Still needs a Firebase project and `google-services.json` |
| Flutter | `hibira_push` | |

If the Hibira MCP server is connected, `get_integration_guide` also has the push guides with the app's values filled in.

```js
import { Client } from '@hibira-io/push-web';

const push = new Client({ instanceId: import.meta.env.VITE_HIBIRA_PUSH_INSTANCE });
await push.start();
await push.addDeviceInterest('news');
```

Apps outside the default cluster set the endpoint (`https://ws-<cluster>.hibira.io`) on the client and in the service worker.

## Sending

- From a server: any Beams server SDK pointed at the Hibira host, authenticated with the instance's secret key (server only). Publish to **interests** (topics a device subscribed to) or to **users** (IDs you authenticate with a token from your backend).
- From an agent: the MCP tool `send_push` (interests or user IDs, title, body, optional tap URL). Confirm with the user before sending to real devices.

## Limits

Every plan includes push. The plan caps registered subscribers across all the account's apps and allows subscriber limit × 10 notifications per UTC day (Free: 2,000 subscribers, 20,000 a day). One notification is one device delivery, so an interest with 5,000 devices counts 5,000. Past the cap, publishes answer `429` with `Retry-After` until 00:00 UTC; past the subscriber limit, registration answers `402`. Do not retry these in a loop.
