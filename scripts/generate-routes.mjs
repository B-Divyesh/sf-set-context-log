import { mkdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../dist/', import.meta.url);
const indexPath = new URL('index.html', root);
const source = await readFile(indexPath, 'utf8');
const demo = source
  .replace('<title>Set Context Log — log what changed each set</title>', '<title>Demo — Set Context Log</title>')
  .replace('rel="canonical" href="https://set-context-log.sociobot.in/"', 'rel="canonical" href="https://set-context-log.sociobot.in/demo"')
  .replace('property="og:title" content="Set Context Log — log what changed each set"', 'property="og:title" content="Demo — Set Context Log"')
  .replace('property="og:url" content="https://set-context-log.sociobot.in/"', 'property="og:url" content="https://set-context-log.sociobot.in/demo"')
  .replace('name="twitter:title" content="Set Context Log — log what changed each set"', 'name="twitter:title" content="Demo — Set Context Log"');

const demoDirectory = new URL('demo/', root);
await mkdir(demoDirectory, { recursive: true });
await writeFile(new URL('index.html', demoDirectory), demo);
console.log('Generated demo/index.html with route-specific metadata.');
