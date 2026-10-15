#!/usr/bin/env node
/* Rivian config tracker — snapshot Rivian's live catalog for one vehicle and diff it
   against data/vehicle-<vehicle>.js. Zero dependencies (Node ≥ 18, built-in fetch). Never
   edits repo data; it only reads, fetches, and reports. See README.md in this folder.

   Usage:
     node validation/r2-config/snapshot.js               # R2 snapshot + report to stdout
     node validation/r2-config/snapshot.js --vehicle r1s # r2 (default) | r1s | r1t
     node validation/r2-config/snapshot.js --no-images   # skip the ~70 CDN HEAD checks
     node validation/r2-config/snapshot.js --report out.md --json out.json

   Exit code: 0 = no drift, 2 = drift findings (see "Findings"), 1 = fetch/parse error.
   A vehicle with no data file yet runs snapshot-only: Rivian's side is reported in full,
   there is simply nothing to diff, and the run exits 0. A data file marked draft:true is
   diffed normally but never fails the run — its numbers are unverified by design.
   Results: results/YYYY-MM-DD.json for R2, results/YYYY-MM-DD-<vehicle>.json otherwise.

   Sources (all fetchable with plain HTTPS, no auth, no headless browser):
     builder   https://rivian.com/configurations/builder/<vehicle> — React Router loader
               data embedded in the HTML (turbo-stream encoded). Contains the full ruleset:
               every option code, name, price, per-trim rules, destination fee. R2 and both
               R1s share the encoding and the rules engine; only the loader keys, where the
               pricing/trim-content blobs hang, and the code vocabulary differ (see VEHICLES).
     r2 page   https://rivian.com/r2 — Next.js flight data with per-trim availabilityText
               ("Available now" / "Coming late 2026" / "Coming 2027"). R2 only: /r1s and
               /r1t are old-style __NEXT_DATA__ pages with no availability blob, so for the
               R1s the ruleset's own availableInFuture / tempUnavailable flags are the signal.
     gear      https://gearshop.rivian.com/collections/r2/products.json + per-product .js.
               The collection is R2-only (Rivian publishes no r1s/r1t collection); the
               per-product endpoint works for every vehicle and matches the builder's prices.
     connect+  https://rivian.com/connect-plus (SSR'd prices)
     newsroom  https://rivian.com/newsroom (article slugs; vehicle-tagged ones are flagged)
     images    HEAD on every CDN URL app.js would build from our data (404 = broken) */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const RESULTS_DIR = path.join(__dirname, 'results');
const SRC = {
  gearProduct: (h) => `https://gearshop.rivian.com/products/${h}.js`,
  connectPlus: 'https://rivian.com/connect-plus',
  newsroom: 'https://rivian.com/newsroom',
};
const IMG = 'https://media.rivian.com/image/upload/'; // mirrors app.js

/* ---------------- per-vehicle configuration ----------------
   Everything that differs between Rivian's builders lives in this one table: where to fetch,
   which loader keys hold the ruleset / pricing / trim content, how our ids map onto Rivian's
   option codes, and which image scheme app.js builds from our data. The fetchers, the
   turbo-stream decoder, the rules engine and the diff below stay shared, single-copy code.
   A code Rivian adds that isn't mapped here surfaces as a "new" finding — that's the point. */
const R1_GROUP_OF = { EXP: 'colors', WHL: 'wheels', INT: 'interiors', DTN: 'drivetrains', ACCESSORIES: 'accessories', BAT: 'batteries', MOT: 'motors', PKG: 'trimPackages', ROOF: 'roofs', BUND: 'bundles', ATP: 'allTerrain', SWUP: 'softwareUpgrades', SWH: 'spare', SEAT: 'seating', WHLPKG: 'wheelPackages', AUD: 'audio', CHRG: 'charging', CONN: 'connectivity', TON: 'tonneau' };
/* R1 drivetrains are the DTN group; the battery pack is its own BAT group, so a data file
   that models packs as `drives` needs its ids mapped here once that file exists. */
const R1_DRIVE_CODE = { dual: 'DTN-201', duallr: 'DTN-202', tri: 'DTN-301', quad: 'DTN-401' };
/* Accessory codes both R1 builders share (same product, same price as R2 where it overlaps).
   Body-specific codes (bed net, tonneau, captain's-chair mats …) are added per vehicle. */
const R1_ACCESSORY_CODE = { PROCGR9EN2: 'wall', ACERRPC001: 'portable', PROC40WJ94: 'j1772', PROC7DQTIG: 'ccs', ACERCSB003: 'crossbars', PROC36F3QD: 'crossbarsdark', PROCVPNA7O: 'sunshade', PROCMUH5EP: 'screen', PROCDERMLE: 'seatback', PROC7AVMF3: 'kitchen', PROCI6NGZX: 'awning', ACEREGC001: 'gearcable', PROC1195GT: 'organizer' };

/* Both R1 builders share a loader shape and an option vocabulary; only the codes, the
   compositor slug and a couple of body-specific groups differ. They also share the loader
   key, so ruleset.meta.vehicle is what disambiguates R1S from R1T. */
function r1(id, label, o) {
  return {
    id, label, data: `data/vehicle-${id}.js`,
    builder: `https://rivian.com/configurations/builder/${id}`,
    page: null,           // /r1s and /r1t are old __NEXT_DATA__ pages: no availabilityText
    gearCollection: null, // Rivian publishes no per-vehicle R1 Gear Shop collection
    vpKey: 'routes/builder/vehicleProduct', layoutKey: 'routes/builder/r1/layout',
    meta: label,          // expected ruleset.meta.vehicle
    /* R2 splits these across the layout route; on R1 they all hang off vehicleProduct. */
    pricing: (vp) => vp.buildPricing || {},
    /* R1 trim cards have no CONFIG= href, so match Rivian's trim title against the option
       name ("R1S Premium" …). Horsepower lives on `hp` there, not `horsepower`. */
    content: (vp, lay, rs) => {
      const by = new Map((vp.r1TrimContent || []).map((t) => [t.title, t]));
      return Object.fromEntries(((rs.groups.BLD || {}).options || []).map((c) => [c, by.get((rs.options[c] || {}).name)]).filter(([, t]) => t).map(([c, t]) => [c, { ...t, horsepower: t.hp }]));
    },
    news: new RegExp(`(^|-)${id}(-|$)`),
    accTrim: 'quad',
    disabledNote: ['disabled in the builder default configuration', 'disabled'],
    legendDisabled: 'disabled in the builder default configuration',
    DRIVE_CODE: R1_DRIVE_CODE, GROUP_OF: R1_GROUP_OF, images: r1ImageUrls,
    ...o,
  };
}

const VEH = {
  r2: {
    id: 'r2', label: 'R2', data: 'data/vehicle-r2.js',
    builder: 'https://rivian.com/configurations/builder/r2',
    page: 'https://rivian.com/r2',
    gearCollection: 'https://gearshop.rivian.com/collections/r2/products.json?limit=250',
    vpKey: 'r2-vehicleProduct', layoutKey: 'routes/builder/r2/layout',
    pricing: (vp, lay) => lay.buildPricing || {},
    content: (vp, lay) => Object.fromEntries((lay.r2TrimContent || []).map((t) => [t.href && (t.href.match(/CONFIG=(BLD-[A-Z0-9]+)/) || [])[1], t])),
    news: /(^|-)r2(-|$)/,
    accTrim: 'performance',
    disabledNote: ['disabled on the default drivetrain (Rivian: "Available with Long Range")', 'disabled unless Long Range'],
    legendDisabled: 'disabled on the default drivetrain',
    TRIM_CODE: { standard: 'BLD-STND2', premium: 'BLD-PRM2', performance: 'BLD-PRF2' },
    DRIVE_CODE: { rwd: 'DTN-RWDS', rwdlr: 'DTN-RWD', awdlr: 'DTN-AWDL' },
    ADDON_CODE: { autonomy: 'AUTO-RAP01', tow: 'TOW-001', spare: 'SPT-1R2' },
    /* Builder "Accessories" group (orderable with the car) → our accessories[].items[].id.
       Everything in this group is expected in our gear list; an unmapped code is a finding. */
    ACCESSORY_CODE: { PROCGR9EN2: 'wall', ACERRPC001: 'portable', PROC40WJ94: 'j1772', PROC7DQTIG: 'ccs', PROCSHQ0DS: 'mats', ACERCB2001: 'crossbars', PROCFTAJXN: 'cargocover', PROCEGZLXP: 'carcover', PROCJ4Z0CV: 'sunshade', PROCE991DW: 'screen', PROCDERMLE: 'seatback' },
    GROUP_OF: { EXP: 'colors', WHL: 'wheels', INT: 'interiors', DTN: 'drivetrains', ACCESSORIES: 'accessories' },
    images: r2ImageUrls,
  },
  r1s: r1('r1s', 'R1S', {
    TRIM_CODE: { premium: 'BLD-DR1S', performance: 'BLD-TR1S', quad: 'BLD-QR1S' },
    ADDON_CODE: { autonomy: 'AUTO-RAP01', power: 'SWUP-PERF01', spare: 'SWH-CST', allterrain: 'ATP-001', captains: 'SEAT-CAPT', soundvision: 'BUND-AR01' },
    ACCESSORY_CODE: { ...R1_ACCESSORY_CODE, PROC8ADYDJ: 'mats', PROCKRCVHG: 'matscapt', PROCC79AX5: 'cargocover', PROCV9QMGB: 'carcover', ACERRTT001: 'tent', PROCLOJG0Z: 'keyfob', ACERKFS001: 'keyfobincl' },
  }),
  r1t: r1('r1t', 'R1T', {
    TRIM_CODE: { premium: 'BLD-DR1T', performance: 'BLD-TR1T', quad: 'BLD-QR1T' },
    ADDON_CODE: { autonomy: 'AUTO-RAP01', power: 'SWUP-PERF01', spare: 'SWH-FSST', allterrain: 'ATP-001', soundvision: 'BUND-AR01', tonneau: 'TON-P02' },
    ACCESSORY_CODE: { ...R1_ACCESSORY_CODE, PROCHZ5Z81: 'mats', PROC0WQQP8: 'tailgatepad', PROCUG0ARL: 'bednet', PROCKPHW41: 'carcover', PROCDPFBCD: 'keyfob', ACERKFT001: 'keyfobincl' },
  }),
};

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const C = VEH[opt('--vehicle') || 'r2'];
if (!C) { console.error(`ERROR: unknown --vehicle "${opt('--vehicle')}" (expected ${Object.keys(VEH).join(' | ')})`); process.exit(1); }

/* ---------------- helpers ---------------- */
const today = new Date().toISOString().slice(0, 10);
async function get(url, as = 'text') {
  const r = await fetch(url, { headers: { 'user-agent': 'r2-configurator-tracker/1 (+https://github.com/mmocniak/r2-configurator)' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return as === 'json' ? r.json() : r.text();
}
async function head(url) {
  try { const r = await fetch(url, { method: 'HEAD' }); return r.status; } catch (e) { return 0; }
}
async function pool(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}
const norm = (s) => String(s || '').toLowerCase().replace(/[“”"″]/g, '"').replace(/rivian |\s*-\s*nacs|\bnacs\b|\ball-season\b|\ball-terrain\b|\ba\/t\b|[()]/g, ' ').replace(/[^a-z0-9"]+/g, ' ').trim();
const money = (n) => (n == null ? '—' : '$' + Number(n).toLocaleString('en-US'));
const sortObj = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));

/* ---------------- 1. our data ----------------
   A vehicle whose data file doesn't exist yet is not an error: we snapshot Rivian's side
   and skip the diff. The destination charge is owned per vehicle (fees.destination in the
   vehicle file); app.js's global FEES is the fallback for files that don't carry one yet. */
function appDestination() {
  const appJs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const dest = (appJs.match(/const FEES\s*=\s*\{[^}]*destination\s*:\s*(\d+)/) || [])[1];
  return { destination: dest ? Number(dest) : null, destSource: 'app.js FEES.destination' };
}
function loadOurs() {
  const file = path.join(ROOT, C.data);
  if (!fs.existsSync(file)) return { V: null, ...appDestination() };
  const ctx = {};
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx);
  const V = (ctx.VEHICLES || {})[C.id];
  if (!V) throw new Error(`${C.data} does not define VEHICLES.${C.id}`);
  if (V.fees && V.fees.destination != null) return { V, destination: V.fees.destination, destSource: `fees.destination in ${C.data}` };
  return { V, ...appDestination() };
}

/* ---------------- 2. builder (turbo-stream) ---------------- */
function decodeTurboStream(text) {
  const arr = JSON.parse(text.split('\n')[0]);
  const memo = new Map();
  const SPECIAL = { '-1': undefined, '-2': undefined, '-3': NaN, '-4': Infinity, '-5': null, '-6': -0, '-7': null };
  function hyd(i) {
    if (typeof i !== 'number') return i;
    if (i < 0) return SPECIAL[i];
    if (memo.has(i)) return memo.get(i);
    const v = arr[i];
    if (Array.isArray(v)) {
      if (typeof v[0] === 'string' && v.length <= 3 && /^[A-Z]{1,3}$/.test(v[0])) { // typed value (Date, Promise, …)
        const out = v[0] === 'D' ? new Date(hyd(v[1])).toISOString() : hyd(v[1]); memo.set(i, out); return out;
      }
      const out = []; memo.set(i, out); v.forEach((x) => out.push(hyd(x))); return out;
    }
    if (v && typeof v === 'object') {
      const out = {}; memo.set(i, out);
      for (const k of Object.keys(v)) out[k.startsWith('_') ? hyd(Number(k.slice(1))) : k] = hyd(v[k]);
      return out;
    }
    memo.set(i, v); return v;
  }
  return hyd(0);
}
function parseBuilder(html) {
  const m = html.match(/streamController\.enqueue\(("(?:[^"\\]|\\.)*")\)/);
  if (!m) throw new Error('builder: no streamController.enqueue payload found (page format changed?)');
  const root = decodeTurboStream(JSON.parse(m[1]));
  const ld = root.loaderData || {};
  const vp = ld[C.vpKey];
  const lay = ld[C.layoutKey];
  if (!vp || !vp.product || !vp.product.ruleset) throw new Error(`builder: ${C.vpKey}.product.ruleset missing (loader shape changed?)`);
  /* Both R1 builders answer on the same loader key, so confirm we got the one we asked for. */
  const meta = vp.product.ruleset.meta || {};
  if (C.meta && meta.vehicle && meta.vehicle !== C.meta) throw new Error(`builder: asked for ${C.meta}, got a ${meta.vehicle} ruleset`);
  return { vp, lay: lay || {} };
}
/* Evaluate the ruleset for one trim: start from the trim's own "select" defaults, apply
   every rule whose condition holds, and read off what is offered + at what price. */
function offerFor(ruleset, bld) {
  const O = ruleset.options, G = ruleset.groups, R = ruleset.rules;
  const trimRule = R.find((r) => r.when && r.when.is === 'set' && r.when.option === bld);
  const sel = new Set([bld, ...((trimRule && trimRule.then && trimRule.then.select) || [])]);
  const state = {};
  const st = (code) => (state[code] = state[code] || { hidden: !!O[code].hidden, disabled: false, price: O[code].price, availableInFuture: !!O[code].availableInFuture, required: !!O[code].required, tempUnavailable: !!O[code].tempUnavailable });
  Object.keys(O).forEach(st);
  const holds = (c) => (c.is === 'set' ? sel.has(c.option) : c.is === 'unset' ? !sel.has(c.option) : false);
  for (const r of R) {
    const ok = r.when ? holds(r.when) : r.whenAll ? r.whenAll.every(holds) : r.whenAny ? r.whenAny.some(holds) : false;
    if (!ok || !r.then) continue;
    for (const u of r.then.update || []) { const s = st(u.option); for (const k of ['hidden', 'disabled', 'price', 'availableInFuture', 'required', 'tempUnavailable']) if (k in u) s[k] = u[k]; }
  }
  const out = {};
  for (const [gid, g] of Object.entries(G)) {
    const key = C.GROUP_OF[gid]; if (!key) continue;
    out[key] = (g.options || []).filter((c) => O[c] && !state[c].hidden).map((c) => ({ code: c, name: O[c].name, price: state[c].price, disabled: state[c].disabled || undefined, availableInFuture: state[c].availableInFuture || undefined, tempUnavailable: state[c].tempUnavailable || undefined }));
  }
  /* Effective wheel pricing: some wheels are force-bundled into a WHLPKG-* package on
     certain trims — a rule selects the package whenever the wheel is picked, the package
     carries the charge, and a sibling rule zeroes the member codes. Price the wheel at
     what a buyer actually pays: the package price where such a rule chain fires for this
     trim. R2 has no WHLPKG group, so this is a no-op there. */
  const pkgFor = (w) => {
    for (const r of R) {
      const p = ((r.then && r.then.select) || []).find((c2) => c2.startsWith('WHLPKG-') && ((O[c2] || {}).bundledOptionCodes || []).includes(w));
      if (!p) continue;
      const conds = r.when ? [r.when] : r.whenAll || [];
      const okc = conds.every((c2) => c2.is === 'set' ? (c2.option === bld || c2.option === w || sel.has(c2.option)) : c2.is === 'unset' ? (c2.option !== bld && c2.option !== w && !sel.has(c2.option)) : false);
      if (okc) return p;
    }
    return null;
  };
  for (const w of out.wheels || []) { const p = pkgFor(w.code); if (p) { w.price = st(p).price; w.pkg = p; } }
  return { selected: [...sel], ...out };
}

/* ---------------- 3. other sources ----------------
   R2 only: the marketing page's "builds" blob is where the availability wording lives. */
function parsePage(html) {
  const u = html.replace(/\\"/g, '"');
  const m = u.match(/"builds":(\{(?:"BLD-[A-Z0-9]+":\{[^{}]*\},?)+\})/);
  return m ? JSON.parse(m[1]) : null;
}
function parseConnectPlus(html) {
  const mo = html.match(/\$(\d+(?:\.\d{2})?)\s*(?:\/|per )\s*mo/i), yr = html.match(/\$(\d+(?:\.\d{2})?)\s*(?:\/|per )\s*y(?:ea)?r/i);
  return { monthly: mo ? Number(mo[1]) : null, yearly: yr ? Number(yr[1]) : null };
}
function parseNewsroom(html) {
  return [...new Set([...html.matchAll(/\/newsroom\/article\/([a-z0-9-]+)/g)].map((m) => m[1]))].sort();
}

/* ---------------- 4. image URLs app.js would build from our data ----------------
   Two schemes, picked per vehicle. R2 renders come from a named visualizer program
   (img.program) with a 360 path; the R1s use a layer compositor instead. */
function r2ImageUrls(V) {
  const P = V.img.program, urls = new Map();
  const add = (kind, what, url) => urls.set(url, { kind, what });
  for (const [id, c] of Object.entries(V.colors)) add('color-chip', id, `${IMG}dpr_auto/f_auto/w_72,q_auto:good,f_auto,c_lfill/v4/${P}/visualizer/color-chips/${c.code}`);
  for (const [code, p] of Object.entries(V.wheelSwatch)) add('wheel-swatch', code, `${IMG}dpr_auto/f_auto/w_120,q_auto:good,c_lfill/${p}`);
  for (const [code, p] of Object.entries(V.cabins)) add('cabin', code, `${IMG}dpr_auto/f_auto/q_auto:good,c_limit,w_1040/${p}`);
  for (const [tid, t] of Object.entries(V.trims)) {
    for (const i of t.interior) add('interior-chip', `${tid}:${i.code}`, `${IMG}dpr_auto/f_auto/w_72,q_auto:good,f_auto,c_lfill/v4/${P}/trims/interior-finishes-chips/${i.code}`);
    for (const w of t.wheels) for (const cid of t.colors) add('hero', `${tid}/${w.code}/${V.colors[cid].code}`, `${IMG}dpr_auto/f_auto/q_auto:good,f_auto,c_lfill/v4/${P}/visualizer/360/${t.folder}/${w.code}/${V.colors[cid].code}/00001.png`);
  }
  for (const g of V.accessories) for (const a of g.items) if (a.img) add('gear-img', a.id, a.img);
  return urls;
}
/* R1 hero: a layer compositor keyed by the sorted, lowercased, comma-joined list of codes
   that make up the render (model year, generation, paint, wheel, motor …). The vehicle file
   supplies img:{compositor,view,ver,extra}, plus optional per-trim `codes`.
   NB the compositor answers 200 with default layers for an unknown code, so a HEAD check
   catches a missing image, never a wrong one. */
const compositorUrl = (img, codes) => `https://media.rivian.com/rivian-main/c_fill,w_1600/q_auto,f_auto/compositor/${img.compositor}/${img.view || 'side'}/${[...new Set([img.ver, ...(img.extra || []), ...codes].filter(Boolean).map((s) => String(s).toLowerCase()))].sort().join(',')}`;
function r1ImageUrls(V) {
  const urls = new Map();
  const add = (kind, what, url) => urls.set(url, { kind, what });
  /* No parametric chip path exists for the R1s: paint swatches are per-code Cloudinary
     filenames, same as the wheel swatches, so the data file carries them as a map. */
  for (const [code, p] of Object.entries(V.colorSwatch || {})) add('color-chip', code, `${IMG}dpr_auto/f_auto/w_72,q_auto:good,f_auto,c_lfill/${p}`);
  for (const [code, p] of Object.entries(V.wheelSwatch || {})) add('wheel-swatch', code, `${IMG}dpr_auto/f_auto/w_120,q_auto:good,c_lfill/${p}`);
  for (const [code, p] of Object.entries(V.cabins || {})) add('cabin', code, `${IMG}dpr_auto/f_auto/q_auto:good,c_limit,w_1040/${p}`);
  if (V.img && V.img.compositor) for (const [tid, t] of Object.entries(V.trims)) for (const w of t.wheels) for (const cid of t.colors) add('hero', `${tid}/${w.code}/${V.colors[cid].code}`, compositorUrl(V.img, [...(t.codes || []), w.code, V.colors[cid].code]));
  for (const g of V.accessories || []) for (const a of g.items) if (a.img) add('gear-img', a.id, a.img);
  return urls;
}

/* ---------------- 5. snapshot ---------------- */
async function snapshot(V) {
  const [builderHtml, pageHtml, cpHtml, newsHtml, collection] = await Promise.all([
    get(C.builder), C.page ? get(C.page) : Promise.resolve(''), get(SRC.connectPlus).catch(() => ''), get(SRC.newsroom).catch(() => ''),
    C.gearCollection ? get(C.gearCollection, 'json').catch(() => ({ products: [] })) : Promise.resolve({ products: [] }),
  ]);
  const { vp, lay } = parseBuilder(builderHtml);
  const rs = vp.product.ruleset;
  const builds = (C.page && parsePage(pageHtml)) || {};
  const pricing = C.pricing(vp, lay) || {};
  const content = C.content(vp, lay, rs) || {};

  const trims = {};
  for (const code of (rs.groups.BLD || {}).options || []) {
    const o = rs.options[code], c = content[code] || {}, b = c.breakdown || {};
    trims[code] = {
      name: o.name, price: rs.defaults.basePrice + (o.price || 0), msrp: pricing[code] && pricing[code].msrp,
      availableInFuture: !!o.availableInFuture, availabilityText: builds[code] && builds[code].availabilityText,
      ...(o.tempUnavailable ? { tempUnavailable: true } : {}),
      range: c.range, acceleration: c.acceleration, horsepower: c.horsepower, pricingText: c.pricing,
      included: b.included || [], optional: b.optional || [], launchPackage: b.launchPackageOptions || [],
      ...offerFor(rs, code),
    };
  }
  const options = sortObj(Object.fromEntries(Object.entries(rs.options).map(([k, o]) => [k, { name: o.name, price: o.price, ...(o.hidden ? { hidden: true } : {}), ...(o.availableInFuture ? { availableInFuture: true } : {}), ...(o.tempUnavailable ? { tempUnavailable: true } : {}), ...(o.bundledOptionCodes ? { bundles: o.bundledOptionCodes } : {}) }])));

  // Gear Shop: the vehicle's collection where one exists, plus a per-product read for
  // every product we link to (the per-product endpoint works for every vehicle).
  const handles = new Set();
  for (const g of (V && V.accessories) || []) for (const a of g.items) { const m = (a.link || '').match(/gearshop\.rivian\.com\/products\/([a-z0-9-]+)/); if (m) handles.add(m[1]); }
  const products = {};
  await pool([...handles], 4, async (h) => {
    try { const j = await get(SRC.gearProduct(h), 'json'); products[h] = { title: j.title, price: j.price / 100, available: !!j.available, image: j.featured_image ? 'https:' + j.featured_image.replace(/^https?:/, '') : null }; }
    catch (e) { products[h] = { error: String(e.message || e) }; }
  });
  const gearCollection = (collection.products || []).map((p) => ({ handle: p.handle, title: p.title, price: Number((p.variants[0] || {}).price || 0), available: !!(p.variants || []).some((v) => v.available) })).sort((a, b) => a.handle.localeCompare(b.handle));

  // images
  let images = { checked: 0, failed: [] };
  if (!flag('--no-images')) {
    const list = [...(V ? C.images(V) : new Map()).entries()];
    if (!list.length) images = { checked: 0, failed: [], note: V ? 'this vehicle data carries no image scheme yet' : 'no local data' };
    else {
      const statuses = await pool(list, 6, ([u]) => head(u));
      images.checked = list.length;
      list.forEach(([u, meta], i) => { if (statuses[i] !== 200) images.failed.push({ ...meta, status: statuses[i], url: u }); });
    }
  } else images = { checked: 0, failed: [], skipped: true };

  const news = parseNewsroom(newsHtml);
  return {
    taken: new Date().toISOString(), sources: { builder: C.builder, [C.id]: C.page, gear: C.gearCollection, connectPlus: SRC.connectPlus, newsroom: SRC.newsroom },
    ruleset: { version: rs.meta.version, effectiveDate: rs.meta.effectiveDate, segments: rs.meta.segments, basePrice: rs.defaults.basePrice, destinationFee: vp.destinationFee, isSoldOut: !!vp.isSoldOut, currency: rs.meta.currency, initialSelection: vp.initialSelection },
    trims, options, rules: rs.rules,
    connectPlus: parseConnectPlus(cpHtml),
    gear: { products: sortObj(products), collection: gearCollection },
    newsroom: { [C.id]: news.filter((s) => C.news.test(s)), all: news },
    images,
  };
}

/* ---------------- 6. diff vs our data ---------------- */
function diffOurs(S, V, destination, destSource) {
  const F = [];
  const f = (level, area, what, ours, rivian, note) => F.push({ level, area, what, ours, rivian, note });
  const chg = (...a) => f('change', ...a), warn = (...a) => f('warn', ...a), info = (...a) => f('info', ...a);
  const availOurs = (s) => norm(s).replace(/^coming\s+/, '');
  const mapped = new Set(Object.values(C.TRIM_CODE));

  // trims
  for (const [code, T] of Object.entries(S.trims)) if (!mapped.has(code)) chg('trims', `new trim ${code}`, null, `${T.name} ${money(T.price)}`, `add to TRIM_CODE + ${C.data}`);
  for (const [tid, code] of Object.entries(C.TRIM_CODE)) {
    const t = V.trims[tid], T = S.trims[code];
    if (!T) { chg('trims', `${tid} missing from Rivian ruleset (${code})`, t && t.name, null); continue; }
    if (!t) { chg('trims', `${code} offered by Rivian, no "${tid}" trim in our data`, null, `${T.name} ${money(T.price)}`); continue; }
    if (t.price !== T.price) chg('trims', `${tid} price`, t.price, T.price);
    const oursNow = /available now/i.test(t.avail);
    if (oursNow === T.availableInFuture) chg('trims', `${tid} availability`, t.avail, T.availableInFuture ? `future (${T.availabilityText || '?'})` : 'available now');
    /* The wording tier needs the marketing page's availabilityText, which only R2 has —
       for the R1s there is nothing to compare and this drops out on its own. */
    else if (T.availabilityText && !oursNow && availOurs(T.availabilityText) !== availOurs(t.avail)) warn('trims', `${tid} availability wording`, t.avail, T.availabilityText);
    if (T.tempUnavailable) info('trims', `${tid} is tempUnavailable in Rivian's ruleset`, t.avail, 'tempUnavailable');
    for (const [k, ok] of [['range', String(t.range) + ' mi'], ['horsepower', t.hp + ' hp'], ['acceleration', String(t.z60).replace('s', ' s')]]) if (T[k] && norm(T[k]) !== norm(ok)) warn('trims', `${tid} ${k}`, ok, T[k]);

    // colors offered on this trim
    const ourColors = new Map((t.colors || []).map((cid) => [V.colors[cid].code, { id: cid, ...V.colors[cid] }]));
    const rivColors = new Map((T.colors || []).map((c) => [c.code, c]));
    for (const [code2, c] of rivColors) {
      const o = ourColors.get(code2);
      if (!o) { chg('colors', `${tid}: ${c.name} (${code2}) offered by Rivian, not in our trim`, null, `${money(c.price)}${c.disabled ? ' (disabled on default drivetrain)' : ''}`); continue; }
      if (o.price !== c.price) chg('colors', `${tid}: ${c.name} price`, o.price, c.price);
      if (o.avail && !c.availableInFuture && !c.tempUnavailable) chg('colors', `${tid}: ${c.name} is orderable now; drop its avail chip`, o.avail, 'available now');
      if (!o.avail && c.availableInFuture) chg('colors', `${tid}: ${c.name} is future-availability at Rivian; add an avail chip`, null, 'availableInFuture');
      if (c.disabled) info('colors', `${tid}: ${c.name} ${C.disabledNote[0]}`, o.avail || null, C.disabledNote[1]);
      if (c.tempUnavailable) info('colors', `${tid}: ${c.name} is tempUnavailable in Rivian's ruleset (stock state, not an avail chip)`, o.avail || null, 'tempUnavailable');
    }
    for (const [code2, o] of ourColors) if (!rivColors.has(code2)) chg('colors', `${tid}: ${o.name} (${code2}) in our trim, not offered by Rivian`, money(o.price), null);

    // wheels
    const rivW = new Map((T.wheels || []).map((w) => [w.code.replace(/^WHL-/, ''), w]));
    /* our wheel codes are bare for R2 ('21B') and full for the R1s ('WHL-2SD', which the
       compositor hero URL needs) — normalize both sides of the lookup to the bare form */
    for (const w of t.wheels || []) { const wc = w.code.replace(/^WHL-/, ''), r = rivW.get(wc); if (!r) chg('wheels', `${tid}: ${w.name} (${w.code}) not offered by Rivian`, money(w.price), null); else if (r.price !== w.price) chg('wheels', `${tid}: ${w.name} price`, w.price, r.price); rivW.delete(wc); }
    for (const [c, r] of rivW) chg('wheels', `${tid}: ${r.name} (${c}) offered by Rivian, not in our trim`, null, money(r.price));

    // interiors
    const rivI = new Map((T.interiors || []).map((i) => [i.code, i]));
    for (const i of t.interior || []) {
      const r = rivI.get(i.code);
      if (!r) { chg('interiors', `${tid}: ${i.name} (${i.code}) not offered by Rivian`, money(i.price), null); continue; }
      if (r.price !== i.price) chg('interiors', `${tid}: ${i.name} price`, i.price, r.price);
      if (i.avail && !r.availableInFuture && !r.tempUnavailable) chg('interiors', `${tid}: ${i.name} is orderable now; drop its avail chip`, i.avail, 'available now');
      if (!i.avail && r.availableInFuture) chg('interiors', `${tid}: ${i.name} is future-availability at Rivian; add an avail chip`, null, 'availableInFuture');
      rivI.delete(i.code);
    }
    for (const [c, r] of rivI) chg('interiors', `${tid}: ${r.name} (${c}) offered by Rivian, not in our trim`, null, money(r.price));

    // drivetrains (only trims with selectable drives)
    if (t.drives) {
      const rivD = new Map((T.drivetrains || []).map((d) => [d.code, d]));
      for (const d of t.drives) { const code2 = C.DRIVE_CODE[d.id], r = rivD.get(code2); if (!r) chg('drivetrains', `${tid}: ${d.name} ${d.sub} (${d.id}→${code2}) not offered by Rivian`, money(d.price), null); else { if (r.price !== d.price) chg('drivetrains', `${tid}: ${d.name} ${d.sub} price`, d.price, r.price); rivD.delete(code2); } }
      for (const [c, r] of rivD) chg('drivetrains', `${tid}: ${r.name} (${c}) offered by Rivian, not in our drives`, null, money(r.price));
    }
  }

  // add-ons — a code's real charge can live on a per-trim override rather than the global
  // option price (R1 Sound + Vision is $0 globally, $2,500 on Premium), so accept a match
  // against the global price or any trim's resolved price for that code.
  const resolvedPrices = (code) => {
    const set = new Set();
    for (const T of Object.values(S.trims)) for (const arr of Object.values(T)) if (Array.isArray(arr)) for (const e of arr) if (e && e.code === code && e.price != null) set.add(e.price);
    return set;
  };
  for (const a of V.addons || []) {
    const code = C.ADDON_CODE[a.id], o = S.options[code];
    if (!o) { warn('addons', `${a.id} has no ADDON_CODE mapping / code missing`, a.price, null); continue; }
    if (o.price !== a.price && !resolvedPrices(code).has(a.price)) chg('addons', `${a.name} price`, a.price, o.price);
  }

  // builder accessories group vs our gear list (explicit ACCESSORY_CODE map)
  const ourAcc = []; for (const g of V.accessories || []) for (const a of g.items) ourAcc.push(a);
  const builderAccPrice = {};
  for (const acc of (S.trims[C.TRIM_CODE[C.accTrim]] || {}).accessories || []) {
    const id = C.ACCESSORY_CODE[acc.code], o = id && ourAcc.find((a) => a.id === id);
    if (id) builderAccPrice[id] = acc.price;
    /* $0 = standard/included equipment on this trim (J1772 on every R1, CCS on Quad) — not a
       purchasable option; never demand a gear-list entry or flag a price against it. */
    if (!acc.price) { info('accessories', `${acc.name} (${acc.code}) is included standard in the builder`, o ? money(o.price) : null, '$0'); continue; }
    if (!id) chg('accessories', `new builder accessory ${acc.code}: ${acc.name} — add to data + ACCESSORY_CODE`, null, money(acc.price));
    else if (!o) chg('accessories', `builder accessory ${acc.name} (${acc.code}→${id}) missing from our gear list`, null, money(acc.price));
    else if (o.price !== acc.price) chg('accessories', `${o.name} builder price`, o.price, acc.price);
  }

  // Gear Shop products we link to
  for (const a of ourAcc) {
    const m = (a.link || '').match(/gearshop\.rivian\.com\/products\/([a-z0-9-]+)/); if (!m) continue;
    const p = S.gear.products[m[1]];
    if (!p || p.error) { chg('gear', `${a.name}: product page unreachable (${m[1]})`, a.link, p && p.error); continue; }
    if (p.price !== a.price) {
      /* When Rivian's builder and Gear Shop disagree (variant pages, bundles), our price
         follows the builder; note the shop's number instead of flagging drift. */
      if (builderAccPrice[a.id] === a.price) info('gear', `${a.name}: Gear Shop page lists ${money(p.price)}; ours follows the builder's ${money(a.price)} (variant/bundle difference)`, a.price, p.price);
      else chg('gear', `${a.name} Gear Shop price`, a.price, p.price);
    }
    if (a.avail && p.available) chg('gear', `${a.name} is purchasable now; drop its "${a.avail}" chip`, a.avail, 'available');
    if (!a.avail && !p.available) info('gear', `${a.name} shows available:false on the Gear Shop (stock state — do not tag; see README)`, null, 'available:false');
    if (p.image && a.img && p.image.split('?')[0].split('/').pop() !== a.img.split('?')[0].split('/').pop()) info('gear', `${a.name} featured image changed on the Gear Shop (ours still resolves unless listed under images)`, a.img.split('/').pop().split('?')[0], p.image.split('/').pop().split('?')[0]);
  }
  /* Only R2 has a Gear Shop collection to compare against; skip this tier for the R1s. */
  if (C.gearCollection) {
    const linked = new Set(ourAcc.map((a) => ((a.link || '').match(/products\/([a-z0-9-]+)/) || [])[1]).filter(Boolean));
    const notListed = S.gear.collection.filter((p) => !linked.has(p.handle) && p.price > 0 && p.price < 100000 && !/t-shirt|shirt|bottle|hat|cap\b|frame|pen\b|caps\b|lug-nut/.test(p.handle));
    if (notListed.length) info('gear', `${C.label} collection products we don't list (${notListed.length})`, null, notListed.map((p) => `${p.handle} ${money(p.price)}${p.available ? '' : ' (unavailable)'}`).join('; '));
  }

  // fees + subscriptions
  if (S.ruleset.destinationFee != null && destination != null && S.ruleset.destinationFee !== destination) chg('fees', `destination fee (${destSource})`, destination, S.ruleset.destinationFee);
  const cp = V.connectPlus && V.connectPlus.plans;
  if (cp) {
    if (S.connectPlus.monthly != null && S.connectPlus.monthly !== cp.monthly.price) chg('connect+', 'monthly', cp.monthly.price, S.connectPlus.monthly);
    if (S.connectPlus.yearly != null && S.connectPlus.yearly !== cp.yearly.price) chg('connect+', 'yearly', cp.yearly.price, S.connectPlus.yearly);
    if (S.connectPlus.monthly == null || S.connectPlus.yearly == null) warn('connect+', 'could not read Connect+ prices from rivian.com/connect-plus', `${cp.monthly.price}/mo ${cp.yearly.price}/yr`, null);
  }

  // images
  for (const i of S.images.failed) chg('images', `${i.kind} ${i.what} → HTTP ${i.status}`, i.url, null);
  return F;
}

/* ---------------- 7. diff vs previous snapshot ---------------- */
/* R2 keeps the original results/YYYY-MM-DD.json name; every other vehicle gets its own
   suffixed series, so each vehicle only ever diffs against its own previous snapshot. */
const resultName = (day) => `${day}${C.id === 'r2' ? '' : `-${C.id}`}.json`;
const RESULT_RE = C.id === 'r2' ? /^\d{4}-\d{2}-\d{2}\.json$/ : new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${C.id}\\.json$`);
function loadPrevious() {
  if (!fs.existsSync(RESULTS_DIR)) return null;
  const files = fs.readdirSync(RESULTS_DIR).filter((f) => RESULT_RE.test(f) && f !== resultName(today)).sort();
  if (!files.length) return null;
  return { file: files[files.length - 1], data: JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, files[files.length - 1]), 'utf8')) };
}
function diffPrevious(S, P) {
  const F = [];
  const f = (area, what, before, after) => F.push({ level: 'delta', area, what, ours: before, rivian: after });
  if (!P) return F;
  const A = P.data;
  if (A.ruleset.version !== S.ruleset.version || A.ruleset.effectiveDate !== S.ruleset.effectiveDate) f('ruleset', 'version / effective date', `${A.ruleset.version} @ ${A.ruleset.effectiveDate}`, `${S.ruleset.version} @ ${S.ruleset.effectiveDate}`);
  for (const k of ['basePrice', 'destinationFee', 'isSoldOut']) if (A.ruleset[k] !== S.ruleset[k]) f('ruleset', k, A.ruleset[k], S.ruleset[k]);
  const keys = new Set([...Object.keys(A.options), ...Object.keys(S.options)]);
  for (const k of keys) {
    const a = A.options[k], b = S.options[k];
    if (!a) f('options', `added ${k}`, null, `${b.name} ${money(b.price)}`);
    else if (!b) f('options', `removed ${k}`, `${a.name} ${money(a.price)}`, null);
    else if (JSON.stringify(a) !== JSON.stringify(b)) f('options', `${k} ${b.name}`, JSON.stringify(a), JSON.stringify(b));
  }
  if (JSON.stringify(A.rules) !== JSON.stringify(S.rules)) f('rules', 'ruleset rules changed (compare the two snapshot files)', `${A.rules.length} rules`, `${S.rules.length} rules`);
  for (const [code, T] of Object.entries(S.trims)) { const a = A.trims[code]; if (!a) continue; for (const k of ['availabilityText', 'availableInFuture', 'tempUnavailable', 'price', 'range', 'horsepower', 'acceleration', 'pricingText']) if (JSON.stringify(a[k]) !== JSON.stringify(T[k])) f('trims', `${T.name} ${k}`, a[k], T[k]); }
  for (const k of ['monthly', 'yearly']) if (A.connectPlus[k] !== S.connectPlus[k]) f('connect+', k, A.connectPlus[k], S.connectPlus[k]);
  const ah = new Map((A.gear.collection || []).map((p) => [p.handle, p])), bh = new Map((S.gear.collection || []).map((p) => [p.handle, p]));
  for (const [h, p] of bh) { const a = ah.get(h); if (!a) f('gear', `new in ${C.label} collection: ${h}`, null, `${p.title} ${money(p.price)}`); else if (a.price !== p.price) f('gear', `${h} price`, a.price, p.price); }
  for (const h of ah.keys()) if (!bh.has(h)) f('gear', `gone from ${C.label} collection: ${h}`, ah.get(h).title, null);
  const wasNews = (A.newsroom || {})[C.id] || [];
  for (const s of S.newsroom[C.id]) if (!wasNews.includes(s)) f('newsroom', `new ${C.label} article`, null, `https://rivian.com/newsroom/article/${s}`);
  return F;
}

/* ---------------- 8. report ---------------- */
function report(S, V, findings, deltas, prev, outFile) {
  const L = [];
  const changes = findings.filter((x) => x.level === 'change'), warns = findings.filter((x) => x.level === 'warn'), infos = findings.filter((x) => x.level === 'info');
  const anyTemp = Object.values(S.trims).some((T) => (T.colors || []).some((x) => x.tempUnavailable) || (T.interiors || []).some((x) => x.tempUnavailable));
  L.push(`# ${C.label} config tracker — ${today}`, '');
  L.push(`Rivian ruleset **${S.ruleset.version}** (effective ${S.ruleset.effectiveDate}, segment ${(S.ruleset.segments || []).join('/')}) · base ${money(S.ruleset.basePrice)} · destination ${money(S.ruleset.destinationFee)} · soldOut=${S.ruleset.isSoldOut}`);
  const oursLine = !V ? `Our data: none yet — \`${C.data}\` is not in the repo, so this run is snapshot-only`
    : `Our data: \`verified: '${V.verified || '—'}'\`${V.draft ? ' · **draft**: findings are reported but never fail the run' : ''}`;
  L.push(`${oursLine} · snapshot saved to \`${path.relative(ROOT, outFile)}\`${prev ? ` · previous: \`${prev.file}\`` : ' · no previous snapshot'}`, '');
  L.push('## Trims (Rivian)', '', '| code | name | price | availability | range / hp / 0-60 | colors | wheels | interiors |', '|---|---|---|---|---|---|---|---|');
  for (const [c, T] of Object.entries(S.trims)) {
    /* Only R2 has availability wording to show; for the R1s the ruleset flags are the signal. */
    const avail = C.page ? `${T.availableInFuture ? 'future' : 'now'} — ${T.availabilityText || '?'}` : `${T.availableInFuture ? 'future' : 'now'}${T.tempUnavailable ? ' ⚠' : ''}`;
    const opts = (list, prefix) => (list || []).map((x) => x.code.replace(prefix, '') + (x.price ? `+${x.price}` : '') + (x.availableInFuture ? '⏳' : '') + (x.tempUnavailable ? '⚠' : '') + (x.disabled ? '†' : '')).join(' ');
    L.push(`| ${c} | ${T.name} | ${money(T.price)} | ${avail} | ${T.range} / ${T.horsepower} / ${T.acceleration} | ${opts(T.colors, 'EXP-')} | ${(T.wheels || []).map((x) => x.code.replace('WHL-', '') + (x.price ? `+${x.price}` : '')).join(' ')} | ${opts(T.interiors, 'INT-')} |`);
  }
  L.push('', `⏳ = availableInFuture · † = ${C.legendDisabled}${anyTemp ? ' · ⚠ = tempUnavailable' : ''}`, '');
  const table = (rows, hdr) => { L.push(`## ${hdr} (${rows.length})`, ''); if (!rows.length) { L.push('none', ''); return; } L.push('| area | what | ours | rivian |', '|---|---|---|---|'); for (const r of rows) L.push(`| ${r.area} | ${r.what} | ${r.ours == null ? '—' : String(r.ours).replace(/\|/g, '\\|')} | ${r.rivian == null ? '—' : String(r.rivian).replace(/\|/g, '\\|')}${r.note ? ` (${r.note})` : ''} |`); L.push(''); };
  if (!V) L.push(`## Findings — drift between Rivian and ${C.data}`, '', `no local data to diff — \`${C.data}\` does not exist yet. Everything above is Rivian's side, captured so a data file can be written against it.`, '');
  else table(changes, `Findings — drift between Rivian and ${C.data}`);
  table(warns, 'Warnings — wording / could not verify');
  table(deltas, `Changes since previous snapshot${prev ? ` (${prev.file})` : ''}`);
  table(infos, 'Info — no action by default');
  const cp = V && V.connectPlus && V.connectPlus.plans;
  L.push(`## Connect+`, '', `Rivian: ${money(S.connectPlus.monthly)}/mo · ${money(S.connectPlus.yearly)}/yr${cp ? ` · ours: ${money(cp.monthly.price)}/mo · ${money(cp.yearly.price)}/yr` : ''}`, '');
  L.push(`## Images`, '', S.images.skipped ? 'skipped (--no-images)' : S.images.note ? `skipped (${S.images.note})` : `${S.images.checked} CDN URLs checked, ${S.images.failed.length} failed`, '');
  L.push(`## Newsroom ${C.label} articles`, '', ...S.newsroom[C.id].map((s) => `- https://rivian.com/newsroom/article/${s}`), '');
  return L.join('\n');
}

/* ---------------- main ---------------- */
(async () => {
  const { V, destination, destSource } = loadOurs();
  const S = await snapshot(V);
  const prev = loadPrevious();
  const findings = V ? diffOurs(S, V, destination, destSource) : [];
  const deltas = diffPrevious(S, prev);
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const outFile = path.resolve(opt('--json') || path.join(RESULTS_DIR, resultName(today)));
  fs.writeFileSync(outFile, JSON.stringify(S, null, 1) + '\n');
  const md = report(S, V, findings, deltas, prev, outFile);
  if (opt('--report')) fs.writeFileSync(path.resolve(opt('--report')), md + '\n');
  process.stdout.write(md + '\n');
  /* Drift fails the run only when there is verified data to be wrong: no data file means
     nothing to diff, and a draft file is unverified by definition. */
  process.exit(V && !V.draft && findings.some((x) => x.level === 'change') ? 2 : 0);
})().catch((e) => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
