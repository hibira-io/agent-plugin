---
name: gaya-ask-group
description: Get a second opinion from a group of AI personas with different points of view through the Gaya MCP server (gaya.hibira.io), and bring back their verdict. Use when the user asks what other people would think, wants a second opinion, a debate, pros and cons from several sides, or mentions Gaya or asking a group.
---

# Ask a Gaya group

Gaya (`https://gaya.hibira.io`) is a live group chat of AI personas with different points of view. A question opens a room; the group talks it over for one or two minutes and ends with a **verdict card**: the options with votes, each persona's stance, where they agree and disagree, and a next step. The room stays at `https://gaya.hibira.io/r/<id>`, where the user can read everything and join in.

The `gaya` MCP server (`https://gaya.hibira.io/mcp`) signs in with OAuth as the user's own Gaya account. Rooms are paid from that account: each AI message uses one of the user's AI replies. Your own message in a room is free.

## Tools

| Tool | Use it for |
|---|---|
| `list_groups` | Preset groups (casts) and the personas a custom cast can be made of |
| `ask_group` | Open a room with a question and wait up to 55 seconds for the verdict |
| `get_room` | A room's state, latest messages and, once done, the verdict; can wait up to 55 seconds |
| `reply` | Post as the user: a follow-up, a missing fact, or `@Name` to ask one persona; reopens the discussion and a new verdict follows |
| `list_rooms` | The user's latest rooms and how many AI replies they have left |

## Steps

1. **Only when it helps.** Use Gaya when the user wants several perspectives on a decision, a plan, wording or a dilemma. Do not open a room for a fact you can look up or a question with one right answer; it spends the user's replies.
2. **Write the question** the way the user would ask it, in their language, with the facts that matter (budget, audience, constraints, the options they are weighing). At most 500 characters, so condense. Never include secrets, passwords, other people's personal data or anything the user said is confidential.
3. **Pick the cast.** The default group is fine for most questions. If the topic has a fitting preset in `list_groups` (for example `career`, `money`, `founders`, `devs` or `redteam`), pass its `group`; or pass 2 to 6 `personas` for a custom mix.
4. **Ask and wait.** Call `ask_group`. If it answers that the group is still talking, call `get_room` with the `room_id` and `wait_seconds: 55`, and repeat at most a few times.
5. **Report honestly.** Give the verdict in a few lines: the leading option and the vote, the strongest disagreement, the suggested next step. Say it is the view of AI personas, not of real people or experts. **Always give the room link.**
6. **Follow up only if asked.** If the user wants to push back or add a fact, use `reply` (with `@Name` to ask one persona) and wait for the new verdict with `get_room`.

## If the tools are missing

The server is not connected. Ask the user to run `/mcp` and sign in to `gaya`, or add it by hand: `claude mcp add --transport http gaya https://gaya.hibira.io/mcp`. In Claude or ChatGPT on the web, they add `https://gaya.hibira.io/mcp` as a custom connector. If a call says no AI replies are left, tell the user; they can top up at `https://gaya.hibira.io`.
