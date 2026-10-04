#!/usr/bin/env node
// The teardown command line. It gives an AI coding agent, or a person at a terminal,
// what the website gives a reader: the probes, a way to run them on an emulator or
// simulator, and a worksheet to record what was seen.
//
//   node bin/teardown.mjs start <app id>      Check prerequisites and hand the playbook to an agent
//   node bin/teardown.mjs doctor [app id]     Check the device and the app
//   node bin/teardown.mjs probes [options]    List probes as JSON
//   node bin/teardown.mjs device <action>     Drive the emulator or simulator
//   node bin/teardown.mjs record <dir> <probe id> <outcome number> [--note text] [--evidence file]
//   node bin/teardown.mjs field <dir> <field id> <value>
//   node bin/teardown.mjs report <dir>        Write report.md and teardown.json

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [command, ...args] = process.argv.slice(2);

const fail = (message) => {
  console.error(message);
  process.exit(1);
};
const run = (cmd, cmdArgs, options = {}) =>
  execFileSync(cmd, cmdArgs, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options });
const has = (cmd) => spawnSync('sh', ['-c', `command -v ${cmd}`]).status === 0;
const flag = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : (args[index + 1] ?? true);
};

// ---------- Probe data ----------

const chapters = () =>
  readdirSync(join(root, 'src/data/chapters'))
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => parse(readFileSync(join(root, 'src/data/chapters', file), 'utf8')))
    .sort((a, b) => a.chapter - b.chapter);

// What a probe needs, judged from its wording. This is a heuristic, so each probe also
// carries its full text and an agent must still read the steps before running it.
const NEEDS = [
  ['second-device', /\b(second device|two devices|both devices|device [AB]\b|on B\b|on A\b|another device|other device|second account|two accounts|another account|second person|helper)/i],
  ['elapsed-time', /\b(next day|a day|days|weeks?|overnight|several hours|an hour|a week|for as long as)/i],
  ['money', /\b(purchase|buy|checkout|subscribe|subscription|pay\b|payment|paywall|booking|book a)/i],
  ['writes', /\b(create|post\b|send|edit|delete|rename|react|like\b|upload|comment|follow|add an item|type |write )/i],
  ['hardware', /\b(walk|drive|move with|outdoors|wearable|watch\b|accessory|headset|call\b|camera)/i],
  ['reinstall', /\b(install the app|reinstall|uninstall|spare device|never had it|old version)/i],
  ['device-setting', /\b(clock|language|region|text size|screen reader|low-power|data-saver|restart the device|time zone)/i],
];

const describe = (chapter, probe) => {
  const text = `${probe.do.join(' ')} ${probe.watch}`;
  const needs = NEEDS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  const blocking = needs.filter((need) => ['second-device', 'elapsed-time', 'money', 'hardware', 'reinstall'].includes(need));
  return {
    id: probe.id,
    chapter: chapter.chapter,
    chapterTitle: chapter.title,
    link: chapter.link,
    name: probe.name,
    do: probe.do,
    watch: probe.watch,
    caution: probe.caution ?? null,
    outcomes: probe.outcomes.map((o, number) => ({ number, label: o.label, reading: o.reading, confidence: o.confidence, fills: o.fills ?? {} })),
    needs,
    runnableOnOneEmulator: blocking.length === 0,
  };
};

const allProbes = () => chapters().flatMap((chapter) => (chapter.probes ?? []).map((probe) => describe(chapter, probe)));

// ---------- Device control ----------

const android = {
  adb: (...a) => run('adb', a),
  shell: (...a) => run('adb', ['shell', ...a]),
  actions: {
    info: () => {
      const s = android.shell;
      return [`android ${s('getprop', 'ro.build.version.release').trim()}`, s('getprop', 'ro.product.model').trim(), s('wm', 'size').trim()].join(' | ');
    },
    installed: (app) => (android.shell('pm', 'list', 'packages', app).includes(`package:${app}`) ? 'yes' : 'no'),
    version: (app) => (android.shell('dumpsys', 'package', app).match(/versionName=(\S+)/) ?? [])[1] ?? 'unknown',
    launch: (app) => (run('adb', ['shell', 'monkey', '-p', app, '-c', 'android.intent.category.LAUNCHER', '1'], { stdio: ['ignore', 'pipe', 'ignore'] }), 'launched'),
    // A cold start, timed by the system. Reports milliseconds to the first drawn frame.
    'cold-start': (app) => {
      android.shell('am', 'force-stop', app);
      const component = android.shell('cmd', 'package', 'resolve-activity', '--brief', app).trim().split('\n').pop();
      const out = android.shell('am', 'start', '-W', '-n', component);
      return `first frame after ${(out.match(/TotalTime: (\d+)/) ?? [])[1]} ms (${(out.match(/LaunchState: (\w+)/) ?? [])[1]})`;
    },
    'force-quit': (app) => (android.shell('am', 'force-stop', app), 'force-quit'),
    // Ends the background process the way the operating system does under memory pressure.
    // Unlike a force-quit, the system keeps the app's saved state.
    'process-death': (app) => {
      android.shell('input', 'keyevent', 'KEYCODE_HOME');
      spawnSync('sleep', ['2']);
      android.shell('am', 'kill', app);
      const alive = (spawnSync('adb', ['shell', 'pidof', app], { encoding: 'utf8' }).stdout ?? '').trim();
      return alive ? 'still running' : 'process ended, saved state kept';
    },
    home: () => (android.shell('input', 'keyevent', 'KEYCODE_HOME'), 'home'),
    back: () => (android.shell('input', 'keyevent', 'KEYCODE_BACK'), 'back'),
    airplane: (state) => {
      android.shell('cmd', 'connectivity', 'airplane-mode', state === 'on' ? 'enable' : 'disable');
      return `airplane mode ${android.shell('settings', 'get', 'global', 'airplane_mode_on').trim() === '1' ? 'on' : 'off'}`;
    },
    'open-url': (url, app) => {
      const extra = app ? [app] : [];
      return android.shell('am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', url, ...extra).split('\n').slice(0, 4).join(' | ');
    },
    tap: (x, y) => (android.shell('input', 'tap', x, y), `tap ${x} ${y}`),
    'long-press': (x, y) => (android.shell('input', 'swipe', x, y, x, y, '900'), `long-press ${x} ${y}`),
    swipe: (x1, y1, x2, y2, ms = '300') => (android.shell('input', 'swipe', x1, y1, x2, y2, ms), 'swipe'),
    'scroll-down': (times = '1') => {
      for (let i = 0; i < Number(times); i++) android.shell('input', 'swipe', '640', '2000', '640', '700', '250');
      return `scrolled down ${times}`;
    },
    'scroll-up': (times = '1') => {
      for (let i = 0; i < Number(times); i++) android.shell('input', 'swipe', '640', '900', '640', '2200', '250');
      return `scrolled up ${times}`;
    },
    type: (text) => (android.shell('input', 'text', text.replace(/ /g, '%s')), 'typed'),
    screenshot: (file = 'screen.png') => {
      mkdirSync(dirname(resolve(file)), { recursive: true });
      writeFileSync(file, execFileSync('adb', ['exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024 }));
      return file;
    },
    // The text a user can read on screen, top to bottom, with tap coordinates.
    texts: () => {
      // The dump fails while the screen is animating, so try a few times.
      let xml = '';
      for (let attempt = 0; attempt < 4 && !xml.includes('<node'); attempt++) {
        const result = spawnSync('adb', ['shell', 'uiautomator', 'dump', '/sdcard/teardown-ui.xml'], { encoding: 'utf8' });
        if (`${result.stdout}${result.stderr}`.includes('dumped to')) xml = android.shell('cat', '/sdcard/teardown-ui.xml');
        else spawnSync('sleep', ['1']);
      }
      const rows = [];
      for (const node of xml.matchAll(/<node [^>]*>/g)) {
        const attr = (name) => (node[0].match(new RegExp(` ${name}="([^"]*)"`)) ?? [])[1] ?? '';
        const label = attr('text') || attr('content-desc');
        const bounds = attr('bounds').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
        if (!label || !bounds) continue;
        const [x1, y1, x2, y2] = bounds.slice(1).map(Number);
        rows.push({ y: y1, line: `${Math.round((x1 + x2) / 2)},${Math.round((y1 + y2) / 2)}  ${label.replace(/&#10;/g, ' / ').replace(/&amp;/g, '&').slice(0, 160)}` });
      }
      return [...new Set(rows.sort((a, b) => a.y - b.y).map((r) => r.line))].join('\n');
    },
    // Taps the first on-screen element whose text contains the given words.
    'tap-text': (...words) => {
      const wanted = words.join(' ').toLowerCase();
      const line = android.actions.texts().split('\n').find((l) => l.toLowerCase().includes(wanted));
      if (!line) fail(`No element on screen contains "${wanted}"`);
      const [x, y] = line.split('  ')[0].split(',');
      android.shell('input', 'tap', x, y);
      return `tapped "${line.split('  ')[1]}" at ${x},${y}`;
    },
    // What the device's own settings show for the app: app size, user data and cache.
    storage: (app) => {
      android.shell('input', 'keyevent', 'KEYCODE_HOME');
      android.shell('am', 'force-stop', 'com.android.settings');
      run('adb', ['shell', 'am', 'start', '--activity-clear-task', '-a', 'android.settings.APPLICATION_DETAILS_SETTINGS', '-d', `package:${app}`], { stdio: ['ignore', 'pipe', 'ignore'] });
      spawnSync('sleep', ['4']);
      android.actions['tap-text']('Storage');
      spawnSync('sleep', ['4']);
      const lines = android.actions.texts().split('\n').map((l) => l.split('  ')[1]);
      const after = (label) => lines[lines.indexOf(label) + 1] ?? 'unknown';
      android.shell('input', 'keyevent', 'KEYCODE_HOME');
      return ['App size', 'User data', 'Cache', 'Total'].map((label) => `${label} ${after(label)}`).join(' | ');
    },
    permissions: (app) => {
      const dump = android.shell('dumpsys', 'package', app);
      const requested = [...new Set([...dump.matchAll(/android\.permission\.([A-Z_]+)/g)].map((m) => m[1]))];
      const granted = [...new Set([...dump.matchAll(/android\.permission\.([A-Z_]+): granted=true/g)].map((m) => m[1]))];
      return `requested: ${requested.join(', ')}\ngranted: ${granted.join(', ')}`;
    },
    'font-scale': (value) => {
      if (value) android.shell('settings', 'put', 'system', 'font_scale', value);
      return `font scale ${android.shell('settings', 'get', 'system', 'font_scale').trim()}`;
    },
    wait: (seconds = '2') => (spawnSync('sleep', [seconds]), `waited ${seconds}s`),
  },
};

const ios = {
  actions: {
    info: () => run('xcrun', ['simctl', 'list', 'devices', 'booted']).trim(),
    installed: (app) => (spawnSync('xcrun', ['simctl', 'get_app_container', 'booted', app]).status === 0 ? 'yes' : 'no'),
    launch: (app) => run('xcrun', ['simctl', 'launch', 'booted', app]).trim(),
    'force-quit': (app) => (spawnSync('xcrun', ['simctl', 'terminate', 'booted', app]), 'force-quit'),
    'open-url': (url) => (run('xcrun', ['simctl', 'openurl', 'booted', url]), `opened ${url}`),
    screenshot: (file = 'screen.png') => (run('xcrun', ['simctl', 'io', 'booted', 'screenshot', file]), file),
    wait: (seconds = '2') => (spawnSync('sleep', [seconds]), `waited ${seconds}s`),
    // The simulator shares the computer's network and has no touch injection from the command
    // line, so these need the agent's own simulator tools or a person.
    airplane: () => fail('The iOS simulator shares the computer network. Turn the computer network off, or use an Android emulator for network probes.'),
    tap: () => fail('Tap is not available through simctl. Use your agent\'s simulator control tool.'),
  },
};

const platform = () => {
  const wanted = flag('platform');
  if (wanted) return wanted;
  if (has('adb') && run('adb', ['devices']).split('\n').slice(1).some((line) => /\tdevice$/.test(line))) return 'android';
  if (has('xcrun') && /Booted/.test(spawnSync('xcrun', ['simctl', 'list', 'devices', 'booted'], { encoding: 'utf8' }).stdout ?? '')) return 'ios';
  return null;
};

const device = (action, ...actionArgs) => {
  const kind = platform();
  if (!kind) fail('No running Android emulator or iOS simulator was found. Start one and try again.');
  const backend = kind === 'android' ? android : ios;
  const fn = backend.actions[action];
  if (!fn) fail(`Unknown device action "${action}" on ${kind}. Available: ${Object.keys(backend.actions).join(', ')}`);
  return fn(...actionArgs.filter((a) => !String(a).startsWith('--')));
};

// ---------- Teardown records ----------

const loadTeardown = (dir) => {
  const file = join(dir, 'teardown.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { name: dir.split('/').pop(), probes: {}, fields: {}, notes: {}, evidence: {} };
};
const saveTeardown = (dir, teardown) => {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'teardown.json'), `${JSON.stringify(teardown, null, 2)}\n`);
};

const report = (dir) => {
  const teardown = loadTeardown(dir);
  const lines = [`# Teardown: ${teardown.name}`, ''];
  for (const key of ['app', 'version', 'device', 'date']) if (teardown[key]) lines.push(`- **${key}:** ${teardown[key]}`);
  lines.push('');
  for (const chapter of chapters()) {
    const probes = (chapter.probes ?? []).filter((p) => teardown.probes[p.id] !== undefined);
    const fields = (chapter.worksheet ?? []).filter((f) => teardown.fields[f.id]);
    if (probes.length === 0 && fields.length === 0) continue;
    lines.push(`## ${chapter.chapter}. ${chapter.title}`, '');
    for (const field of fields) lines.push(`- **${field.label}:** ${teardown.fields[field.id]}`);
    if (probes.length > 0) lines.push('', '### Probe results', '');
    for (const probe of probes) {
      const outcome = probe.outcomes[teardown.probes[probe.id]];
      lines.push(`- **${probe.id} ${probe.name}:** ${outcome.label}. ${outcome.reading} (${outcome.confidence})`);
      if (teardown.notes[probe.id]) lines.push(`  - Seen: ${teardown.notes[probe.id]}`);
      for (const file of teardown.evidence[probe.id] ?? []) lines.push(`  - Evidence: ${file}`);
    }
    lines.push('');
  }
  writeFileSync(join(dir, 'report.md'), lines.join('\n'));
  return join(dir, 'report.md');
};

// ---------- Commands ----------

const doctor = (app) => {
  const kind = platform();
  const checks = [
    ['An AI coding agent on the PATH (claude or codex)', has('claude') || has('codex')],
    ['A running Android emulator or iOS simulator', Boolean(kind)],
  ];
  if (kind && app) checks.push([`${app} is installed on it`, device('installed', app) === 'yes']);
  checks.forEach(([label, ok]) => console.log(`${ok ? 'ok     ' : 'MISSING'}  ${label}`));
  if (kind) console.log(`device   ${device('info')}`);
  return checks.every(([, ok]) => ok);
};

const commands = {
  doctor: () => process.exit(doctor(args[0]) ? 0 : 1),

  probes: () => {
    let list = allProbes();
    if (flag('chapter')) list = list.filter((p) => p.chapter === Number(flag('chapter')));
    if (flag('runnable')) list = list.filter((p) => p.runnableOnOneEmulator);
    if (flag('id')) list = list.filter((p) => p.id === flag('id'));
    if (flag('summary')) {
      console.log(list.map((p) => `${p.id}\t${p.runnableOnOneEmulator ? 'runnable' : 'manual  '}\t${p.needs.join(',') || '-'}\t${p.name}`).join('\n'));
      console.log(`\n${list.length} probes, ${list.filter((p) => p.runnableOnOneEmulator).length} runnable on one emulator`);
    } else {
      console.log(JSON.stringify(list, null, 2));
    }
  },

  device: () => console.log(device(...args)),

  record: () => {
    const [dir, id, number] = args;
    const probe = allProbes().find((p) => p.id === id);
    if (!probe) fail(`Unknown probe ${id}`);
    const outcome = probe.outcomes[Number(number)];
    if (!outcome) fail(`Probe ${id} has outcomes 0 to ${probe.outcomes.length - 1}`);
    const teardown = loadTeardown(dir);
    teardown.probes[id] = outcome.number;
    Object.assign(teardown.fields, outcome.fills);
    if (flag('note')) teardown.notes[id] = flag('note');
    if (flag('evidence')) teardown.evidence[id] = [...(teardown.evidence[id] ?? []), flag('evidence')];
    saveTeardown(dir, teardown);
    console.log(`${id}: ${outcome.label} -> ${outcome.reading} (${outcome.confidence})`);
  },

  field: () => {
    const [dir, id, ...value] = args;
    const teardown = loadTeardown(dir);
    if (['name', 'app', 'version', 'device', 'date'].includes(id)) teardown[id] = value.join(' ');
    else teardown.fields[id] = value.join(' ');
    saveTeardown(dir, teardown);
    console.log(`${id} = ${value.join(' ')}`);
  },

  report: () => console.log(report(args[0])),

  start: () => {
    const app = args[0];
    if (!app || app.startsWith('--')) fail('Usage: npm run teardown -- <app id>   for example: npm run teardown -- xyz.blueskyweb.app');
    const ready = doctor(app);
    const dir = `teardowns/${app}`;
    const prompt = readFileSync(join(root, 'AGENT_PLAYBOOK.md'), 'utf8')
      .replaceAll('{{APP_ID}}', app)
      .replaceAll('{{DIR}}', dir);
    if (flag('print') || !ready) {
      if (!ready) console.error('\nFix the missing items, or give the prompt that follows to your agent yourself.\n');
      console.log(prompt);
      return;
    }
    const agent = has('claude') ? 'claude' : 'codex';
    console.log(`\nStarting ${agent} with the teardown playbook for ${app}. Results will be written to ${dir}/\n`);
    spawnSync(agent, [prompt], { stdio: 'inherit', cwd: root });
  },
};

if (!commands[command]) fail(`Usage: node bin/teardown.mjs <${Object.keys(commands).join(' | ')}>`);
commands[command]();
