import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Chapters and components link to pages by root path, for example /lookup/.
// When the site is served under a base path, this adds the base to every such
// link and image in the built pages. Links the framework already prefixed are left alone.
export default function basePaths(base) {
  return {
    name: 'base-paths',
    hooks: {
      'astro:build:done': ({ dir }) => {
        if (!base) return;
        const walk = (folder) => {
          for (const entry of readdirSync(folder, { withFileTypes: true })) {
            const path = join(folder, entry.name);
            if (entry.isDirectory()) walk(path);
            else if (entry.name.endsWith('.html')) {
              const html = readFileSync(path, 'utf8');
              const fixed = html.replace(/\b(href|src)="\/(?!\/)([^"]*)"/g, (match, attribute, rest) =>
                `/${rest}` === base || `/${rest}`.startsWith(`${base}/`) ? match : `${attribute}="${base}/${rest}"`,
              );
              if (fixed !== html) writeFileSync(path, fixed);
            }
          }
        };
        walk(fileURLToPath(dir));
      },
    },
  };
}
