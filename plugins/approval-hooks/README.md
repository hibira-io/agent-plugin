# Hibira approval hooks

Risky shell commands from Claude Code, Codex and Cursor wait until a second person approves them in your [Hibira Approvals](https://hibira.io/approvals) workspace. Everything else runs as usual.

| Waits for approval | Examples |
|---|---|
| Deleting files | `rm -rf src`, `find . -delete`, `git clean -fdx` (not `rm -rf node_modules`, `dist`, `build`) |
| Rewriting git history | `git push --force`, `git reset --hard`, `git branch -D`, `gh pr merge` |
| Deploys and releases | `vercel --prod`, `fly deploy`, `wrangler deploy`, `npm run deploy`, `make release` |
| Infrastructure | `terraform apply`, `pulumi up`, `kubectl delete`, `helm upgrade`, cloud CLI deletes |
| Publishing | `npm publish`, `cargo publish`, `docker push`, `gh release create` |
| Databases | `psql -c "DELETE ..."`, migrations, `redis-cli FLUSHALL` |

The approvers get the request on their phones with the full command, the folder, repository and branch, and the computer. The agent never sees an approval link, so it cannot approve itself. An approval lets that exact command run once; a rejection goes back to the agent with an instruction to stop. Commands are checked on your computer, and only the ones that wait count toward the workspace's monthly requests.

The hook is the `hook` command of [`@hibira-io/mcp-approval-gate`](https://github.com/hibira-io/mcp-approval-gate#coding-agents-approval-before-risky-shell-commands), run with `npx` (Node.js 20 or later). This plugin ships no scripts of its own.

## Install

1. Create a Hibira Approvals workspace and invite the approvers.
2. Connect this computer once:

   ```sh
   npx -y @hibira-io/mcp-approval-gate login --label "coding agent"
   ```

3. Install the plugin.

   **Claude Code**

   ```sh
   claude plugin marketplace add hibira-io/agent-plugin
   claude plugin install hibira-approval-hooks@hibira
   ```

   **Codex**

   ```sh
   codex plugin marketplace add hibira-io/agent-plugin
   codex plugin add hibira-approval-hooks@hibira
   ```

   Then review and trust the hook with `/hooks`.

   **Cursor**: install `hibira-approval-hooks` from the same marketplace, or clone this folder to `~/.cursor/plugins/local/hibira-approval-hooks`.

Check what would wait with `npx -y @hibira-io/mcp-approval-gate hook check -- terraform apply`. Rules (`always`, `never`, `approvers`, `wait`) go in `~/.config/hibira/approval-hook.json`; see the [settings](https://github.com/hibira-io/mcp-approval-gate#coding-agents-approval-before-risky-shell-commands).

This is a safety net against honest mistakes, not a sandbox. Keep production credentials out of the agent's reach as well.

## 中文摘要

让 Claude Code、Codex、Cursor 执行不可逆的 shell 指令前，先送到 Hibira Approvals 工作区等另一个人核准：删档（`rm -rf`）、`git push --force`、部署、`terraform apply`、发包、数据库写入等。核准后只放行那一条指令一次；驳回会附上理由回给 agent 并要求停手；其他指令照常执行，不占用每月审批次数。agent 拿不到审批链接，无法自己核准。安装：先执行 `npx -y @hibira-io/mcp-approval-gate login --label "coding agent"` 连接工作区，再 `claude plugin install hibira-approval-hooks@hibira`（Codex、Cursor 同一个 marketplace）。
