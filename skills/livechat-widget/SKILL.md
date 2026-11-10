---
name: livechat-widget
description: Add the Hibira Live Chat widget (chat.hibira.io) to a website or web app, in any framework, so visitors can chat with the business and its AI assistant. Use when the user wants a live chat, support chat or chat bubble on their site with Hibira Live Chat, an Intercom, Crisp or tawk.to alternative, or wants to open the chat from their own button.
---

# Hibira Live Chat widget

The widget is one plain script with no dependencies. It draws a chat button and panel in a shadow root (it cannot clash with the site's CSS), speaks the visitor's language (en, ja, ko, zh-TW, zh-CN, th, vi) and talks to `chat.hibira.io`.

```html
<script src="https://chat.hibira.io/w/v1.js" data-workspace="ws_..." async></script>
```

## Steps

1. **Find the workspace ID.** It starts with `ws_`. It is on the Live Chat portal's **Widget** settings page (`https://chat.hibira.io/portal/widget`), in the snippet shown there. If the `hibira-live-chat` MCP server is connected, `get_sso_setup` returns it as `workspace.id`. The ID is public (it ships in the page), so it may go in source or a public env variable such as `NEXT_PUBLIC_HIBIRA_CHAT_WORKSPACE`. There is no secret to handle.
2. **Allow the site.** In the same Widget settings, under "Sites the widget may run on", the user adds each origin the widget runs on, one per line (`https://shop.example.com`, and `http://localhost:3000` for development). The widget refuses any other site. You cannot do this for them; tell them exactly which origins to add.
3. **Add the script once, on every page that should show the chat**, just before `</body>` or in the shared layout. Follow the project's way of adding third-party scripts:
   - Plain HTML, PHP, Rails, Django, Laravel Blade: the tag in the base layout.
   - Next.js: `<Script src="https://chat.hibira.io/w/v1.js" data-workspace="ws_..." strategy="lazyOnload" />` from `next/script` in the root layout.
   - Nuxt: `useHead({ script: [{ src: 'https://chat.hibira.io/w/v1.js', 'data-workspace': 'ws_...', async: true }] })` in `app.vue`.
   - SPA without SSR (Vite, CRA, Angular, Svelte): the tag in `index.html`.
   - Shopify theme: the tag in `layout/theme.liquid`, before `</body>`. WordPress: the theme's footer (or the site's header and footer scripts setting).
   The script ignores a second copy, but do not add it per component or per route.
4. **Options** (attributes on the same tag):
   - `data-color="#0f766e"`: the button and header colour (hex).
   - `data-lang="ja"`: force a language instead of the browser's.
   - `data-launcher="none"`: no round button; the page opens the chat itself.
5. **Open it from the site's own buttons** (for example "Contact us" or "Talk to sales"):
   ```js
   function openChat(topic) {
     const go = () => window.HibiraLiveChat.open(topic ? { topic } : undefined);
     if (window.HibiraLiveChat) go();
     else window.addEventListener('hibira-livechat:ready', go, { once: true });
   }
   ```
   `{ topic: 'sales' }` marks a new conversation as a sales inquiry. `window.HibiraLiveChat.close()` closes the panel.
6. **Content Security Policy.** If the site sends a CSP, allow `https://chat.hibira.io` in `script-src` and `connect-src`, plus `wss://*.hibira.io` for live messages. If the workspace turns on bot checks, also allow `https://challenges.cloudflare.com` in `script-src` and `frame-src`. Put the page's nonce on the script tag; the widget reuses it for what it adds.

## Verify

Run the site, open the page, click the button and send a message. It shows up in the inbox at `https://chat.hibira.io/inbox`. If the button never appears, the origin is missing from the allowed sites, the workspace ID is wrong, or the CSP blocks the script (check the browser console).

## Related

- The AI assistant answers from the workspace's knowledge base: see the `livechat-knowledge` skill to fill it from the site's FAQ or help pages.
- Staff opening the inbox from the business's own admin panel: see the `livechat-sso` skill.
- Analytics: the Widget settings can send `hibira_chat_*` events to the site's own GA4 tag; nothing to code.
