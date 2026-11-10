---
name: gaya-review
description: Put work in progress (landing page copy, a product or feature name, pricing, an onboarding flow, a launch post, a plan or an RFC summary) in front of a Gaya panel of AI personas, then turn their verdict into concrete edits. Use when the user asks how their copy, naming, pricing or plan will land with customers, wants a panel review or audience reaction, or asks Gaya to review something in the project.
---

# Review work with a Gaya panel

This skill uses the same `gaya` MCP server as `gaya-ask-group` (read that skill for the tools, sign-in and costs). The difference is the job: here the input is something in the user's project and the output is a short list of changes, not just an opinion.

## Steps

1. **Find the thing to review** in the project: the hero text in a landing page component, the pricing table, a README intro, a release post draft, the options in a naming discussion. Read it; do not review what you have not read.
2. **Agree on the question.** One decision per room: "Which of these 3 headlines makes a small shop owner want to try it?" works; "review my site" does not. If the user did not say who the audience is, ask, or state your assumption in the question.
3. **Condense to 500 characters.** Quote the actual words being judged (the headlines, the price points, the names) and the context that matters (audience, goal, constraints). Drop markup and boilerplate. Number the options so the verdict can refer to them. Never include secrets, unreleased financials the user did not choose to share, or anyone's personal data.
4. **Ask** with `ask_group`, choosing a cast that resembles the audience when `list_groups` has one (for example `launch`, `brand`, `shop`, `smallbiz`, `devs`, or `redteam` to hunt for weak spots); otherwise the default group. Wait with `get_room` as needed.
5. **Turn the verdict into edits.** Summarize in a few lines (winner, vote, the main objection, the next step), give the room link, then propose specific changes in the files: the rewritten line, the reordered tiers, the renamed label. Mark which suggestions come from the panel and which are your own.
6. **Apply only what the user approves.** The panel is AI personas, not market research: present it as a quick gut check, and for decisions with real money behind them suggest testing with real users too.
7. **Second round (optional).** If the user changes the work and wants a re-check, `reply` in the same room with the new version so the panel compares it with the first, instead of opening a new room.

## Good questions

- "Two hero lines for a realtime API aimed at indie game developers: 1) ... 2) ... Which makes you want to click Start free, and what would you change?"
- "Pricing: Hobby $19, Starter $39, Pro $89. For a two-person SaaS, which plan would you pick and what feels off?"
- "Feature name for letting a support bot hand a chat to a person: Handover, Escalate or Call a human?"
