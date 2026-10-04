import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import remarkMermaid from './src/plugins/remark-mermaid.mjs';
import rehypeGlossary from './src/plugins/rehype-glossary.mjs';

export default defineConfig({
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMermaid],
      rehypePlugins: [rehypeGlossary],
    }),
  },
  integrations: [
    starlight({
      title: 'The App Teardown Handbook',
      description: 'Mobile system design, read from the outside. Work out how any app is built from how it behaves.',
      customCss: ['./src/styles/site.css'],
      components: {
        Footer: './src/components/Footer.astro',
      },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      sidebar: [
        {
          label: 'Tools',
          items: [
            { label: 'Contents', link: '/contents/' },
            { label: 'Signal lookup', link: '/lookup/' },
            { label: 'Teardown worksheet', link: '/worksheet/' },
            { label: 'Glossary', link: '/glossary/' },
          ],
        },
        { label: 'Worked examples', items: [{ autogenerate: { directory: 'examples' } }] },
        { label: 'Part I. The teardown method', items: [{ autogenerate: { directory: 'part-1-method' } }] },
        { label: 'Part II. Concerns', items: [{ autogenerate: { directory: 'part-2-concerns' } }] },
        { label: 'Part III. Archetypes', items: [{ autogenerate: { directory: 'part-3-archetypes' } }] },
        {
          label: 'Appendices',
          items: [
            { label: 'A. Probe catalog', link: '/probes/' },
            { label: 'E. The method in a design interview', link: '/interview/' },
            { label: 'F. Further reading', link: '/further-reading/' },
          ],
        },
      ],
    }),
  ],
});
