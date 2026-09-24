#!/usr/bin/env node
// Rebuilds library/ and INDEX.md from a checkout of VoltAgent/awesome-design-md.
//
//   git clone --depth 1 https://github.com/VoltAgent/awesome-design-md /tmp/awesome-design-md
//   node .claude/skills/design-md-library/update.mjs /tmp/awesome-design-md
//
// Every design-md/<site>/DESIGN.md becomes library/<site>.md, unchanged. INDEX.md
// lists each one with its own one-line description, so the skill can pick a
// reference without reading all of them.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const src = process.argv[2];
if (!src || !existsSync(join(src, 'design-md'))) {
  console.error('usage: node update.mjs <path to a checkout of VoltAgent/awesome-design-md>');
  process.exit(1);
}

const lib = join(here, 'library');
rmSync(lib, { recursive: true, force: true });
mkdirSync(lib);

// One line that says what the design system is: the front-matter description,
// or for the few files without front matter, the first paragraph of prose.
function summary(text) {
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (fm) {
    const d = fm[1].match(/^description:\s*(.+)$/m);
    if (d) return d[1].trim().replace(/^["']|["']$/g, '');
  }
  const para = text.replace(/^---[\s\S]*?\n---\n/, '').split(/\n\s*\n/)
    .map(p => p.trim()).find(p => p && !p.startsWith('#') && !p.startsWith('|') && !p.startsWith('-'));
  return (para || '').replace(/\s+/g, ' ');
}
const clip = (s, n) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n)) + '…' : s);

const rows = [];
for (const site of readdirSync(join(src, 'design-md')).sort()) {
  const file = join(src, 'design-md', site, 'DESIGN.md');
  if (!existsSync(file) || !statSync(file).isFile()) continue;
  const text = readFileSync(file, 'utf8');
  writeFileSync(join(lib, `${site}.md`), text);
  rows.push(`| \`${site}\` | ${clip(summary(text), 220).replace(/\|/g, '\\|')} |`);
}

let commit = 'unknown';
try { commit = execFileSync('git', ['-C', src, 'rev-parse', '--short', 'HEAD']).toString().trim(); } catch {}

writeFileSync(join(here, 'INDEX.md'), `# Design system index

${rows.length} design systems from [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) at \`${commit}\`.
Each one is \`library/<name>.md\`. Read this list first, then open only the files you need.

| Name | What it is |
|---|---|
${rows.join('\n')}
`);
console.log(`library: ${rows.length} files, INDEX.md written (source ${commit})`);
