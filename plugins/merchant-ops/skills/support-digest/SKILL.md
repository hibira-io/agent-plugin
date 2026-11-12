---
name: support-digest
description: Build a daily (or weekly) Hibira Live Chat support digest as a sheet: conversations, how many the chat assistant solved alone, handoffs to people, unanswered chats, first reply times, ratings, top questions and knowledge base gaps, plus waiting room activity. Use when a store or support team asks how support went yesterday, this week or on sale day, wants a customer service report, summary, digest or recap, asks what customers asked about, or which questions the assistant could not answer.
---

# Support digest

A short report a store owner or support lead reads in two minutes: what happened in Live Chat over a period, what needs follow-up, and what to add to the knowledge base so it happens less. Output it as a sheet when the client can make one.

## 1. Period and workspace

- **Period**: default is yesterday, midnight to midnight in the merchant's time zone. Ask for the time zone once if you do not know it. "This week", "sale day" or a date range work the same way.
- **Workspace**: `list_agents` on the `hibira-live-chat` MCP server shows which Live Chat workspace is signed in and who is on the team.

## 2. Get the conversations

The Live Chat MCP server does not read conversations. Use the Live Chat REST API with a **read** key (Team and Business plans; an owner or admin creates it at https://chat.hibira.io/portal/developers, scope *read*).

- The merchant keeps the key in an environment variable, such as `HIBIRA_LIVECHAT_KEY`, in their own terminal or secret store. **Never ask them to paste it into chat, never print it and never write it to a file.** If they paste it anyway, tell them to revoke it in the portal and create a new one.
- This needs a client that can run shell commands. Without a shell, or without a key, see *No API key* below.

List conversations, newest activity first, 100 a page:

```sh
curl -s -H "Authorization: Bearer $HIBIRA_LIVECHAT_KEY" \
  "https://chat.hibira.io/v1/conversations?status=all&limit=100"
```

Keep calling with `&before=<next_before>` from the previous page until `next_before` is `null` or the last conversation's `updated_at` is before the period start. Then keep only conversations whose `created_at` is inside the period. Ratings for the period:

```sh
curl -s -H "Authorization: Bearer $HIBIRA_LIVECHAT_KEY" \
  "https://chat.hibira.io/v1/ratings?since=<period start, RFC 3339>"
```

At most 10 requests a second per key; pause and retry on `429`. Work on the JSON in memory or in a temporary file you delete afterwards; do not keep visitor data around.

### No API key

- **Business plan**: the same numbers are on https://chat.hibira.io/portal/reports (pick the period). Ask the merchant for the figures, or a screenshot of the page, and build the summary tab from it. There are no per-conversation rows, so skip *Needs follow-up* and say why.
- **Starter, or no key wanted**: say what the key would add, point to the portal's inbox and ratings pages, and still do the waiting room part (step 4).

## 3. Count

For each conversation created in the period (the same rules as the Reports page):

| Bucket | Rule |
|---|---|
| **Answered by a person** | `agents` has anyone other than `ai`, or `first_reply_at` is set |
| **Solved by the assistant alone** | not the above, and `ai_replies` > 0 |
| **Unanswered** | neither |
| **Handoffs** | `ai_handoff` is `true` (the assistant passed it to a person); count separately |
| **Offline** | `offline` is `true` (arrived when nobody was online) |
| **Still open** | `status` is `open`; **waiting now** when `waiting_since` is set |
| **Channel** | `channel`, empty means the website widget |

Also work out:

- **Assistant share**: solved by the assistant alone ÷ (alone + by a person). Leave it out when there were no answered chats.
- **First reply time**: median and slowest of `first_reply_at − created_at`, for chats a person answered.
- **Ratings**: count, average `score` (1 to 5), and how many are 2 or below. Each rating's `comment` is useful for themes.
- **Busiest hours**: count by hour of `created_at` in the merchant's time zone.

Compare with the period before (yesterday vs the day before, this week vs last week) when the data is there; one number with an arrow is enough.

## 4. Waiting room activity

If the merchant uses waiting rooms, call `list_waiting_rooms` for each app (`list_apps` first). Report rooms that were open in the period, with state, admitted and still waiting. A sale day with many chats usually explains itself once the room's numbers sit next to it.

## 5. Read what people asked

Open the conversations that teach the most, up to about 20: handoffs first, then low ratings, then unanswered and the longest waits.

```sh
curl -s -H "Authorization: Bearer $HIBIRA_LIVECHAT_KEY" \
  "https://chat.hibira.io/v1/conversations/<id>"
```

From them, write:

- **Top questions**: 3 to 7 themes in a few words each ("Where is my order", "Size exchange", "Payment failed at checkout"), with a count.
- **Knowledge gaps**: questions the assistant handed off or got wrong because the knowledge base had no answer. For each, a suggested entry in the import file format of the `livechat-knowledge` skill in the `hibira` plugin, written only from the team's own replies in those conversations. Mark anything you are unsure of for the merchant to confirm; never invent a policy.
- **Needs follow-up**: open conversations still waiting, and low ratings nobody answered, with the link `https://chat.hibira.io/inbox/<id>`.

Messages marked `internal: true` are the team's notes: use them to understand, never quote them as answers.

## 6. Output

**Sheet first.** If the client can create a spreadsheet (a Claude Sheet, Google Sheets, Excel) use these tabs; otherwise write the same tables in Markdown and, when files can be saved, `support-digest-YYYY-MM-DD.csv` (or `.xlsx`).

1. **Summary**: period, conversations, by a person, assistant alone, unanswered, handoffs, offline, still open, assistant share, first reply median and slowest, ratings count, average and low, each with the change from the previous period.
2. **By day** (multi-day periods) or **By hour** (one day).
3. **Top questions**: theme, count, example wording (paraphrased, no names).
4. **Knowledge gaps**: question, suggested answer, source conversation link, confirm (yes/no).
5. **Needs follow-up**: link, waiting since or rating, channel, one-line reason.
6. **Waiting rooms**, when there were any.

A whiteboard suits the top questions as clusters if the merchant asks for one; the numbers stay in the sheet.

End with three lines in chat: the headline ("142 chats, 61% solved by the assistant, 3 still waiting"), the one thing to fix, and the knowledge entries ready to import at https://chat.hibira.io/portal/knowledge.

## Privacy

- No visitor names, emails, phone numbers, order numbers or addresses in the digest. Use conversation links; the team opens them in the inbox.
- Paraphrase questions; quote at most a few words.
- The digest is for the merchant's team. Do not send it anywhere they did not ask for.

## Running it every day

The digest is the same steps each time. In a client with scheduled tasks, offer to run it every morning for the day before, with the key read from the environment as above.
