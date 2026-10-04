import { visitParents } from 'unist-util-visit-parents';
import { glossaryTerms } from '../lib/data.mjs';

const SKIP_TAGS = new Set(['a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'th', 'script', 'style']);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Wraps the first occurrence of each glossary term on a page in a span that shows
// the definition on hover or focus.
export default function rehypeGlossary() {
  const terms = glossaryTerms().filter((t) => t.tooltip !== false);
  const byKey = new Map(terms.map((t) => [t.term.toLowerCase(), t]));
  const alternatives = terms
    .map((t) => t.term)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join('|');
  const pattern = new RegExp(`\\b(${alternatives})(s?)\\b`, 'gi');

  return (tree) => {
    const seen = new Set();
    const jobs = [];

    visitParents(tree, 'text', (node, ancestors) => {
      const skip = ancestors.some(
        (a) => (a.type === 'element' && SKIP_TAGS.has(a.tagName)) || String(a.type).startsWith('mdx')
      );
      if (skip) return;

      const parts = [];
      let last = 0;
      for (const match of node.value.matchAll(pattern)) {
        const key = match[1].toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        if (match.index > last) parts.push({ type: 'text', value: node.value.slice(last, match.index) });
        parts.push({
          type: 'element',
          tagName: 'span',
          properties: { className: ['gloss'], tabIndex: 0, dataDef: byKey.get(key).definition },
          children: [{ type: 'text', value: match[0] }],
        });
        last = match.index + match[0].length;
      }
      if (parts.length === 0) return;
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      jobs.push({ node, parent: ancestors[ancestors.length - 1], parts });
    });

    for (const { node, parent, parts } of jobs) {
      const index = parent.children.indexOf(node);
      if (index !== -1) parent.children.splice(index, 1, ...parts);
    }
  };
}
