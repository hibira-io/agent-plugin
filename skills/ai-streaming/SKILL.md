---
name: ai-streaming
description: Stream Vercel AI SDK chat answers over Hibira channels with @hibira-io/ai-sdk so they survive reloads and dropped connections and reach every tab. Use when building a useChat UI, resumable AI chat, background generation, or streaming an agent's progress to a page.
---

# Streaming AI answers over Hibira

`@hibira-io/ai-sdk` is a `ChatTransport` for the Vercel AI SDK (versions 5, 6 and 7; v7 needs Node 22+). The API route answers at once, generation runs in the background, and chunks travel over a private Hibira channel. Any `useChat` works (React, Vue, Svelte, Angular).

What it gives: answers survive dropped connections, `useChat({ resume: true })` picks up an answer still being written after a reload (no Redis or stream store), and every tab subscribed to the chat sees it. Resume needs **channel history**, on Hobby plans and up, turned on in the app's settings.

```sh
npm install @hibira-io/ai-sdk pusher-js pusher
```

## Client

```tsx
'use client';
import { useChat } from '@ai-sdk/react';
import Pusher from 'pusher-js';
import { HibiraChatTransport } from '@hibira-io/ai-sdk';

const pusher = new Pusher(process.env.NEXT_PUBLIC_HIBIRA_KEY!, {
  cluster: 'hkg',
  wsHost: 'ws.hibira.io',
  forceTLS: true,
  channelAuthorization: { endpoint: '/api/hibira/auth', transport: 'ajax' },
});
const transport = new HibiraChatTransport({ pusher, api: '/api/chat' });

const { messages, sendMessage, status } = useChat({ id, messages: initialMessages, transport, resume: true });
```

The transport subscribes to `private-ai-chat-{chatId}` (override with `channel: (chatId) => ...`). Laravel Echo users pass `echo.connector.pusher`.

## Server

In the chat route, start `streamText` and hand its UI message stream to `publishUIMessageStream` from `@hibira-io/ai-sdk/server` with a server-side `pusher` client; in Next.js wrap the work in `after()` so the route returns at once. Read the package README for the exact signature of the installed version rather than guessing.

## Rules

- Add an auth route (`/api/hibira/auth`) that checks the user owns the chat before signing `private-ai-chat-{chatId}`; otherwise anyone could read another user's answers.
- The app secret stays on the server.
- For plain agent progress (not `useChat`), publish small events with the server SDK or the MCP tool `publish_event`; keep each event small (the payload limit is 4 KB on Free and 10 KB or more on paid plans).
- For tool calls that need a person's OK, see the `agent-approvals` skill.
