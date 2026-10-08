import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyRouteInventory, captureLegacyRoute } from './legacy_route_content.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SEO_VERSION = '20261008-gsc1';
export const SEO_POLICY_SCRIPT_VERSION = '20261008-routes1';

// Other languages retain the title and topic description produced by main.js.
// These short translations add business context without replacing that copy.
export const businessContext = {
  en: 'Custom wire harness manufacturing from our China factory, with OEM/ODM project support.',
  zh: '中国工厂提供定制线束制造与 OEM/ODM 项目支持。',
  hi: 'चीन में हमारी फैक्टरी OEM/ODM परियोजनाओं के लिए कस्टम वायर हार्नेस बनाती है।',
  es: 'Nuestra fábrica en China fabrica arneses de cables a medida para proyectos OEM/ODM.',
  fr: 'Notre usine en Chine fabrique des faisceaux de câbles sur mesure pour les projets OEM/ODM.',
  ar: 'يصنع مصنعنا في الصين ضفائر أسلاك مخصصة لمشاريع OEM/ODM.',
  bn: 'চীনে আমাদের কারখানা OEM/ODM প্রকল্পের জন্য কাস্টম তারের হারনেস তৈরি করে।',
  pt: 'Nossa fábrica na China produz chicotes elétricos personalizados para projetos OEM/ODM.',
  ru: 'Наш завод в Китае производит заказные жгуты проводов для проектов OEM/ODM.',
  ur: 'چین میں ہماری فیکٹری OEM/ODM منصوبوں کے لیے حسب ضرورت وائر ہارنس تیار کرتی ہے۔',
  id: 'Pabrik kami di Tiongkok memproduksi wire harness khusus untuk proyek OEM/ODM.',
  de: 'Unsere Fabrik in China fertigt kundenspezifische Kabelbäume für OEM/ODM-Projekte.',
  ja: '中国の当社工場で、OEM/ODMプロジェクト向けのカスタムワイヤーハーネスを製造します。',
  tr: 'Çin’deki fabrikamız OEM/ODM projeleri için özel kablo demetleri üretir.',
  vi: 'Nhà máy của chúng tôi tại Trung Quốc sản xuất bộ dây điện tùy chỉnh cho dự án OEM/ODM.',
  ko: '중국의 당사 공장에서 OEM/ODM 프로젝트용 맞춤형 와이어 하네스를 제조합니다.',
  it: 'La nostra fabbrica in Cina produce cablaggi su misura per progetti OEM/ODM.',
  nl: 'Onze fabriek in China produceert kabelbomen op maat voor OEM/ODM-projecten.',
  pl: 'Nasza fabryka w Chinach produkuje wiązki przewodów na zamówienie dla projektów OEM/ODM.',
  th: 'โรงงานของเราในจีนผลิตชุดสายไฟตามสั่งสำหรับโครงการ OEM/ODM'
};

const corePages = {
  '/': {
    topic: ['Custom Wire Harness Manufacturing', '定制线束制造'],
    title: ['Custom Wire Harness Manufacturer | China OEM/ODM Factory', '定制线束制造商｜中国工厂 OEM/ODM 服务'],
    lead: ['Connector, pinout and cable assembly options for equipment and diagnostic projects.', '为设备与诊断项目提供接头、针位及电缆组件方案。']
  },
  '/custom': {
    topic: ['Custom Harness Engineering & Production Process', '定制线束工程与生产流程'],
    title: ['Custom Harness Engineering & Production Process | OEM/ODM China', '定制线束工程与生产流程｜中国工厂 OEM/ODM'],
    lead: ['Follow the engineering and production process from drawings and pin definition to samples and repeat production.', '了解从图纸与针位定义、样品评审到重复生产的线束工程与生产流程。']
  },
  '/products': {
    topic: ['Wire Harness & Cable Assembly Catalogue', '线束与电缆组件产品目录'],
    title: ['Wire Harness & Cable Assembly Catalogue | OEM/ODM China', '线束与电缆组件产品目录｜中国工厂 OEM/ODM'],
    lead: ['Browse harness, cable assembly, connector and material options for your project.', '浏览线束、电缆组件、连接器及材料选项，核对项目需求。']
  },
  '/turbo-actuator-harness': {
    topic: ['Turbo Actuator Harnesses', '涡轮执行器线束'],
    title: ['Turbo Actuator Harness Manufacturer | OEM/ODM China', '涡轮执行器线束制造｜中国工厂 OEM/ODM'],
    lead: ['Review actuator-side interfaces, pin assignments and routing requirements.', '核对执行器端接口、针位定义及线缆走向要求。']
  },
  '/obd2-diagnostic-cable': {
    topic: ['OBD2 Diagnostic Cables', 'OBD2 诊断电缆'],
    title: ['OBD2 Diagnostic Cable Manufacturer | OEM/ODM China', 'OBD2 诊断电缆制造｜中国工厂 OEM/ODM'],
    lead: ['OBD2 diagnostic cables with project-defined connectors, pinouts and lengths.', '按项目确认 OBD2 诊断电缆的接头、针位及长度。']
  },
  '/j1939-cable': {
    topic: ['J1939 Diagnostic Cables', 'J1939 诊断电缆'],
    title: ['J1939 Diagnostic Cable Manufacturer | OEM/ODM China', 'J1939 诊断电缆制造｜中国工厂 OEM/ODM'],
    lead: ['Discuss heavy-duty diagnostic interfaces, pinouts and cable configurations.', '核对重型车辆诊断接口、针位定义与电缆配置。']
  },
  '/custom-wiring-harness': {
    topic: ['Custom Wiring Harnesses', '定制线束'],
    title: ['Custom Wiring Harness Manufacturer in China | Super Smile', '定制线束制造商｜中国工厂 OEM/ODM 项目'],
    lead: ['Drawing-based harness projects with connector, branch and protection options.', '依据图纸确认接头、分支及防护方案，推进定制线束项目。']
  },
  '/about': {
    topic: ['About Super Smile', '关于 Super Smile'],
    title: ['About Super Smile | China Wire Harness Factory', '关于 Super Smile｜中国定制线束制造工厂'],
    lead: ['Learn about Super Smile and our approach to harness and cable assembly projects.', '了解 Super Smile，以及我们开展线束和电缆组件项目的方式。']
  },
  '/contact': {
    topic: ['Contact Super Smile', '联系 Super Smile'],
    title: ['Contact Super Smile | Custom Wire Harness OEM/ODM Quotes', '联系 Super Smile｜中国工厂定制线束 OEM/ODM 报价'],
    lead: ['Send your drawing, connector requirements and quantity for a project review.', '提交图纸、接头要求及数量，沟通项目评审与报价。']
  }
};

const categoryLead = {
  'custom-harness': ['connector, routing and branch options', '接头、走线与分支方案'],
  'cable-assembly': ['end connectors, cable lengths and assembly options', '两端接头、线缆长度与组件方案'],
  automotive: ['pinout, routing and vehicle interface options', '针位、走线与车辆接口方案'],
  'connector-systems': ['housing, terminal and cable configuration options', '壳体、端子与线缆配置方案'],
  specialty: ['termination, protection and assembly options', '端接、防护与组件方案'],
  'wire-cable': ['material and termination choices for harness projects', '线束项目的材料与端接选项']
};

const topicOverrides = {
  'connector-systems-01': ['TE / AMP-Compatible Harnesses', 'TE / AMP 兼容线束'],
  'connector-systems-02': ['Molex-Compatible Wire Harnesses', 'Molex 兼容线束'],
  'connector-systems-03': ['JST-Compatible Wire Harnesses', 'JST 兼容线束'],
  'connector-systems-04': ['Deutsch-Compatible Wire Harnesses', 'Deutsch 兼容线束']
};
const categoryTitles = {
  'connector-systems-02': ['Molex-Compatible Wire Harness Manufacturer | OEM/ODM China', 'Molex 兼容线束制造｜中国工厂 OEM/ODM'],
  'automotive-01': ['Automotive Diagnostic & OBD Harness Manufacturer | OEM/ODM China', '汽车诊断与 OBD 定制线束制造｜中国工厂 OEM/ODM'],
  'wire-cable-03': ['Equipment Wire & Harness Manufacturing | OEM/ODM China', '设备用电线与定制线束制造｜中国工厂 OEM/ODM']
};
const productTopics = {
  'autel-chrysler-12-8-red-square-upgrade-adapter': ['Autel Chrysler 12+8 Red Square Upgrade Adapter', null],
  'autel-nissan-16-32-pin-gateway-adapter': ['Autel Nissan 16+32 Pin Gateway Adapter', null],
  'autel-im608-im608-pro-obd2-cable': ['Autel IM608 / IM608 PRO OBD2 Cable', null],
  'dts-metal-shell-9-pin-deutsch-to': ['DTS Metal-Shell 9-Pin Deutsch to OBD2 / DB15 Cable', null],
  'dts-3-row-db15-to-obd2-16': ['DTS 3-Row DB15 to OBD2 16-Pin Test Cable', null],
  'dts-2-row-db15-to-obd2-16': ['DTS 2-Row DB15 to OBD2 16-Pin Test Cable', null],
  '6-in-1-ev-ac-compressor-diagnostic': ['6-in-1 EV AC Compressor Diagnostic Harness', null],
  'launch-x431-usb-adapter-connector-for-launch': ['LAUNCH X431 USB Adapter Connector', null],
  'launch-x431-small-square-obd-adapter-connector': ['LAUNCH X431 Small Square OBD Adapter', null],
  'zdyb-gen-3-e0118-main-diagnostic-test': ['ZDYB Gen 3 E0118 Main Diagnostic Test Cable', null]
};

const localize = (value, language) => typeof value === 'string' ? value : (value?.[language] || value?.en || '');
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const slugify = value => String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const htmlPathForRoute = route => route === '/' ? 'index.html' : `${route.replace(/^\//, '')}.html`;
export function sitemapRoutes(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(match => {
    const url = new URL(match[1].replace(/&amp;/g, '&').trim());
    if (url.origin !== 'https://supersmile-tech.com' || url.search || url.hash) throw new Error(`Invalid sitemap URL: ${url}`);
    return url.pathname.replace(/\/$/, '') || '/';
  });
}

export async function buildSeoPolicy(siteRoot = root) {
  const [xml, capabilities, details, products] = await Promise.all([
    fs.readFile(path.join(siteRoot, 'sitemap.xml'), 'utf8'),
    fs.readFile(path.join(siteRoot, 'data/product-capabilities.json'), 'utf8').then(JSON.parse),
    fs.readFile(path.join(siteRoot, 'data/product-category-details.json'), 'utf8').then(JSON.parse),
    fs.readFile(path.join(siteRoot, 'data/products.json'), 'utf8').then(JSON.parse)
  ]);
  const candidates = new Map();
  const add = (route, kind, topic, titles, leads, source = {}) => {
    const [en, zh] = topic.map(clean);
    candidates.set(route, {
      route, kind, ...source, topic: { en, zh },
      title: { en: clean(titles[0]), zh: clean(titles[1]) },
      description: { en: `${clean(leads[0])} ${businessContext.en}`, zh: `${clean(leads[1])}${businessContext.zh}` }
    });
  };
  for (const [route, page] of Object.entries(corePages)) add(route, 'core', page.topic, page.title, page.lead);
  for (const group of capabilities.groups) {
    group.items.en.forEach((name, index) => {
      const categoryKey = `${group.id}-${String(index + 1).padStart(2, '0')}`;
      const detail = details[categoryKey] || {};
      const topic = topicOverrides[categoryKey] || [
        localize(detail.page?.displayTitle || detail.title || name, 'en'),
        localize(detail.page?.displayTitle || detail.title || group.items.zh[index], 'zh')
      ];
      const title = categoryTitles[categoryKey] || [`${topic[0]} | OEM/ODM Harness Manufacturing`, `${topic[1]}｜中国工厂 OEM/ODM 定制线束`];
      const [enLead, zhLead] = categoryLead[group.id];
      add(`/products/${slugify(name)}`, 'category', topic, title, [`${topic[0]}: ${enLead}.`, `${topic[1]}：核对${zhLead}。`], { categoryKey });
    });
  }
  for (const category of products.categories) {
    for (const product of category.products) {
      const override = productTopics[product.slug];
      const topic = [override?.[0] || localize(product.name, 'en'), override?.[1] || localize(product.name, 'zh')];
      const suffix = ['turbo-actuator', 'motor-rubber-grommet'].includes(product.slug) ? 'Super Smile' : 'OEM/ODM Project Support';
      add(`/product/${product.slug}`, 'product', topic,
        [`${topic[0]} | ${suffix}`, `${topic[1]}｜OEM/ODM 定制项目`],
        [`${topic[0]}: catalogue reference for your interface requirements.`, `${topic[1]}：用于核对产品接口与项目需求的目录参考。`], { productId: product.id });
    }
  }
  // Restore the existing landing/series topics from the same bilingual copy
  // used by their runtime and static renderers; never canonicalize them to home.
  for (const record of await legacyRouteInventory()) {
    const [{ copy: en }, { copy: zh }] = await Promise.all([
      captureLegacyRoute(record), captureLegacyRoute(record, 'zh'),
    ]);
    add(record.route, record.kind, [en.title, zh.title],
      [en.title + ' | Super Smile', zh.title + '｜Super Smile'], [en.intro, zh.intro]);
  }
  const routes = sitemapRoutes(xml);
  if (new Set(routes).size !== routes.length) throw new Error('Duplicate sitemap route');
  const pages = routes.map(route => {
    if (!candidates.has(route)) throw new Error(`Missing SEO topic: ${route}`);
    return candidates.get(route);
  });
  for (const language of ['en', 'zh']) {
    for (const field of ['title', 'description']) {
      const values = new Map();
      for (const page of pages) {
        const value = page[field][language];
        if (values.has(value)) throw new Error(`Duplicate ${language} ${field}: ${page.route} and ${values.get(value)}`);
        values.set(value, page.route);
      }
    }
  }
  return { version: SEO_VERSION, pages, businessContext };
}

// This function has no build-time dependencies and is serialized into the browser module.
export function createRuntimePolicy(data) {
  const routes = new Map(data.pages.map(page => [page.route, page]));
  const titleAuthorities = new WeakMap();
  const releaseTitleAuthority = document => {
    const state = titleAuthorities.get(document);
    state?.observer?.disconnect();
    titleAuthorities.delete(document);
  };
  const maintainTitleAuthority = (document, title) => {
    let state = titleAuthorities.get(document);
    if (!state) {
      state = { title: '', observer: null };
      titleAuthorities.set(document, state);
    }
    // Match the browser's title whitespace normalization to avoid repeated writes.
    // Set the current authority before assigning a new language's document title.
    state.title = String(title).replace(/[\t\n\f\r ]+/g, ' ').trim();
    const Observer = document.defaultView?.MutationObserver ?? globalThis.MutationObserver;
    if (!state.observer && Observer && document.head) {
      state.observer = new Observer(() => {
        if (titleAuthorities.get(document) !== state) return;
        if (document.title !== state.title) document.title = state.title;
      });
      // Observe the head so replacing or removing the title element is also handled.
      state.observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    }
  };
  const normalizeRoute = input => {
    let pathname = String(input || '/');
    if (/^https?:\/\//i.test(pathname)) {
      try {
        const url = new URL(pathname);
        if (!['https://supersmile-tech.com', 'https://www.supersmile-tech.com'].includes(url.origin)) return null;
        pathname = url.pathname;
      } catch { return null; }
    }
    pathname = pathname.split(/[?#]/)[0].replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
    return pathname === '/index' ? '/' : pathname;
  };
  const resolve = (options = {}) => {
    const route = normalizeRoute(options.path ?? options.pathname ?? globalThis.location?.pathname ?? '/');
    const page = routes.get(route);
    const lang = String(options.lang ?? options.LANG ?? 'en').toLowerCase();
    if (!page || !data.businessContext[lang]) return null;
    if (lang === 'en' || lang === 'zh') {
      return { route, lang, topic: page.topic[lang], title: page.title[lang], description: page.description[lang], procurementContext: data.businessContext[lang] };
    }
    // A translated topic must already exist; never silently replace it with English.
    const title = String(options.title || '').trim();
    let description = String(options.description || '').trim();
    if (!title || !description) return null;
    for (const tail of Object.values(data.businessContext)) {
      if (description.endsWith(tail)) description = description.slice(0, -tail.length).trim();
    }
    return { route, lang, topic: null, title, description: `${description} ${data.businessContext[lang]}`.trim(), procurementContext: data.businessContext[lang] };
  };
  const apply = (options = {}) => {
    const document = options.document ?? globalThis.document;
    if (!document) return resolve(options);
    const get = selector => document.querySelector(selector)?.content || '';
    const metadata = resolve({ ...options, title: options.title ?? document.title, description: options.description ?? get('meta[name="description"]') });
    if (!metadata) {
      releaseTitleAuthority(document);
      return null;
    }
    maintainTitleAuthority(document, metadata.title);
    document.title = metadata.title;
    for (const [selector, value] of [
      ['meta[name="description"]', metadata.description],
      ['meta[property="og:title"]', metadata.title],
      ['meta[property="og:description"]', metadata.description]
    ]) {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const match = selector.match(/\[(name|property)="([^"]+)"\]/);
        element.setAttribute(match[1], match[2]);
        document.head.appendChild(element);
      }
      element.content = value;
    }
    return metadata;
  };
  return Object.freeze({ version: data.version, resolve, apply });
}

export function serializeRuntime(policy) {
  const payload = JSON.stringify(policy).replace(/</g, '\\u003c');
  return `/* Generated by tools/apply_seo_policy.mjs --build. Public sitemap routes only. */\n(function(root){\n'use strict';\nconst data=${payload};\nconst createPolicy=${createRuntimePolicy.toString()};\nconst policy=createPolicy(data);\nroot.SS_SEO_POLICY=policy;\nif(typeof module==='object'&&module.exports) module.exports=policy;\n})(typeof window==='object'?window:globalThis);\n`;
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
function replaceMeta(html, attribute, key, value) {
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}">`;
  const expression = new RegExp(`<meta\\b(?=[^>]*\\b${attribute}\\s*=\\s*["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'])[^>]*>`, 'gi');
  let replaced = false;
  const output = html.replace(expression, () => { if (replaced) return ''; replaced = true; return tag; });
  return replaced ? output : output.replace(/<\/head>/i, `  ${tag}\n</head>`);
}

export function withSeoPolicy(html, route, policy, { lang = 'en', scripts = true } = {}) {
  const metadata = createRuntimePolicy(policy).resolve({ path: route, lang });
  if (!metadata) return html;
  let output = /<title\b[^>]*>[\s\S]*?<\/title>/i.test(html)
    ? html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`)
    : html.replace(/<\/head>/i, `  <title>${escapeHtml(metadata.title)}</title>\n</head>`);
  output = replaceMeta(output, 'name', 'description', metadata.description);
  output = replaceMeta(output, 'property', 'og:title', metadata.title);
  output = replaceMeta(output, 'property', 'og:description', metadata.description);
  if (scripts) {
    output = output.replace(/<script\b[^>]*\bsrc=["']\/assets\/js\/seo-policy\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>\s*/gi, '');
    let foundMain = false;
    output = output.replace(/<script\b[^>]*\bsrc=["']\/assets\/js\/main\.js(?:\?[^"']*)?["'][^>]*>\s*<\/script>/gi, tag => {
      if (foundMain) throw new Error(`Duplicate main.js script on ${route}`);
      foundMain = true;
      const mainTag = tag.replace(/(\bsrc=["'])\/assets\/js\/main\.js(?:\?[^"']*)?(["'])/i, `$1/assets/js/main.js?v=${SEO_VERSION}$2`);
      return `<script defer src="/assets/js/seo-policy.js?v=${SEO_POLICY_SCRIPT_VERSION}"></script>\n${mainTag}`;
    });
    if (!foundMain) throw new Error(`No main.js script on public page ${route}`);
  }
  return output;
}
