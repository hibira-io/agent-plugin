---
name: migrate-from-pusher
description: Move an existing Pusher Channels or Pusher Beams integration to Hibira. Use when a project already uses pusher-js, Laravel Echo with the pusher broadcaster, a Pusher server SDK, Beams push notifications, or Pusher webhooks, and the user wants to switch to Hibira.
---

# Migrating from Pusher to Hibira

Hibira speaks the Pusher Channels protocol and the Pusher Beams v1 API, so a migration is configuration, not a rewrite. Channel names, event names, auth routes, presence data and webhook handlers stay the same.

## Steps

1. **Find every Pusher touch point.** Search for `pusher`, `Pusher(`, `PUSHER_`, `Echo`, `beams`, `PushNotifications`, `X-Pusher-Signature`. List clients (browser, mobile), servers, auth routes, webhook handlers and env files before changing anything.
2. **Get Hibira credentials.** With the MCP server, `list_apps` / `create_app`, then `get_app` for host and cluster. Otherwise the user copies app ID, key and secret from the Hibira portal.
3. **Channels clients**: keep the library, add the host. For pusher-js that is `wsHost`, `wsPort: 443`, `wssPort: 443`, `forceTLS: true`, `enabledTransports: ['ws', 'wss']`, and the Hibira cluster. Laravel Echo takes the same options. Flutter apps on `pusher_channels_flutter` move to the `hibira` Dart package, because the official one cannot change its host.
4. **Channels servers**: keep the SDK, add `host` (and port/TLS where the SDK asks). In Laravel, `composer require hibira-io/laravel` and `php artisan hibira:install` set up the `HIBIRA_*` env; projects that keep the `pusher` broadcaster can instead set `PUSHER_HOST`, `PUSHER_PORT=443`, `PUSHER_SCHEME=https`.
5. **Env**: replace values, keep the variable names the project already uses unless the user wants `HIBIRA_*`. Update `.env.example`. Never commit real secrets.
6. **Allowed origins**: add every site origin (and localhost for dev) to the Hibira app, or browsers are refused.
7. **Webhooks**: register the same URLs in the Hibira app. Signatures use the Hibira app secret, so the existing verification code works once the secret is swapped.
8. **Beams push**: swap the SDKs for the Hibira forks, which keep the Beams API: `@hibira-io/push-web`, `hibira-push-ios` (Swift package `HibiraPush`), `hibira-push-android`, `hibira_push` for Flutter. Upload the APNs key and FCM service account in the portal, then point the server's Beams client at the Hibira instance and host. See the `push-notifications` skill.
9. **Cut over safely**: deploy server and clients reading the new env together, or run a short dual-publish window (publish to both) while old clients age out.

## Verify

Publish a test event to a channel a page subscribes to and watch it arrive (MCP `send_test_event` + `watch_debug_events`, or the portal Debug console). Check one private or presence channel so the auth route is exercised.
