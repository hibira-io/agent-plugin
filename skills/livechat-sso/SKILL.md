---
name: livechat-sso
description: Connect a business's own admin panel or back office to Hibira Live Chat (chat.hibira.io) single sign-on, so its staff open the Live Chat inbox from it without a separate login. Uses the hibira-live-chat MCP server to read the workspace's setup, write the signing code for the project's stack and check the tokens it makes. Use when the user mentions Hibira Live Chat SSO, agent sign-in, or opening the Live Chat inbox from their admin.
---

# Hibira Live Chat single sign-on

The business's server signs a short-lived HS256 JWT with the workspace's SSO secret and sends the staff member's browser to `https://chat.hibira.io/sso/jwt?jwt=<token>&return_to=/inbox`. Live Chat checks it, creates the agent on their first visit (while a seat is free) and signs them in for 12 hours.

The `hibira-live-chat` MCP server (`https://chat.hibira.io/mcp`) signs in with OAuth as a Live Chat **owner or admin**. It is separate from the `hibira` server (hibira.io realtime apps).

## Steps

1. **Read the setup.** Call `get_sso_setup`. It returns the workspace ID (the token's `iss`), the login URL, the claims, the seats and `next`.
2. **The secret is the user's job.** If single sign-on is off, ask the user to open `portal_sso_url`, press **Create a secret** and put it in the server's environment as `HIBIRA_LIVECHAT_SSO_SECRET` (a git-ignored `.env`, or the host's secret store). Never ask them to paste the secret into the chat, never print it, never write it into source code or commit it. If they rotate it later, the old one keeps working for a short grace period.
3. **Write the route.** Call `get_sso_snippet` with the project's stack (`node`, `laravel`, `php`, `python`, `django`, `rails`, `go`, `java`, `dotnet`). Add a staff-only route to the admin panel (behind its existing login and permission checks), plus a link or button such as "Live Chat" that points at it. The route signs a token **when it is clicked** and redirects; never sign tokens ahead of time or into cached pages.
   - `sub`: the user's stable ID in the project (not the email).
   - `email`, `name`: from the project's user.
   - `role`: `admin` for people who manage Live Chat settings, `agent` for everyone else. The token decides the role on every sign-in (the owner stays owner).
   - `jti`: a new random ID every time; `exp`: at most 5 minutes ahead (the snippets use 2).
   - `return_to`: `/inbox`, or `/inbox/<conversation id>` to open one conversation.
4. **Check before anyone clicks.** Run the project's code (a test, a one-off script or the route itself) to sign a sample token and pass it, or the whole URL, to `check_sso_token`. It verifies exactly like the real login, says what a real sign-in would do (sign in, link an invited agent, or create one) and lists every problem, without using up the `jti`. Fix and repeat until `ok` is true. Do not log the token in the project.
5. **Try it for real.** Ask the user to click the new link once. Then `list_agents` shows the agent with `via: sso` and their `external_id`.
6. **Optional: SSO only.** Only if the user asks, and only after a sign-in worked, call `set_sso_only` with `enabled: true` (owner only). Email sign-in then works for the owner only.

## Rules

- Never handle the SSO secret yourself beyond reading it from the environment in code.
- If `check_sso_token` says the signature does not match, the server has an old or mistyped secret: ask the user to check `HIBIRA_LIVECHAT_SSO_SECRET`, not to send it to you.
- `seats_full` means the plan has no free seat: the user removes an agent or upgrades in the portal.
- Other languages: sign a standard HS256 JWT with the claims from `get_sso_setup`.
