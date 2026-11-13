---
name: approval-before-risky-actions
description: Get a second person's approval in Hibira Approvals before a coding agent does something hard to undo, such as deleting files, force-pushing, deploying, terraform apply, publishing a package or writing to a production database. Use when about to run such a step, when a Hibira approval hook blocked a command, or when the user wants agent guardrails or approval hooks set up.
---

# Approval before risky actions

Some steps cannot be taken back. Before running one, a second person should say yes. With Hibira Approvals, the request goes to the approvers' phones and the inbox at approvals.hibira.io; the agent never gets an approval link, so it cannot approve itself.

## What needs approval

- Deleting files outside build output: `rm -rf src`, `find . -delete`, `git clean -fdx`.
- Rewriting or deleting git history: `git push --force`, `git reset --hard`, `git branch -D`, deleting remote branches or tags, `gh pr merge`.
- Deploys and releases: `vercel --prod`, `fly deploy`, `wrangler deploy`, `firebase deploy`, `npm run deploy`, `make release`.
- Infrastructure: `terraform apply` or `destroy`, `pulumi up`, `cdk deploy`, `kubectl delete` or `apply`, `helm upgrade`, cloud CLI deletes.
- Publishing: `npm publish`, `cargo publish`, `twine upload`, `docker push`, `gh release create`.
- Database writes, above all production: `DELETE`, `UPDATE`, `DROP`, migrations (`prisma migrate deploy`, `artisan migrate --force`), `redis-cli FLUSHALL`.

Reading, building, testing, `terraform plan`, `git push` without force and dry runs do not need approval.

## With the approval hook installed

The `hibira-approval-hooks` plugin checks every shell command before it runs. Just run the command; the hook asks and waits (up to 10 minutes) while the approvers decide.

- **Approved**: the command runs once. A different command, or the same one later, asks again.
- **Rejected**: stop. Do not run it, split it up, rephrase it, or reach the same result another way. Tell the user who rejected it and their comment.
- **Still waiting**: tell the user it is waiting. When they say it was approved, run exactly the same command again; the hook picks up the same request instead of asking twice.
- **Not connected**: run `npx -y @hibira-io/mcp-approval-gate login --label "coding agent"` in the background, show the user the link and code it prints, and retry the command once it says connected.
- **Out of requests for the month**: stop and tell the user; a workspace admin can upgrade or allow safe commands locally.

Make each request easy to decide, and spend fewer of the workspace's monthly requests:

- Run the dry run first (`terraform plan -out=tfplan`, `prisma migrate diff`, `--dry-run`) and tell the user what will change, then run the real command once.
- One command per risky step. Do not chain unrelated risky steps with `&&`, and do not hide them inside scripts or `bash -c`.

## Without the hook: ask with the MCP tool

When the Hibira MCP server is connected but the hook is not installed (ChatGPT, claude.ai, other agents), ask before the step:

1. `request_approval` with a title such as `Deploy shop-web to production`, details that hold the exact command, the dry-run summary and how to undo it, and `expires_in_minutes` around 30.
2. Give the link to the user to pass to whoever approves (not to approve themselves), or send it with push interests.
3. Call `get_approval` until the status is `approved`, `rejected` or `expired`. Run the step only on `approved`, exactly as described in the request.

## Setting up the hook

1. Create a Hibira Approvals workspace and invite the approvers.
2. Connect the computer once: `npx -y @hibira-io/mcp-approval-gate login --label "coding agent"`.
3. Install the hook: `claude plugin install hibira-approval-hooks@hibira` (Codex: `codex plugin add hibira-approval-hooks@hibira`, then trust it in `/hooks`; Cursor: install the plugin from the same marketplace). Manual `settings.json` / `hooks.json` snippets are in the [mcp-approval-gate README](https://github.com/hibira-io/mcp-approval-gate#coding-agents-approval-before-risky-shell-commands).
4. Optional rules in `~/.config/hibira/approval-hook.json`: `always` and `never` (regexes), `approvers` (emails or groups), `wait` (seconds). `npx -y @hibira-io/mcp-approval-gate hook check -- <command>` shows whether a command would ask.

Never edit the user's hook settings to get a blocked command through.
