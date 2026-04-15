import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const entryPoint = require.resolve('@trivago/prettier-plugin-sort-imports');
const outfile = path.join(__dirname, 'prettier-plugin-sort-imports-bundle.js');

console.log(`Bundling ${entryPoint} to ${outfile}...`);

try {
  await build({
    entryPoints: [entryPoint],
    bundle: true,
    outfile,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    banner: {
      js: "import { createRequire as __createRequire } from 'module'; const require = __createRequire(import.meta.url);",
    },
    external: [
      'prettier',
      'prettier/*',
      '@vue/compiler-sfc',
      'svelte',
      'prettier-plugin-svelte',
      'prettier-plugin-ember-template-tag',
      'node:*',
      'tty',
      'util',
      'fs',
      'path',
      'os',
      'crypto',
    ],
    // We need to handle top-level await in the source plugin
    supported: {
      'top-level-await': true,
    },
    logLevel: 'info',
  });
  console.log('✅ Bundle generated successfully.');
} catch (err) {
  console.error('❌ Bundling failed:', err);
  process.exit(1);
}
