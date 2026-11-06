// Checks that every client manifest agrees on the plugin version and the MCP URL.
import { readFileSync, existsSync } from 'node:fs';

const MCP_URL = 'https://hibira.io/mcp';
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const errors = [];

const version = read('.claude-plugin/plugin.json').version;
const versions = {
  '.claude-plugin/marketplace.json': read('.claude-plugin/marketplace.json').metadata.version,
  '.cursor-plugin/plugin.json': read('.cursor-plugin/plugin.json').version,
  '.codex-plugin/plugin.json': read('.codex-plugin/plugin.json').version,
  'gemini-extension.json': read('gemini-extension.json').version,
  'plugin.json': read('plugin.json').version,
};
for (const [file, v] of Object.entries(versions)) {
  if (v !== version) errors.push(`${file}: version ${v}, expected ${version}`);
}

const urls = {
  '.mcp.json': read('.mcp.json').mcpServers.hibira?.url,
  'mcp.json': read('mcp.json').mcpServers.hibira?.url,
  'gemini-extension.json': read('gemini-extension.json').mcpServers.hibira?.httpUrl,
};
for (const [file, u] of Object.entries(urls)) {
  if (u !== MCP_URL) errors.push(`${file}: MCP URL ${u}, expected ${MCP_URL}`);
}

for (const p of ['assets/icon.png', '.claude-plugin/icon.png']) {
  if (!existsSync(p)) errors.push(`${p} is missing`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`ok: version ${version}, MCP ${MCP_URL}`);
