---
name: chat-api
description: Add in-app chat with stored history using the Hibira Chat API (beta). Use when building one-to-one or group messaging, support chat, unread counts, read receipts, typing indicators or push for offline users on top of Hibira, or when testing conversations with the MCP chat tools.
---

# Hibira Chat API

The Chat API stores conversations and messages and delivers them over the app's existing Hibira connection. **Your server** creates conversations, chooses members and sends messages on users' behalf; **clients** only connect, call `pusher.signin()` and listen on their user channel. Full reference: https://hibira.io/chat-api (Markdown copy: https://hibira.io/chat-api.md).

## Check access first

The API is in beta per account. A call to an app without it answers `403 the Chat API is not enabled for this app`. With the MCP server connected, `create_conversation` says so directly and gives the waitlist link (https://hibira.io/chat). Tell the user instead of working around it.

## Server side

Base URL `https://<app host>/apps/<APP_ID>/chat`, JSON bodies, signed exactly like the Pusher HTTP API (`auth_key`, `auth_timestamp`, `auth_version=1.0`, `body_md5`, `auth_signature` = HMAC-SHA256 of `METHOD\nPATH\nsorted query` with the app secret). Pusher server libraries only sign GET/POST to fixed paths, so write a small signer (the reference has a complete Node.js one) and keep the secret on the server.

| Need | Request |
|---|---|
| Create or replace a conversation | `PUT /conversations/{id}` with `name`, `members`, `metadata`, `roles` |
| Add / remove a member | `POST /conversations/{id}/members` `{user_ids}` / `DELETE /conversations/{id}/members/{user_id}` |
| Send as a user | `POST /conversations/{id}/messages` with `user_id` (a member), `text`, optional `name`, `metadata`, `push` |
| Catch up | `GET /conversations/{id}/messages?after=<seq>` or `?last=50` |
| Mark read | `POST /conversations/{id}/read` `{user_id, seq}` |
| Inbox with unread counts | `GET /users/{user_id}/conversations` |
| Token for a browser to call `/chat/me/...` itself | `POST /tokens` `{user_id, conversation_id?, join?, ttl?}` |

Conversation IDs are yours (1–128 of `A-Z a-z 0-9 _ - = @ , . ;`), such as `order-1042`. Use the same user IDs as `pusher.signin`. Max 100 members, 4,000-character text, 4 KB metadata.

## Client side

```js
const pusher = new Pusher(KEY, { cluster, wsHost, userAuthentication: { endpoint: '/pusher/user-auth' } });
pusher.signin();
pusher.user.bind('chat.message', ({ conversation_id, message }) => render(conversation_id, message));
pusher.user.bind('chat.read', ({ conversation_id, user_id, read_seq }) => markRead(conversation_id, user_id, read_seq));
```

Other events: `chat.conversation`, `chat.message_updated` (edit, delete, reaction), `chat.typing`, `chat.left`, `chat.deleted`. On reconnect, read `after` the last `seq` you have, and re-read the shown messages with `last=n` to pick up edits. For a ready React or plain JS view, use `@hibira-io/chat-ui` (https://hibira.io/guides/chat-ui).

## With the MCP server

| Tool | Scope | Use |
|---|---|---|
| `create_conversation` | write | Create a test conversation with members |
| `send_message` | write | Send as a member; members get `chat.message` live |
| `list_conversations` | read | A user's conversations with `unread` |
| `list_messages` | read | Newest messages, or those after a seq |

Typical check after wiring a project: `create_conversation` with two test users, open the app signed in as one, `send_message` as the other, confirm the message appears and `list_conversations` shows `unread: 1`, then mark it read from the app.

## Rules

- **Ask before writing to a production app.** Messages are delivered to real users and pushed to their phones (`push: "offline"` is the default; pass `push: "never"` for tests).
- **Monthly active users are billed.** A user who sends or marks read counts for the month (500 free per account). Use a few fixed test user IDs, not a new one per run.
- **Never put the app secret in client code.** Browsers use `/chat/me` with a user token from your server.
- Moderation (word filter, bans, mutes, reports), attachments and roles/internal notes are in the reference.
