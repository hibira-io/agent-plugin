---
name: livechat-knowledge
description: Fill a Hibira Live Chat knowledge base (what the AI assistant answers visitors from) from the business's own FAQ, help pages, policies, docs or product data, as a JSON file the user imports in one click. Use when the user wants to import, write, update or clean up Live Chat knowledge base entries, FAQ answers or the AI assistant's sources.
---

# Hibira Live Chat knowledge base import

The Live Chat AI assistant answers visitors from the workspace's knowledge base and hands over to a person when it cannot. Entries are either a question with its answer (`qa`) or an article (`article`: a policy, a help page). Search is by words and by meaning, in any of the supported languages, so an entry does not have to match the visitor's wording.

You write a JSON file; the user imports it at `https://chat.hibira.io/portal/knowledge` with the **import** button (the file icon next to "New entry"). You never need a token or a password.

## File format

```json
{
  "items": [
    { "kind": "qa", "title": "How long does shipping take?", "body": "Orders ship within 2 business days. Delivery takes 3 to 5 days in Taiwan." },
    { "kind": "article", "title": "Returns and refunds", "body": "Unopened items can be returned within 14 days...", "url": "https://shop.example.com/returns" }
  ]
}
```

- `kind`: `qa` (default) or `article`.
- `title`: the question, or the article's title. At most 300 characters.
- `body`: the answer, or the article's text. Plain text, at most 20,000 characters. Split longer pages into several entries by section.
- `url` (optional): where an article came from; agents see it, visitors do not.
- At most 500 entries and 8 MB per file. The plan also caps the total (the portal shows "N of M entries").

Importing is safe to repeat: an entry with the same kind and title (any case) as one already there gets the new text instead of a duplicate. One invalid entry, or more new entries than the plan has room for, imports nothing, and the error names the entry (`entry 7: ...`).

## Steps

1. **Collect the sources** the user points at: an FAQ page, help center export, policy pages, `docs/`, a product CSV, past support emails they paste. Read only what they give you or what is clearly public on their site. If they gave nothing, ask which pages matter most (shipping, returns, payment, opening hours, account and order questions are the usual top ones).
2. **Write entries the way visitors ask.** One question per `qa` entry, phrased as a visitor would type it, with a complete, self-contained answer (do not say "see above"). Keep the business's own facts, numbers, links and tone; never invent a policy, price or date. If the source is unclear or out of date, leave the entry out and list it for the user to confirm.
3. **Language.** Write entries in the language the source is in. Add a second language only if the user asks; search by meaning already finds an entry for a question asked in another language.
4. **Leave out** anything private or internal: staff names, internal notes, personal data of customers, discount codes not meant for everyone, secrets.
5. **Save the file** as `hibira-knowledge.json` (or a name the user prefers) in the project, validate that it parses and every entry meets the limits above, and tell the user how many entries it has.
6. **Import.** Ask the user to open `https://chat.hibira.io/portal/knowledge`, press the import button and pick the file. The toast says how many entries were new and how many were updated.
7. **Test.** Under **AI assistant**, the user can try a question and see which entries the answer used. Suggest three real visitor questions to try.

## Keeping it current

Keep the JSON file in the repo next to the content it comes from. When the FAQ or a policy changes, update the matching entries and import again: same titles update in place. Removing an entry from the file does not delete it in Live Chat; the user deletes it in the portal.
