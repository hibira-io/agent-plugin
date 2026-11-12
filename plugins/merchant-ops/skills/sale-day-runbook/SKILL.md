---
name: sale-day-runbook
description: Run a flash sale, ticket drop, product launch or limited release with a Hibira waiting room and Hibira Live Chat, from the day before to sold out. Use when a store or event team says they have a sale, drop, presale, launch or restock coming, asks to prepare or check the waiting room, wants to open, pause, slow down, speed up or close the line, post a notice to people waiting, watch the queue live, or keep up with customer chats during the rush.
---

# Sale-day runbook

You are the operator next to the merchant on sale day. The merchant knows the sale; you run the checklist, watch the numbers and propose each change. **The merchant approves every change before you make it.**

Two Hibira products are involved:

- **Waiting room** (`hibira` MCP server): the line in front of the sale page. Tools: `list_apps`, `list_waiting_rooms`, `get_waiting_room`, `set_waiting_room`, `admit_waiting_room`, `open_waiting_room_panel`.
- **Live Chat** (`hibira-live-chat` MCP server, and the Live Chat REST API for the inbox): the chat on the store and, on the Event plan, on the waiting page itself. MCP tools: `list_agents`, `list_channels`, `test_channel`.

Both servers sign in with OAuth on first use. Never ask for a password, app secret or API key in chat.

## 0. Find the sale

Ask only what you cannot look up:

1. **Which sale**: name, start time with time zone, the page that sells it (the URL people land on), and roughly how many people they expect.
2. **Which app and room**: `list_apps`, then `list_waiting_rooms` for the app. If a room already points at that page (`return_urls`), use it. If there is none, go to step 1.
3. **Which Live Chat workspace**, if they use Live Chat: `list_agents` shows the workspace and its team.

Write the answers down at the top of the runbook (step 2) so nobody has to ask again during the rush.

## 1. Set up the room (the day before, or earlier)

If the room does not exist, propose one and create it after the merchant agrees:

| Field | What to set |
|---|---|
| `room` | Short and readable, such as `winter-presale`. It appears in the waiting page URL. |
| `state` | `paused` until the sale starts, or `open` with `starts_at`. Numbers are handed out in arrival order either way. |
| `starts_at` | The sale start in RFC 3339 with the merchant's offset, such as `2026-12-04T12:00:00+09:00`. |
| `shuffle` | Offer it for hyped drops: everyone who arrives before `starts_at` gets a random place, so refreshing early or bots racing the clock gain nothing. |
| `admit_per_minute` | Start at what the site and checkout can comfortably serve. If the merchant does not know, start low (for example 100 to 300) and raise it once the site holds. For a site that tracks how many people are shopping, `mode: "capacity"` with `max_active_users` instead. |
| `return_urls` | The sale page, and checkout if it is on another path. Same host. Without this, admitted people cannot be sent back. |
| `title`, `message` | The sale's name; purchase limits and what happens after they get in, in the shoppers' language. |
| `notice` | Leave empty for now. It is the live announcement line for sale day. |
| `logo_url`, `brand_color`, `hide_powered_by` | The store's look, if their plan allows it. |
| `turnstile` | Offer it when bots are a known problem. |
| `live_chat` | The Live Chat workspace ID, so people in line can ask questions (Event plan). |

Then check the page is actually protected. Open the waiting page link `https://ws.hibira.io/wait/APP_KEY/ROOM` yourself if you can browse, or ask the merchant to open the sale page in a private window: with the room paused, it must land on the waiting page. If it does not, protection is not installed yet; a developer sets it up with the waiting room guide (https://hibira.io/guides/waiting-room). Do not change the store's code from this skill.

## 2. Write the runbook

Make one runbook the whole team can follow. If the client can create a spreadsheet (a Claude Sheet, Google Sheets, Excel) or a whiteboard, use it; otherwise a Markdown table saved as `sale-day-runbook.md`, plus `sale-day-runbook.csv` when files can be saved. Columns: **When**, **What**, **Who**, **Done**.

Fill it from the merchant's sale, not a generic list. A typical skeleton:

| When | What |
|---|---|
| T-24h | Room created and paused, `starts_at` set, page redirect tested in a private window |
| T-24h | Live Chat answers ready for the questions this sale will get (see below) |
| T-24h | Who watches what: one person on the site and stock, one on chat, one approves line changes |
| T-1h | Agents signed in to Live Chat; messaging channels tested (`test_channel`) |
| T-1h | Waiting page title, message and look checked on a phone |
| T-0 | Line opens (by `starts_at`, or `state: "open"`); live panel open |
| T+5m | First check: site speed, checkout errors, queue moving, chats waiting |
| Every 10–15m | Same check; adjust the rate in steps |
| Low stock | Notice: "Few left in size M" or similar |
| Sold out | `state: "closed"` and a sold-out notice |
| After | Leave the room closed, run the support digest for the day |

**Live Chat answers.** The questions a sale brings are predictable: start time, purchase limits, sizes and stock, payment methods, shipping dates, "my page is stuck", "I lost my place". Draft them as Live Chat knowledge entries in the import file format of the `livechat-knowledge` skill in the `hibira` plugin (`{"items":[{"kind":"qa","title":"...","body":"..."}]}`), using only facts the merchant gives you. The merchant imports the file at https://chat.hibira.io/portal/knowledge. Never invent a policy, date or price.

## 3. Sale time

1. When the merchant says go (or `starts_at` arrives), confirm the room is open. If it is still `paused`, ask, then `set_waiting_room` with `state: "open"`.
2. Call `open_waiting_room_panel` for the room. In clients that show interactive panels it stays live by itself: people waiting, admitted, the rate, the last 15 minutes, with buttons to pause, change the rate, admit now and edit the notice (each asks the merchant first). Do not poll `get_waiting_room` while the panel is open. In clients without panels, the call returns the numbers as text; call `get_waiting_room` again at each check instead.
3. **Watch the chat queue** at each check if the merchant has a Live Chat API key (section *Reading the Live Chat inbox* below): open conversations nobody has picked up, and the oldest `waiting_since`. Otherwise ask the person on chat how far behind they are.

## 4. What to do when

Propose, wait for a yes, then act. Say what changes and what shoppers will see.

| Signal | Proposal |
|---|---|
| Site slow, checkout errors, payment provider failing | Lower `admit_per_minute` by a third to a half. If it keeps failing, `state: "paused"` until it recovers. The line keeps everyone's place. |
| Site comfortable and the line is long | Raise `admit_per_minute` by 20 to 30 percent, then wait one check before raising again. |
| Queue moved and you need to let a fixed group in (VIPs, a stuck batch) | `admit_waiting_room` with a small `count`. Never a big batch without a clear yes: that many people hit the page at once. |
| Stock running low on some items | `notice` (at most 280 characters), such as "Black, size M is sold out. Other sizes still available." |
| Everything sold out | `state: "closed"` (new visitors are turned away; passes already issued stay valid) and `notice: "Sold out. Thank you for waiting."`, in the shoppers' language. |
| Many chats ask the same thing | Answer it once for everyone: a `notice` on the waiting page, and a knowledge entry so the chat assistant answers it too. |
| Chats piling up, nobody free | Tell the merchant how many are waiting and since when; suggest more agents sign in, or a notice that answers the top question. |
| Bots or one person grabbing many places | Offer `turnstile: true` now, and `one_per_user` for the next sale (needs the store's developer). |

Keep a short log in the runbook (time, change, why) so the team can see what happened later.

## 5. After the sale

1. Keep the room `closed`, or `paused` if the merchant may restock. Rooms are deleted in the Hibira portal, never from here.
2. Report: when the line opened and closed, the highest number waiting and the number admitted (from the panel or `get_waiting_room`), every change from the log, and anything that went wrong.
3. Offer the `support-digest` skill for the sale day, to see what customers asked and what the chat assistant could not answer.

## Reading the Live Chat inbox

The Live Chat MCP server does not read conversations. For the inbox, use the Live Chat REST API with a **read** key (Team and Business plans; an owner or admin creates it at https://chat.hibira.io/portal/developers).

- The merchant puts the key in an environment variable, such as `HIBIRA_LIVECHAT_KEY`, in their own terminal or secret store. **Never ask them to paste it into chat, never print it and never write it to a file.** If they paste it anyway, tell them to revoke it in the portal and create a new one.
- This needs a client that can run shell commands. In a client without a shell, skip it and ask the person on chat instead.

```sh
curl -s -H "Authorization: Bearer $HIBIRA_LIVECHAT_KEY" \
  "https://chat.hibira.io/v1/conversations?status=open&assignee_id=none&limit=100"
```

Each conversation has `waiting_since` (set while the visitor waits for a reply), `last_from` (`visitor`, `agent` or `ai`), `ai_handoff` (the assistant passed it to a person) and `channel` (empty for the website widget). Report counts and the longest wait, not visitor names or messages. Link a conversation as `https://chat.hibira.io/inbox/<id>`. At most 10 requests a second per key.

## Safety

- Every write (`set_waiting_room`, `admit_waiting_room`) needs the merchant's yes first, with the exact change spelled out. The panel's buttons ask too.
- Pausing stops the line, closing turns new visitors away, a large admit floods the page. Say so before each.
- Do not change the store's code, prices or stock from this skill.
- Keep shopper data out of the runbook and reports: counts and times only.
