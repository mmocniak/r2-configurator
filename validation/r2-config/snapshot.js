#!/usr/bin/env node
/* R2 config tracker — snapshot Rivian's live R2 catalog and diff it against
   data/vehicle-r2.js. Zero dependencies (Node ≥ 18, built-in fetch). Never edits
   repo data; it only reads, fetches, and reports. See README.md in this folder.

   Usage:
     node validation/r2-config/snapshot.js              # snapshot + report to stdout
     node validation/r2-config/snapshot.js --no-images  # skip the ~70 CDN HEAD checks
     node validation/r2-config/snapshot.js --report out.md --json out.json

   Exit code: 0 = no drift, 2 = drift findings (see "Findings"), 1 = fetch/parse error.

   Sources (all fetchable with plain HTTPS, no auth, no headless browser):
     builder   https://rivian.com/configurations/builder/r2   — React Router loader data
               embedded in the HTML (turbo-stream encoded). Contains the full R2
               ruleset: every option code, name, price, per-trim rules, destination fee.
     r2 page   https://rivian.com/r2 — Next.js flight data with per-trim availabilityText
               ("Available now" / "Coming late 2026" / "Coming 2027").
     gear      https://gearshop.rivian.com/collections/r2/products.json + per-product .js
     connect+  https://rivian.com/connect-plus (SSR'd prices)
     newsroom  https://rivian.com/newsroom (article slugs; R2-tagged ones are flagged)
     images    HEAD on every CDN URL app.js would build from our data (404 = broken) */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const RESULTS_DIR = path.join(__dirname, 'results');
const SRC = {
  builder: 'https://rivian.com/configurations/builder/r2',
  r2: 'https://rivian.com/r2',
  gearCollection: 'https://gearshop.rivian.com/collections/r2/products.json?limit=250',
  gearProduct: (h) => `https://gearshop.rivian.com/products/${h}.js`,
  connectPlus: 'https://rivian.com/connect-plus',
  newsroom: 'https://rivian.com/newsroom',
};
const IMG = 'https://media.rivian.com/image/upload/'; // mirrors app.js
/* How our ids map onto Rivian's option codes. A code Rivian adds that isn't mapped
   here surfaces as a "new" finding — that's the point. */
const TRIM_CODE = { standard: 'BLD-STND2', premium: 'BLD-PRM2', performance: 'BLD-PRF2' };
const DRIVE_CODE = { rwd: 'DTN-RWDS', rwdlr: 'DTN-RWD', awdlr: 'DTN-AWDL' };
const ADDON_CODE = { autonomy: 'AUTO-RAP01', tow: 'TOW-001', spare: 'SPT-1R2' };
/* Builder "Accessories" group (orderable with the car) → our accessories[].items[].id.
   Everything in this group is expected in our gear list; an unmapped code is a finding. */
const ACCESSORY_CODE = { PROCGR9EN2: 'wall', ACERRPC001: 'portable', PROC40WJ94: 'j1772', PROC7DQTIG: 'ccs', PROCSHQ0DS: 'mats', ACERCB2001: 'crossbars', PROCFTAJXN: 'cargocover', PROCEGZLXP: 'carcover', PROCJ4Z0CV: 'sunshade', PROCE991DW: 'screen', PROCDERMLE: 'seatback' };
const GROUP_OF = { EXP: 'colors', WHL: 'wheels', INT: 'interiors', DTN: 'drivetrains', ACCESSORIES: 'accessories' };

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

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

/* ---------------- 1. our data ---------------- */
function loadOurs() {
  const ctx = {};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data', 'vehicle-r2.js'), 'utf8'), ctx);
  const appJs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
  const dest = (appJs.match(/const FEES\s*=\s*\{[^}]*destination\s*:\s*(\d+)/) || [])[1];
  return { V: ctx.VEHICLES.r2, destination: dest ? Number(dest) : null };
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
  const vp = ld['r2-vehicleProduct'];
  const lay = ld['routes/builder/r2/layout'];
  if (!vp || !vp.product || !vp.product.ruleset) throw new Error('builder: r2-vehicleProduct.product.ruleset missing (loader shape changed?)');
  return { vp, lay: lay || {} };
}
/* Evaluate the ruleset for one trim: start from the trim's own "select" defaults, apply
   every rule whose condition holds, and read off what is offered + at what price. */
function offerFor(ruleset, bld) {
  const O = ruleset.options, G = ruleset.groups, R = ruleset.rules;
  const trimRule = R.find((r) => r.when && r.when.is === 'set' && r.when.option === bld);
  const sel = new Set([bld, ...((trimRule && trimRule.then && trimRule.then.select) || [])]);
  const state = {};
  const st = (code) => (state[code] = state[code] || { hidden: !!O[code].hidden, disabled: false, price: O[code].price, availableInFuture: !!O[code].availableInFuture, required: !!O[code].required });
  Object.keys(O).forEach(st);
  const holds = (c) => (c.is === 'set' ? sel.has(c.option) : c.is === 'unset' ? !sel.has(c.option) : false);
  for (const r of R) {
    const ok = r.when ? holds(r.when) : r.whenAll ? r.whenAll.every(holds) : r.whenAny ? r.whenAny.some(holds) : false;
    if (!ok || !r.then) continue;
    for (const u of r.then.update || []) { const s = st(u.option); for (const k of ['hidden', 'disabled', 'price', 'availableInFuture', 'required']) if (k in u) s[k] = u[k]; }
  }
  const out = {};
  for (const [gid, g] of Object.entries(G)) {
    const key = GROUP_OF[gid]; if (!key) continue;
    out[key] = (g.options || []).filter((c) => O[c] && !state[c].hidden).map((c) => ({ code: c, name: O[c].name, price: state[c].price, disabled: state[c].disabled || undefined, availableInFuture: state[c].availableInFuture || undefined }));
  }
  return { selected: [...sel], ...out };
}

/* ---------------- 3. other sources ---------------- */
function parseR2Page(html) {
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

/* ---------------- 4. image URLs app.js would build from our data ---------------- */
function imageUrls(V) {
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

/* ---------------- 5. snapshot ---------------- */
async function snapshot(V, ours) {
  const [builderHtml, r2Html, cpHtml, newsHtml, collection] = await Promise.all([
    get(SRC.builder), get(SRC.r2), get(SRC.connectPlus).catch(() => ''), get(SRC.newsroom).catch(() => ''), get(SRC.gearCollection, 'json').catch(() => ({ products: [] })),
  ]);
  const { vp, lay } = parseBuilder(builderHtml);
  const rs = vp.product.ruleset;
  const builds = parseR2Page(r2Html) || {};
  const pricing = (lay.buildPricing) || {};
  const content = Object.fromEntries((lay.r2TrimContent || []).map((t) => [t.href && (t.href.match(/CONFIG=(BLD-[A-Z0-9]+)/) || [])[1], t]));

  const trims = {};
  for (const code of (rs.groups.BLD || {}).options || []) {
    const o = rs.options[code], c = content[code] || {}, b = c.breakdown || {};
    trims[code] = {
      name: o.name, price: rs.defaults.basePrice + (o.price || 0), msrp: pricing[code] && pricing[code].msrp,
      availableInFuture: !!o.availableInFuture, availabilityText: builds[code] && builds[code].availabilityText,
      range: c.range, acceleration: c.acceleration, horsepower: c.horsepower, pricingText: c.pricing,
      included: b.included || [], optional: b.optional || [], launchPackage: b.launchPackageOptions || [],
      ...offerFor(rs, code),
    };
  }
  const options = sortObj(Object.fromEntries(Object.entries(rs.options).map(([k, o]) => [k, { name: o.name, price: o.price, ...(o.hidden ? { hidden: true } : {}), ...(o.availableInFuture ? { availableInFuture: true } : {}), ...(o.bundledOptionCodes ? { bundles: o.bundledOptionCodes } : {}) }])));

  // Gear Shop: the R2 collection, plus a per-product read for every product we link to
  const handles = new Set();
  for (const g of V.accessories) for (const a of g.items) { const m = (a.link || '').match(/gearshop\.rivian\.com\/products\/([a-z0-9-]+)/); if (m) handles.add(m[1]); }
  const products = {};
  await pool([...handles], 4, async (h) => {
    try { const j = await get(SRC.gearProduct(h), 'json'); products[h] = { title: j.title, price: j.price / 100, available: !!j.available, image: j.featured_image ? 'https:' + j.featured_image.replace(/^https?:/, '') : null }; }
    catch (e) { products[h] = { error: String(e.message || e) }; }
  });
  const gearCollection = (collection.products || []).map((p) => ({ handle: p.handle, title: p.title, price: Number((p.variants[0] || {}).price || 0), available: !!(p.variants || []).some((v) => v.available) })).sort((a, b) => a.handle.localeCompare(b.handle));

  // images
  let images = { checked: 0, failed: [] };
  if (!flag('--no-images')) {
    const urls = imageUrls(V);
    const list = [...urls.entries()];
    const statuses = await pool(list, 6, ([u]) => head(u));
    images.checked = list.length;
    list.forEach(([u, meta], i) => { if (statuses[i] !== 200) images.failed.push({ ...meta, status: statuses[i], url: u }); });
  } else images = { checked: 0, failed: [], skipped: true };

  const news = parseNewsroom(newsHtml);
  return {
    taken: new Date().toISOString(), sources: { builder: SRC.builder, r2: SRC.r2, gear: SRC.gearCollection, connectPlus: SRC.connectPlus, newsroom: SRC.newsroom },
    ruleset: { version: rs.meta.version, effectiveDate: rs.meta.effectiveDate, segments: rs.meta.segments, basePrice: rs.defaults.basePrice, destinationFee: vp.destinationFee, isSoldOut: !!vp.isSoldOut, currency: rs.meta.currency, initialSelection: vp.initialSelection },
    trims, options, rules: rs.rules,
    connectPlus: parseConnectPlus(cpHtml),
    gear: { products: sortObj(products), collection: gearCollection },
    newsroom: { r2: news.filter((s) => /(^|-)r2(-|$)/.test(s)), all: news },
    images,
  };
}

/* ---------------- 6. diff vs our data ---------------- */
function diffOurs(S, V, destination) {
  const F = [];
  const f = (level, area, what, ours, rivian, note) => F.push({ level, area, what, ours, rivian, note });
  const chg = (...a) => f('change', ...a), warn = (...a) => f('warn', ...a), info = (...a) => f('info', ...a);
  const availOurs = (s) => norm(s).replace(/^coming\s+/, '');
  const mapped = new Set(Object.values(TRIM_CODE));

  // trims
  for (const [code, T] of Object.entries(S.trims)) if (!mapped.has(code)) chg('trims', `new trim ${code}`, null, `${T.name} ${money(T.price)}`, 'add to TRIM_CODE + data/vehicle-r2.js');
  for (const [tid, code] of Object.entries(TRIM_CODE)) {
    const t = V.trims[tid], T = S.trims[code];
    if (!T) { chg('trims', `${tid} missing from Rivian ruleset (${code})`, t && t.name, null); continue; }
    if (t.price !== T.price) chg('trims', `${tid} price`, t.price, T.price);
    const oursNow = /available now/i.test(t.avail);
    if (oursNow === T.availableInFuture) chg('trims', `${tid} availability`, t.avail, T.availableInFuture ? `future (${T.availabilityText || '?'})` : 'available now');
    else if (T.availabilityText && !oursNow && availOurs(T.availabilityText) !== availOurs(t.avail)) warn('trims', `${tid} availability wording`, t.avail, T.availabilityText);
    for (const [k, ok] of [['range', String(t.range) + ' mi'], ['horsepower', t.hp + ' hp'], ['acceleration', String(t.z60).replace('s', ' s')]]) if (T[k] && norm(T[k]) !== norm(ok)) warn('trims', `${tid} ${k}`, ok, T[k]);

    // colors offered on this trim
    const ourColors = new Map(t.colors.map((cid) => [V.colors[cid].code, { id: cid, ...V.colors[cid] }]));
    const rivColors = new Map(T.colors.map((c) => [c.code, c]));
    for (const [code2, c] of rivColors) {
      const o = ourColors.get(code2);
      if (!o) { chg('colors', `${tid}: ${c.name} (${code2}) offered by Rivian, not in our trim`, null, `${money(c.price)}${c.disabled ? ' (disabled on default drivetrain)' : ''}`); continue; }
      if (o.price !== c.price) chg('colors', `${tid}: ${c.name} price`, o.price, c.price);
      if (o.avail && !c.availableInFuture) chg('colors', `${tid}: ${c.name} is orderable now; drop its avail chip`, o.avail, 'available now');
      if (!o.avail && c.availableInFuture) chg('colors', `${tid}: ${c.name} is future-availability at Rivian; add an avail chip`, null, 'availableInFuture');
      if (c.disabled) info('colors', `${tid}: ${c.name} disabled on the default drivetrain (Rivian: "Available with Long Range")`, o.avail || null, 'disabled unless Long Range');
    }
    for (const [code2, o] of ourColors) if (!rivColors.has(code2)) chg('colors', `${tid}: ${o.name} (${code2}) in our trim, not offered by Rivian`, money(o.price), null);

    // wheels
    const rivW = new Map(T.wheels.map((w) => [w.code.replace(/^WHL-/, ''), w]));
    for (const w of t.wheels) { const r = rivW.get(w.code); if (!r) chg('wheels', `${tid}: ${w.name} (${w.code}) not offered by Rivian`, money(w.price), null); else if (r.price !== w.price) chg('wheels', `${tid}: ${w.name} price`, w.price, r.price); rivW.delete(w.code); }
    for (const [c, r] of rivW) chg('wheels', `${tid}: ${r.name} (${c}) offered by Rivian, not in our trim`, null, money(r.price));

    // interiors
    const rivI = new Map(T.interiors.map((i) => [i.code, i]));
    for (const i of t.interior) {
      const r = rivI.get(i.code);
      if (!r) { chg('interiors', `${tid}: ${i.name} (${i.code}) not offered by Rivian`, money(i.price), null); continue; }
      if (r.price !== i.price) chg('interiors', `${tid}: ${i.name} price`, i.price, r.price);
      if (i.avail && !r.availableInFuture) chg('interiors', `${tid}: ${i.name} is orderable now; drop its avail chip`, i.avail, 'available now');
      if (!i.avail && r.availableInFuture) chg('interiors', `${tid}: ${i.name} is future-availability at Rivian; add an avail chip`, null, 'availableInFuture');
      rivI.delete(i.code);
    }
    for (const [c, r] of rivI) chg('interiors', `${tid}: ${r.name} (${c}) offered by Rivian, not in our trim`, null, money(r.price));

    // drivetrains (only trims with selectable drives)
    if (t.drives) {
      const rivD = new Map(T.drivetrains.map((d) => [d.code, d]));
      for (const d of t.drives) { const code2 = DRIVE_CODE[d.id], r = rivD.get(code2); if (!r) chg('drivetrains', `${tid}: ${d.name} ${d.sub} (${d.id}→${code2}) not offered by Rivian`, money(d.price), null); else { if (r.price !== d.price) chg('drivetrains', `${tid}: ${d.name} ${d.sub} price`, d.price, r.price); rivD.delete(code2); } }
      for (const [c, r] of rivD) chg('drivetrains', `${tid}: ${r.name} (${c}) offered by Rivian, not in our drives`, null, money(r.price));
    }
  }

  // add-ons
  for (const a of V.addons) { const o = S.options[ADDON_CODE[a.id]]; if (!o) warn('addons', `${a.id} has no ADDON_CODE mapping / code missing`, a.price, null); else if (o.price !== a.price) chg('addons', `${a.name} price`, a.price, o.price); }

  // builder accessories group vs our gear list (explicit ACCESSORY_CODE map)
  const ourAcc = []; for (const g of V.accessories) for (const a of g.items) ourAcc.push(a);
  for (const acc of (S.trims[TRIM_CODE.performance] || { accessories: [] }).accessories) {
    const id = ACCESSORY_CODE[acc.code], o = id && ourAcc.find((a) => a.id === id);
    if (!id) chg('accessories', `new builder accessory ${acc.code}: ${acc.name} — add to data + ACCESSORY_CODE`, null, money(acc.price));
    else if (!o) chg('accessories', `builder accessory ${acc.name} (${acc.code}→${id}) missing from our gear list`, null, money(acc.price));
    else if (o.price !== acc.price) chg('accessories', `${o.name} builder price`, o.price, acc.price);
  }

  // Gear Shop products we link to
  for (const a of ourAcc) {
    const m = (a.link || '').match(/gearshop\.rivian\.com\/products\/([a-z0-9-]+)/); if (!m) continue;
    const p = S.gear.products[m[1]];
    if (!p || p.error) { chg('gear', `${a.name}: product page unreachable (${m[1]})`, a.link, p && p.error); continue; }
    if (p.price !== a.price) chg('gear', `${a.name} Gear Shop price`, a.price, p.price);
    if (a.avail && p.available) chg('gear', `${a.name} is purchasable now; drop its "${a.avail}" chip`, a.avail, 'available');
    if (!a.avail && !p.available) info('gear', `${a.name} shows available:false on the Gear Shop (stock state — do not tag; see README)`, null, 'available:false');
    if (p.image && a.img && p.image.split('?')[0].split('/').pop() !== a.img.split('?')[0].split('/').pop()) info('gear', `${a.name} featured image changed on the Gear Shop (ours still resolves unless listed under images)`, a.img.split('/').pop().split('?')[0], p.image.split('/').pop().split('?')[0]);
  }
  const linked = new Set(ourAcc.map((a) => ((a.link || '').match(/products\/([a-z0-9-]+)/) || [])[1]).filter(Boolean));
  const notListed = S.gear.collection.filter((p) => !linked.has(p.handle) && p.price > 0 && p.price < 100000 && !/t-shirt|shirt|bottle|hat|cap\b|frame|pen\b|caps\b|lug-nut/.test(p.handle));
  if (notListed.length) info('gear', `R2 collection products we don't list (${notListed.length})`, null, notListed.map((p) => `${p.handle} ${money(p.price)}${p.available ? '' : ' (unavailable)'}`).join('; '));

  // fees + subscriptions
  if (S.ruleset.destinationFee != null && destination != null && S.ruleset.destinationFee !== destination) chg('fees', 'destination fee (app.js FEES.destination)', destination, S.ruleset.destinationFee);
  const cp = V.connectPlus.plans;
  if (S.connectPlus.monthly != null && S.connectPlus.monthly !== cp.monthly.price) chg('connect+', 'monthly', cp.monthly.price, S.connectPlus.monthly);
  if (S.connectPlus.yearly != null && S.connectPlus.yearly !== cp.yearly.price) chg('connect+', 'yearly', cp.yearly.price, S.connectPlus.yearly);
  if (S.connectPlus.monthly == null || S.connectPlus.yearly == null) warn('connect+', 'could not read Connect+ prices from rivian.com/connect-plus', `${cp.monthly.price}/mo ${cp.yearly.price}/yr`, null);

  // images
  for (const i of S.images.failed) chg('images', `${i.kind} ${i.what} → HTTP ${i.status}`, i.url, null);
  return F;
}

/* ---------------- 7. diff vs previous snapshot ---------------- */
function loadPrevious() {
  if (!fs.existsSync(RESULTS_DIR)) return null;
  const files = fs.readdirSync(RESULTS_DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f !== `${today}.json`).sort();
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
  for (const [code, T] of Object.entries(S.trims)) { const a = A.trims[code]; if (!a) continue; for (const k of ['availabilityText', 'availableInFuture', 'price', 'range', 'horsepower', 'acceleration', 'pricingText']) if (JSON.stringify(a[k]) !== JSON.stringify(T[k])) f('trims', `${T.name} ${k}`, a[k], T[k]); }
  for (const k of ['monthly', 'yearly']) if (A.connectPlus[k] !== S.connectPlus[k]) f('connect+', k, A.connectPlus[k], S.connectPlus[k]);
  const ah = new Map(A.gear.collection.map((p) => [p.handle, p])), bh = new Map(S.gear.collection.map((p) => [p.handle, p]));
  for (const [h, p] of bh) { const a = ah.get(h); if (!a) f('gear', `new in R2 collection: ${h}`, null, `${p.title} ${money(p.price)}`); else if (a.price !== p.price) f('gear', `${h} price`, a.price, p.price); }
  for (const h of ah.keys()) if (!bh.has(h)) f('gear', `gone from R2 collection: ${h}`, ah.get(h).title, null);
  for (const s of S.newsroom.r2) if (!A.newsroom.r2.includes(s)) f('newsroom', `new R2 article`, null, `https://rivian.com/newsroom/article/${s}`);
  return F;
}

/* ---------------- 8. report ---------------- */
function report(S, V, findings, deltas, prev, outFile) {
  const L = [];
  const changes = findings.filter((x) => x.level === 'change'), warns = findings.filter((x) => x.level === 'warn'), infos = findings.filter((x) => x.level === 'info');
  L.push(`# R2 config tracker — ${today}`, '');
  L.push(`Rivian ruleset **${S.ruleset.version}** (effective ${S.ruleset.effectiveDate}, segment ${(S.ruleset.segments || []).join('/')}) · base ${money(S.ruleset.basePrice)} · destination ${money(S.ruleset.destinationFee)} · soldOut=${S.ruleset.isSoldOut}`);
  L.push(`Our data: \`verified: '${V.verified}'\` · snapshot saved to \`${path.relative(ROOT, outFile)}\`${prev ? ` · previous: \`${prev.file}\`` : ' · no previous snapshot'}`, '');
  L.push('## Trims (Rivian)', '', '| code | name | price | availability | range / hp / 0-60 | colors | wheels | interiors |', '|---|---|---|---|---|---|---|---|');
  for (const [c, T] of Object.entries(S.trims)) L.push(`| ${c} | ${T.name} | ${money(T.price)} | ${T.availableInFuture ? 'future' : 'now'} — ${T.availabilityText || '?'} | ${T.range} / ${T.horsepower} / ${T.acceleration} | ${T.colors.map((x) => x.code.replace('EXP-', '') + (x.price ? `+${x.price}` : '') + (x.availableInFuture ? '⏳' : '') + (x.disabled ? '†' : '')).join(' ')} | ${T.wheels.map((x) => x.code.replace('WHL-', '') + (x.price ? `+${x.price}` : '')).join(' ')} | ${T.interiors.map((x) => x.code.replace('INT-', '') + (x.price ? `+${x.price}` : '') + (x.availableInFuture ? '⏳' : '')).join(' ')} |`);
  L.push('', '⏳ = availableInFuture · † = disabled on the default drivetrain', '');
  const table = (rows, hdr) => { L.push(`## ${hdr} (${rows.length})`, ''); if (!rows.length) { L.push('none', ''); return; } L.push('| area | what | ours | rivian |', '|---|---|---|---|'); for (const r of rows) L.push(`| ${r.area} | ${r.what} | ${r.ours == null ? '—' : String(r.ours).replace(/\|/g, '\\|')} | ${r.rivian == null ? '—' : String(r.rivian).replace(/\|/g, '\\|')}${r.note ? ` (${r.note})` : ''} |`); L.push(''); };
  table(changes, 'Findings — drift between Rivian and data/vehicle-r2.js');
  table(warns, 'Warnings — wording / could not verify');
  table(deltas, `Changes since previous snapshot${prev ? ` (${prev.file})` : ''}`);
  table(infos, 'Info — no action by default');
  L.push(`## Connect+`, '', `Rivian: ${money(S.connectPlus.monthly)}/mo · ${money(S.connectPlus.yearly)}/yr · ours: ${money(V.connectPlus.plans.monthly.price)}/mo · ${money(V.connectPlus.plans.yearly.price)}/yr`, '');
  L.push(`## Images`, '', S.images.skipped ? 'skipped (--no-images)' : `${S.images.checked} CDN URLs checked, ${S.images.failed.length} failed`, '');
  L.push(`## Newsroom R2 articles`, '', ...S.newsroom.r2.map((s) => `- https://rivian.com/newsroom/article/${s}`), '');
  return L.join('\n');
}

/* ---------------- main ---------------- */
(async () => {
  const { V, destination } = loadOurs();
  const S = await snapshot(V, { destination });
  const prev = loadPrevious();
  const findings = diffOurs(S, V, destination);
  const deltas = diffPrevious(S, prev);
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const outFile = path.resolve(opt('--json') || path.join(RESULTS_DIR, `${today}.json`));
  fs.writeFileSync(outFile, JSON.stringify(S, null, 1) + '\n');
  const md = report(S, V, findings, deltas, prev, outFile);
  if (opt('--report')) fs.writeFileSync(path.resolve(opt('--report')), md + '\n');
  process.stdout.write(md + '\n');
  process.exit(findings.some((x) => x.level === 'change') ? 2 : 0);
})().catch((e) => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
