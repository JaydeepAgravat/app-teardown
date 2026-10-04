// Checks one chapter's MDX file and data file against the rules in STYLE.md.
// Usage: node scripts/check-chapter.mjs 12

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';

const n = Number(process.argv[2]);
if (!n) {
  console.error('Usage: node scripts/check-chapter.mjs <chapter number>');
  process.exit(2);
}

const docsRoot = 'src/content/docs';
const LEVELS = ['Observed', 'Inferred', 'Speculative'];
const problems = [];
const fail = (message) => problems.push(message);

// Every chapter page that exists, as a site path.
const pages = new Set();
for (const dir of readdirSync(docsRoot, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const file of readdirSync(join(docsRoot, dir.name))) {
    pages.add(`/${dir.name}/${file.replace(/\.mdx?$/, '')}/`);
  }
}
// Every chapter in the outline is a valid link target, written or not. A chapter's path is
// "/<part folder>/<number>-<title in lowercase, punctuation removed, spaces as hyphens>/".
const slugify = (title) => title.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-');
const outline = parse(readFileSync('src/data/outline.yaml', 'utf8'));
const planned = ['/contents/', '/lookup/', '/worksheet/', '/glossary/', '/probes/', '/interview/', '/further-reading/', '/examples/bluesky/', '/examples/expensify/'];
for (const part of outline.parts) {
  for (const section of part.sections) {
    for (const chapter of section.chapters) planned.push(`/${part.dir}/${chapter.n}-${slugify(chapter.title)}/`);
  }
}
planned.forEach((p) => pages.add(p));

// Locate the chapter file.
let file = null;
for (const dir of readdirSync(docsRoot, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const match = readdirSync(join(docsRoot, dir.name)).find((f) => f.startsWith(`${n}-`) && f.endsWith('.mdx'));
  if (match) file = join(docsRoot, dir.name, match);
}
if (!file) {
  console.error(`No file named "${n}-<slug>.mdx" under ${docsRoot}`);
  process.exit(1);
}

if (!planned.some((p) => file.endsWith(`${p.slice(1, -1)}.mdx`))) fail('File name does not match the slug derived from the outline title');

const source = readFileSync(file, 'utf8');
const front = source.match(/^---\n([\s\S]*?)\n---\n/);
if (!front) fail('Missing frontmatter');
const meta = front ? parse(front[1]) : {};
const body = front ? source.slice(front[0].length) : source;

if (!String(meta.title ?? '').startsWith(`${n}. `)) fail(`title must start with "${n}. "`);
if (!meta.description) fail('description is missing');
if (meta.sidebar?.order !== n) fail(`sidebar.order must be ${n}`);
if (/^# /m.test(body.replace(/```[\s\S]*?```/g, ''))) fail('Do not use a level-1 heading. The title comes from frontmatter');

try {
  await compile(body, { remarkPlugins: [remarkGfm] });
} catch (error) {
  fail(`MDX does not compile: ${error.message}`);
}

// Diagrams must use the kit.
const fences = [...body.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
fences.forEach((code, i) => {
  if (/^\s*flowchart/.test(code) && !code.includes('classDef store')) fail(`Diagram ${i + 1}: flowchart is missing the kit class block`);
  if (/^\s*sequenceDiagram/.test(code) && !code.includes('box rgba(')) fail(`Diagram ${i + 1}: sequence diagram has no colored zones`);
});

// Links to other pages must point at a real or planned page.
for (const [, target] of body.matchAll(/\]\((\/[^)#\s]*)(?:#[^)]*)?\)/g)) {
  if (!pages.has(target)) fail(`Link to a page that does not exist: ${target}`);
}

// Data file.
const dataFile = `src/data/chapters/${n}.yaml`;
const usedProbes = [...body.matchAll(/<Probe id="([^"]+)"/g)].map((m) => m[1]);
if (existsSync(dataFile)) {
  let data;
  try {
    data = parse(readFileSync(dataFile, 'utf8'));
  } catch (error) {
    fail(`${dataFile} does not parse: ${error.message}`);
  }
  if (data) {
    if (data.chapter !== n) fail('data: chapter number is wrong');
    if (!data.title) fail('data: title is missing');
    if (!pages.has(data.link)) fail(`data: link "${data.link}" is not a known page`);
    const fields = new Set((data.worksheet ?? []).map((f) => f.id));
    for (const field of data.worksheet ?? []) {
      if (!field.id?.startsWith(`c${n}-`)) fail(`data: worksheet id "${field.id}" must start with "c${n}-"`);
      if (!field.label) fail(`data: worksheet field ${field.id} has no label`);
    }
    for (const probe of data.probes ?? []) {
      if (!probe.id?.startsWith(`P${n}.`)) fail(`data: probe id "${probe.id}" must start with "P${n}."`);
      if (!probe.name || !Array.isArray(probe.do) || !probe.watch) fail(`data: probe ${probe.id} needs name, do (a list) and watch`);
      if (!Array.isArray(probe.outcomes) || probe.outcomes.length < 2) fail(`data: probe ${probe.id} needs at least two outcomes`);
      for (const outcome of probe.outcomes ?? []) {
        if (!outcome.label || !outcome.reading) fail(`data: probe ${probe.id} has an outcome without label or reading`);
        if (!LEVELS.includes(outcome.confidence)) fail(`data: probe ${probe.id} has confidence "${outcome.confidence}"`);
        for (const key of Object.keys(outcome.fills ?? {})) {
          if (!fields.has(key)) fail(`data: probe ${probe.id} fills unknown worksheet field "${key}"`);
        }
      }
      if (!usedProbes.includes(probe.id)) fail(`Probe ${probe.id} is defined in data but not placed in the chapter`);
    }
    for (const row of data.signals ?? []) {
      if (!row.signal || !row.design || !LEVELS.includes(row.confidence)) fail(`data: bad signal row "${row.signal}"`);
    }
    const known = new Set((data.probes ?? []).map((p) => p.id));
    for (const id of usedProbes) if (!known.has(id)) fail(`Chapter uses <Probe id="${id}" /> but the data file does not define it`);
  }
} else if (usedProbes.length > 0 || /<(Signals|WorksheetForm)/.test(body)) {
  fail(`Chapter uses data components but ${dataFile} does not exist`);
}

const words = body
  .replace(/```[\s\S]*?```/g, '')
  .replace(/^import .*$/gm, '')
  .split(/\s+/)
  .filter(Boolean).length;

console.log(`${file}`);
console.log(`  words (outside code and diagrams): ${words}`);
console.log(`  diagrams: ${fences.length}   probes placed: ${usedProbes.length}`);
if (problems.length > 0) {
  console.log(`  ${problems.length} problem(s):`);
  problems.forEach((p) => console.log(`   - ${p}`));
  process.exit(1);
}
console.log('  OK');
