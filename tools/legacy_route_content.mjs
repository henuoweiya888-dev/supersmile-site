import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInContext } from 'node:vm';
import { createRenderContext } from './sync_priority_page_ssr.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => fs.readFile(path.join(root, name), 'utf8');

// These URLs already have route-specific content in main.js but previously
// rewrote to index.html, which has neither their canonical nor a main host.
export const landingRoutes = [
  ['/ev-diagnostic-cable', 'evDiagnosticLandingCopy'],
  ['/industrial-equipment-wiring-harness-guide', 'industrialEquipmentGuideCopy'],
  ['/robotic-wiring-harness-flex-guide', 'roboticHarnessFlexGuideCopy'],
  ['/wire-harness-prototype-sample-validation', 'harnessPrototypeGuideCopy'],
  ['/custom-cable-assembly', 'cableAssemblyLandingCopy'],
  ['/automotive-wiring-harness', 'automotiveHarnessLandingCopy'],
  ['/automotive-diagnostic-cable-manufacturer', 'automotiveDiagnosticLandingCopy'],
  ['/ecu-programming-cable', 'ecuProgrammingLandingCopy'],
];

export async function legacyRouteInventory() {
  const { series } = JSON.parse(await read('data/product-series.json'));
  return [...landingRoutes.map(([route, copyFunction]) => ({ route, copyFunction, kind: 'landing' })),
    ...series.map(record => ({ route: `/products/${record.slug}`, kind: 'series', seriesId: record.id }))];
}

export async function captureLegacyRoute(record, language = 'en') {
  const { context, main } = await createRenderContext(record.route, language);
  let copy;
  if (record.kind === 'series') {
    context.__series = JSON.parse(await read('data/product-series.json'));
    runInContext('SERIES=__series; renderProductSeriesPage();', context);
    copy = runInContext(`(() => { const {series}=productSeriesRecord(); return { title:t(series.title), intro:t(series.description), faqs:series.faqs.map(item=>[t(item.q),t(item.a)]) }; })()`, context);
  } else {
    copy = runInContext(`${record.copyFunction}()`, context);
    runInContext('renderLandingPage()', context);
  }
  if (!main.innerHTML.includes('<h1>') || !copy.title || !copy.intro || !copy.faqs?.length) throw Error(`Incomplete rendering: ${record.route}`);
  return { markup: main.innerHTML.trim(), copy };
}

