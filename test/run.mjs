// Verifies the built artifact (dist/index.js) against the demo page in a real
// browser. Run with `npm test` (which builds first).
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname, join, normalize, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const mime = {'.html': 'text/html', '.js': 'text/javascript', '.cjs': 'text/javascript', '.css': 'text/css'};

const server = createServer(async (req, res) => {
  try {
    const path = normalize(join(root, new URL(req.url, 'http://localhost').pathname));
    if (!path.startsWith(root + sep) && path !== root) throw new Error('outside root');
    const body = await readFile(path);
    res.writeHead(200, {'content-type': mime[extname(path)] ?? 'application/octet-stream'});
    res.end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((resolve) => server.listen(0, resolve));
const demoUrl = `http://localhost:${server.address().port}/demo/index.html`;

let browser;
try {
  browser = await chromium.launch({channel: 'chrome'});
} catch {
  try {
    browser = await chromium.launch();
  } catch (error) {
    console.error('No Chrome found and no bundled Chromium. Run: npx playwright install chromium');
    server.close();
    throw error;
  }
}

let failed = 0;
const assert = (name, condition, detail = '') => {
  if (condition) console.log(`  ok - ${name}`);
  else {
    failed += 1;
    console.error(`  FAIL - ${name}${detail ? `  [${detail}]` : ''}`);
  }
};

const VISIBLE = 'appear-on-scroll--visible';

// setContent pages have no origin, so they cannot import a module by URL.
// Inject the same built file as a global instead.
const libraryGlobal = (await readFile(join(root, 'dist/index.js'), 'utf8')).replace(
  /export\s*\{[^}]*\}\s*;?/g,
  'window.AppearOnScroll = AppearOnScroll;',
);
const page = await browser.newPage({viewport: {width: 1000, height: 700}});
await page.goto(demoUrl);
await page.waitForSelector('#dir-el.appear-on-scroll', {state: 'attached'});

const style = (selector, property) => page.$eval(selector, (el, property) => getComputedStyle(el)[property], property);
const inlineVar = (selector, name) => page.$eval(selector, (el, name) => el.style.getPropertyValue(name), name);
const hasClass = (selector, className) =>
  page.$eval(selector, (el, className) => el.classList.contains(className), className);
const scrollToCenter = (selector) => page.$eval(selector, (el) => el.scrollIntoView({block: 'center'}));
// Resolves with the element's computed transform captured in the same style
// pass that first sees the visible class — i.e. the transition's start.
const transformAtReveal = (selector) =>
  page
    .waitForFunction(
      (selector) => {
        const el = document.querySelector(selector);
        return el.classList.contains('appear-on-scroll--visible') && getComputedStyle(el).transform;
      },
      selector,
      {polling: 'raf'},
    )
    .then((handle) => handle.jsonValue());
const translateY = (matrix) => (matrix === 'none' ? 0 : parseFloat(matrix.split(',')[5]));

console.log('\nbelow-fold elements start hidden');
assert('one shared stylesheet for all 11 instances', (await page.$$('style[data-appear-on-scroll]')).length === 1);
assert('#dir-el has no visible class before scrolling', !(await hasClass('#dir-el', VISIBLE)));
assert('#dir-el computed opacity is 0', (await style('#dir-el', 'opacity')) === '0');
assert('#once-el computed opacity is 0', (await style('#once-el', 'opacity')) === '0');

console.log('\nscrolling down reveals, sliding up from below');
let reveal = transformAtReveal('#dir-el');
await scrollToCenter('#dir-el');
const downStart = await reveal;
await page.waitForFunction(() => getComputedStyle(document.querySelector('#dir-el')).opacity === '1');
assert('#dir-el gains the visible class', await hasClass('#dir-el', VISIBLE));
assert('#dir-el computed opacity reaches 1', (await style('#dir-el', 'opacity')) === '1');
assert(
  'start transform is from below',
  (await inlineVar('#dir-el', '--aos-transform-from')) === 'translate3d(0, 25px, 0)',
);
assert('transition begins with positive translateY', translateY(downStart) > 5, `matrix: ${downStart}`);

console.log('\nscrolling back up reveals the other way');
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForFunction((VISIBLE) => !document.querySelector('#dir-el').classList.contains(VISIBLE), VISIBLE);
reveal = transformAtReveal('#dir-el');
// Jump so #dir-el straddles the viewport's top edge — a scroll-up entry.
await page.$eval('#dir-el', (el) => {
  const rect = el.getBoundingClientRect();
  window.scrollTo(0, rect.top + window.scrollY + rect.height / 2);
});
const upStart = await reveal;
assert(
  'start transform is from above',
  (await inlineVar('#dir-el', '--aos-transform-from')) === 'translate3d(0, calc(25px * -1), 0)',
);
assert('transition begins with negative translateY', translateY(upStart) < -5, `matrix: ${upStart}`);

console.log('\nonce: false replays, once: true sticks');
assert('#again-el re-hid after leaving the viewport', !(await hasClass('#again-el', VISIBLE)));
assert('#again-el computed opacity is 0 again', (await style('#again-el', 'opacity')) === '0');
assert('#once-el keeps the visible class off-screen', await hasClass('#once-el', VISIBLE));
// Its fade may still be finishing from the trip past it — let it land.
await page.waitForFunction(() => getComputedStyle(document.querySelector('#once-el')).opacity === '1');
assert('#once-el computed opacity stays 1', (await style('#once-el', 'opacity')) === '1');

console.log('\nstagger spreads a batch of reveals');
await scrollToCenter('.grid');
await page.waitForFunction(
  (VISIBLE) => [...document.querySelectorAll('.stagger-cell')].every((el) => el.classList.contains(VISIBLE)),
  VISIBLE,
);
const delays = await page.$$eval('.stagger-cell', (els) => els.map((el) => el.style.getPropertyValue('--aos-delay')));
assert('first cell has no added delay', delays[0] === '0ms', delays.join(', '));
assert('ninth cell waits 8 × 90ms', delays[8] === '720ms', delays.join(', '));
assert('every cell gets a distinct delay', new Set(delays).size === 9);

console.log('\nprefers-reduced-motion: instant, no transition');
const reducedPage = await browser.newPage({viewport: {width: 1000, height: 700}});
await reducedPage.emulateMedia({reducedMotion: 'reduce'});
await reducedPage.goto(demoUrl);
await reducedPage.waitForSelector('#dir-el.appear-on-scroll', {state: 'attached'});
const reduced = await reducedPage.$eval('#dir-el', (el) => {
  const computed = getComputedStyle(el);
  return {opacity: computed.opacity, transform: computed.transform, duration: computed.transitionDuration};
});
assert('below-fold element is immediately visible', reduced.opacity === '1');
assert('no starting transform', reduced.transform === 'none');
assert('no transition', reduced.duration === '0s', `duration: ${reduced.duration}`);
await reducedPage.close();

// Two regressions the demo page cannot show, because it only ever jump-scrolls
// and always passes a fully-populated options object.
console.log('\nreduced motion is not defeated by an explicitly-undefined option');
const undefinedOptionPage = await browser.newPage({viewport: {width: 800, height: 600}});
await undefinedOptionPage.emulateMedia({reducedMotion: 'reduce'});
await undefinedOptionPage.setContent('<style>body{margin:0}</style><div id="u">x</div>');
await undefinedOptionPage.addScriptTag({content: libraryGlobal});
const undefinedOption = await undefinedOptionPage.evaluate(() => {
  new window.AppearOnScroll('#u', {respectReducedMotion: undefined});
  const el = document.getElementById('u');
  return {opacity: getComputedStyle(el).opacity, optedOut: el.classList.contains('appear-on-scroll--motion')};
});
assert(
  'a caller forwarding an absent prop still gets reduced motion',
  undefinedOption.opacity === '1',
  `opacity: ${undefinedOption.opacity}`,
);
assert('the motion opt-out class is not applied', undefinedOption.optedOut === false);
await undefinedOptionPage.close();

console.log('\nstagger is a property of the wave, not of the observer batch');
// The observer decides how many entries ride in one callback, and that depends on
// scroll speed. Reveals that happen in quick succession are one wave to the eye,
// so the cascade must continue across callbacks rather than restart in each.
const wavePage = await browser.newPage({viewport: {width: 800, height: 400}});
await wavePage.setContent(
  '<style>body{margin:0}.s{height:40px}</style><div style="height:500px"></div>' +
    Array.from({length: 6}, (_, i) => `<div class="s" id="s${i}"></div>`).join('') +
    '<div style="height:800px"></div>',
);
await wavePage.addScriptTag({content: libraryGlobal});
await wavePage.evaluate(() => new window.AppearOnScroll('.s', {stagger: 90, once: true}));
// Two nudges 20ms apart: two observer callbacks, one wave as far as the eye is concerned.
await wavePage.evaluate(() => window.scrollTo(0, 240));
await wavePage.waitForTimeout(20);
await wavePage.evaluate(() => window.scrollTo(0, 400));
await wavePage.waitForTimeout(400);
const wave = await wavePage.evaluate(() =>
  [...document.querySelectorAll('.s')].map((el) => ({
    revealed: el.classList.contains('appear-on-scroll--visible'),
    delay: Number.parseInt(el.style.getPropertyValue('--aos-delay') || '0', 10),
  })),
);
await wavePage.close();
const waveDelays = wave.map((s) => s.delay);
assert(
  'all six reveal',
  wave.every((s) => s.revealed),
  JSON.stringify(wave),
);
assert(
  'the cascade keeps climbing across callbacks instead of restarting',
  waveDelays.join() === '0,90,180,270,360,450',
  waveDelays.join(),
);

console.log('\nreveals that are genuinely apart start a fresh cascade');
const apartPage = await browser.newPage({viewport: {width: 800, height: 400}});
await apartPage.setContent(
  '<style>body{margin:0}.s{height:40px}</style><div style="height:500px"></div>' +
    Array.from({length: 3}, (_, i) => `<div class="s" id="a${i}" style="margin-bottom:500px"></div>`).join('') +
    '<div style="height:800px"></div>',
);
await apartPage.addScriptTag({content: libraryGlobal});
await apartPage.evaluate(() => new window.AppearOnScroll('.s', {stagger: 90, once: true}));
for (const y of [500, 1050, 1600]) {
  await apartPage.evaluate((to) => window.scrollTo(0, to), y);
  await apartPage.waitForTimeout(250);
}
await apartPage.waitForTimeout(300);
const apart = await apartPage.evaluate(() =>
  [...document.querySelectorAll('.s')].map((el) =>
    Number.parseInt(el.style.getPropertyValue('--aos-delay') || '0', 10),
  ),
);
await apartPage.close();
assert(
  'an element arriving alone is not made to wait',
  apart.every((d) => d === 0),
  apart.join(),
);

console.log('\ndestroy() restores everything');
await page.evaluate(() => window.__aosInstances.forEach((instance) => instance.destroy()));
assert('injected stylesheet is removed', (await page.$$('style[data-appear-on-scroll]')).length === 0);
assert('no element keeps a library class', (await page.$$('[class*="appear-on-scroll"]')).length === 0);
assert('#dir-el inline custom properties are cleared', (await inlineVar('#dir-el', '--aos-transform-from')) === '');
assert('#dir-el is plainly visible', (await style('#dir-el', 'opacity')) === '1');

await browser.close();
server.close();

console.log(failed ? `\n${failed} assertion(s) FAILED` : '\nall assertions passed');
process.exit(failed ? 1 : 0);
