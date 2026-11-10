// Builds dist/hibira-chatgpt.zip for the ChatGPT plugin directory
// (platform.openai.com/plugins). The directory takes one MCP server per
// plugin, so the ZIP carries only `hibira` and the skills that use it.
// Usage: node scripts/openai-zip.mjs [demo-recording-url]
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const SERVER = 'hibira';
const SKIP_SKILLS = new Set(['livechat-sso']); // uses the Live Chat MCP server
const OUT = 'dist/hibira-chatgpt';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const manifest = read('.codex-plugin/plugin.json');
const openai = read('openai/submission.json');
const demo = process.argv[2] ?? openai.review.demo_recording_url;
if (demo) openai.review.demo_recording_url = demo;
else delete openai.review.demo_recording_url;

manifest.extensions = { ...(manifest.extensions ?? {}), 'com.openai': openai };

const errors = [];
const i = manifest.interface;
if (i.displayName.length > 30) errors.push('displayName is over 30 characters');
if (i.shortDescription.length > 30) errors.push('shortDescription is over 30 characters');
if (i.longDescription.length > 4000) errors.push('longDescription is over 4000 characters');
for (const k of ['composerIcon', 'composerIconDark', 'logo', 'logoDark']) {
  if (!i[k] || !existsSync(i[k])) errors.push(`interface.${k} file is missing`);
}
if (!existsSync(openai.onboardingSkill)) errors.push(`${openai.onboardingSkill} is missing`);
const cases = openai.review.test_cases;
if (cases.positive.length !== 5) errors.push('need exactly 5 positive test cases');
if (cases.negative.length !== 3) errors.push('need exactly 3 negative test cases');
for (const [loc, t] of Object.entries(openai.publication.translations ?? {})) {
  if (t.subtitle.length > 30) errors.push(`${loc} subtitle is over 30 characters`);
}
const mcp = read('.mcp.json').mcpServers[SERVER];
if (!mcp) errors.push(`.mcp.json has no ${SERVER} server`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

rmSync('dist', { recursive: true, force: true });
mkdirSync(join(OUT, '.codex-plugin'), { recursive: true });
writeFileSync(join(OUT, '.codex-plugin/plugin.json'), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(join(OUT, '.mcp.json'), JSON.stringify({ mcpServers: { [SERVER]: mcp } }, null, 2) + '\n');
cpSync('assets', join(OUT, 'assets'), { recursive: true });
for (const s of readdirSync('skills')) {
  if (!SKIP_SKILLS.has(s)) cpSync(join('skills', s), join(OUT, 'skills', s), { recursive: true });
}
cpSync('LICENSE', join(OUT, 'LICENSE'));

execFileSync('zip', ['-qrX', '../hibira-chatgpt.zip', '.'], { cwd: OUT });
console.log(`dist/hibira-chatgpt.zip: version ${manifest.version}, server ${mcp.url}${demo ? '' : ' (no demo URL yet)'}`);
