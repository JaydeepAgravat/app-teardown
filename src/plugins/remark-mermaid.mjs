import { visit } from 'unist-util-visit';

// Turns ```mermaid fences into <div class="mermaid" data-source="...">, rendered in the
// browser by Footer.astro. The source is kept in an attribute so that no later text
// transform (smart quotes, dashes) can alter the diagram syntax.
export default function remarkMermaid() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid' || !parent) return;
      parent.children[index] = {
        type: 'paragraph',
        data: {
          hName: 'div',
          hProperties: { className: ['mermaid', 'not-content'], dataSource: node.value },
        },
        children: [],
      };
    });
  };
}
