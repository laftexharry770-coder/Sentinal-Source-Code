#!/usr/bin/env node
// Starts the Playwright MCP server so Claude can open the site in a real
// browser, click through it and take screenshots of what it built.
//
// Browser choice, first match wins:
//   1. PLAYWRIGHT_MCP_EXECUTABLE_PATH, if you set it
//   2. the Chromium preinstalled in Claude Code cloud sessions
//   3. Playwright's own browser (on your machine: npx playwright install chromium)
//
// The cloud image ships an older Chromium than this Playwright release expects,
// so without step 2 the server would look for a browser that is not there.
//
// Chromium refuses to start its sandbox as root, and cloud sessions run as
// root, so the sandbox is switched off there and only there.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const VERSION = '0.0.82';
const CLOUD_CHROMIUM = '/opt/pw-browsers/chromium';

const args = ['-y', `@playwright/mcp@${VERSION}`, '--headless', '--isolated'];
const executable =
  process.env.PLAYWRIGHT_MCP_EXECUTABLE_PATH ||
  (existsSync(CLOUD_CHROMIUM) ? CLOUD_CHROMIUM : '');
if (executable) args.push('--executable-path', executable);
if (process.platform === 'linux' && process.getuid?.() === 0) args.push('--no-sandbox');

const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
