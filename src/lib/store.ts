// Reader state, kept in the browser only. Every access is guarded, because storage
// can be unavailable (private windows, blocked site data).

export type Teardown = {
  id: string;
  name: string;
  probes: Record<string, number>;
  fields: Record<string, string>;
};

export type State = {
  current: string;
  apps: Record<string, Teardown>;
  read: Record<string, boolean>;
};

const KEY = 'teardown:v1';
export const CHANGE_EVENT = 'teardown:change';

let state: State | null = null;

function fresh(): State {
  const id = 'app-1';
  return {
    current: id,
    apps: { [id]: { id, name: 'My first teardown', probes: {}, fields: {} } },
    read: {},
  };
}

export function load(): State {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as State) : fresh();
  } catch {
    state = fresh();
  }
  if (!state.apps || !state.apps[state.current]) state = fresh();
  state.read ??= {};
  return state;
}

export function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(load()));
  } catch {
    // Storage is unavailable. The page keeps working from memory for this visit.
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function current(): Teardown {
  const s = load();
  return s.apps[s.current];
}

export function select(id: string): void {
  const s = load();
  if (s.apps[id]) s.current = id;
  save();
}

export function add(name: string): void {
  const s = load();
  const id = `app-${Date.now()}`;
  s.apps[id] = { id, name, probes: {}, fields: {} };
  s.current = id;
  save();
}

export function rename(name: string): void {
  current().name = name;
  save();
}

export function remove(): void {
  const s = load();
  delete s.apps[s.current];
  const remaining = Object.keys(s.apps);
  if (remaining.length === 0) {
    state = { ...fresh(), read: s.read };
  } else {
    s.current = remaining[0];
  }
  save();
}

/** Adds a teardown made elsewhere, such as one written by the command line tool, and selects it. */
export function importTeardown(data: { name?: string; probes?: Record<string, number>; fields?: Record<string, string> }): void {
  const s = load();
  const id = `app-${Date.now()}`;
  s.apps[id] = { id, name: data.name || 'Imported teardown', probes: { ...data.probes }, fields: { ...data.fields } };
  s.current = id;
  save();
}
