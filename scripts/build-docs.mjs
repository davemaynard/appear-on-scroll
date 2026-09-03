// Publishes demo/index.html to docs/, which GitHub Pages serves at
// https://davemaynard.github.io/appear-on-scroll. The demo reads the library
// from ../dist during development; the published copy needs it alongside.
// Run by `npm run build:docs`; CI checks the result is in sync with source.
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIBRARY = 'appear-on-scroll.js';

const [demo, library] = await Promise.all([
  readFile(join(root, 'demo/index.html'), 'utf8'),
  readFile(join(root, 'dist/index.js'), 'utf8'),
]);

const source = '../dist/index.js';
if (!demo.includes(source)) throw new Error(`demo/index.html no longer imports ${source}`);

const page = demo
  .replace(source, `./${LIBRARY}`)
  .replace('<title>appear-on-scroll — demo</title>', '<title>appear-on-scroll</title>');

await mkdir(join(root, 'docs'), {recursive: true});
await writeFile(join(root, 'docs/index.html'), page);
await writeFile(join(root, `docs/${LIBRARY}`), library);
await writeFile(join(root, 'docs/.nojekyll'), '');

console.log(`docs/index.html and docs/${LIBRARY} written`);
