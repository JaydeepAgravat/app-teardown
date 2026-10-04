import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const root = join(process.cwd(), 'src', 'data');
const read = (file) => parse(readFileSync(join(root, file), 'utf8'));

/** Glossary groups, each with a title and its terms. */
export const loadGlossary = () => read('glossary.yaml');

/** Every glossary term as a flat list. */
export const glossaryTerms = () => loadGlossary().flatMap((group) => group.terms);

/** The locked chapter list: parts, sections, chapters and appendices. */
export const loadOutline = () => read('outline.yaml');

/** Structured data (probes, signals, worksheet fields) for every chapter that has it. */
export const loadChapters = () =>
  readdirSync(join(root, 'chapters'))
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => read(join('chapters', file)))
    .sort((a, b) => a.chapter - b.chapter);

export const loadChapter = (number) => {
  const chapter = loadChapters().find((c) => c.chapter === Number(number));
  if (!chapter) throw new Error(`No data file for chapter ${number} in src/data/chapters`);
  return chapter;
};

export const loadProbe = (id) => {
  const chapter = loadChapter(id.slice(1).split('.')[0]);
  const probe = chapter.probes.find((p) => p.id === id);
  if (!probe) throw new Error(`Probe ${id} is not defined in src/data/chapters`);
  return probe;
};
