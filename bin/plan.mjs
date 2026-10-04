#!/usr/bin/env node
// The planning command line tool for The App Teardown Handbook.
//
//   node bin/plan.mjs new "<idea>" | --file idea.md          Plan and build a new app from an idea
//   node bin/plan.mjs rebuild <store link>... [--competitors] Research an existing app, then plan a new one
//   node bin/plan.mjs feature "<feature>" [--repo <path>]     Plan and build a feature in an existing codebase
//   node bin/plan.mjs chapters                                List the chapters
//   node bin/plan.mjs find <words>                            Chapters and decisions that match some words
//   node bin/plan.mjs decisions --chapter <n>                 The decisions a chapter covers
//
// Add --print to a mode to print the playbook instead of starting an agent.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// npm runs scripts from the package root, so INIT_CWD is where the user really is.
const here = process.env.INIT_CWD ?? process.cwd();
const [command, ...rest] = process.argv.slice(2);

const VALUE_FLAGS = ['file', 'repo', 'chapter', 'out'];
const flags = {};
const args = [];
for (let i = 0; i < rest.length; i++) {
  const arg = rest[i];
  if (!arg.startsWith('--')) args.push(arg);
  else if (VALUE_FLAGS.includes(arg.slice(2))) flags[arg.slice(2)] = rest[++i];
  else flags[arg.slice(2)] = true;
}

const fail = (message) => {
  console.error(message);
  process.exit(1);
};
const has = (cmd) => spawnSync('sh', ['-c', `command -v ${cmd}`]).status === 0;

const readYaml = (file) => parse(readFileSync(join(root, 'src', 'data', file), 'utf8'));
const outlineChapters = () =>
  readYaml('outline.yaml').parts.flatMap((part) =>
    part.sections.flatMap((section) => section.chapters.map((chapter) => ({ ...chapter, part: part.title }))),
  );
const chapterData = () =>
  readdirSync(join(root, 'src', 'data', 'chapters'))
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => readYaml(join('chapters', file)))
    .sort((a, b) => a.chapter - b.chapter);

const slugify = (text) =>
  text.toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 5).join('-') || 'plan';

// The slug of a store link: the app's name on the App Store, the package's last part on Google Play.
const linkSlug = (link) => {
  const apple = link.match(/apps\.apple\.com\/.*\/app\/([^/]+)\//);
  if (apple) return slugify(apple[1]);
  const play = link.match(/[?&]id=([\w.]+)/);
  if (play) return slugify(play[1].split('.').pop());
  return slugify(link.replace(/^https?:\/\//, ''));
};

const freshDir = (base, slug) => {
  let dir = join(base, 'plans', slug);
  for (let n = 2; existsSync(dir); n++) dir = join(base, 'plans', `${slug}-${n}`);
  return dir;
};

// PLAN_PLAYBOOK.md holds the shared steps, then one block per mode, split by <!-- name --> lines.
const playbookParts = () => {
  const parts = {};
  let name = null;
  for (const line of readFileSync(join(root, 'PLAN_PLAYBOOK.md'), 'utf8').split('\n')) {
    const marker = line.match(/^<!-- ([\w:]+) -->$/);
    if (marker) name = marker[1];
    else if (name) parts[name] = `${parts[name] ?? ''}${line}\n`;
  }
  return parts;
};

const MODES = {
  new: 'A new app from a new idea',
  rebuild: 'A new app in the space of an existing one, informed by real reviews',
  feature: 'A feature in an existing codebase',
};

const startMode = (mode, { input, slug, base, values = {}, cwd }) => {
  const dir = flags.out ? resolve(here, flags.out) : freshDir(base, slug);
  const parts = playbookParts();
  const fill = (text) =>
    Object.entries({ HANDBOOK: root, MODE: MODES[mode], DIR: dir, INPUT: input, ...values }).reduce(
      (out, [key, value]) => out.replaceAll(`{{${key}}}`, value),
      text,
    );
  // Mode blocks go in first, so the placeholders inside them are filled too.
  const prompt = fill(parts.core.replace('{{MODE_STEPS}}', parts[mode].trim()).replace('{{BUILD_RULES}}', parts[`${mode}:build`].trim()));

  const agent = ['claude', 'codex'].find(has);
  if (flags.print || !agent) {
    if (!agent) console.error('No AI coding agent (claude or codex) is on the PATH. Give the prompt that follows to your agent yourself.\n');
    console.log(prompt);
    return;
  }
  mkdirSync(dir, { recursive: true });
  console.log(`\nStarting ${agent}. It will ask you questions, then write the plan to ${dir}/\n`);
  // Claude Code needs to be told it may read the handbook when it runs in another folder.
  const extra = agent === 'claude' && resolve(cwd) !== resolve(root) ? ['--add-dir', root] : [];
  spawnSync(agent, [...extra, prompt], { stdio: 'inherit', cwd });
};

const commands = {
  new: () => {
    const input = flags.file ? readFileSync(resolve(here, flags.file), 'utf8').trim() : args.join(' ').trim();
    if (!input) fail('Usage: npm run new-app -- "<your idea, as much detail as you have>"   or   npm run new-app -- --file idea.md');
    startMode('new', { input, slug: slugify(input), base: root, cwd: root });
  },

  rebuild: () => {
    const links = args.filter((arg) => /^https?:\/\//.test(arg));
    if (!links.length) fail('Usage: npm run rebuild-app -- <App Store or Google Play link> [more links] [--competitors] ["notes on what you want to build"]');
    const notes = args.filter((arg) => !links.includes(arg)).join(' ');
    startMode('rebuild', {
      input: [...links, notes && `Notes from the user: ${notes}`].filter(Boolean).join('\n'),
      slug: linkSlug(links[0]),
      base: root,
      cwd: root,
      values: { COMPETITORS: flags.competitors ? 'on' : 'off (ask the user once whether they want it)' },
    });
  },

  feature: () => {
    const input = flags.file ? readFileSync(resolve(here, flags.file), 'utf8').trim() : args.join(' ').trim();
    if (!input) fail('Usage: node <handbook>/bin/plan.mjs feature "<the feature>" [--repo <path to your codebase>]');
    const repo = resolve(here, flags.repo ?? '.');
    if (!existsSync(repo)) fail(`No folder at ${repo}`);
    if (repo === resolve(root)) fail('Point --repo at your own codebase, or run this command from inside it. The handbook itself is not the target.');
    startMode('feature', { input, slug: slugify(input), base: repo, cwd: repo, values: { REPO: repo } });
  },

  chapters: () => {
    let part = '';
    for (const chapter of outlineChapters()) {
      if (chapter.part !== part) console.log(`\n${(part = chapter.part)}`);
      console.log(`  ${String(chapter.n).padStart(2)}. ${chapter.title}: ${chapter.question}`);
    }
  },

  find: () => {
    const words = args.join(' ').toLowerCase().split(/\s+/).filter((word) => word.length > 2);
    if (!words.length) fail('Usage: node bin/plan.mjs find <words>');
    const score = (text) => words.filter((word) => text.toLowerCase().includes(word)).length;
    const titles = Object.fromEntries(outlineChapters().map((chapter) => [chapter.n, chapter]));
    const hits = chapterData()
      .map((data) => {
        const chapter = titles[data.chapter] ?? { title: '', question: '' };
        const fields = (data.worksheet ?? []).filter((field) => score(field.label));
        const signals = (data.signals ?? []).filter((signal) => score(JSON.stringify(signal)) === words.length);
        const total = score(`${chapter.title} ${chapter.question}`) * 3 + fields.length + signals.length;
        return { data, chapter, fields, signals, total };
      })
      .filter((hit) => hit.total)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
    if (!hits.length) return console.log('Nothing matched. Run `chapters` and choose by title.');
    for (const hit of hits) {
      console.log(`\nChapter ${hit.data.chapter}. ${hit.chapter.title}`);
      for (const field of hit.fields.slice(0, 6)) console.log(`  decision: ${field.label}${field.options ? ` [${field.options.join(' | ')}]` : ''}`);
      if (hit.signals.length) console.log(`  ${hit.signals.length} matching signal${hit.signals.length > 1 ? 's' : ''} in src/data/chapters/${hit.data.chapter}.yaml`);
    }
  },

  decisions: () => {
    const number = Number(flags.chapter ?? args[0]);
    const data = chapterData().find((chapter) => chapter.chapter === number);
    if (!data) fail('Usage: node bin/plan.mjs decisions --chapter <n>   (chapters 7 to 55 have decisions)');
    const chapter = outlineChapters().find((c) => c.n === number);
    console.log(`Chapter ${number}. ${chapter.title}\n${chapter.question}\n`);
    for (const field of data.worksheet ?? []) {
      console.log(`- ${field.label} (${field.id})`);
      if (field.options) console.log(`    options: ${field.options.join(' | ')}`);
      // The probe outcomes that fill this field say how each option behaves for a user.
      for (const probe of data.probes ?? [])
        for (const outcome of probe.outcomes ?? [])
          if (outcome.fills?.[field.id] !== undefined) console.log(`    ${outcome.fills[field.id]}: ${outcome.reading} (${probe.id})`);
    }
    console.log(`\nRead the chapter for the trade-offs: src/content/docs/ (file starting with ${number}-)`);
  },
};

if (!commands[command]) fail(`Usage: node bin/plan.mjs <${Object.keys(commands).join(' | ')}>`);
commands[command]();
