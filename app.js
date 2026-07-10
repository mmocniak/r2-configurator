/* ---------------- DATA ---------------- */
const IMG='https://media.rivian.com/image/upload/';
/* CUR_VEHICLE is the active VEHICLES[...] object; imgProgram() feeds the Rivian
   visualizer CDN path so each vehicle hotlinks renders from its own program segment. */
let CUR_VEHICLE=null;
function imgProgram(){return (CUR_VEHICLE&&CUR_VEHICLE.img&&CUR_VEHICLE.img.program)||'gold-iris';}
function chipURL(code){return IMG+'dpr_auto/f_auto/w_72,q_auto:good,f_auto,c_lfill/v4/'+imgProgram()+'/visualizer/color-chips/'+code;}
/* wheel selector swatch (per-vehicle WHEEL_SWATCH map) — no parametric wheel-chip
   path exists, so we hotlink the swatch Rivian serves per wheel code */
function wheelURL(code){return IMG+'dpr_auto/f_auto/w_120,q_auto:good,c_lfill/'+WHEEL_SWATCH[code];}
function interiorURL(code){return IMG+'dpr_auto/f_auto/w_72,q_auto:good,f_auto,c_lfill/v4/'+imgProgram()+'/trims/interior-finishes-chips/'+code;}
function heroURL(trim,wheel,color){return IMG+'dpr_auto/f_auto/q_auto:good,f_auto,c_lfill/v4/'+imgProgram()+'/visualizer/360/'+trim+'/'+wheel+'/'+color+'/00001.png';}
/* interior cabin photo (per-vehicle CABINS map) — no parametric interior visualizer
   exists, so we hotlink the studio shot Rivian serves per interior code */
function cabinURL(code){return IMG+'dpr_auto/f_auto/q_auto:good,c_limit,w_1040/'+CABINS[code];}

const FEES={destination:1495,doc:377};/* national fees only; tax/title/reg/evFee are per-state (see LOC) */

/* ---------------- VEHICLE LAYER ----------------
   Vehicle spec/pricing lives in data/vehicle-<id>.js (the VEHICLES map). These working
   globals are re-pointed at the active vehicle by selectVehicle(); everything below reads
   them exactly as before, so the R2 render path is unchanged when only R2 is loaded. */
let TRIMS,COLORS,ADDONS,CONNECT_PLUS,INTERIORS,CABINS,WHEEL_SWATCH,CMP_ACCESSORIES,GEAR_IMG,ACC_FOOTNOTE;
let TRIM_KEYS=[],CMP_ADDONS=[],INT_HEX={};
/* Preview mode reveals draft vehicles for QA. Precedence:
   1. an explicit ?preview / ?preview=1 / #preview turns it ON; ?preview=0 / false turns it OFF;
   2. otherwise it's ON automatically in local dev (file:// or localhost) and OFF everywhere else.
   So drafts auto-show while you build locally, stay hidden in production, and either can be
   forced via the param — no build step, no hardcoded production domain. */
function previewMode(loc){
  loc=loc||location;
  var m=(loc.search+'&'+loc.hash).match(/[?#&]preview(?:=([^&#]*))?/i);
  if(m)return m[1]===undefined||m[1]===''||!/^(0|false|no)$/i.test(m[1]);   /* explicit param wins */
  var h=loc.hostname;return h===''||h==='localhost'||h==='127.0.0.1'||h==='[::1]';   /* auto-on in local dev */
}
/* "live" = shown in the header toggle: non-draft vehicles, plus drafts while in preview mode.
   ≥2 live vehicles is what renders the toggle at all. */
function liveVehicleIds(){var pv=previewMode();return Object.keys(VEHICLES).filter(id=>pv||!VEHICLES[id].draft);}

/* ---------------- STATE ---------------- */
/* Per-trim Build memory: BUILD[vehicle][trim] keeps each trim's own color/wheel/interior/
   drive/add-ons/Connect+ so switching trims (or vehicles) never leaks a selection between
   them. Seeded from each trim's defaults — the first option in each array. */
function buildSlot(k){const t=TRIMS[k];return{
  drive:t.drives?t.drives[0].id:null,   /* trims with selectable drivetrains only */
  color:t.colors[0],
  wheel:t.wheels[0].id,
  interior:t.interior[0].id,
  addons:new Set(),
  connectPlus:'none'
};}
const BUILD={};
const S={vehicle:'r2',trim:undefined,heroView:'ext',state2:'NC',
  cmpColor:{},cmpInterior:{},cmpWheel:{},cmpDrive:{},cmpAddons:{},cmpConnectPlus:{},
  accBundle:new Set(),
  launchOff:false};   /* true = what-if: price the flagship Launch Edition promo out */
/* Route S.wheel / S.color / … to the active vehicle+trim's slot, so every existing
   read+write below stays valid with zero call-site changes. addons is a Set mutated in
   place (.add/.delete/.clear) and never reassigned, so it needs no setter. */
['drive','color','wheel','interior','connectPlus'].forEach(f=>Object.defineProperty(S,f,{
  enumerable:true,get(){return BUILD[S.vehicle][S.trim][f];},set(v){BUILD[S.vehicle][S.trim][f]=v;}}));
Object.defineProperty(S,'addons',{enumerable:true,get(){return BUILD[S.vehicle][S.trim].addons;}});
/* re-seed the compare-tab's per-column selections from the active vehicle's trim defaults */
function seedCmp(){
  S.cmpColor={};S.cmpInterior={};S.cmpWheel={};S.cmpDrive={};S.cmpAddons={};S.cmpConnectPlus={};
  TRIM_KEYS.forEach(k=>{const t=TRIMS[k];
    S.cmpColor[k]=t.colors[0];
    S.cmpInterior[k]=t.interior[0].id;
    S.cmpWheel[k]=t.wheels[0].id;
    if(t.drives)S.cmpDrive[k]=t.drives[0].id;
    S.cmpAddons[k]=new Set();
    S.cmpConnectPlus[k]='none';
  });
}
/* point the working globals at a vehicle and (re)seed its build + compare state */
function selectVehicle(id){
  if(!VEHICLES[id])return;
  CUR_VEHICLE=VEHICLES[id];
  TRIMS=CUR_VEHICLE.trims;COLORS=CUR_VEHICLE.colors;ADDONS=CUR_VEHICLE.addons;
  CONNECT_PLUS=CUR_VEHICLE.connectPlus;INTERIORS=CUR_VEHICLE.interiors;CABINS=CUR_VEHICLE.cabins;
  WHEEL_SWATCH=CUR_VEHICLE.wheelSwatch;CMP_ACCESSORIES=CUR_VEHICLE.accessories;
  GEAR_IMG=CUR_VEHICLE.gearImg;ACC_FOOTNOTE=CUR_VEHICLE.accFootnote;
  TRIM_KEYS=Object.keys(TRIMS);
  /* add-ons surfaced as selectable rows in the compare matrix (Launch-included or cmp-flagged) */
  CMP_ADDONS=ADDONS.filter(a=>a.launchInc||a.cmp);
  INT_HEX={};TRIM_KEYS.forEach(k=>TRIMS[k].interior.forEach(i=>{INT_HEX[i.id]=i.hex||'#2c2c2e';}));
  S.vehicle=id;
  if(!TRIMS[S.trim])S.trim=CUR_VEHICLE.flagshipTrim||TRIM_KEYS[0];
  if(!BUILD[id]){BUILD[id]={};TRIM_KEYS.forEach(k=>BUILD[id][k]=buildSlot(k));}
  seedCmp();
}
selectVehicle('r2');
/* Performance folds the Launch pair in free; S.launchOff simulates the promo ending */
const isLaunchInc=(t,a)=>!!(t.autoIncl&&a.launchInc&&!S.launchOff);
/* accessories sourced from the trim-comparison sheet (Gear Shop / configurator, June 2026) */
/* --- accessory catalog lives per-vehicle in data/vehicle-<id>.js (CMP_ACCESSORIES) --- */

/* ---------------- HELPERS ---------------- */
const $=id=>document.getElementById(id);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const moneyCents=n=>{
  const v=Math.round((+n||0)*100)/100;
  return '$'+v.toLocaleString('en-US',{minimumFractionDigits:Number.isInteger(v)?0:2,maximumFractionDigits:2});
};
function connectPlan(plan){return (CONNECT_PLUS.plans&&CONNECT_PLUS.plans[plan])||null;}
function connectLabel(plan){const p=connectPlan(plan);return p?`${moneyCents(p.price)}/${p.period}`:'Off';}
function connectPlanName(plan){const p=connectPlan(plan);return p?`${CONNECT_PLUS.name} · ${p.name}`:'No Connect+';}
function connectAnnualCost(plan){const p=connectPlan(plan);return p?(p.period==='mo'?p.price*12:p.price):0;}
function connectTotalCost(plan,years){return connectAnnualCost(plan)*years;}
function connectSummary(plan){const p=connectPlan(plan);return p?`${CONNECT_PLUS.name} · ${p.name} (${moneyCents(p.price)}/${p.period})`:'';}
function normalizeConnect(plan){return connectPlan(plan)?plan:'none';}
/* theme-aware chart palette — dark values kick in with the OS scheme. Chart DATA
   colors (baked into SVG/inline styles) read these instead of hardcoded hex; the
   chart CHROME — axes/labels/legend — already flips via CSS vars. Evaluated per
   render so an OS theme flip is reflected on the next calc2(). */
const DARKQ=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)');
const CHART_LIGHT={yellow:'#f4cf17',gray:'#7b8794',blue:'#4f8fd0',red:'#d6453f',
  teal:'#1f7f8c',orange:'#d6783f',green:'#1f9d57',olive:'#b5790a',purple:'#9166cc',
  resale:'#cdd5dd',navy:'#1d2733',statetax:'#c9547d',dest:'#e0b33c',doc:'#c2b596',
  tealFill:'rgba(31,127,140,.12)',tealFill2:'rgba(31,127,140,.16)',
  redFill:'rgba(214,69,63,.14)',redFillLt:'rgba(214,69,63,.07)',
  greenFill:'rgba(31,157,87,.10)',redGlow:'rgba(214,69,63,.5)'};
const CHART_DARK={yellow:'#f4cf17',gray:'#8f9caa',blue:'#5fa0e0',red:'#e8635d',
  teal:'#3fb2c0',orange:'#e0895a',green:'#3cc274',olive:'#d9a63a',purple:'#a986d8',
  resale:'#5a6673',navy:'#e6ecf2',statetax:'#e07aa0',dest:'#e6bf5a',doc:'#c9bda0',
  tealFill:'rgba(63,178,192,.16)',tealFill2:'rgba(63,178,192,.20)',
  redFill:'rgba(232,99,93,.18)',redFillLt:'rgba(232,99,93,.10)',
  greenFill:'rgba(60,194,116,.14)',redGlow:'rgba(232,99,93,.5)'};
function CC(){return (DARKQ&&DARKQ.matches)?CHART_DARK:CHART_LIGHT;}
/* inline Lucide + Lucide Lab icons (offline-safe) */
const ICONS={
  zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  palette:'<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.4"/>',
  seat:'<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/><path d="M5 18v2"/><path d="M19 18v2"/>',
  gearboxSquare:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7v10"/><path d="M12 7v10"/><path d="M17 7v5H7"/>',
  steeringWheel:'<circle cx="12" cy="12" r="10"/><path d="m3.3 7 7 4"/><path d="m13.7 11 7-4"/><path d="M12 14v8"/><circle cx="12" cy="12" r="2"/>',
  caravan:'<path d="M18 19V9a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a2 2 0 0 0 2 2h2"/><path d="M2 9h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2"/><path d="M22 17v1a1 1 0 0 1-1 1H10v-9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9"/><circle cx="8" cy="19" r="2"/>',
  charge:'<path d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><path d="M6 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1"/><path d="m11 7-3 5h4l-3 5"/><line x1="22" x2="22" y1="11" y2="13"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  plug:'<path d="M9 2v5"/><path d="M15 2v5"/><path d="M6 7h12v4a6 6 0 0 1-12 0Z"/><path d="M12 17v5"/>',
  wifi:'<path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M12 20h.01"/>',
  rack:'<path d="M3 7h18"/><path d="M3 17h18"/><path d="M6 7v10"/><path d="M12 7v10"/><path d="M18 7v10"/>',
  mats:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18"/><path d="M4 9h4"/><path d="M4 15h4"/>',
  box:'<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
  monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  tablet:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  bike:'<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>'
};
function ico(name,size){size=size||18;return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||''}</svg>`;}
function curTrim(){return TRIMS[S.trim];}
function curWheel(){return curTrim().wheels.find(w=>w.id===S.wheel)||curTrim().wheels[0];}
/* selected drive system (Standard has 3; other trims have a single fixed drivetrain) */
function curDrive(){const t=curTrim();if(!t.drives)return null;return t.drives.find(d=>d.id===S.drive)||t.drives[0];}
function curRange(){const d=curDrive();return (d?d.range:curTrim().range)+curWheel().rd;}
function curHP(){const d=curDrive();return d?d.hp:curTrim().hp;}
function curZ60(){const d=curDrive();return d?d.z60:curTrim().z60;}
function curDriveLabel(){const d=curDrive();return d?d.drive:curTrim().drive;}
function curMotors(){const d=curDrive();return d?d.motors:curTrim().motors;}
function curTow(){const d=curDrive();return d?d.tow:curTrim().tow;}
function curAvail(){const d=curDrive();return d?d.avail:curTrim().avail;}
/* An option ships today when avail reads "Available now" (or is unset); any
   other value — a future quarter/year or "Coming soon" — isn't orderable yet. */
function isSoon(avail){var t=(avail||'').trim();return !!t&&!/available now/i.test(t);}
function soonPill(avail){return isSoon(avail)?`<span class="soon">${avail}</span>`:'';}

/* ---------------- BUILD: trims ---------------- */
function renderTrims(){
  const row=$('trimRow');row.innerHTML='';
  Object.entries(TRIMS).forEach(([k,t])=>{
    const d=document.createElement('div');
    d.className='trim'+(S.trim===k?' sel':'');
    d.innerHTML=`<div class="check">${ico('check',13)}</div><div class="tn">${t.short}</div>
      <div class="tp">${money(t.price)}</div>
      <div class="ts">${t.motors} · ${t.drive} · ${t.hp} hp<br>${t.range} mi · 0–60 ${t.z60}</div>
      <span class="av${isSoon(t.avail)?' soon':''}">${t.avail}</span>`;
    d.onclick=()=>{S.trim=k;S.heroView='ext';renderAll();};
    row.appendChild(d);
  });
}

/* ---------------- BUILD: hero render ---------------- */
function renderHero(){
  const t=curTrim();const col=COLORS[S.color];const img=$('heroImg');
  img.style.display='';$('heroPh').style.display='none';
  img.onerror=()=>{img.style.display='none';$('heroPh').style.display='';};
  if(S.heroView==='int'){
    const io=t.interior.find(i=>i.id===S.interior)||t.interior[0];
    img.src=cabinURL(io.code);
    $('heroCap').textContent=`${t.short} · ${io.name} interior`;
  }else{
    img.src=heroURL(t.folder,curWheel().code,col.code);
    $('heroCap').textContent=`${t.short} · ${col.name} · ${curWheel().name}`;
  }
  /* reflect active view on the toggle buttons */
  document.querySelectorAll('#heroView button').forEach(b=>b.classList.toggle('on',b.dataset.view===S.heroView));
}

/* ---------------- BUILD: branches ---------------- */
function makeNode(o){
  const el=document.createElement('div');
  el.className='node'+(o.sel?' sel':'')+(o.locked?' locked':'');
  let chip='';
  if(o.chip==='color')chip=`<span class="chip" style="background:${o.hex}"><img src="${chipURL(o.code)}" loading="lazy" onerror="this.style.display='none'"></span>`;
  if(o.chip==='wheel')chip=`<span class="chip wheel"><img src="${wheelURL(o.code)}" loading="lazy" onerror="this.style.display='none'"></span>`;
  if(o.chip==='interior')chip=`<span class="chip" style="background:${o.hex}"><img src="${interiorURL(o.code)}" loading="lazy" onerror="this.style.display='none'"></span>`;
  const price=o.price===null?'':(o.price>0
    ?`+<b>${o.period?moneyCents(o.price):money(o.price)}</b>${o.period?'/'+o.period:''}`
    :`<b>Included</b>`);
  el.innerHTML=`<div class="check">${ico('check',12)}</div><div class="nm">${chip}${o.label}</div>
    <div class="pr">${price}</div>${o.spec?`<div class="pr" style="margin-top:3px;color:var(--faint)">${o.spec}</div>`:''}${o.tag?`<span class="tag">${o.tag}</span>`:''}${soonPill(o.avail)}`;
  if(o.onclick&&!o.locked)el.onclick=o.onclick;
  return el;
}
/* dedicated drive-system card: range is the hero, paired with price; specs demoted */
function makeDriveNode(o){
  const el=document.createElement('div');
  el.className='dnode'+(o.sel?' sel':'')+(o.onclick?'':' fixed');
  const price=o.price>0?`+${money(o.price)}`:`<span class="dincl">Included</span>`;
  const note=(o.note&&o.note!=='Included')?` · ${o.note}`:'';
  el.innerHTML=`<div class="check">${ico('check',12)}</div>
    <div class="dname">${o.name}</div>
    <div class="dvar">${o.sub}</div>
    <div class="dkey">
      <div class="drange"><b>${o.range}</b> mi <i>est.</i></div>
      <div class="dprice">${price}</div>
    </div>
    <div class="dspecs">${o.hp} hp · 0–60 ${o.z60} · ${o.tow} tow</div>
    <div class="davail">${soonPill(o.avail)||o.avail}${note}</div>`;
  if(o.onclick)el.onclick=o.onclick;
  return el;
}
function branch(ic,title,meta,nodes){
  const b=document.createElement('div');
  b.innerHTML=`<div class="branchhead"><span class="ic">${ic}</span>${title}<span class="meta">${meta||''}</span></div>`;
  const n=document.createElement('div');n.className='nodes';
  nodes.forEach(o=>n.appendChild(makeNode(o)));
  b.appendChild(n);return b;
}
function renderBranches(){
  const t=curTrim();const host=$('treeBranches');host.innerHTML='';

  /* Performance-only: Launch Edition promo switch — full-width banner above the config tree */
  const lb=$('launchBanner');
  if(lb){
    if(t.autoIncl){
      lb.innerHTML=`<div class="launchbanner${S.launchOff?' off':''}">
        <span class="lbic">${ico('zap',15)}</span>
        <span class="lbtext"><b>Launch Edition promotion</b>
        <span class="lbsub">${S.launchOff
          ?'Off — pricing shown as if the promotion has ended: Autonomy+ and the Tow Package price individually below.'
          :'Autonomy+, Tow Package &amp; Launch key fob included — limited time.'}</span></span>
        <button type="button" class="swtoggle" role="switch" aria-checked="${!S.launchOff}" aria-label="Launch Edition promotion"><span class="knob"></span></button></div>`;
      lb.querySelector('.swtoggle').onclick=()=>{S.launchOff=!S.launchOff;renderAll();};
    }else lb.innerHTML='';
  }

  /* one "Drive system" card grid for every trim: Standard's are selectable, fixed trims render one Included card */
  const drives=t.drives||[{
    name:t.drive==='AWD'?'All-Wheel Drive':'Rear-Wheel Drive',
    sub:`${t.motors} · Large pack (~87.9 kWh)`,
    price:0,range:t.range,hp:t.hp,z60:t.z60,tow:t.tow,avail:t.avail,note:'Included',sel:true
  }];
  const wrap=document.createElement('div');
  wrap.innerHTML=`<div class="branchhead"><span class="ic">${ico('gearboxSquare')}</span>Drive system<span class="meta">${curRange()} mi configured</span></div>`;
  const grid=document.createElement('div');grid.className='nodes drivenodes';
  drives.forEach(o=>{
    const opts=Object.assign({},o);
    if(t.drives){opts.sel=S.drive===o.id;opts.onclick=()=>{S.drive=o.id;renderAll();};}
    grid.appendChild(makeDriveNode(opts));
  });
  wrap.appendChild(grid);host.appendChild(wrap);

  host.appendChild(branch(ico('palette'),'Paint',COLORS[S.color].name,t.colors.map(id=>{
    const c=COLORS[id];
    return {label:c.name,price:c.price,sel:S.color===id,chip:'color',code:c.code,hex:c.hex,tag:c.note||'',avail:c.avail,
      onclick:()=>{S.color=id;S.heroView='ext';renderAll();}};
  })));

  host.appendChild(branch(ico('wheel'),'Wheels & tires','',t.wheels.map(w=>({
    label:w.name,price:w.price,sel:S.wheel===w.id,chip:'wheel',code:w.code,
    tag:(w.rd?`${w.rd} mi range`:'')+(w.note?(w.rd?' · ':'')+w.note:''),
    onclick:()=>{S.wheel=w.id;S.heroView='ext';renderAll();}}))));

  host.appendChild(branch(ico('seat'),'Interior','',t.interior.map(i=>({
    label:i.name,price:i.price,sel:S.interior===i.id,chip:'interior',code:i.code,hex:intHex(i.id),tag:i.note||'',avail:i.avail,
    onclick:()=>{S.interior=i.id;S.heroView='int';renderAll();}}))));

  const groups={};ADDONS.forEach(a=>{(groups[a.grp]=groups[a.grp]||[]).push(a);});
  const grpIcon={'Driver assistance':'steeringWheel','Towing & utility':'caravan'};
  Object.entries(groups).forEach(([g,items])=>{
    host.appendChild(branch(ico(grpIcon[g]||'zap'),g,'',items.map(a=>{
      const inc=isLaunchInc(t,a);
      return {label:a.name,price:inc?0:a.price,sel:inc||S.addons.has(a.id),locked:inc,
        tag:inc?'Included (Launch)':'',
        onclick:inc?null:()=>{S.addons.has(a.id)?S.addons.delete(a.id):S.addons.add(a.id);renderAll();}};
    })));
  });

  const yp=connectPlan('yearly'), mp=connectPlan('monthly');
  const connectOpts=[
    {id:'none',label:'No Connect+',price:null},
    {id:'yearly',label:'Connect+ yearly',price:yp.price,period:yp.period},
    {id:'monthly',label:'Connect+ monthly',price:mp.price,period:mp.period}
  ];
  host.appendChild(branch(ico('wifi'),'Connected services','',connectOpts.map(o=>({
    label:o.label,price:o.price,period:o.period,sel:S.connectPlus===o.id,
    onclick:()=>{S.connectPlus=o.id;renderAll();}
  }))));

  const lk=document.createElement('div');lk.className='note';
  lk.innerHTML=`Accessories &amp; gear: <a href="https://rivian.com/gear-shop" target="_blank" rel="noopener">Rivian Gear Shop ↗</a> · Driver assist: <a href="https://rivian.com/autonomy" target="_blank" rel="noopener">Autonomy+ ↗</a> · Connected services: <a href="${CONNECT_PLUS.link}" target="_blank" rel="noopener">Connect+ ↗</a>`;
  host.appendChild(lk);
}

/* ---------------- BUILD: price + summary ---------------- */
function configuredPrice(){
  const t=curTrim();let p=t.price;
  const d=curDrive();if(d)p+=d.price;
  p+=COLORS[S.color].price;
  p+=curWheel().price;
  p+=(t.interior.find(i=>i.id===S.interior)||{price:0}).price;
  ADDONS.forEach(a=>{const inc=isLaunchInc(t,a);if(!inc&&S.addons.has(a.id))p+=a.price;});
  return p;
}
function renderSummary(){
  const t=curTrim();const price=configuredPrice();
  $('cfgPrice').textContent=Math.round(price).toLocaleString('en-US');
  $('specChips').innerHTML=`<div class="c">Range<b>${curRange()} mi</b></div><div class="c">Power<b>${curHP()} hp</b></div><div class="c">Drive<b>${curDriveLabel()}</b></div><div class="c">Max tow<b>${curTow()}</b></div>`;
  const lines=[`<div class="sumline"><span>${t.name} base</span><span>${money(t.price)}</span></div>`];
  const add=(l,v)=>lines.push(`<div class="sumline"><span>${l}</span><span>+${money(v)}</span></div>`);
  const d=curDrive();if(d&&d.price)add('Drive · '+d.name+(d.sub?' '+d.sub:''),d.price);
  const c=COLORS[S.color];if(c.price)add('Paint · '+c.name,c.price);
  const w=curWheel();if(w.price)add('Wheels · '+w.name,w.price);
  const it=t.interior.find(i=>i.id===S.interior);if(it&&it.price)add('Interior · '+it.name,it.price);
  ADDONS.forEach(a=>{const inc=isLaunchInc(t,a);if(!inc&&S.addons.has(a.id))add(a.name,a.price);});
  lines.push(`<div class="sumline tot"><span>Configured price</span><span>${money(price)}</span></div>`);
  const gear=accBundleTotal();if(gear)lines.push(`<div class="sumline"><span>Gear &amp; accessories</span><span>+${money(gear)}</span></div>`);
  if(connectPlan(S.connectPlus))lines.push(`<div class="sumline"><span>${connectPlanName(S.connectPlus)}</span><span>${connectLabel(S.connectPlus)}</span></div>`);
  $('sumLines').innerHTML=lines.join('');
}

/* ---------------- COMPARE ---------------- */
/* per-column selections: each trim carries its own paint + interior; Standard also its own drive system */
function cmpDriveObj(k){const t=TRIMS[k];if(!t.drives)return null;return t.drives.find(d=>d.id===S.cmpDrive[k])||t.drives[0];}
function cmpBaseDriveObj(k){const t=TRIMS[k];return t.drives?t.drives[0]:null;}
function cmpColorId(k){const c=S.cmpColor[k];return TRIMS[k].colors.includes(c)?c:TRIMS[k].colors[0];}
function cmpIntObj(k){const t=TRIMS[k];return t.interior.find(i=>i.id===S.cmpInterior[k])||t.interior[0];}
function cmpWheelObj(k){const t=TRIMS[k];return t.wheels.find(w=>w.id===S.cmpWheel[k])||t.wheels[0];}
function intHex(id){return INT_HEX[id]||'#2c2c2e';}
/* the halo/flagship column (defaults to the last trim) and its per-cell class */
function flagshipKey(){return (CUR_VEHICLE.flagshipTrim&&TRIMS[CUR_VEHICLE.flagshipTrim])?CUR_VEHICLE.flagshipTrim:TRIM_KEYS[TRIM_KEYS.length-1];}
function pcol(k){return k===flagshipKey()?'perfcol':'';}
/* the Launch-Edition promo exists only when a trim auto-includes launch-flagged add-ons */
function hasLaunchPromo(){return TRIM_KEYS.some(k=>TRIMS[k].autoIncl)&&ADDONS.some(a=>a.launchInc);}
function cmpAddonTotal(k){
  const t=TRIMS[k];let sum=0;
  CMP_ADDONS.forEach(a=>{const inc=isLaunchInc(t,a);if(!inc&&S.cmpAddons[k].has(a.id))sum+=a.price;});
  return sum;
}
/* one shared gear bundle — same total applied to every trim */
function accBundleTotal(){
  let sum=0;
  CMP_ACCESSORIES.forEach(g=>g.items.forEach(a=>{if(a.price&&S.accBundle.has(a.id))sum+=a.price;}));
  return sum;
}
function trimCfg(k){
  const t=TRIMS[k];
  const colId=cmpColorId(k);const c=COLORS[colId];const paint=c.price;
  const io=cmpIntObj(k);const interior=io.price||0;
  const wo=cmpWheelObj(k);const wheel=wo.price||0;
  let drive=0,driveObj=null;
  if(t.drives){driveObj=cmpDriveObj(k);drive=driveObj.price;}
  const addon=cmpAddonTotal(k);const acc=accBundleTotal();
  const vehicle=t.price+drive+paint+interior+wheel+addon;
  return {price:vehicle+acc,vehicle,colId,c,io,paint,interior,wo,wheel,drive,driveObj,addon,acc};
}
function miniChip(code,hex,interior){return `<span class="chip mini" style="background:${hex}"><img src="${(interior?interiorURL:chipURL)(code)}" loading="lazy" onerror="this.style.display='none'"></span>`;}
/* interactive per-column selector cells (swatches live in the matrix) */
function selRow(label,kind){
  return `<tr class="cfgrow"><td class="lab cfg-lab">${label}</td>${TRIM_KEYS.map(k=>selCell(k,kind)).join('')}</tr>`;
}
function priceTag(p){return p>0?`<span class="opx add">+${money(p)}</span>`:`<span class="opx free">incl.</span>`;}
function selCell(k,kind){
  const cls=k===flagshipKey()?'perfcol ':'';
  if(kind==='connectPlus'){
    const chips=['none','yearly','monthly'].map(id=>{
      const sel=S.cmpConnectPlus[k]===id;
      const lbl=id==='none'?'Off':connectPlan(id).name;
      const price=id==='none'?'<span class="opx free">off</span>':`<span class="opx add">${connectLabel(id)}</span>`;
      return `<div class="optchip${sel?' sel':''}" data-sw="connectPlus" data-k="${k}" data-id="${id}" title="${id==='none'?'No Connect+':CONNECT_PLUS.name+' '+connectPlan(id).name}"><span class="onm">${lbl}</span>${price}</div>`;
    }).join('');
    return `<td class="${cls}"><div class="optlist">${chips}</div></td>`;
  }
  if(kind==='drive'){
    if(!TRIMS[k].drives)return `<td class="${cls}"><div class="optlist"><div class="optchip ro"><span class="onm">${TRIMS[k].motors} ${TRIMS[k].drive}</span><span class="onote">not configurable</span></div></div></td>`;
    const chips=TRIMS[k].drives.map(d=>
      `<div class="optchip${S.cmpDrive[k]===d.id?' sel':''}" data-sw="drive" data-k="${k}" data-id="${d.id}" title="${d.name} · ${d.sub}"><span class="onm">${d.drive} · ${d.sub}</span>${priceTag(d.price)}</div>`
    ).join('');
    return `<td class="${cls}"><div class="optlist">${chips}</div></td>`;
  }
  if(kind==='color'){
    const sel=cmpColorId(k);
    const chips=TRIMS[k].colors.map(id=>{const o=COLORS[id];
      return `<div class="optchip${sel===id?' sel':''}" data-sw="color" data-k="${k}" data-id="${id}" title="${o.name}"><span class="sw" style="background:${o.hex}"><img src="${chipURL(o.code)}" loading="lazy" onerror="this.style.display='none'"></span><span class="onm">${o.name}</span>${priceTag(o.price)}</div>`;
    }).join('');
    return `<td class="${cls}"><div class="optlist">${chips}</div></td>`;
  }
  if(kind==='wheel'){
    const wsel=cmpWheelObj(k).id;
    const chips=TRIMS[k].wheels.map(w=>
      `<div class="optchip${wsel===w.id?' sel':''}" data-sw="wheel" data-k="${k}" data-id="${w.id}" title="${w.name}${w.rd?` · ${w.rd} mi range`:''}"><span class="sw wheel"><img src="${wheelURL(w.code)}" loading="lazy" onerror="this.style.display='none'"></span><span class="onm">${w.name}</span>${priceTag(w.price)}</div>`
    ).join('');
    return `<td class="${cls}"><div class="optlist">${chips}</div></td>`;
  }
  if(TRIMS[k].interior.length<2){
    const io=cmpIntObj(k);
    return `<td class="${cls}"><div class="optlist"><div class="optchip sel ro"><span class="sw" style="background:${intHex(io.id)}"><img src="${interiorURL(io.code)}" loading="lazy" onerror="this.style.display='none'"></span><span class="onm">${io.name}</span><span class="opx free">standard</span></div></div></td>`;
  }
  const chips=TRIMS[k].interior.map(i=>
    `<div class="optchip${S.cmpInterior[k]===i.id?' sel':''}" data-sw="interior" data-k="${k}" data-id="${i.id}" title="${i.name}"><span class="sw" style="background:${intHex(i.id)}"><img src="${interiorURL(i.code)}" loading="lazy" onerror="this.style.display='none'"></span><span class="onm">${i.name}</span>${priceTag(i.price)}</div>`
  ).join('');
  return `<td class="${cls}"><div class="optlist">${chips}</div></td>`;
}
/* interactive per-column add-on toggle (Performance includes the Launch pair free) */
function addonRow(label,id,price){
  return `<tr class="cfgrow"><td class="lab cfg-lab">${label}</td>${TRIM_KEYS.map(k=>addonCell(k,id,price)).join('')}</tr>`;
}
function addonCell(k,id,price){
  const cls=k===flagshipKey()?'perfcol ':'';
  const a=ADDONS.find(x=>x.id===id);
  if(isLaunchInc(TRIMS[k],a))
    return `<td class="${cls}"><div class="optlist"><div class="optchip sel ro"><span class="onm">Included</span><span class="onote">with Launch Edition</span></div></div></td>`;
  const on=S.cmpAddons[k].has(id);
  return `<td class="${cls}"><div class="optlist"><div class="optchip toggle${on?' sel':''}" data-add="${id}" data-k="${k}" title="${a.name}">${on?`<span class="ack">${ico('check',11)}</span>`:''}<span class="onm">${on?'Added':'Add'}</span>${priceTag(price)}</div></div></td>`;
}
/* Launch Edition promo toggle row — the Performance what-if, mirrored from the Build tab */
function promoRow(){
  const on=!S.launchOff;
  const chip=`<div class="optchip toggle${on?' sel':''}" data-promo title="Launch Edition promotion">${on?`<span class="ack">${ico('check',11)}</span>`:''}<span class="onm">${on?'Active':'Ended'}</span><span class="onote">${on?'bundles the add-ons below':'what-if · add-ons price out'}</span></div>`;
  const cells=TRIM_KEYS.map(k=>TRIMS[k].autoIncl
    ?`<td class="${pcol(k)}"><div class="optlist">${chip}</div></td>`
    :`<td class="no ${pcol(k)}">—</td>`).join('');
  return `<tr class="cfgrow"><td class="lab cfg-lab">Launch Edition promo</td>${cells}</tr>`;
}
/* shared gear parts list — one card per item, photo + tooltip */
function gearCard(a){
  const on=S.accBundle.has(a.id);
  const tip=`<span class="tip"><b>${a.name}</b> · +${money(a.price)}<br>${a.note} <a href="${a.link}" target="_blank" rel="noopener">View ↗</a></span>`;
  return `<div class="gear${on?' on':''}" data-acc="${a.id}">
    <span class="check">${ico('check',12)}</span>
    <span class="ic"><span class="ph">${ico(a.icon,22)}</span><img src="${a.img}" loading="lazy" alt="${a.name}" onerror="this.style.display='none'"></span>
    <span class="gbody"><span class="gnm">${a.name}<span class="info" tabindex="0" role="button" aria-label="${a.name} details">i</span>${tip}${soonPill(a.avail)}</span><span class="gpx">+${money(a.price)}</span></span>
  </div>`;
}
function renderGearBody(body){
  if(!body)return;
  body.innerHTML=CMP_ACCESSORIES.map(g=>
    `<div class="grphead">${g.grp}</div><div class="gearlist">${g.items.map(gearCard).join('')}</div>`
  ).join('')+`<div class="accnote-gear" style="font-size:11px;color:var(--muted);line-height:1.55;margin-top:16px">${ACC_FOOTNOTE}</div>`;
  body.querySelectorAll('.gear').forEach(el=>el.onclick=ev=>{
    if(ev.target.closest('.info')||ev.target.closest('.tip'))return;
    const id=el.dataset.acc;S.accBundle.has(id)?S.accBundle.delete(id):S.accBundle.add(id);renderAll();
  });
}
function renderGear(){
  renderGearBody($('buildGearBody'));
  renderGearBody($('gearBody'));
  const n=S.accBundle.size,total=accBundleTotal();
  const label=n?`· <b>${money(total)}</b> gear selected`:'';
  const buildSum=$('buildGearSum');if(buildSum)buildSum.innerHTML=label;
  const sum=$('gearSum');if(sum)sum.innerHTML=label;
}
/* pinned summary: each column's live configured total, lowest flagged */
function totalRow(){
  const c={};TRIM_KEYS.forEach(k=>c[k]=trimCfg(k));
  const min=Math.min(...TRIM_KEYS.map(k=>c[k].price));
  const anyAcc=TRIM_KEYS.some(k=>c[k].acc>0);
  return `<tr class="totalrow"><td class="lab">Total</td>${TRIM_KEYS.map(k=>totalCell(k,c[k],c[k].price===min,anyAcc)).join('')}</tr>`;
}
function renderCompare(){
  const host=$('cmpCards');host.innerHTML='';
  TRIM_KEYS.forEach(k=>{
    const cls=k===flagshipKey()?' perf':'';
    const t=TRIMS[k];const cfg=trimCfg(k);
    const colId=cfg.colId;const w=cfg.wo;const io=cfg.io;const hex=intHex(io.id);
    const availTxt=cfg.driveObj?cfg.driveObj.avail:t.avail;
    const brk=`${money(t.price)} base${cfg.drive?` + ${money(cfg.drive)} drive`:''}${cfg.paint?` + ${money(cfg.paint)} paint`:''}${cfg.wheel?` + ${money(cfg.wheel)} wheels`:''}${cfg.interior?` + ${money(cfg.interior)} interior`:''}${cfg.addon?` + ${money(cfg.addon)} add-ons`:''}${cfg.acc?` + ${money(cfg.acc)} accessories`:''}`;
    const connect=connectSummary(S.cmpConnectPlus[k]);
    const card=document.createElement('div');card.className='cmpcard'+cls;
    card.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><h3>${t.short}</h3><div class="av${isSoon(availTxt)?' soon':''}">${availTxt}</div></div>
        <div style="text-align:right"><div class="price">${money(cfg.price)}</div><div class="cardbreak">as configured</div></div>
      </div>
      <div class="hero" style="margin:12px 0 0;position:relative">
        <img alt="${t.short}" loading="lazy" src="${heroURL(t.folder,w.code,COLORS[colId].code)}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
        <div class="ph" style="display:none">Render needs internet</div>
        <div class="cap">${t.short} · ${COLORS[colId].name} · ${w.name}</div>
      </div>
      <div class="cardrow"><span class="chip" style="background:${hex}"><img src="${interiorURL(io.code)}" loading="lazy" onerror="this.style.display='none'"></span><span>${io.name}${io.price?` · +${money(io.price)}`:' · included'}</span></div>
      <div class="cardbreak" style="margin-top:8px">${brk}</div>
      ${connect?`<div class="cardbreak" style="margin-top:5px">${connect}</div>`:''}
      <button class="btn cmplaunch" data-launch="${k}" style="margin-top:13px">See cost over time <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>`;
    host.appendChild(card);
  });
  host.querySelectorAll('[data-launch]').forEach(b=>b.onclick=()=>launchCost2(b.dataset.launch));
  $('cmpMatrix').innerHTML=buildMatrix();
  $('cmpMatrix').querySelectorAll('[data-sw]').forEach(el=>el.onclick=()=>{
    const k=el.dataset.k,kind=el.dataset.sw,id=el.dataset.id;
    if(kind==='color')S.cmpColor[k]=id;else if(kind==='interior')S.cmpInterior[k]=id;else if(kind==='wheel')S.cmpWheel[k]=id;else if(kind==='drive')S.cmpDrive[k]=id;else if(kind==='connectPlus')S.cmpConnectPlus[k]=normalizeConnect(id);
    renderCompare();
  });
  $('cmpMatrix').querySelectorAll('[data-add]').forEach(el=>el.onclick=()=>{
    const k=el.dataset.k,id=el.dataset.add;
    S.cmpAddons[k].has(id)?S.cmpAddons[k].delete(id):S.cmpAddons[k].add(id);
    renderCompare();
  });
  /* the promo flag is shared with the Build tab, so re-render everything */
  $('cmpMatrix').querySelectorAll('[data-promo]').forEach(el=>el.onclick=()=>{S.launchOff=!S.launchOff;renderAll();});
  renderGear();
  updateVerdict();
  updateMobileCmpHead();
}
function updateMobileCmpHead(){
  const cmp=document.querySelector('.mobile-cmp'),visual=document.querySelector('.mobile-cmp-visual');
  if(!cmp||!visual)return;
  const r=visual.getBoundingClientRect();
  cmp.classList.toggle('show-sticky',r.bottom<=0);
}
/* drive the scroll-fade mask on the cost results column: fade the top edge only when
   scrolled down, the bottom edge only when more content sits below (see .sticky.cost-scroll) */
function updateColFade(col){
  const FADE=32, EPS=2;
  const up = col.scrollTop > EPS;
  const dn = col.scrollTop + col.clientHeight < col.scrollHeight - EPS;
  col.style.setProperty('--fade-top', up?FADE+'px':'0px');
  col.style.setProperty('--fade-bot', dn?FADE+'px':'0px');
}
/* fixed cost-summary bar: show once the charts section reaches the viewport top on the active cost tab */
function updateCostSticky(){
  const view=$('view-cost2'),bar=$('coststicky'),sec=$('costModelSection');
  if(!view||!bar||!sec)return;
  if(!view.classList.contains('active')){bar.classList.remove('show');bar.setAttribute('aria-hidden','true');return;}
  /* show once the first input group ("The basics") scrolls out of view, and keep
     it for the rest of the page (fallback: charts reached the top) */
  const first=view.querySelector('.igstack .igroup');
  const show=first?first.getBoundingClientRect().bottom<=0:sec.getBoundingClientRect().top<=0;
  bar.classList.toggle('show',show);
  bar.setAttribute('aria-hidden',show?'false':'true');
  /* pin the results column below the fixed bar. The column is about as tall as
     the input column, so in-flow sticky has no travel room — instead cap it to
     the viewport and let its own content scroll when it doesn't fit. */
  const col=view.querySelector('.grid2 .sticky');
  if(col){
    if(getComputedStyle(col).position==='sticky'){
      const topBase=show?76:18;
      col.style.top=topBase+'px';
      col.style.maxHeight=(window.innerHeight-topBase-18)+'px';
      col.style.overflowY='auto';
      col.classList.add('cost-scroll');
      if(!col.dataset.fadeBound){
        col.dataset.fadeBound='1';
        col.addEventListener('scroll',()=>updateColFade(col),{passive:true});
      }
      updateColFade(col);
    }else{col.style.top='';col.style.maxHeight='';col.style.overflowY='';   /* phones: column is static */
      col.classList.remove('cost-scroll');col.style.removeProperty('--fade-top');col.style.removeProperty('--fade-bot');}
  }
}
function cmpCell(v,colcls){
  const c=colcls?(' '+colcls):'';
  if(v===true)return `<td class="yes${c}">${ico('check',15)}Included</td>`;
  if(v===false)return `<td class="no${c}">—</td>`;
  if(v==='launch')return `<td class="yes launch${c}">${ico('check',15)}Included<small>with Launch Edition</small></td>`;
  if(v==='opt25')return `<td class="opt${c}">Optional<small>+$2,500</small></td>`;
  if(v==='opt950')return `<td class="opt${c}">Optional<small>+$950</small></td>`;
  if(v==='excl2000')return `<td class="excl${c}">Exclusive option<small>+$2,000 · Performance only</small></td>`;
  return `<td class="val${c}">${v}</td>`;
}
function mobileCmpCell(k,td){
  const m=td.match(/^<td(?: class="([^"]*)")?>/);
  const cls=m&&m[1]?` ${m[1]}`:'';
  const body=td.replace(/^<td(?: class="[^"]*")?>/,'').replace(/<\/td>$/,'');
  return `<div class="mobile-cmp-val${cls}"><div class="mobile-cmp-trim">${TRIMS[k].short}</div><div class="mobile-cmp-body">${body}</div></div>`;
}
function mobileCmpRow(label,klass,cells){
  return `<div class="mobile-cmp-row ${klass}"><div class="mobile-cmp-label">${label}</div><div class="mobile-cmp-values">${TRIM_KEYS.map((k,i)=>mobileCmpCell(k,cells[i])).join('')}</div></div>`;
}
function mobileCmpDivider(label,klass=''){
  return `<div class="mobile-cmp-divider ${klass}">${label}</div>`;
}
function mobileCmpHead(totals){
  const cells=TRIM_KEYS.map(k=>{
    const t=TRIMS[k],cfg=totals[k];
    return `<div class="mobile-cmp-headcell"><span>${t.short}</span><b>${money(cfg.vehicle)}</b></div>`;
  }).join('');
  const visual=TRIM_KEYS.map(k=>{
    const t=TRIMS[k],cfg=totals[k];
    return `<div class="mobile-cmp-visualcell"><img src="${heroURL(t.folder,cfg.wo.code,COLORS[cfg.colId].code)}" loading="lazy" alt="${t.short}" onerror="this.style.display='none'"><span>${t.short}</span><b>${money(cfg.vehicle)}</b></div>`;
  }).join('');
  return `<div class="mobile-cmp-visual">${visual}</div><div class="mobile-cmp-head">${cells}</div>`;
}
function mobileOptGroup(label,rows){
  return `<div class="mobile-opt-group"><div class="mobile-cmp-label">${label}</div><div class="mobile-opt-list">${rows}</div></div>`;
}
function mobileOptRow(label,cells){
  return `<div class="mobile-opt-row"><div class="mobile-opt-name">${label}</div><div class="mobile-opt-values">${cells.join('')}</div></div>`;
}
function mobileOptCell(k,{kind,id,label,selected=false,unavailable=false,readonly=false,add=false}){
  const tag=unavailable?'—':label;
  const cls=`mobile-opt-cell${selected?' sel':''}${unavailable?' na':''}${readonly?' ro':''}`;
  const attrs=!unavailable&&!readonly
    ? add?` data-add="${id}" data-k="${k}"`:` data-sw="${kind}" data-k="${k}" data-id="${id}"`
    :'';
  const node=!unavailable&&!readonly?'button':'div';
  return `<${node} class="${cls}"${attrs}>${selected?`${ico('check',11)} `:''}${tag}</${node}>`;
}
function mobileColorGroup(){
  const ids=Object.keys(COLORS).filter(id=>TRIM_KEYS.some(k=>TRIMS[k].colors.includes(id)));
  return mobileOptGroup('Paint',ids.map(id=>{
    const o=COLORS[id];
    const sw=`<span class="mobile-opt-swatch" style="background:${o.hex}"><img src="${chipURL(o.code)}" loading="lazy" onerror="this.style.display='none'"></span>${o.name}`;
    const cells=TRIM_KEYS.map(k=>{
      const supported=TRIMS[k].colors.includes(id);
      return mobileOptCell(k,{kind:'color',id,label:o.price?`+${money(o.price)}`:'Included',selected:cmpColorId(k)===id,unavailable:!supported});
    });
    return mobileOptRow(sw,cells);
  }).join(''));
}
function mobileWheelGroup(){
  const seen=new Set(),opts=[];
  TRIM_KEYS.forEach(k=>TRIMS[k].wheels.forEach(w=>{if(!seen.has(w.id)){seen.add(w.id);opts.push(w);}}));
  return mobileOptGroup('Wheels',opts.map(w=>{
    const label=`<span class="mobile-opt-swatch wheel"><img src="${wheelURL(w.code)}" loading="lazy" onerror="this.style.display='none'"></span>${w.name}`;
    const cells=TRIM_KEYS.map(k=>{
      const tw=TRIMS[k].wheels.find(x=>x.id===w.id);
      return mobileOptCell(k,{kind:'wheel',id:w.id,label:tw?(tw.price?`+${money(tw.price)}`:'Included'):'—',selected:tw&&cmpWheelObj(k).id===w.id,unavailable:!tw});
    });
    return mobileOptRow(label,cells);
  }).join(''));
}
function mobileInteriorGroup(){
  const seen=new Set(),opts=[];
  TRIM_KEYS.forEach(k=>TRIMS[k].interior.forEach(i=>{if(!seen.has(i.id)){seen.add(i.id);opts.push(i);}}));
  return mobileOptGroup('Interior',opts.map(i=>{
    const label=`<span class="mobile-opt-swatch" style="background:${intHex(i.id)}"><img src="${interiorURL(i.code)}" loading="lazy" onerror="this.style.display='none'"></span>${i.name}`;
    const cells=TRIM_KEYS.map(k=>{
      const ti=TRIMS[k].interior.find(x=>x.id===i.id);
      return mobileOptCell(k,{kind:'interior',id:i.id,label:ti?(ti.price?`+${money(ti.price)}`:'Included'):'—',selected:ti&&cmpIntObj(k).id===i.id,unavailable:!ti,readonly:!!ti&&TRIMS[k].interior.length<2});
    });
    return mobileOptRow(label,cells);
  }).join(''));
}
function mobileDriveGroup(){
  /* union of every trim's selectable drives; trims with a fixed drivetrain highlight
     the union row that matches their drive+motors (e.g. R2 Premium/Perf ↔ AWD dual) */
  const seen=new Set(),opts=[];
  TRIM_KEYS.forEach(k=>{const t=TRIMS[k];if(t.drives)t.drives.forEach(d=>{if(!seen.has(d.id)){seen.add(d.id);opts.push(d);}});});
  if(!opts.length)return '';
  return mobileOptGroup('Drive system',opts.map(d=>{
    const cells=TRIM_KEYS.map(k=>{
      const t=TRIMS[k];
      if(t.drives){
        const has=t.drives.find(x=>x.id===d.id);
        return has
          ?mobileOptCell(k,{kind:'drive',id:d.id,label:has.price?`+${money(has.price)}`:'Included',selected:(S.cmpDrive[k]||t.drives[0].id)===d.id})
          :mobileOptCell(k,{label:'—',unavailable:true});
      }
      const match=(t.drive===d.drive&&t.motors===d.motors);
      return mobileOptCell(k,{label:match?'Included':'—',selected:match,unavailable:!match,readonly:true});
    });
    return mobileOptRow(`${d.drive} · ${d.sub}`,cells);
  }).join(''));
}
function mobileAddonGroup(){
  const promoOn=!S.launchOff;
  const promo=hasLaunchPromo()?mobileOptRow('Launch Edition promo',TRIM_KEYS.map(k=>TRIMS[k].autoIncl
    ?`<button class="mobile-opt-cell${promoOn?' sel':''}" data-promo>${promoOn?ico('check',11)+' Active':'Ended · what-if'}</button>`
    :mobileOptCell(k,{label:'—',unavailable:true}))):'';
  if(!promo&&!CMP_ADDONS.length)return '';
  return mobileOptGroup('Packages',promo+CMP_ADDONS.map(a=>{
    const cells=TRIM_KEYS.map(k=>{
      const inc=isLaunchInc(TRIMS[k],a);
      const on=S.cmpAddons[k].has(a.id);
      return mobileOptCell(k,{id:a.id,label:inc?'Launch Edition':on?'Added':`+${money(a.price)}`,selected:inc||on,readonly:inc,add:true});
    });
    return mobileOptRow(a.name,cells);
  }).join(''));
}
function mobileConnectGroup(){
  return mobileOptGroup('Connected services',['none','yearly','monthly'].map(id=>{
    const label=id==='none'?'No Connect+':`${CONNECT_PLUS.name} · ${connectPlan(id).name}`;
    const cells=TRIM_KEYS.map(k=>
      mobileOptCell(k,{kind:'connectPlus',id,label:connectLabel(id),selected:S.cmpConnectPlus[k]===id})
    );
    return mobileOptRow(label,cells);
  }).join(''));
}
function totalCell(k,cfg,best,anyAcc){
  const cls=k===flagshipKey()?'perfcol ':'';
  const receipt=cfg.acc>0
    ?`<div class="trcpt"><div class="trln"><span>Vehicle</span><span>${money(cfg.vehicle)}</span></div><div class="trln"><span>+ Accessories</span><span>${money(cfg.acc)}</span></div></div>`
    :'';
  const tag=(best?'lowest ':'')+(anyAcc?'total':'as configured');
  return `<td class="${cls}"><div class="ttl">${TRIMS[k].short}</div>${receipt}<div class="ttlp${best?' best':''}">${money(cfg.price)}</div><div class="ttld">${tag}</div></td>`;
}
function buildMatrix(){
  const keys=TRIM_KEYS,ncol=keys.length;
  /* dynamic spec rows derived live from each column's selected drive + wheel (works for any
     trim count); the vehicle-specific equipment rows come from CUR_VEHICLE.compareSpecs */
  const dynSpecs=[
    {l:'Availability',get:(t,d)=>d?d.avail:t.avail},
    {l:'Drivetrain',get:(t,d)=>`${d?d.motors:t.motors} ${d?d.drive:t.drive}`},
    {l:'Horsepower',get:(t,d)=>(d?d.hp:t.hp)+' hp'},
    {l:'0–60 mph',get:(t,d)=>d?d.z60:t.z60},
    {l:'__range__'},
    {l:'Max towing',get:(t,d)=>d?d.tow:t.tow}
  ];
  const dynLabel=r=>r.l==='__range__'?'EPA range':r.l;
  /* one dynamic-spec cell: strike the trim's base value when the current pick changed it */
  const dynCell=(k,r,cls)=>{
    const t=TRIMS[k],d=cmpDriveObj(k),d0=cmpBaseDriveObj(k);
    if(r.l==='__range__'){
      const cur=(d?d.range:t.range)+cmpWheelObj(k).rd,base=(d0?d0.range:t.range);
      return cur!==base
        ?`<td class="val chg${cls?' '+cls:''}"><s class="was">${base} mi</s><b class="now">${cur} mi</b></td>`
        :`<td class="val${cls?' '+cls:''}">${cur} mi</td>`;
    }
    const cur=r.get(t,d),base=r.get(t,d0);
    return cur!==base
      ?`<td class="val chg${cls?' '+cls:''}"><s class="was">${base}</s><b class="now">${cur}</b></td>`
      :`<td class="val${cls?' '+cls:''}">${cur}</td>`;
  };
  /* data-driven feature rows: values are true / false / a cmpCell token ('excl2000', 'launchFob', …) */
  const featVal=(r,k)=>{let v=r.values[k];if(v==='launchFob')v=!S.launchOff;return v;};
  const specs=CUR_VEHICLE.compareSpecs||[],baseInc=CUR_VEHICLE.baseIncludes||[],baseLabel=CUR_VEHICLE.baseLabel||'Standard on every trim';
  const specRow=r=>`<tr><td class="lab">${dynLabel(r)}</td>${keys.map(k=>dynCell(k,r,pcol(k))).join('')}</tr>`;
  const featRow=r=>`<tr><td class="lab">${r.label}</td>${keys.map(k=>cmpCell(featVal(r,k),pcol(k))).join('')}</tr>`;
  const baseRow=l=>`<tr><td class="lab">${l}</td>${keys.map(k=>cmpCell(true,pcol(k))).join('')}</tr>`;
  const totals={};keys.forEach(k=>totals[k]=trimCfg(k));
  const mobileRows=
     `<div class="mobile-cmp">`
    +mobileCmpHead(totals)
    +mobileCmpDivider('Configure each trim')
    +mobileDriveGroup()+mobileColorGroup()+mobileWheelGroup()+mobileInteriorGroup()+mobileAddonGroup()+mobileConnectGroup()
    +mobileCmpDivider('Specs & equipment')
    +dynSpecs.map(r=>mobileCmpRow(dynLabel(r),'',keys.map(k=>dynCell(k,r,pcol(k))))).join('')
    +specs.map(r=>mobileCmpRow(r.label,'',keys.map(k=>cmpCell(featVal(r,k),pcol(k))))).join('')
    +mobileCmpDivider(baseLabel)
    +baseInc.map(l=>mobileCmpRow(l,'',keys.map(k=>cmpCell(true,pcol(k))))).join('')
    +`</div>`;
  const rows=
     totalRow()
    +`<tr class="divider"><td colspan="${ncol+1}">Configure each column</td></tr>`
    +selRow('Drive system','drive')+selRow('Paint','color')+selRow('Wheels','wheel')+selRow('Interior','interior')
    +(hasLaunchPromo()?promoRow():'')
    +CMP_ADDONS.map(a=>addonRow(a.name,a.id,a.price)).join('')
    +selRow('Connect+','connectPlus')
    +`<tr class="divider"><td colspan="${ncol+1}">Specs &amp; equipment</td></tr>`
    +dynSpecs.map(specRow).join('')
    +specs.map(featRow).join('')
    +`<tr class="divider"><td colspan="${ncol+1}">${baseLabel}</td></tr>`
    +baseInc.map(baseRow).join('');
  const thead=`<thead><tr><th>Feature</th>${keys.map(k=>`<th class="${pcol(k)}">${TRIMS[k].short}</th>`).join('')}</tr></thead>`;
  return `<div class="matrixdesk"><table class="matrix">${thead}<tbody>${rows}</tbody></table></div>${mobileRows}`;
}
function resetBuild(){
  const t=curTrim();
  if(t.drives)S.drive=t.drives[0].id;
  S.color=t.colors[0];S.wheel=t.wheels[0].id;S.interior=t.interior[0].id;S.addons.clear();S.connectPlus='none';
  S.launchOff=false;
  renderAll();
}
/* reset every compare column back to its default paint, interior, drive and add-ons */
function resetCompare(){
  seedCmp();               /* every column back to its default paint, interior, wheel, drive, add-ons */
  S.accBundle.clear();
  S.launchOff=false;       /* shared with the Build tab, so refresh everything */
  renderAll();
}
function updateVerdict(){
  const cfg={};TRIM_KEYS.forEach(k=>cfg[k]=trimCfg(k));
  const ranked=TRIM_KEYS.slice().sort((a,b)=>cfg[a].vehicle-cfg[b].vehicle);
  const low=ranked[0],high=ranked[ranked.length-1];
  const launchVal=CMP_ADDONS.reduce((s,a)=>s+a.price,0);
  /* per-trim copy: vehicle-supplied verdictNotes (+ a launch-off variant) else a data-driven line */
  const notes=CUR_VEHICLE.verdictNotes||{},notesOff=CUR_VEHICLE.verdictNotesLaunchOff||{};
  const genericBody=k=>{
    const t=TRIMS[k],d=cmpDriveObj(k);
    const spec=`${d?d.motors:t.motors} ${d?d.drive:t.drive} · ${(d?d.range:t.range)+cmpWheelObj(k).rd} mi · ${d?d.avail:t.avail}`;
    const lead=k===low?'Lowest configured price.':k===high?'Top of the range — most power, highest price.':'The middle ground on price and features.';
    return `${lead} ${spec}.`;
  };
  /* authored notes may embed {tokens} — drive, motors, driveSub, range, hp, z60, tow,
     avail — filled from the column's live drive + wheel pick, so per-vehicle copy tracks
     the configuration (e.g. R2 Standard's selectable drivetrains) instead of going stale */
  const fill=(tpl,k)=>{
    const t=TRIMS[k],d=cmpDriveObj(k);
    const v={drive:d?d.drive:t.drive,motors:d?d.motors:t.motors,driveSub:(d&&d.sub)||'',
      range:(d?d.range:t.range)+cmpWheelObj(k).rd,hp:d?d.hp:t.hp,z60:d?d.z60:t.z60,
      tow:d?d.tow:t.tow,avail:d?d.avail:t.avail};
    return tpl.replace(/\{(\w+)\}/g,(m,key)=>v[key]!==undefined?v[key]:m);
  };
  const card=k=>{
    const pos=k===low?'lowest':k===high?'highest':'middle';
    const body=fill((S.launchOff&&notesOff[k])||notes[k]||genericBody(k),k);
    return `<div class="vcard ${pos}"><div class="vtop"><span>${TRIMS[k].short}</span><b>${money(cfg[k].vehicle)}</b></div><p>${body}</p></div>`;
  };
  let big='';
  if(ranked.length>=2){
    big=`${TRIMS[ranked[1]].short} is <b>+${money(cfg[ranked[1]].vehicle-cfg[low].vehicle)}</b> over ${TRIMS[low].short}`;
    if(ranked.length>=3)big+=`, then <b>+${money(cfg[high].vehicle-cfg[ranked[ranked.length-2]].vehicle)}</b> more for ${TRIMS[high].short}`;
    big+='.';
  }
  const cards=TRIM_KEYS.map(card).join('');
  const note=hasLaunchPromo()?(S.launchOff
    ?`<div class="vnote">Configured vehicle prices shown before shared gear and recurring services. Launch Edition promo toggled off — its ${money(launchVal)} of add-ons price individually on every trim.</div>`
    :`<div class="vnote">Configured vehicle prices shown before shared gear and recurring services. On ${TRIMS[flagshipKey()].short}, the Launch Edition folds ${money(launchVal)} of add-ons into the price.</div>`)
    :`<div class="vnote">Configured vehicle prices shown before shared gear and recurring services.</div>`;
  $('verdictBig').innerHTML=big;$('verdictP').innerHTML=`<div class="vgrid">${cards}</div>${note}`;
}

/* ---------------- COST CALCULATOR ---------------- */
function amort(principal,aprPct,term){
  const r=aprPct/100/12;const m=r===0?principal/term:principal*r/(1-Math.pow(1+r,-term));
  let bal=principal,sched=[];
  for(let i=0;i<term;i++){const int=bal*r;bal-=(m-int);sched.push({int,bal:Math.max(bal,0)});}
  return {monthly:m,sched};
}
function dedCap(magi,th){if(magi<=th)return 10000;return Math.max(0,10000-200*Math.ceil((magi-th)/1000));}

/* ================= COST OVER TIME ================= */
S.ext=null;S.pay2='finance';S.scenarios2=[];S.cur2=null;
S.rc={ins:1,maint:1,energy:1,reg:1,prop:1};S.financeGear=false;S.hasTrade=false;
const INPUT_IDS2=['i2_price','i2_gear','i2_trade','i2_owed','i2_years','i2_miles','i2_down','i2_apr','i2_term','i2_year','i2_lease','i2_leasedown','i2_leaseterm','i2_ins','i2_maint','i2_kwh','i2_public','i2_eff','i2_home','i2_install','i2_proptax','i2_resale','i2_esc','i2_rebate','i2_mpg','i2_gas','i2_filing','i2_magi','i2_rate'];
const fmtK=n=>{const a=Math.abs(n);if(a>=1000)return (n<0?'-$':'$')+Math.round(a/1000)+'k';return (n<0?'-$':'$')+Math.round(a);};

/* ----- launch from Compare / Build into the cost tab ----- */
function buildExt(src){
  /* src.k = trim key; pulls from Compare column config (paint, interior, drive, add-ons) + shared gear */
  const k=src.k,t=TRIMS[k],cfg=trimCfg(k);
  const colId=cfg.colId,w=cfg.wo,io=cfg.io;
  const dObj=cfg.driveObj;   /* set for any trim with selectable drives; null otherwise */
  const addonNames=[];CMP_ADDONS.forEach(a=>{const inc=isLaunchInc(t,a);if(inc)addonNames.push(a.name+' (Launch)');else if(S.cmpAddons[k].has(a.id))addonNames.push(a.name);});
  const gearItems=[];CMP_ACCESSORIES.forEach(g=>g.items.forEach(a=>{if(a.price&&S.accBundle.has(a.id))gearItems.push({name:a.name,price:a.price});}));
  return {source:'compare',vehicleId:S.vehicle,vehicleName:CUR_VEHICLE.name,trim:k,trimName:t.short,folder:t.folder,colCode:COLORS[colId].code,colName:COLORS[colId].name,
    wheelCode:w.code,wheelName:w.name,vehicle:cfg.vehicle,gear:cfg.acc,connectPlus:normalizeConnect(S.cmpConnectPlus[k]),
    base:t.price,drive:cfg.drive,paint:cfg.paint,interior:cfg.interior,addon:cfg.addon,
    driveLabel:dObj?(dObj.drive+' · '+dObj.sub):(t.motors+' '+t.drive),
    intName:io.name,addonNames,gearItems,
    range:(dObj?dObj.range:t.range)+w.rd,hp:dObj?dObj.hp:t.hp,
    z60:dObj?dObj.z60:t.z60,avail:dObj?dObj.avail:t.avail};
}
/* Build tab → cost-over-time: source the loaded vehicle from the actual Build config
   (Build has its own wheel + add-on selections and no gear bundle, unlike Compare). */
function buildExtFromBuild(){
  const k=S.trim,t=curTrim(),col=COLORS[S.color],io=t.interior.find(i=>i.id===S.interior)||t.interior[0];
  const dObj=curDrive(),w=curWheel();
  const addonNames=[];let addon=0;
  ADDONS.forEach(a=>{const inc=isLaunchInc(t,a);if(inc)addonNames.push(a.name+' (Launch)');else if(S.addons.has(a.id)){addonNames.push(a.name);addon+=a.price;}});
  const gearItems=[];CMP_ACCESSORIES.forEach(g=>g.items.forEach(a=>{if(a.price&&S.accBundle.has(a.id))gearItems.push({name:a.name,price:a.price});}));
  return {source:'build',vehicleId:S.vehicle,vehicleName:CUR_VEHICLE.name,trim:k,trimName:t.short,folder:t.folder,colCode:col.code,colName:col.name,
    wheelCode:w.code,wheelName:w.name,vehicle:configuredPrice(),gear:accBundleTotal(),connectPlus:normalizeConnect(S.connectPlus),
    base:t.price,drive:dObj?dObj.price:0,paint:col.price,interior:io.price||0,addon,
    driveLabel:dObj?(dObj.drive+(dObj.sub?' · '+dObj.sub:'')):(t.motors+' '+t.drive),
    intName:io.name,addonNames,gearItems,
    range:curRange(),hp:curHP(),z60:dObj?dObj.z60:t.z60,avail:curAvail()};
}
function launchCost2(k){
  S.ext=buildExt({k});
  document.querySelector('.tab[data-tab="cost2"]').click(); /* applies + renders on entry */
}
function launchCost2FromBuild(){
  S.ext=buildExtFromBuild();
  document.querySelector('.tab[data-tab="cost2"]').click(); /* applies + renders on entry */
}
function ensureExt(){if(!S.ext)S.ext=buildExtFromBuild();}
function applyExt(){
  ensureExt();
  $('i2_price').value=Math.round(S.ext.vehicle);
  $('i2_gear').value=Math.round(S.ext.gear);
  renderLoaded();calc2();
}
function renderLoaded(){
  const host=$('loadedCard');if(!host)return;const e=S.ext;
  if(!e){host.className='loaded empty';host.innerHTML='<div class="lbody"><div class="ltrim">No vehicle loaded</div><div class="lcfg">Spec a trim on Build or Compare and hit “See cost over time.”</div></div>';return;}
  host.className='loaded';
  const addons=e.addonNames.length?' · '+e.addonNames.join(', '):'';
  const connect=connectSummary(e.connectPlus);
  const gearLine=e.gear>0?`<div class="pg">+ ${money(e.gear)} gear · ${e.gearItems.length} item${e.gearItems.length>1?'s':''}</div>`:'<div class="pg">no gear added</div>';
  host.innerHTML=`<div class="lthumb"><img loading="lazy" alt="${e.trimName}" src="${heroURL(e.folder,e.wheelCode,e.colCode)}" onerror="this.parentNode.style.display='none'"></div>
    <div class="lbody">
      <div class="ltrim">${e.vehicleName||'R2'} ${e.trimName}</div>
      <div class="lcfg"><b>${e.colName}</b> · ${e.intName} · ${e.driveLabel} · ${e.range} mi · ${e.hp} hp · 0–60 ${e.z60}${addons}${connect?' · '+connect:''}</div>
    </div>
    <div class="lprice"><div class="pv">${money(e.vehicle)}</div>${gearLine}</div>
    <button class="lswap" data-goto="${e.source==='build'?'build':'compare'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>Edit</button>`;
  const b=host.querySelector('[data-goto]');if(b)b.onclick=()=>document.querySelector('.tab[data-tab="'+b.dataset.goto+'"]').click();
}

/* ----- chart frame helpers (offline inline SVG) ----- */
const CW=340,CH=190,CL=44,CR=12,CT=12,CB=26,PW=CW-CL-CR,PH=CH-CT-CB;
/* geometry boxes: the compact grid charts use G0 (the module constants above); the
   full-width scenarios overlay uses GSCEN — a wide, short box so it doesn't tower over
   the other charts. Geometry-aware helpers take an optional g, defaulting to G0. */
const G0={CW,CH,CL,CR,CT,CB,PW,PH};
const GSCEN=(()=>{const CW=760,CH=200,CL=44,CR=12,CT=12,CB=26;return{CW,CH,CL,CR,CT,CB,PW:CW-CL-CR,PH:CH-CT-CB};})();
const xM=(m,NM,g=G0)=>g.CL+(NM?m/NM:0)*g.PW;
const yV=(v,Vmax,g=G0)=>g.CT+(1-(Vmax?v/Vmax:0))*g.PH;
const lineP=pts=>pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
const areaP=(pts,baseY)=>pts.length?('M'+pts[0][0].toFixed(1)+' '+baseY.toFixed(1)+' '+pts.map(p=>'L'+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')+' L'+pts[pts.length-1][0].toFixed(1)+' '+baseY.toFixed(1)+' Z'):'';
function frameSVG(inner,g=G0){return `<svg viewBox="0 0 ${g.CW} ${g.CH}" role="img">${inner}</svg>`;}
function yAxis(Vmax,g=G0){
  let s='';const steps=[0,.5,1];
  steps.forEach(f=>{const y=g.CT+(1-f)*g.PH,v=Vmax*f;
    s+=`<line class="${f===0?'ax':'axg'}" x1="${g.CL}" y1="${y.toFixed(1)}" x2="${g.CW-g.CR}" y2="${y.toFixed(1)}"/>`;
    s+=`<text class="axlbl end" x="${g.CL-5}" y="${(y+3).toFixed(1)}">${fmtK(v)}</text>`;});
  return s;
}
function xYears(years,NM,g=G0){
  let s='';const step=years<=8?1:2;
  for(let y=0;y<=years;y+=step){const x=xM(y*12,NM,g);
    s+=`<text class="axlbl mid" x="${x.toFixed(1)}" y="${g.CH-9}">${y===0?'now':y+'y'}</text>`;}
  return s;
}
function legendRow(items){return `<div class="clegend">${items.map(i=>`<span class="ci"${i.k?` data-k="${i.k}"`:''}><i class="${i.ln?'ln':''}" style="background:${i.c}"></i>${i.t}</span>`).join('')}</div>`;}

/* ----- shared hover tooltip + cross-highlighting for segmented bars ----- */
let TIP=null;
function tipEl(){if(!TIP){TIP=document.createElement('div');TIP.className='ctip';TIP.setAttribute('aria-hidden','true');document.body.appendChild(TIP);}return TIP;}
function showTip(html,x,y){const el=tipEl();el.innerHTML=html;el.classList.add('show');
  const r=el.getBoundingClientRect();
  el.style.left=Math.min(Math.max(8,x+14),window.innerWidth-r.width-8)+'px';
  el.style.top=Math.max(8,y-r.height-12)+'px';}
function hideTip(){if(TIP)TIP.classList.remove('show');}
function bindSegTips(host,sel){
  if(!host)return;
  host.querySelectorAll(sel).forEach(el=>{
    el.addEventListener('mousemove',e=>{if(el.dataset.tip)showTip(el.dataset.tip,e.clientX,e.clientY);});
    el.addEventListener('mouseleave',hideTip);
  });
}
/* crosshair hover for the line charts: track the month under the cursor, draw a
   dashed guide + dots on the curves, and reuse the shared tooltip.
   probe(m) → {tip, dots:[[svgY, color], …]} or null to clear. */
function bindChartHover(host,NM,probe,mLo,g=G0){
  if(!host)return;const svg=host.querySelector('svg');if(!svg)return;
  const lo=(mLo==null)?1:mLo;
  const ov=document.createElementNS('http://www.w3.org/2000/svg','g');
  ov.setAttribute('style','pointer-events:none');
  svg.appendChild(ov);
  svg.addEventListener('mousemove',e=>{
    const r=svg.getBoundingClientRect();if(!r.width)return;
    const vx=(e.clientX-r.left)*(g.CW/r.width);
    let m=Math.round((vx-g.CL)/g.PW*NM);m=Math.max(lo,Math.min(NM,m));
    const p=probe(m);
    if(!p){ov.innerHTML='';hideTip();return;}
    const x=xM(m,NM,g).toFixed(1);
    ov.innerHTML=`<line x1="${x}" y1="${g.CT}" x2="${x}" y2="${g.CT+g.PH}" stroke="var(--faint)" opacity=".55" stroke-dasharray="2 2"/>`+
      p.dots.map(d=>`<circle cx="${x}" cy="${d[0].toFixed(1)}" r="3" fill="${d[1]}" stroke="var(--panel)" stroke-width="1.2"/>`).join('');
    showTip(p.tip,e.clientX,e.clientY);
  });
  svg.addEventListener('mouseleave',()=>{ov.innerHTML='';hideTip();});
}
const moLabel=m=>`Month ${m} · year ${Math.ceil(m/12)}`;
/* legend item hover → spotlight that category's segments (dim the rest) */
function bindLegendHighlight(host,segSel){
  if(!host)return;
  host.querySelectorAll('.clegend .ci[data-k]').forEach(ci=>{
    ci.addEventListener('mouseenter',()=>host.querySelectorAll(segSel).forEach(sg=>sg.classList.toggle('dim',sg.dataset.k!==ci.dataset.k)));
    ci.addEventListener('mouseleave',()=>host.querySelectorAll(segSel).forEach(sg=>sg.classList.remove('dim')));
  });
}

/* ----- the model ----- */
/* selected-state helpers: LOC = the STATES row driving per-state tax/fees/defaults */
const locRow=()=>STATES[S.state2]||STATES.NC;
function syncPropRow(){$('i2_proptaxRow').style.display=(locRow().propTax===0)?'none':'';}
/* live "what this state sets" summary under the picker — the upfront tax % has no
   field of its own, so this makes the state's effect visible at the point of choice */
function renderStateSets(){
  const L=locRow(),el=$('i2_stateSets');if(!el)return;
  const reg=L.evFee>0?`$${Math.round(L.reg)} + $${Math.round(L.evFee)} reg/EV per yr`:`$${Math.round(L.reg)} reg per yr`;
  const prop=L.propTax>0?`${L.propTax}/$100 property tax`:'no property tax';
  el.innerHTML=`<b>${L.name}</b> sets <b>${L.tax}%</b> upfront tax · <b>$${L.title}</b> title · <b>${reg}</b> · <b>${prop}</b> · <b>~${L.kwh}¢</b>/kWh home power`;
}
function applyStateDefaults(){const L=locRow();$('i2_ins').value=L.ins;$('i2_proptax').value=L.propTax;
  if($('i2_kwh'))$('i2_kwh').value=L.kwh;if($('i2_gas'))$('i2_gas').value=L.gas;
  syncPropRow();renderStateSets();}
/* value-curve constants: front-loaded two-phase depreciation + mileage-aware endpoint */
const DEP_R1=0.82;        /* default year-1 retention (drive-off + first-year drop) */
const DEP_MI_BASE=12000;  /* mi/yr baseline the resale-% input assumes */
const DEP_MI_ADJ=0.0025;  /* endpoint retention lost per 1,000 mi/yr above baseline */
const DEP_MI_CAP=0.05;    /* mileage adjustment capped at ±5 retention points */
/* HTML input defaults, mirrored so snapshots decoded outside the DOM (scenario
   overlay) get the exact fallback semantics hydrate2 gives the live inputs */
const DEFAULTS2={i2_price:57990,i2_gear:0,i2_trade:0,i2_owed:0,i2_years:6,i2_miles:13000,
  i2_down:15000,i2_apr:5.79,i2_term:60,i2_year:2027,
  i2_lease:829,i2_leasedown:4895,i2_leaseterm:36,
  i2_ins:2300,i2_maint:450,i2_kwh:16.3,i2_public:45,i2_eff:3.5,i2_home:90,i2_install:700,
  i2_proptax:0.8721,i2_resale:50,i2_esc:0,i2_rebate:0,i2_mpg:28,i2_gas:3.50,
  i2_filing:200000,i2_magi:100000,i2_rate:22};
/* read the live DOM + session state into a plain values object for model2Core */
function readInputs2(){
  const num=id=>+$(id).value||0;
  return {price:num('i2_price'),gear:num('i2_gear'),trade:num('i2_trade'),owed:num('i2_owed'),
    years:num('i2_years'),miles:num('i2_miles'),
    down:num('i2_down'),apr:num('i2_apr'),term:num('i2_term'),startYear:num('i2_year'),
    lease:num('i2_lease'),leasedown:num('i2_leasedown'),leaseterm:num('i2_leaseterm'),
    ins:num('i2_ins'),maint:num('i2_maint'),kwh:num('i2_kwh'),pub:num('i2_public'),
    eff:num('i2_eff'),home:num('i2_home'),install:num('i2_install'),
    proptax:num('i2_proptax'),resale:num('i2_resale'),esc:num('i2_esc'),rebate:num('i2_rebate'),
    mpg:num('i2_mpg'),gas:num('i2_gas'),
    filing:+$('i2_filing').value||200000,magi:num('i2_magi'),rate:num('i2_rate'),
    pay:S.pay2,rc:S.rc,financeGear:S.financeGear,connectPlus:S.ext&&S.ext.connectPlus,
    loc:locRow()};
}
/* build the same values object from a decoded scenario/share payload (no DOM).
   rc/financeGear aren't serialized — mirror hydrate2, which leaves them as-is. */
function valsFromSnapshot(inp,loc){
  const g=id=>{const v=(inp&&inp[id]!=null)?inp[id]:DEFAULTS2[id];return +v||0;};
  return {price:g('i2_price'),gear:g('i2_gear'),trade:g('i2_trade'),owed:g('i2_owed'),
    years:g('i2_years'),miles:g('i2_miles'),
    down:g('i2_down'),apr:g('i2_apr'),term:g('i2_term'),startYear:g('i2_year'),
    lease:g('i2_lease'),leasedown:g('i2_leasedown'),leaseterm:g('i2_leaseterm'),
    ins:g('i2_ins'),maint:g('i2_maint'),kwh:g('i2_kwh'),pub:g('i2_public'),
    eff:g('i2_eff'),home:g('i2_home'),install:g('i2_install'),
    proptax:g('i2_proptax'),resale:g('i2_resale'),esc:g('i2_esc'),rebate:g('i2_rebate'),
    mpg:g('i2_mpg'),gas:g('i2_gas'),
    filing:g('i2_filing')||200000,magi:g('i2_magi'),rate:g('i2_rate'),
    pay:(inp&&inp.pay)||'finance',rc:S.rc,financeGear:false,
    connectPlus:inp&&inp.ext&&inp.ext.connectPlus,
    loc:STATES[loc]||STATES.NC};
}
function model2(){return model2Core(readInputs2());}
function model2Core(V){
  const P=CC();
  const inc=V.rc,gI=inc.ins?1:0,gM=inc.maint?1:0,gE=inc.energy?1:0,gR=inc.reg?1:0,gP=inc.prop?1:0;
  const price=V.price,gear=V.gear,trade=V.trade,owed=V.owed;
  const years=Math.max(1,Math.round(V.years)),miles=V.miles,pay=V.pay,NM=years*12;
  const connectPlanId=normalizeConnect(V.connectPlus),connectAnnual=connectAnnualCost(connectPlanId),connectTotal=connectTotalCost(connectPlanId,years);
  const finG=(V.financeGear&&pay==='finance');
  const ins=V.ins,maint=V.maint,kwh=V.kwh/100,eff=V.eff||3.5,home=V.home/100,install=V.install;
  const pubRate=V.pub/100,esc=Math.max(0,V.esc)/100,rebate=Math.max(0,V.rebate);
  const mpg=V.mpg,gasPrice=V.gas;
  const proptaxRate=V.proptax/100,resalePct=V.resale/100;
  const energyAnnual=(miles/eff)*(home*kwh+(1-home)*pubRate);
  const gasAnnual=(mpg>0&&gasPrice>0)?(miles/mpg)*gasPrice:0;
  const LOC=V.loc;
  const grossVehicle=price+FEES.destination;
  /* A trade-in has two halves: the dealer's allowance (value) and the loan payoff
     still owed on it. Tax relief follows the gross allowance (capped at the vehicle
     price), but only the *equity* (value − payoff) reduces what you actually pay or
     finance. Equity can be negative — "underwater" — which raises the amount owed. */
  const tradeValue=Math.max(trade,0);
  const tradeAllow=Math.min(tradeValue,grossVehicle);   /* taxable-price reduction */
  const owedAmt=Math.max(owed,0);
  const netEquity=tradeValue-owedAmt;                   /* may be negative */
  const tradeCredit=tradeAllow;                         /* alias kept for downstream copy */
  const netVehicle=grossVehicle-tradeAllow;
  const hut=netVehicle*LOC.tax/100;
  const otdGross=grossVehicle+FEES.doc+hut+LOC.title;
  const otd=otdGross-netEquity;   /* equity, not gross value: negative equity raises OTD */
  const reg=LOC.reg+LOC.evFee;
  /* two-phase value curve: steep year 1 (retention r1), easing to the endpoint (rf).
     The endpoint is the user's resale % shifted for above-baseline mileage; r1 never
     drops below the endpoint and never sits gentler than the single-exponential curve. */
  const rfBase=Math.max(0.02,resalePct);
  const miAdj=Math.max(-DEP_MI_CAP,Math.min(DEP_MI_CAP,(miles-DEP_MI_BASE)/1000*DEP_MI_ADJ));
  const rf=Math.max(0.02,Math.min(0.95,rfBase-miAdj));
  const r1=Math.min(Math.max(DEP_R1,rf),Math.pow(rf,NM?12/NM:1));
  const valueAt=m=>m<=12?price*Math.pow(r1,m/12):price*r1*Math.pow(rf/r1,(m-12)/(NM-12));
  const resale=price*rf;
  const propYear=y=>valueAt((y-1)*12)*proptaxRate;
  let propTotal=0;for(let y=1;y<=years;y++)propTotal+=propYear(y);
  /* optional running-cost escalation (ins/maint/energy only; reg is statutory, prop already declines) */
  const escF=y=>Math.pow(1+esc,y-1);
  let escSum=0;for(let y=1;y<=years;y++)escSum+=escF(y);
  const fuelSaved=(gasAnnual>0)?(gasAnnual-energyAnnual)*escSum:0;
  /* financing */
  const term=Math.max(1,Math.round(V.term)),apr=V.apr,down=V.down,startYear=Math.round(V.startYear)||2027;
  const rate=V.rate/100,cap=dedCap(V.magi,V.filing||200000);
  const lp=V.lease,ldRaw=V.leasedown,lt=Math.max(1,Math.round(V.leaseterm));
  /* trade equity applies to a lease as a capitalized-cost reduction — offset "due at
     signing" (negative equity raises it). Equity beyond signing comes back as a check. */
  const ld=Math.max(0,ldRaw-netEquity);
  const leaseCashback=Math.max(0,netEquity-ldRaw);
  let A=null,principal=0,balAt=[],monthlyPmt=0,interestHold=0,dedInt=0,ded=0,maxYearInt=0,remBal=0,payoffMonth=0,dedYears=0;
  if(pay==='finance'){
    principal=Math.max(0,otd+(finG?gear:0)-down);
    A=amort(principal,apr,term);monthlyPmt=A.monthly;
    balAt=[principal];for(let m=0;m<NM;m++)balAt.push(m<term?A.sched[m].bal:0);
    remBal=NM>=term?0:(A.sched[NM-1]?A.sched[NM-1].bal:0);
    for(let m=0;m<Math.min(NM,term);m++)interestHold+=A.sched[m].int;
    payoffMonth=Math.min(term,NM);for(let m=0;m<balAt.length;m++){if(balAt[m]<=0.5){payoffMonth=m;break;}}
    let yi=0;for(let cy=startYear;cy<startYear+Math.ceil(term/12);cy++){let iy=0;for(let mm=0;mm<12;mm++){const idx=yi*12+mm;if(idx<A.sched.length)iy+=A.sched[idx].int;}yi++;if(cy>=2025&&cy<=2028){dedInt+=Math.min(iy,cap);dedYears++;if(iy>maxYearInt)maxYearInt=iy;}}
    ded=dedInt*rate;
  }
  const upfront=(pay==='finance'?down:pay==='cash'?otd:ld)+(finG?0:gear)+install;
  const runMo=y=>propYear(y)*gP/12+((ins*gI+maint*gM+energyAnnual*gE)*escF(y)+reg*gR+connectAnnual)/12;
  /* monthly cumulative cash out */
  const cum=[];let c=0;
  for(let m=0;m<NM;m++){let o=0;const y=Math.floor(m/12)+1;
    if(m===0)o+=upfront;
    o+=runMo(y);
    if(pay==='finance'&&m<term)o+=monthlyPmt;
    if(pay==='lease'&&m<lt)o+=lp;
    c+=o;cum.push(c);}
  const grossCum=c;
  const netResale=(pay==='lease')?0:(resale-remBal);
  /* rebates arrive after purchase (a check in the mail) — they never reduce day-one
     cash, taxable price, or loan principal; they come back like resale/deduction do */
  const trueCost=grossCum-netResale-(pay==='finance'?ded:0)-rebate;
  /* structured breakdown rows — grp: acq | fin | run(toggleable) */
  const moPaid=Math.min(NM,lt);
  const stateUp=hut+LOC.title;                     /* the state's upfront cut: sales/use tax + title */
  const finLbl=(pay==='finance'?' (financed)':'');
  const acq=(pay==='lease')
    ?[{key:'lease',l:'Lease + signing',v:ld+lp*moPaid,c:P.yellow,grp:'acq'}]
    :[{key:'vehicle',l:'Base vehicle price',v:price,c:P.yellow,grp:'acq'},
      {key:'dest',l:'Destination charge',v:FEES.destination,c:P.dest,grp:'acq'},
      {key:'doc',l:'Documentation fee',v:FEES.doc,c:P.doc,grp:'acq'}];
  if(pay!=='lease'&&tradeValue>0)acq.push({key:'trade',l:'Trade-in value',v:-tradeValue,c:P.resale,grp:'acq',credit:1});
  if(pay!=='lease'&&owedAmt>0)acq.push({key:'payoff',l:'Trade-in loan payoff',v:owedAmt,c:P.red,grp:'acq'});
  if(pay!=='lease'&&stateUp>0)acq.push({key:'statetax',l:'State tax + title'+finLbl,v:stateUp,c:P.statetax,grp:'acq'});
  acq.push({key:'gear',l:'Gear & accessories'+(finG?' (in loan)':''),v:gear,c:P.gray,grp:'acq'});
  acq.push({key:'install',l:'Charger install',v:install,c:P.blue,grp:'acq'});
  const fin=(pay==='finance')?[{key:'interest',l:'Loan interest',v:interestHold,c:P.red,grp:'fin'}]:[];
  const run=[
    {key:'ins',l:'Insurance',v:ins*escSum,c:P.teal,grp:'run',tog:1},
    {key:'maint',l:'Maintenance + tires',v:maint*escSum,c:P.orange,grp:'run',tog:1},
    {key:'energy',l:'Electricity',v:energyAnnual*escSum,c:P.green,grp:'run',tog:1},
    {key:'reg',l:'Registration + EV fee',v:reg*years,c:P.olive,grp:'run',tog:1}]
    .concat(connectAnnual>0?[{key:'connect',l:'Connect+',v:connectTotal,c:P.blue,grp:'run'}]:[])
    .concat([
    {key:'prop',l:'Property tax',v:propTotal,c:P.purple,grp:'run',tog:1}]);
  const bdRows=acq.concat(fin,run).map(r=>{const on=r.tog?!!inc[r.key]:true;return Object.assign({on,active:on?r.v:0},r);});
  const buckets=bdRows.filter(r=>r.active>0).map(r=>({key:r.key,l:r.l,v:r.active,c:r.c}));
  /* per-year rows (running gated by toggles) */
  const yearRows=[];
  const upTax=(pay==='cash')?stateUp:0;   /* state tax is a year-1 cash outlay only when paying cash; financed/leased tax rides inside the payment bars */
  for(let y=1;y<=years;y++){const m0=(y-1)*12;let pmt=0;
    if(pay==='finance')for(let m=m0;m<m0+12&&m<term;m++)pmt+=monthlyPmt;
    if(pay==='lease')for(let m=m0;m<m0+12&&m<lt;m++)pmt+=lp;
    yearRows.push({y,up:(y===1?upfront-upTax:0),statetax:(y===1?upTax:0),pmt,ins:ins*gI*escF(y),energy:energyAnnual*gE*escF(y),reg:reg*gR,connect:connectAnnual,prop:propYear(y)*gP,maint:maint*gM*escF(y),resaleCredit:(y===years?netResale:0),rebateCredit:(y===1?rebate:0)});
  }
  /* underwater */
  let underMonths=0,crossover=-1;
  if(pay==='finance'){for(let m=0;m<=NM;m++){const v=valueAt(m),b=balAt[m]!=null?balAt[m]:0;if(b>v)underMonths++;else if(crossover<0&&m>0)crossover=m;}if(crossover<0&&balAt[0]<=valueAt(0))crossover=0;}
  return {price,gear,trade,owed,tradeCredit,tradeValue,owedAmt,netEquity,leaseCashback,grossVehicle,netVehicle,years,miles,pay,NM,otd,otdGross,reg,ins,maint,energyAnnual,install,propTotal,connectPlanId,connectAnnual,connectTotal,resale,resalePct,
    resalePctEff:rf,resaleAdjPP:Math.round((rfBase-rf)*1000)/10,r1,
    esc,escF,rebate,gasAnnual,fuelSaved,mpg,gasPrice,
    valueAt,propYear,term,apr,down,monthlyPmt,principal,balAt,interestHold,remBal,payoffMonth,ded,dedInt,maxYearInt,cap,rate,dedYears,finG,
    upfront,cum,grossCum,netResale,trueCost,buckets,bdRows,yearRows,underMonths,crossover,lp,ld,lt,A};
}

/* ----- charts ----- */
function chartCum(M){
  const P=CC();
  const Vmax=Math.max(M.grossCum,M.trueCost)*1.08||1;
  const pts=M.cum.map((v,i)=>[xM(i+1,M.NM),yV(v,Vmax)]);
  const tcY=yV(M.trueCost,Vmax),endX=xM(M.NM,M.NM);
  let s=yAxis(Vmax)+xYears(M.years,M.NM);
  s+=`<path d="${areaP(pts,yV(0,Vmax))}" fill="${P.tealFill}"/>`;
  s+=`<path d="${lineP(pts)}" fill="none" stroke="${P.teal}" stroke-width="2.2"/>`;
  const gY=yV(M.grossCum,Vmax);
  if(M.netResale>0||M.ded>0||M.rebate>0){
    s+=`<line class="axg" x1="${endX.toFixed(1)}" y1="${gY.toFixed(1)}" x2="${endX.toFixed(1)}" y2="${tcY.toFixed(1)}" stroke="${P.olive}" stroke-dasharray="3 2"/>`;
    s+=`<circle class="cdot" cx="${endX.toFixed(1)}" cy="${tcY.toFixed(1)}" r="3.4" fill="${P.green}"/>`;
    s+=`<text class="clbl" x="${(endX-3).toFixed(1)}" y="${(tcY-6).toFixed(1)}" text-anchor="end">${fmtK(M.trueCost)} net</text>`;
    /* direct-label the gross endpoint too, unless it would collide with the net label */
    if(Math.abs(gY-tcY)>=16)s+=`<text class="clbl" x="${(endX-3).toFixed(1)}" y="${(gY-6).toFixed(1)}" text-anchor="end">${fmtK(M.grossCum)} gross</text>`;
  }else{
    s+=`<circle class="cdot" cx="${endX.toFixed(1)}" cy="${tcY.toFixed(1)}" r="3.4" fill="${P.teal}"/>`;
    s+=`<text class="clbl" x="${(endX-3).toFixed(1)}" y="${(tcY-6).toFixed(1)}" text-anchor="end">${fmtK(M.grossCum)}</text>`;
  }
  s+=`<circle class="cdot" cx="${xM(1,M.NM).toFixed(1)}" cy="${yV(M.cum[0],Vmax).toFixed(1)}" r="3" fill="${P.teal}"/>`;
  s+=`<text class="clbl" x="${(xM(1,M.NM)+4).toFixed(1)}" y="${(yV(M.cum[0],Vmax)-6).toFixed(1)}">${fmtK(M.upfront)} day one</text>`;
  $('chartCum').innerHTML=frameSVG(s)+legendRow([{c:P.teal,t:'Cumulative cash out'},{c:P.green,t:'True cost (net of resale)'}]);
  bindChartHover($('chartCum'),M.NM,m=>({
    tip:`${moLabel(m)}<br><b>${money(M.cum[m-1])}</b> cash out so far`,
    dots:[[yV(M.cum[m-1],Vmax),P.teal]]
  }));
  $('cumSub').textContent=fmtK(M.trueCost)+' net';
  const backParts=[];
  if(M.pay!=='lease')backParts.push(`Resale recovers <b>${money(M.netResale)}</b>`);
  if(M.ded>0)backParts.push(`deduction saves <b>${money(M.ded)}</b>`);
  if(M.rebate>0)backParts.push(`rebates return <b>${money(M.rebate)}</b>`);
  $('cumCap').innerHTML=`Day one: <b>${money(M.upfront)}</b>. Gross paid by year ${M.years}: <b>${money(M.grossCum)}</b>`+(M.pay==='lease'&&!backParts.length?`. No resale on a lease.`:`. ${backParts.join('; ')}. Net: <b>${money(M.trueCost)}</b>.`);
}
/* per-year cost categories (label + color + key), shared by the annual chart and
   the year-by-year table so the two never drift. Only categories that actually
   occur are returned — no prop-tax row in the ~30 states without one, no
   zeroed-out toggles — keeping legend + table readable. */
function annualCats(M){
  const P=CC();const has=k=>M.yearRows.some(r=>(r[k]||0)>0);
  const all=[{k:'up',l:'Up-front',c:P.yellow}]
    .concat(has('statetax')?[{k:'statetax',l:'State tax + title',c:P.statetax}]:[])   /* cash only — financed/leased tax lives in the payment bars */
    .concat([{k:'pmt',l:(M.pay==='lease'?'Lease':'Financing'),c:P.red},
    {k:'ins',l:'Insurance',c:P.teal},{k:'energy',l:'Electricity',c:P.green},
    {k:'reg',l:'Reg + EV',c:P.olive}])
    .concat(M.connectAnnual>0?[{k:'connect',l:'Connect+',c:P.blue}]:[])
    .concat([{k:'prop',l:'Property tax',c:P.purple},{k:'maint',l:'Maintenance',c:P.orange}]);
  return all.filter(ct=>has(ct.k));
}
function chartAnnual(M){
  const P=CC();
  const cats=annualCats(M);
  let maxPos=0,maxNeg=0;
  M.yearRows.forEach(r=>{let p=0;cats.forEach(ct=>p+=r[ct.k]||0);if(p>maxPos)maxPos=p;const neg=(r.resaleCredit||0)+(r.rebateCredit||0);if(neg>maxNeg)maxNeg=neg;});
  const R=(maxPos+maxNeg)||1,unit=PH/R,base=CT+(maxPos/R)*PH;
  let s='';
  /* zero + helper gridlines */
  s+=`<line class="ax" x1="${CL}" y1="${base.toFixed(1)}" x2="${CW-CR}" y2="${base.toFixed(1)}"/>`;
  [0.5,1].forEach(f=>{const v=maxPos*f,y=base-v*unit;s+=`<line class="axg" x1="${CL}" y1="${y.toFixed(1)}" x2="${CW-CR}" y2="${y.toFixed(1)}"/><text class="axlbl end" x="${CL-5}" y="${(y+3).toFixed(1)}">${fmtK(v)}</text>`;});
  if(maxNeg>0){const y=base+maxNeg*unit;s+=`<text class="axlbl end" x="${CL-5}" y="${(y+3).toFixed(1)}">-${fmtK(maxNeg)}</text>`;}
  const n=M.years,slot=PW/n,bw=Math.min(34,slot*0.6);
  const yearTot=M.yearRows.map(r=>cats.reduce((a,ct)=>a+(r[ct.k]||0),0));
  M.yearRows.forEach((r,i)=>{
    const cx=CL+slot*i+slot/2,x=cx-bw/2;let yTop=base,tot=0;
    cats.forEach(ct=>{const v=r[ct.k]||0;if(v<=0)return;const h=v*unit;yTop-=h;tot+=v;
      const pc=yearTot[i]>0?Math.round(v/yearTot[i]*100):0;
      s+=`<rect class="barseg" data-k="${ct.k}" data-tip="<b>${ct.l}</b> · year ${r.y}<br><b>${money(v)}</b> · ${pc}% of year ${r.y}'s ${money(yearTot[i])}" x="${x.toFixed(1)}" y="${yTop.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${ct.c}"/>`;});
    if(M.years<=8&&tot>0)s+=`<text class="axlbl mid" x="${cx.toFixed(1)}" y="${(yTop-3).toFixed(1)}">${fmtK(tot)}</text>`;
    let yNeg=base;
    if(r.resaleCredit>0){const h=r.resaleCredit*unit;s+=`<rect class="barseg" data-k="resale" data-tip="<b>Resale</b> · year ${r.y}<br><b>−${money(r.resaleCredit)}</b> comes back to you" x="${x.toFixed(1)}" y="${yNeg.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${P.resale}"/>`;yNeg+=h;}
    if(r.rebateCredit>0){const h=r.rebateCredit*unit;s+=`<rect class="barseg" data-k="rebate" data-tip="<b>Rebates</b> · year ${r.y}<br><b>−${money(r.rebateCredit)}</b> comes back to you" x="${x.toFixed(1)}" y="${yNeg.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${P.gray}"/>`;}
    s+=`<text class="axlbl mid" x="${cx.toFixed(1)}" y="${CH-9}">${r.y}</text>`;
  });
  $('chartAnnual').innerHTML=frameSVG(s)+legendRow(cats.map(ct=>({c:ct.c,t:ct.l,k:ct.k}))
    .concat(M.netResale>0?[{c:P.resale,t:'Resale (yr '+M.years+')',k:'resale'}]:[])
    .concat(M.rebate>0?[{c:P.gray,t:'Rebates (yr 1)',k:'rebate'}]:[]));
  bindSegTips($('chartAnnual'),'.barseg');
  bindLegendHighlight($('chartAnnual'),'.barseg');
  $('annSub').textContent='per year';
  const yr1=M.yearRows[0],g1=yr1.up+(yr1.statetax||0)+yr1.pmt+yr1.ins+yr1.energy+yr1.reg+(yr1.connect||0)+yr1.prop+yr1.maint;
  const yr2=M.yearRows[1]||yr1,steady=yr2.pmt+yr2.ins+yr2.energy+yr2.reg+(yr2.connect||0)+yr2.prop+yr2.maint;
  $('annCap').innerHTML=`Year 1: <b>${money(g1)}</b>. Typical later year: <b>${money(steady)}</b>`+(M.pay==='finance'&&M.payoffMonth<M.NM?`, then lower after payoff in year ${Math.ceil(M.payoffMonth/12)}.`:'.');
}
/* ----- year-by-year breakdown table: categories × years so the shape of each
   cost is visible over time (financing present then gone at payoff, insurance /
   maintenance escalating, property tax declining, up-front + resale landing in
   single years). Same categories/colors as the annual chart via annualCats(). */
function renderYearTable(M){
  const el=$('yearBd');if(!el)return;
  const cats=annualCats(M),yrs=M.yearRows;
  const cell=v=>v>0?money(v):'<span class="z">—</span>';
  const ccell=v=>v>0?'−'+money(v):'<span class="z">—</span>';
  const smoney=v=>v<0?'−'+money(-v):money(v);
  const head='<tr><th class="cat">Category</th>'+yrs.map(r=>`<th>Yr ${r.y}</th>`).join('')+'<th class="tot">Total</th></tr>';
  let body='';
  cats.forEach(ct=>{
    const tot=yrs.reduce((a,r)=>a+(r[ct.k]||0),0);
    body+=`<tr><td class="cat"><i style="background:${ct.c}"></i>${ct.l}</td>`+
      yrs.map(r=>`<td>${cell(r[ct.k]||0)}</td>`).join('')+`<td class="tot">${cell(tot)}</td></tr>`;
  });
  const credits=[];
  if(yrs.some(r=>r.resaleCredit>0))credits.push({l:'Resale',k:'resaleCredit'});
  if(yrs.some(r=>r.rebateCredit>0))credits.push({l:'Rebates',k:'rebateCredit'});
  credits.forEach(cr=>{
    const tot=yrs.reduce((a,r)=>a+(r[cr.k]||0),0);
    body+=`<tr class="cred"><td class="cat"><i style="background:${CC().resale}"></i>${cr.l}</td>`+
      yrs.map(r=>`<td>${ccell(r[cr.k]||0)}</td>`).join('')+`<td class="tot">${ccell(tot)}</td></tr>`;
  });
  const net=yrs.map(r=>cats.reduce((a,ct)=>a+(r[ct.k]||0),0)-(r.resaleCredit||0)-(r.rebateCredit||0));
  const netTot=net.reduce((a,v)=>a+v,0);
  body+=`<tr class="net"><td class="cat">Net cash</td>`+net.map(v=>`<td>${smoney(v)}</td>`).join('')+`<td class="tot">${smoney(netTot)}</td></tr>`;
  el.innerHTML=`<table class="ybt"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  if($('yearBdSub'))$('yearBdSub').textContent=(M.pay==='finance'&&M.ded>0)?'per year · before tax deduction':'per year';
}
function chartLoan(M){
  const P=CC();
  if(M.pay==='cash'){$('chartLoan').innerHTML='<div class="chartnote">💵<span>Paid in cash — no loan.</span></div>';$('loanCap').innerHTML='No interest; full equity from day one.';$('loanSub').textContent='no loan';return;}
  if(M.pay==='lease'){$('chartLoan').innerHTML='<div class="chartnote">🔑<span>Lease payments cover use, not ownership.</span></div>';$('loanCap').innerHTML='No equity or payoff curve; you return the car at lease end.';$('loanSub').textContent='no equity';return;}
  const NMv=Math.min(M.NM,M.term);
  let cumI=[],cumP=[],iAcc=0,pAcc=0;
  for(let m=0;m<NMv;m++){iAcc+=M.A.sched[m].int;pAcc+=(M.monthlyPmt-M.A.sched[m].int);cumI.push(iAcc);cumP.push(pAcc);}
  const totPaid=iAcc+pAcc,Vmax=Math.max(M.principal,totPaid)*1.08||1;
  const ptsBal=[];for(let m=0;m<=NMv;m++)ptsBal.push([xM(m,M.NM),yV(M.balAt[m]!=null?M.balAt[m]:0,Vmax)]);
  const ptsI=cumI.map((v,i)=>[xM(i+1,M.NM),yV(v,Vmax)]);
  const ptsIP=cumI.map((v,i)=>[xM(i+1,M.NM),yV(v+cumP[i],Vmax)]);
  let s=yAxis(Vmax)+xYears(M.years,M.NM);
  /* cumulative principal (teal) stacked atop interest (red) */
  const stackTop=ptsIP.slice(),stackBotRev=ptsI.slice().reverse();
  s+=`<path d="${'M'+ptsI.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+' L'+stackTop.slice().reverse().map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')+' Z'}" fill="${P.tealFill2}"/>`;
  s+=`<path d="${areaP(ptsI,yV(0,Vmax))}" fill="${P.redFill}"/>`;
  s+=`<path d="${lineP(ptsIP)}" fill="none" stroke="${P.teal}" stroke-width="1.6"/>`;
  s+=`<path d="${lineP(ptsI)}" fill="none" stroke="${P.red}" stroke-width="1.6"/>`;
  s+=`<path d="${lineP(ptsBal)}" fill="none" stroke="${P.navy}" stroke-width="2.2"/>`;
  if(M.payoffMonth<NMv){const px=xM(M.payoffMonth,M.NM);s+=`<line class="axg" x1="${px.toFixed(1)}" y1="${CT}" x2="${px.toFixed(1)}" y2="${(CT+PH).toFixed(1)}" stroke="${P.green}"/><text class="clbl" x="${(px+3).toFixed(1)}" y="${(CT+10)}" fill="${P.green}">paid off</text>`;}
  $('chartLoan').innerHTML=frameSVG(s)+legendRow([{c:P.navy,t:'Balance owed',ln:1},{c:P.teal,t:'Principal paid'},{c:P.red,t:'Interest paid'}]);
  bindChartHover($('chartLoan'),M.NM,m=>{
    const mm=Math.min(m,NMv),bal=M.balAt[mm]!=null?M.balAt[mm]:0,ci=cumI[mm-1]||0,cp=cumP[mm-1]||0;
    return {tip:`${moLabel(m)}<br>Balance owed <b>${money(bal)}</b><br>Principal paid <b>${money(cp)}</b> · interest <b>${money(ci)}</b>`,
      dots:[[yV(bal,Vmax),P.navy],[yV(ci+cp,Vmax),P.teal],[yV(ci,Vmax),P.red]]};
  });
  $('loanSub').textContent=fmtK(M.interestHold)+' interest';
  $('loanCap').innerHTML=`Over ${M.years} yrs: <b>${money(iAcc)}</b> interest, <b>${money(pAcc)}</b> principal. `+(M.remBal>0?`Balance at sale: <b>${money(M.remBal)}</b>.`:`Paid off`+(M.payoffMonth<M.NM?` in year ${Math.ceil(M.payoffMonth/12)}.`:` at the end.`));
}
function chartDep(M){
  const P=CC();
  const Vmax=Math.max(M.price,M.pay==='finance'?M.principal:0)*1.06||1;
  const val=[];for(let m=0;m<=M.NM;m++)val.push([xM(m,M.NM),yV(M.valueAt(m),Vmax)]);
  let s=yAxis(Vmax)+xYears(M.years,M.NM);
  s+=`<path d="${areaP(val,yV(0,Vmax))}" fill="${P.greenFill}"/>`;
  if(M.pay==='finance'){
    const bal=[];for(let m=0;m<=M.NM;m++)bal.push([xM(m,M.NM),yV(M.balAt[m]!=null?M.balAt[m]:0,Vmax)]);
    /* underwater shading: region where balance>value */
    let uw='';for(let m=0;m<M.NM;m++){const v=M.valueAt(m),b=M.balAt[m]!=null?M.balAt[m]:0;if(b>v){const x1=xM(m,M.NM),x2=xM(m+1,M.NM);uw+=`<rect x="${x1.toFixed(1)}" y="${CT}" width="${(x2-x1+0.6).toFixed(1)}" height="${PH}" fill="${P.redFillLt}"/>`;}}
    s=yAxis(Vmax)+uw+xYears(M.years,M.NM)+`<path d="${areaP(val,yV(0,Vmax))}" fill="${P.greenFill}"/>`;
    s+=`<path d="${lineP(bal)}" fill="none" stroke="${P.red}" stroke-width="2" stroke-dasharray="4 2"/>`;
    if(M.crossover>0&&M.crossover<M.NM){const cx=xM(M.crossover,M.NM),cy=yV(M.valueAt(M.crossover),Vmax);s+=`<circle class="cdot" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="3.6" fill="${P.green}"/><text class="clbl" x="${(cx+4).toFixed(1)}" y="${(cy-5).toFixed(1)}" fill="${P.green}">equity</text>`;}
  }
  s+=`<path d="${lineP(val)}" fill="none" stroke="${P.green}" stroke-width="2.2"/>`;
  const endVX=xM(M.NM,M.NM),endVY=yV(M.valueAt(M.NM),Vmax);
  s+=`<circle class="cdot" cx="${endVX.toFixed(1)}" cy="${endVY.toFixed(1)}" r="3.2" fill="${P.green}"/>`;
  s+=`<text class="clbl" x="${(endVX-4).toFixed(1)}" y="${(endVY-7).toFixed(1)}" text-anchor="end" fill="${P.green}">${fmtK(M.resale)}</text>`;
  const leg=[{c:P.green,t:'Vehicle value'}];if(M.pay==='finance')leg.push({c:P.red,t:'Loan balance',ln:1},{c:P.redGlow,t:'Underwater'});
  $('chartDep').innerHTML=frameSVG(s)+legendRow(leg);
  bindChartHover($('chartDep'),M.NM,m=>{
    const v=M.valueAt(m),lbl=m===0?'Day one':moLabel(m);
    if(M.pay!=='finance')return {tip:`${lbl}<br>Vehicle value <b>${money(v)}</b>`,dots:[[yV(v,Vmax),P.green]]};
    const b=M.balAt[m]!=null?M.balAt[m]:0,eq=v-b;
    return {tip:`${lbl}<br>Vehicle value <b>${money(v)}</b> · owed <b>${money(b)}</b><br>`+
      (eq>=0?`Equity <b>${money(eq)}</b>`:`<span style="color:var(--bad)">Underwater by <b>${money(-eq)}</b></span>`),
      dots:[[yV(v,Vmax),P.green],[yV(b,Vmax),P.red]]};
  },0);
  /* show the EFFECTIVE endpoint so the mileage adjustment is never hidden */
  const adj=M.resaleAdjPP;
  $('depSub').textContent=Math.round(M.resalePctEff*100)+'% retained'+(adj>0?` · −${adj}pp for ${Math.round(M.miles/1000)}k mi/yr`:(adj<0?` · +${-adj}pp for ${Math.round(M.miles/1000)}k mi/yr`:''));
  if(M.pay==='finance'){
    $('depCap').innerHTML=M.underMonths>0
      ?`<span class="uw">Underwater for ~${M.underMonths} month${M.underMonths>1?'s':''}</span>, then <span class="eq">positive equity</span>${M.crossover>0?` around month ${M.crossover}`:''}. Ending value: <b>${money(M.resale)}</b>.`
      :`<span class="eq">Above water the whole time</span>. Ending value: <b>${money(M.resale)}</b>.`;
  }else if(M.pay==='cash'){
    $('depCap').innerHTML=`Owned outright: <span class="eq">all equity</span>, from ${money(M.price)} to about <b>${money(M.resale)}</b> by year ${M.years}.`;
  }else{
    $('depCap').innerHTML=`Lease: no equity to track. Estimated value moves from ${money(M.price)} to about ${money(M.resale)}.`;
  }
}
/* EV-vs-gas fuel savings: cumulative (gas fuel − electricity), starting in the hole
   by the charger install — the zero-crossing is where charging has paid the install back.
   Fuel only, by design: no gas-vehicle price/insurance/depreciation is modeled. */
function chartGas(M){
  const P=CC();
  if(!(M.gasAnnual>0)){
    $('chartGas').innerHTML='<div class="chartnote">⛽<span>Set a comparable mpg and gas price to compare fuel costs.</span></div>';
    $('gasCap').innerHTML='Fuel-only comparison — enter the gas SUV you\'d otherwise drive.';$('gasSub').textContent='—';return;
  }
  const sv=[];let sav=-M.install,minV=Math.min(0,sav),maxV=sav,cross=-1;
  for(let m=0;m<M.NM;m++){const y=Math.floor(m/12)+1;
    sav+=(M.gasAnnual-M.energyAnnual)*M.escF(y)/12;sv.push(sav);
    if(cross<0&&sav>=0)cross=m+1;
    if(sav<minV)minV=sav;if(sav>maxV)maxV=sav;}
  const range=(maxV-minV)||1,yv=v=>CT+(1-(v-minV)/range)*PH,base=yv(0);
  const pts=[[xM(0,M.NM),yv(-M.install)]].concat(sv.map((v,i)=>[xM(i+1,M.NM),yv(v)]));
  let s='';
  s+=`<line class="ax" x1="${CL}" y1="${base.toFixed(1)}" x2="${CW-CR}" y2="${base.toFixed(1)}"/>`;
  [maxV,minV<0?minV:null].forEach(v=>{if(v==null||v===0)return;const y=yv(v);
    s+=`<line class="axg" x1="${CL}" y1="${y.toFixed(1)}" x2="${CW-CR}" y2="${y.toFixed(1)}"/><text class="axlbl end" x="${CL-5}" y="${(y+3).toFixed(1)}">${fmtK(v)}</text>`;});
  s+=xYears(M.years,M.NM);
  s+=`<path d="${areaP(pts,base)}" fill="${P.greenFill}"/>`;
  s+=`<path d="${lineP(pts)}" fill="none" stroke="${P.green}" stroke-width="2.2"/>`;
  if(cross>0&&M.install>0&&cross<M.NM){const px=xM(cross,M.NM);
    s+=`<line class="axg" x1="${px.toFixed(1)}" y1="${CT}" x2="${px.toFixed(1)}" y2="${(CT+PH).toFixed(1)}" stroke="${P.olive}"/>`;
    s+=`<text class="clbl" x="${(px+3).toFixed(1)}" y="${(CT+10)}" fill="${P.olive}">install paid back</text>`;}
  const endY=yv(sv[sv.length-1]);
  s+=`<circle class="cdot" cx="${xM(M.NM,M.NM).toFixed(1)}" cy="${endY.toFixed(1)}" r="3.4" fill="${P.green}"/>`;
  s+=`<text class="clbl" x="${(xM(M.NM,M.NM)-4).toFixed(1)}" y="${(endY-6).toFixed(1)}" text-anchor="end">${fmtK(sv[sv.length-1])} saved</text>`;
  $('chartGas').innerHTML=frameSVG(s)+legendRow([{c:P.green,t:'Cumulative fuel savings vs gas'}]);
  bindChartHover($('chartGas'),M.NM,m=>{
    const v=sv[m-1];
    return {tip:`${moLabel(m)}<br>`+(v>=0?`<b>${money(v)}</b> saved vs gas so far`:`<span style="color:var(--bad)"><b>${money(-v)}</b> from breaking even</span> (charger install)`),
      dots:[[yv(v),P.green]]};
  });
  $('gasSub').textContent=fmtK(sv[sv.length-1])+' saved';
  const evMi=M.miles>0?(M.energyAnnual/M.miles*100):0,gasMi=M.miles>0?(M.gasAnnual/M.miles*100):0;
  $('gasCap').innerHTML=`Charging ≈ <b>${evMi.toFixed(1)}¢/mi</b> vs gas ≈ <b>${gasMi.toFixed(1)}¢/mi</b> (${M.mpg} mpg @ $${M.gasPrice.toFixed(2)}/gal)`
    +(M.install>0?(cross>0&&cross<=M.NM?`. Charger install paid back in <b>month ${cross}</b>.`:`. Install not paid back within your hold.`):'.')
    +' Fuel only — no gas-car purchase or insurance modeled.';
}
function renderKPIs(M){
  const k=[];const yr1=M.yearRows[0];
  k.push({l:'Day-one cash',v:money(M.upfront),s:M.pay==='finance'?('down'+(M.finG?'':' + gear')+' + install'):M.pay==='lease'?'signing + gear':'full + gear'});
  if(M.miles>0)k.push({l:'True cost per mile',v:'$'+(M.trueCost/(M.miles*M.years)).toFixed(2),s:M.miles.toLocaleString()+' mi/yr · '+M.years+' yrs'});
  if(M.fuelSaved>0)k.push({l:'Fuel saved vs gas',v:money(M.fuelSaved),s:'vs '+M.mpg+' mpg @ $'+M.gasPrice.toFixed(2)+'/gal',cls:'good'});
  if(M.pay==='finance'){k.push({l:'Total interest (hold)',v:money(M.interestHold),s:M.apr+'% · '+M.term+'-mo',cls:'warn'});
    k.push({l:M.payoffMonth<M.NM?'Loan paid off':'Owed at sale',v:M.payoffMonth<M.NM?('Year '+Math.ceil(M.payoffMonth/12)):money(M.remBal),s:M.payoffMonth<M.NM?'within your hold':'covered by resale'});
    k.push({l:'Underwater',v:M.underMonths>0?('~'+M.underMonths+' mo'):'Never',s:M.underMonths>0?'owe > value':'down keeps equity+',cls:M.underMonths>0?'warn':'good'});}
  if(M.pay!=='lease'){k.push({l:'Resale recovered',v:money(M.netResale),s:Math.round(M.resalePctEff*100)+'% at year '+M.years,cls:'good'});}
  if(M.pay==='finance'&&M.ded>0){k.push({l:'Deduction saved',v:money(M.ded),s:'total, 2025–28',cls:'good'});}
  k.push({l:'Most expensive year',v:'Year 1',s:money(yr1.up+(yr1.statetax||0)+yr1.pmt+yr1.ins+yr1.energy+yr1.reg+(yr1.connect||0)+yr1.prop+yr1.maint)});
  $('kpiGrid').innerHTML=k.slice(0,8).map(x=>`<div class="kpi"><div class="kl">${x.l}</div><div class="kv ${x.cls||''}">${x.v}</div><div class="ks">${x.s}</div></div>`).join('');
}

/* ----- grouped, toggleable breakdown ----- */
function renderBreakdown2(M){
  const grossActive=M.bdRows.reduce((a,r)=>a+r.active,0)||1;
  const groups=[{id:'acq',t:'Up-front'},{id:'fin',t:'Financing'},{id:'run',t:'Running costs'}];
  /* one itemized line; credit rows (trade-in) show a green −value and no % */
  const rowHTML=r=>{
    const credit=r.credit||r.active<0;
    const pc=(!credit&&r.on)?Math.round(r.active/grossActive*100)+'%':'';
    const col3=r.tog?`<button class="tgl${r.on?' on':''}" data-rc="${r.key}" title="Toggle ${r.l}" aria-label="Toggle ${r.l}"></button>`:`<span class="pc">${pc}</span>`;
    const val=r.tog?r.v:r.active;
    const vtxt=credit?'−'+money(Math.abs(val)):money(val);
    return `<div class="bdrow${r.on?'':' off'}${credit?' credit':''}" data-key="${r.key}"><i style="background:${r.c}"></i><span class="nm">${r.l}</span>${col3}<span class="vl">${vtxt}</span></div>`;
  };
  /* a summed rule line (no dot); `grand` = the emphatic bottom-line total */
  const ruleHTML=(label,val,cls)=>`<div class="bdrow rule${cls?' '+cls:''}"><span class="nm">${label}</span><span class="vl">${money(val)}</span></div>`;
  const addon=r=>r.key==='gear'||r.key==='install';
  let html='';let first=true;
  groups.forEach(g=>{
    const rows=M.bdRows.filter(r=>r.grp===g.id);if(!rows.length)return;
    const gtot=rows.reduce((a,r)=>a+r.active,0);
    html+=`<div class="bdgrp${first?' first':''}"><div class="gh"><span>${g.t}${g.id==='run'?' · tap to include/exclude':''}</span><span class="gt">${money(gtot)}</span></div>`;first=false;
    if(g.id==='acq'&&M.pay!=='lease'){
      /* vehicle + fees + tax roll up to the drive-away price, then the add-ons */
      rows.filter(r=>!addon(r)).forEach(r=>html+=rowHTML(r));
      html+=ruleHTML('Out-the-door'+(M.pay==='finance'?' (financed)':''),M.otd);
      rows.filter(addon).forEach(r=>html+=rowHTML(r));
    }else{
      rows.forEach(r=>html+=rowHTML(r));
    }
    html+='</div>';
  });
  /* the receipt counts the FULL out-the-door price above, so recovery must be the
     full sale value — not equity (resale − payoff), which would drop the remaining
     loan balance from the arithmetic whenever the hold is shorter than the loan.
     Equity (netResale) stays the right figure for the cash-flow views (chartCum,
     year table, KPIs); here it would break Gross spend − Recovered = True cost. */
  const rec=[];if(M.pay!=='lease')rec.push({l:'Resale value at end',tt:M.remBal>0?'The sale first pays off the remaining '+money(M.remBal)+' loan balance — see the note below':'',v:M.resale});if(M.pay==='finance'&&M.ded>0)rec.push({l:'Tax deduction (total)',v:M.ded});if(M.rebate>0)rec.push({l:'EV incentives / rebates',v:M.rebate});
  const recActive=rec.filter(r=>r.v>0);
  if(recActive.length){
    /* gross spend equals the summed cost lines above; recoveries come back below it */
    html+=ruleHTML('Gross spend',grossActive);
    html+=`<div class="bdgrp"><div class="gh"><span>Recovered later</span><span class="gt">−${money(recActive.reduce((a,r)=>a+r.v,0))}</span></div>`;
    recActive.forEach(r=>{html+=`<div class="bdrow sub"${r.tt?' title="'+r.tt+'"':''}><i style="background:${CC().resale}"></i><span class="nm">${r.l}</span><span class="pc"></span><span class="vl">−${money(r.v)}</span></div>`;});html+='</div>';
  }
  html+=ruleHTML('True cost · '+M.years+' yr'+(M.years===1?'':'s'),M.trueCost,'grand');
  $('bd2').innerHTML=html;
  $('bd2').querySelectorAll('[data-rc]').forEach(b=>b.onclick=()=>{const k=b.dataset.rc;S.rc[k]=S.rc[k]?0:1;calc2();});
  /* row ↔ bar cross-highlighting: hovering a breakdown row spotlights its segment
     in the money-goes bar, and hovering a segment highlights its row */
  const bar=$('costBar2');
  const segs=bar?bar.querySelectorAll('[data-key]'):[];
  $('bd2').querySelectorAll('.bdrow[data-key]').forEach(row=>{
    row.addEventListener('mouseenter',()=>{let hit=false;row.classList.add('hl');
      segs.forEach(sg=>{const on=sg.dataset.key===row.dataset.key;if(on)hit=true;sg.classList.toggle('dim',!on);});
      if(!hit)segs.forEach(sg=>sg.classList.remove('dim'));});   /* toggled-off / recovered rows have no segment */
    row.addEventListener('mouseleave',()=>{row.classList.remove('hl');segs.forEach(sg=>sg.classList.remove('dim'));});
  });
  segs.forEach(sg=>{
    sg.addEventListener('mouseenter',()=>{const row=$('bd2').querySelector(`.bdrow[data-key="${sg.dataset.key}"]`);if(row)row.classList.add('hl');});
    sg.addEventListener('mouseleave',()=>$('bd2').querySelectorAll('.bdrow.hl').forEach(r=>r.classList.remove('hl')));
  });
}

/* ----- export scenario as a chat prompt ----- */
function exportScenario(){
  const M=model2(),e=S.ext,num=id=>+$(id).value||0;
  const veh=(e&&e.vehicleName)||'R2';   /* older snapshots predate the vehicle stamp */
  const L=[];
  L.push('Help me optimize the financing on this Rivian '+veh+' cost scenario. Find the down-payment and loan-term combination that gives the lowest sensible monthly payment WITHOUT tying up more cash in the down payment than necessary — flag where extra down payment stops meaningfully lowering the monthly (diminishing returns). Show the trade-off between monthly payment, total interest paid, and cash up front, and recommend a balanced pick.');
  L.push('');
  L.push('VEHICLE: '+veh+' '+(e?e.trimName:'(unloaded)')+(e?' · '+e.colName+' · '+e.driveLabel:''));
  L.push('Configured price (taxed + financeable): '+money(M.price));
  if(M.tradeValue>0)L.push('Trade-in: '+money(M.tradeValue)+' value'+(M.owedAmt>0?' − '+money(M.owedAmt)+' payoff = '+money(M.netEquity)+' equity'+(M.netEquity<0?' (underwater, rolled into the deal)':''):'')+(M.pay==='lease'?' — applied as a lease cap-cost reduction':''));
  L.push('Gear & accessories ('+(M.finG?'rolled into loan':'upfront cash')+'): '+money(M.gear));
  L.push('Connect+: '+(M.connectAnnual>0?(connectPlanName(M.connectPlanId)+' · '+connectLabel(M.connectPlanId)+' ('+money(M.connectTotal)+' over hold)'):'off'));
  L.push('Out-the-door (after trade + tax + fees): '+money(M.otd));
  L.push('Pay method: '+M.pay.toUpperCase());
  if(M.pay==='finance')L.push('Current financing: '+money(M.down)+' down · '+M.apr+'% APR · '+M.term+'-mo → '+money(M.monthlyPmt)+'/mo, '+money(M.interestHold)+' interest over the hold');
  L.push('Ownership horizon: '+M.years+' yrs at '+M.miles.toLocaleString()+' mi/yr');
  const rc=S.rc,onv=(k,v)=>rc[k]?money(v):'(excluded)';
  L.push('Running costs/yr: insurance '+onv('ins',M.ins)+', maintenance '+onv('maint',M.maint)+', electricity ~'+onv('energy',M.energyAnnual)+', registration+EV '+onv('reg',M.reg)+(M.connectAnnual>0?', Connect+ '+money(M.connectAnnual):''));
  L.push('Resale retained at horizon: '+Math.round(M.resalePctEff*100)+'% (~'+money(M.resale)+')'+(M.resaleAdjPP!==0?' — mileage-adjusted from the '+Math.round(M.resalePct*100)+'% input':''));
  if(M.rebate>0)L.push('EV incentives / rebates (received after purchase): '+money(M.rebate));
  if(M.esc>0)L.push('Running-cost escalation: '+(M.esc*100).toFixed(1)+'%/yr on insurance, maintenance, electricity');
  L.push('Tax: MAGI '+money(num('i2_magi'))+', '+((+$('i2_filing').value===100000)?'single':'married filing jointly')+', '+(M.rate*100).toFixed(0)+'% marginal → est. deduction '+money(M.ded)+' total over 2025–28');
  L.push('True cost over '+M.years+' yrs (net of resale + deduction): '+money(M.trueCost)+' · effective '+money(M.trueCost/M.NM)+'/mo');
  const txt=L.join('\n');
  const ok=()=>{const o=$('exportOk');if(o){o.classList.add('show');setTimeout(()=>o.classList.remove('show'),2800);}};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok,()=>copyFallback(txt,ok));
  else copyFallback(txt,ok);
}
function copyFallback(txt,ok){try{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);ok();}catch(e){window.prompt('Copy this scenario, then paste it into any AI chat:',txt);}}

/* ----- main calc + render for the new tab ----- */
function calc2(){
  hideTip();   /* don't let a hover tooltip outlive the segments it described */
  const M=model2();
  /* results */
  if(M.pay==='lease'){$('r2_otd').textContent=money(M.ld);$('r2_otd_lbl').textContent='Due at signing';$('r2_otd_sub').textContent=(M.netEquity>0?'trade applied · ':M.netEquity<0?'incl. negative equity · ':'')+'up-front on a lease (excl. gear)';$('r2_pay_sub').textContent='to the lessor · '+M.lt+' mo';}
  else{$('r2_otd').textContent=money(M.otd);$('r2_otd_lbl').textContent='Out-the-door';$('r2_otd_sub').textContent=M.netEquity<0?'tax + fees + rolled-in negative equity':(M.tradeValue>0?'after trade + tax + fees':(M.pay==='finance'?'vehicle price + tax + fees':'cash to drive away, day one'));$('r2_pay_sub').textContent=M.pay==='finance'?('to the bank · '+M.term+' mo @ '+M.apr+'%'):'no monthly payment';}
  $('r2_pay').textContent=M.monthlyPmt>0?money(M.monthlyPmt)+'/mo':(M.pay==='lease'?money(M.lp)+'/mo':'—');
  /* finance-gear toggle UI */
  $('finGearAmt').textContent=money(M.gear);
  $('finGearSw').classList.toggle('on',!!S.financeGear);
  $('finGearRow').style.display=(M.pay==='finance'&&M.gear>0)?'flex':'none';
  /* trade-in reveal — collapsed until the user says they have one (auto-opened on hydrate) */
  $('tradeSw').classList.toggle('on',!!S.hasTrade);
  $('tradeFields2').style.display=S.hasTrade?'grid':'none';
  $('r2_years').textContent=M.years;$('o2_years_l').textContent=M.years;$('r2_horizonlbl').textContent='· over '+M.years+' yrs';$('modelHorizon').textContent=M.years+'-year hold · '+M.miles.toLocaleString()+' mi/yr';
  $('r2_true').textContent=money(M.trueCost);
  $('r2_permo').innerHTML=money(M.trueCost/M.NM)+'/mo'+(M.miles>0?'<span class="permi">$'+(M.trueCost/(M.miles*M.years)).toFixed(2)+'/mi</span>':'');
  /* mirror the four sidebar figures + horizon into the fixed scroll-sticky bar
     (guarded so calc2 never throws if the markup is absent). Monthly payment
     leads; the rest follow the sidebar's order and values verbatim. */
  if($('cs_pay')){
    $('cs_pay_lbl').textContent='Monthly payment';
    $('cs_pay').textContent=M.monthlyPmt>0?money(M.monthlyPmt)+'/mo':(M.pay==='lease'?money(M.lp)+'/mo':'—');
    $('cs_pay_sub').textContent=M.pay==='lease'?('to the lessor · '+M.lt+' mo'):(M.pay==='finance'?('to the bank · '+M.term+' mo @ '+M.apr+'%'):'no monthly payment');
    if(M.pay==='lease'){$('cs_otd_lbl').textContent='Due at signing';$('cs_otd').textContent=money(M.ld);}
    else{$('cs_otd_lbl').textContent='Out-the-door';$('cs_otd').textContent=money(M.otd);}
    $('cs_true').textContent=money(M.trueCost);
    $('cs_years_top').textContent=M.years;
    $('cs_permo').textContent=money(M.trueCost/M.NM)+'/mo'+(M.miles>0?' · $'+(M.trueCost/(M.miles*M.years)).toFixed(2)+'/mi':'');
    $('cs_years_l').textContent=M.years;
    $('cs_years_dec').disabled=M.years<=1;   /* stepper bounds mirror #i2_years min/max */
    $('cs_years_inc').disabled=M.years>=12;
  }
  /* deduction box */
  if(M.pay!=='finance'){$('dedBox2').innerHTML='<div class="muted">Only financing qualifies — cash has no interest to deduct, leases are excluded.</div>';}
  else{const th=+$('i2_filing').value||200000,gone=th+50000,who=th===100000?'single':'joint';
    const capLabel=M.cap>=10000?'Full $10,000 / yr':(M.cap<=0?'$0':`Phased to ${money(M.cap)} / yr`);
    let note;if(M.cap<=0)note=`<span class="flag">No benefit at this income.</span> Gone at ${money(gone)} (${who}).`;
    else if(M.cap<M.maxYearInt)note=`Phase-out has pushed the cap below your interest, so the benefit shrinks as income rises — $0 at ${money(gone)}.`;
    else note=`Limited by your actual interest (biggest year ≈ ${money(M.maxYearInt)}), not the cap. Phase-out bites above ~${money(th)} MAGI; $0 at ${money(gone)}.`;
    const perYrSave=(M.cap<=0||!M.dedYears)?0:(M.dedInt/M.dedYears)*M.rate;
    $('dedBox2').innerHTML=`<div class="dl"><span>Deductible interest · total 2025–28</span><b>${money(M.dedInt)}</b></div>`+
      `<div class="dl"><span>Annual cap at this MAGI</span><b>${capLabel}</b></div>`+
      `<div class="dl save"><span>Est. tax saved · <b>cumulative</b> over ${M.dedYears||0} yr${M.dedYears===1?'':'s'}</span><b>${M.cap<=0?'$0':money(M.ded)}</b></div>`+
      `<div class="muted">This is the <b>total</b> across the eligible years, not annual — roughly <b>${money(perYrSave)}/yr</b>. Value = deductible interest × your ${(M.rate*100).toFixed(0)}% rate. ${note}</div>`;}
  /* money-goes bar + grouped, toggleable breakdown */
  const shown=M.buckets.filter(b=>b.v>0).sort((a,b)=>b.v-a.v);const sum=shown.reduce((a,b)=>a+b.v,0)||1;
  const barHTML=shown.map(b=>`<div data-key="${b.key}" data-tip="<b>${b.l}</b><br><b>${money(b.v)}</b> · ${Math.round(b.v/sum*100)}% of ${money(sum)} gross" style="width:${(b.v/sum*100).toFixed(2)}%;background:${b.c}"></div>`).join('');
  $('costBar2').innerHTML=barHTML;
  bindSegTips($('costBar2'),'[data-tip]');
  renderBreakdown2(M);
  const recNames=[];if(M.pay!=='lease'&&M.resale>0)recNames.push('resale');if(M.pay==='finance'&&M.ded>0)recNames.push('the loan-interest deduction');if(M.rebate>0)recNames.push('rebates');
  const payoffNote=(M.pay==='finance'&&M.remBal>0)
    ?` Selling mid-loan: the sale first clears the ${money(M.remBal)} still owed — ${M.netResale>=0?money(M.netResale)+' comes back as equity':'you\'d be '+money(-M.netResale)+' short (underwater)'}.`
    :'';
  /* trade-in equity note (non-lease): underwater rolls into the deal; a payoff nets the value */
  const tradeNote=(M.pay!=='lease')
    ?(M.netEquity<0
      ?` Your trade is underwater — the ${money(M.owedAmt)} payoff tops its ${money(M.tradeValue)} value, so ${money(-M.netEquity)} of negative equity ${M.pay==='finance'?'is rolled into the loan':'is added to your day-one cash'}.`
      :(M.owedAmt>0
        ?` Trade-in equity is ${money(M.netEquity)} — the ${money(M.tradeValue)} value net of the ${money(M.owedAmt)} still owed.`
        :''))
    :'';
  const leaseTradeNote=(M.pay==='lease'&&M.netEquity!==0)
    ?` Your trade’s ${M.netEquity>0?money(M.netEquity)+' equity lowers':money(-M.netEquity)+' negative equity raises'} the due-at-signing as a capitalized-cost reduction.`+(M.leaseCashback>0?` Equity beyond signing (${money(M.leaseCashback)}) would come back as a check.`:'')
    :'';
  $('r2_resaleNote').innerHTML=M.pay==='lease'
    ?'Lease: you return the car — no resale, no deduction. R2 lease terms aren\'t public; treat as placeholders.'+leaseTradeNote
    :(recNames.length
      ?`Amounts under <b>Recovered later</b> (${recNames.join(', ')}) come back after purchase — subtracted above to reach your <b>true cost</b>, but they don\'t lower your day-one cash.`+payoffNote+tradeNote
      :`Up-front is your day-one cash; running costs play out over the ${M.years}-year hold to reach the <b>true cost</b> above.`+tradeNote);
  /* charts + kpis */
  chartCum(M);chartAnnual(M);renderYearTable(M);chartLoan(M);chartDep(M);chartGas(M);renderKPIs(M);
  chartScen();   /* keep the scenario overlay's "current setup" line live */
  updateCostSticky();   /* results-column height may have changed (pay mode, KPIs) — re-pin */
  /* scenario snapshot */
  const terms=M.pay==='finance'?`${M.apr}% · ${M.term} mo · ${money(M.down)} down`:(M.pay==='lease'?`${money(M.lp)}/mo · ${M.lt} mo`:'paid in full');
  S.cur2={pay:M.pay,payLabel:M.pay.charAt(0).toUpperCase()+M.pay.slice(1),years:M.years,terms,
    veh:(S.ext&&S.ext.vehicleName)||'',trim:S.ext?S.ext.trimName:'—',connect:M.connectAnnual>0?connectSummary(M.connectPlanId):'',otd:M.pay==='lease'?M.ld:M.otd,monthly:M.monthlyPmt||(M.pay==='lease'?M.lp:0),
    trueCost:M.trueCost,perMo:M.trueCost/M.NM,perMi:M.miles>0?M.trueCost/(M.miles*M.years):0,
    buckets:shown.map(b=>({v:b.v,c:b.c})),inputs:snap2()};
}
function snap2(){const o={pay:S.pay2,ext:S.ext,loc:S.state2};INPUT_IDS2.forEach(id=>{const el=$(id);if(el)o[id]=el.value;});return o;}

/* URL-safe + Unicode-safe base64 (raw btoa throws on non-ASCII). */
function b64u(str){return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function unb64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)));}

/* ----- "My builds" — localStorage-backed persistence. The public repo has NO
   backend, so builds + #c= shareable links live entirely client-side. ----- */
const BUILDS_KEY='r2_builds_v1';
function loadBuilds(){try{return JSON.parse(localStorage.getItem(BUILDS_KEY))||[];}catch(e){return [];}}
function saveBuilds(){try{localStorage.setItem(BUILDS_KEY,JSON.stringify(S.scenarios2));}catch(e){}}
function refreshScenarios2(){S.scenarios2=loadBuilds();renumberScenarios();renderScenarios2();}
function newScenId(){return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);}
/* Default names are positional labels: A = 1st card, B = 2nd, … matching the chart's
   line colors. They auto-reflow on add/remove so you never get gaps or duplicate letters.
   A name the user has typed (anything not matching this exact pattern) is left alone. */
const SCEN_DEFAULT_RE=/^Scenario (?:[A-Z]|\d+)$/;
const defaultScenName=i=>'Scenario '+(i<26?String.fromCharCode(65+i):(i+1));
function renumberScenarios(){S.scenarios2.forEach((s,i)=>{if(SCEN_DEFAULT_RE.test(s.name))s.name=defaultScenName(i);});}
function saveScenario2(){
  if(!S.cur2)calc2();
  const loc=S.state2;                                       /* selected state code (#3) */
  const encoded=b64u(JSON.stringify({v:1,loc,...snap2()}));  /* same encoding as share links */
  const summary={...S.cur2};delete summary.inputs;           /* display fields only; encoded supersedes inputs */
  S.scenarios2.push({id:newScenId(),name:defaultScenName(S.scenarios2.length),loc,encoded,summary});
  renumberScenarios();
  saveBuilds();renderScenarios2();
}
/* shared hydration core — reused by Load (below) and share-link decode (bootShareLink) */
function hydrate2(inp,loc){
  if(!inp)return;
  if(loc!=null&&STATES[loc]){S.state2=loc;if($('i2_state'))$('i2_state').value=S.state2;syncPropRow();renderStateSets();} /* restore the saved/shared state + its tax/fees (ins/proptax values restored below) */
  S.ext=inp.ext||S.ext;INPUT_IDS2.forEach(k=>{const el=$(k);if(el&&inp[k]!=null)el.value=inp[k];});
  /* re-point Build/Compare at the scenario's source vehicle so "Edit" lands on the right
     one. Gated to live/previewed vehicles: a shared draft link never reveals draft data in
     production — the self-contained ext snapshot still prices correctly on its own. */
  const vid=S.ext&&S.ext.vehicleId;
  if(vid&&vid!==S.vehicle&&VEHICLES[vid]&&liveVehicleIds().includes(vid)){
    selectVehicle(vid);S.heroView='ext';updateVehicleLabel();renderVehicleToggle();renderAll();
  }
  S.hasTrade=((+$('i2_trade').value||0)>0)||((+$('i2_owed').value||0)>0);  /* reveal the trade fields if the loaded scenario carries one */
  S.pay2=inp.pay||S.pay2;$('paySeg2').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.pay===S.pay2));
  syncPayFields();
  $('o2_years_l').textContent=$('i2_years').value;renderLoaded();calc2();
}
/* finance fields (incl. the nested deduction block) only make sense when financing;
   lease fields only when leasing. Cash shows neither. */
function syncPayFields(){
  $('financeFields2').style.display=S.pay2==='finance'?'grid':'none';
  $('leaseFields2').style.display=S.pay2==='lease'?'grid':'none';
  if($('dedWrap2'))$('dedWrap2').style.display=S.pay2==='finance'?'':'none';
}
function loadScenario2(id){const s=S.scenarios2.find(x=>x.id===id);if(!s)return;
  let inp;try{inp=JSON.parse(unb64u(s.encoded));}catch(e){return;}
  hydrate2(inp,s.loc);
  const top=$('view-cost2').querySelector('.panel');if(top&&top.scrollIntoView)top.scrollIntoView({behavior:'smooth',block:'start'});}
/* overlay the saved scenarios' cumulative-cost curves on one plot (≥2 scenarios).
   Each saved payload is decoded and re-run through model2Core — same fallback
   semantics as loading it — plus the current unsaved setup as a dashed gray line. */
function chartScen(){
  const card=$('scenChartCard');if(!card)return;
  const list=S.scenarios2.slice(0,5);
  if(list.length<2){card.style.display='none';return;}
  card.style.display='';
  const P=CC(),colors=[P.teal,P.orange,P.purple,P.blue,P.olive];
  const models=[];
  list.forEach((sc,i)=>{
    let inp;try{inp=JSON.parse(unb64u(sc.encoded));}catch(e){return;}
    models.push({name:sc.name,M:model2Core(valsFromSnapshot(inp,sc.loc)),c:colors[i%colors.length]});
  });
  if(models.length<2){card.style.display='none';return;}
  const cur={name:'Current setup',M:model2(),c:P.gray,dash:1};
  const all=models.concat([cur]);
  const NMmax=Math.max(...all.map(x=>x.M.NM));
  const Vmax=Math.max(...all.map(x=>x.M.grossCum))*1.08||1;
  let s=yAxis(Vmax,GSCEN)+xYears(NMmax/12,NMmax,GSCEN);
  all.forEach(x=>{
    const pts=x.M.cum.map((v,i)=>[xM(i+1,NMmax,GSCEN),yV(v,Vmax,GSCEN)]);
    s+=`<path d="${lineP(pts)}" fill="none" stroke="${x.c}" stroke-width="${x.dash?1.6:2}"${x.dash?' stroke-dasharray="5 3" opacity=".75"':''}/>`;
    const endX=xM(x.M.NM,NMmax,GSCEN),tcY=yV(x.M.trueCost,Vmax,GSCEN),gY=yV(x.M.grossCum,Vmax,GSCEN);
    if(Math.abs(gY-tcY)>1)s+=`<line x1="${endX.toFixed(1)}" y1="${gY.toFixed(1)}" x2="${endX.toFixed(1)}" y2="${tcY.toFixed(1)}" stroke="${x.c}" stroke-dasharray="3 2" opacity=".6"/>`;
    s+=`<circle class="cdot" cx="${endX.toFixed(1)}" cy="${tcY.toFixed(1)}" r="3.2" fill="${x.c}"/>`;
  });
  $('chartScen').innerHTML=frameSVG(s,GSCEN)+legendRow(all.map(x=>({c:x.c,t:x.name+' · '+fmtK(x.M.trueCost),ln:x.dash})));
  bindChartHover($('chartScen'),NMmax,m=>{
    const live=all.filter(x=>m<=x.M.NM);
    if(!live.length)return null;
    return {tip:`${moLabel(m)}<br>`+live.map(x=>`${x.name}: <b>${money(x.M.cum[m-1])}</b>`).join('<br>'),
      dots:live.map(x=>[yV(x.M.cum[m-1],Vmax,GSCEN),x.c])};
  },undefined,GSCEN);
  $('scenSub').textContent=models.length+' saved'+(S.scenarios2.length>5?' (first 5)':'');
  $('scenCap').innerHTML='Each line is cumulative cash out; the dashed drop lands on that scenario\'s <b>net true cost</b>. The gray dashed line is your current, unsaved setup.';
}
function renderScenarios2(){
  chartScen();
  const wrap=$('scenWrap2');
  if(!S.scenarios2.length){wrap.innerHTML='<div class="scenempty">No scenarios yet. Adjust inputs, then hit <b>Save current setup</b>.</div>';$('clearScen2').hidden=true;return;}
  $('clearScen2').hidden=false;
  const costs=S.scenarios2.map(s=>s.summary.trueCost),min=Math.min(...costs),multi=S.scenarios2.length>1;
  /* line colors mirror chartScen(): assigned by position, first 5 only, and only once
     the overlay is drawn (≥2 saved) — so each card's dot matches its curve. */
  const P=CC(),lineColors=[P.teal,P.orange,P.purple,P.blue,P.olive],charted=S.scenarios2.length>=2;
  wrap.innerHTML='<div class="scengrid">'+S.scenarios2.map((s,i)=>{const u=s.summary;const best=multi&&u.trueCost===min;const sum=u.buckets.reduce((a,b)=>a+b.v,0)||1;
    const bar=u.buckets.map(b=>`<div style="width:${(b.v/sum*100).toFixed(1)}%;background:${b.c}"></div>`).join('');
    const delta=(multi&&!best)?`<div class="scdelta">+${money(u.trueCost-min)} vs cheapest</div>`:'';
    const dotC=(charted&&i<5)?lineColors[i]:null;
    const dot=dotC?`<i class="scdot" style="background:${dotC}"></i>`:'';
    return `<div class="scencard${best?' best':''}">${best?'<span class="sctag">Lowest true cost</span>':''}
      <div class="scnamerow">${dot}<input class="scname" value="${s.name.replace(/"/g,'&quot;')}" data-id="${s.id}" aria-label="Scenario name"></div>
      <div class="scpay">${(u.veh?u.veh+' ':'')+u.trim} · ${u.payLabel} · ${u.years} yr · ${u.terms}${u.connect?' · '+u.connect:''}</div>
      <div class="sctrue">${money(u.trueCost)}</div><div class="sctruelbl">true cost over ${u.years} yrs</div>
      <div class="scbar">${bar}</div>
      <div class="scrow"><span>${u.pay==='lease'?'Due at signing':'Out-the-door'}</span><b>${money(u.otd)}</b></div>
      <div class="scrow"><span>Monthly</span><b>${u.monthly>0?money(u.monthly):'—'}</b></div>
      <div class="scrow"><span>Effective</span><b>${money(u.perMo)}/mo${u.perMi>0?' · $'+u.perMi.toFixed(2)+'/mi':''}</b></div>
      ${delta}<div class="scact"><button class="scload" data-id="${s.id}">Load</button><button class="scdel" data-id="${s.id}">Remove</button></div></div>`;
  }).join('')+'</div>';
  wrap.querySelectorAll('.scload').forEach(b=>b.onclick=()=>loadScenario2(b.dataset.id));
  wrap.querySelectorAll('.scdel').forEach(b=>b.onclick=()=>{S.scenarios2=S.scenarios2.filter(x=>x.id!==b.dataset.id);renumberScenarios();saveBuilds();renderScenarios2();});
  wrap.querySelectorAll('.scname').forEach(inp=>inp.onchange=()=>{const s=S.scenarios2.find(x=>x.id===inp.dataset.id);if(s){s.name=inp.value;saveBuilds();renderScenarios2();}});
}

/* ---------------- CHANGELOG ---------------- */
const CL_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const clDate=iso=>{const[y,m,d]=iso.split('-').map(Number);return CL_MONTHS[m-1]+' '+d+', '+y;};
function renderChangelog(){
  const root=$('view-changelog');root.innerHTML='';
  const panel=document.createElement('div');panel.className='panel changelog';
  const h=document.createElement('h2');h.textContent='Changelog';panel.appendChild(h);
  // newest-first; sort defensively even though data is authored newest-first
  const entries=CHANGELOG.slice().sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:0);
  if(entries.length){
    const upd=document.createElement('p');upd.className='cl-updated';
    upd.textContent='Last updated '+clDate(entries[0].date);panel.appendChild(upd);
  }
  entries.forEach(en=>{
    const e=document.createElement('div');e.className='cl-entry';
    const head=document.createElement('div');head.className='cl-head';
    const dt=document.createElement('span');dt.className='cl-date';dt.textContent=clDate(en.date);
    head.appendChild(dt);
    e.appendChild(head);
    const ul=document.createElement('ul');ul.className='cl-list';
    (en.changes||[]).forEach(c=>{
      const li=document.createElement('li');
      if(c&&typeof c==='object'){
        if(c.config){const tag=document.createElement('span');tag.className='cl-tag';tag.textContent='Config';li.appendChild(tag);}
        li.appendChild(document.createTextNode(c.text||''));
      }else{li.textContent=c;}
      ul.appendChild(li);
    });
    e.appendChild(ul);panel.appendChild(e);
  });
  const foot=document.createElement('p');foot.className='cl-foot';
  const a=document.createElement('a');a.href='https://github.com/mmocniak/r2-configurator';
  a.target='_blank';a.rel='noopener';a.textContent='Contribute on GitHub ↗';
  foot.appendChild(a);
  foot.appendChild(document.createTextNode(' · '));
  const r=document.createElement('a');r.href='https://www.reddit.com/r/RivianR2/';
  r.target='_blank';r.rel='noopener';r.textContent='Discuss on r/RivianR2 ↗';
  foot.appendChild(r);
  foot.appendChild(document.createTextNode(' · '));
  const r2=document.createElement('a');r2.href='https://www.reddit.com/r/Rivian/';
  r2.target='_blank';r2.rel='noopener';r2.textContent='r/Rivian ↗';
  foot.appendChild(r2);panel.appendChild(foot);
  root.appendChild(panel);
}

/* ---------------- WIRING ---------------- */
function renderAll(){renderTrims();renderHero();renderBranches();renderSummary();renderCompare();}
/* ----- vehicle switch (data-gated: only ≥2 live vehicles renders the toggle) ----- */
function renderVehicleToggle(){
  const host=$('vehicleToggle');if(!host)return;
  const ids=liveVehicleIds();
  if(ids.length<2){host.hidden=true;host.innerHTML='';return;}   /* one live vehicle → no toggle, app looks like today */
  host.hidden=false;
  host.innerHTML=ids.map(id=>{
    const v=VEHICLES[id],draft=!!v.draft;   /* draft only reaches here in preview mode — badge it so it's never mistaken for shipped data */
    return `<button type="button" class="vehbtn${id===S.vehicle?' on':''}${draft?' draft':''}" data-veh="${id}" role="tab" aria-selected="${id===S.vehicle}"${draft?' title="Draft — unverified preview data"':''}>${v.name}${draft?'<span class="vehdraft">draft</span>':''}</button>`;
  }).join('');
  host.querySelectorAll('.vehbtn').forEach(b=>b.onclick=()=>switchVehicle(b.dataset.veh));
}
function updateVehicleLabel(){
  const y=document.querySelector('header.top h1 .y');if(y)y.textContent=CUR_VEHICLE.name;
  const sub=document.querySelector('header.top .sub');if(sub)sub.innerHTML=`Build a ${CUR_VEHICLE.name}, compare trims, and estimate all-in ownership cost for <b>your state</b>.`;
}
function switchVehicle(id){
  if(id===S.vehicle||!VEHICLES[id])return;
  selectVehicle(id);
  S.heroView='ext';
  S.ext=null;                 /* cost tab re-derives from the new vehicle's build on entry */
  updateVehicleLabel();
  renderVehicleToggle();
  renderAll();
  if($('view-cost2')&&$('view-cost2').classList.contains('active')){applyExt();refreshScenarios2();}
  resetPageScroll();
}
function resetPageScroll(){
  try{window.scrollTo({top:0,left:0,behavior:'auto'});}
  catch(e){window.scrollTo(0,0);}
  document.documentElement.scrollTop=0;
  document.body.scrollTop=0;
}
document.querySelectorAll('.tab').forEach(tb=>tb.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  $('navChangelog').classList.remove('active');
  $('navMore').classList.remove('active');
  tb.classList.add('active');$('view-'+tb.dataset.tab).classList.add('active');
  if(tb.dataset.tab==='compare'){
    TRIM_KEYS.forEach(k=>{
      S.cmpColor[k]=TRIMS[k].colors.includes(S.color)?S.color:TRIMS[k].colors[0];
      S.cmpInterior[k]=TRIMS[k].interior.some(i=>i.id===S.interior)?S.interior:TRIMS[k].interior[0].id;
      /* wheels only carry to the trim actually built: the same wheel id can be included
         on one trim but a paid upgrade on another (e.g. 21" is Performance's default
         but +$2,000 on Premium), so broadcasting it would silently upcharge columns */
      S.cmpWheel[k]=(k===S.trim&&TRIMS[k].wheels.some(w=>w.id===S.wheel))?S.wheel:TRIMS[k].wheels[0].id;
      S.cmpConnectPlus[k]=S.connectPlus;
    });
    if(TRIMS[S.trim].drives)S.cmpDrive[S.trim]=S.drive;
    renderCompare();
  }
  if(tb.dataset.tab==='cost2'){applyExt();refreshScenarios2();}
  resetPageScroll();
  updateCostSticky();   /* hide the bar when leaving cost2; re-evaluate scroll position on entry */
});
function showChangelog(){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  $('view-changelog').classList.add('active');
  $('navChangelog').classList.add('active');
  $('navMore').classList.add('active');   // mirror active state onto the ⋯ button (phones)
  resetPageScroll();
}
$('navChangelog').onclick=showChangelog;
/* ⋯ overflow menu (phones): open/close + forward to existing actions */
const moreBtn=$('navMore'), moreMenu=$('navMoreMenu');
const closeMore=()=>{moreMenu.hidden=true;moreBtn.setAttribute('aria-expanded','false');};
moreBtn.onclick=e=>{
  e.stopPropagation();
  const open=moreMenu.hidden;
  moreMenu.hidden=!open;
  moreBtn.setAttribute('aria-expanded',String(open));
};
$('navChangelogM').onclick=()=>{closeMore();showChangelog();};
moreMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMore)); // configurator link
document.addEventListener('click',e=>{if(!moreMenu.hidden && !e.target.closest('.tabmore'))closeMore();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMore();});
/* Community flyout (desktop): same open/close pattern as the ⋯ menu */
const comBtn=$('navCommunity'), comMenu=$('navCommunityMenu');
const closeCommunity=()=>{comMenu.hidden=true;comBtn.setAttribute('aria-expanded','false');};
comBtn.onclick=e=>{
  e.stopPropagation();
  const open=comMenu.hidden;
  comMenu.hidden=!open;
  comBtn.setAttribute('aria-expanded',String(open));
};
comMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeCommunity));
document.addEventListener('click',e=>{if(!comMenu.hidden && !e.target.closest('.tabflyout'))closeCommunity();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCommunity();});
$('toCost').onclick=launchCost2FromBuild;
$('toCompare').onclick=()=>document.querySelector('.tab[data-tab="compare"]').click();
$('resetBuild').onclick=resetBuild;
$('resetCompare').onclick=resetCompare;
/* hero exterior/interior view toggle — only the hero needs updating, so call renderHero directly */
$('heroView').onclick=e=>{const b=e.target.closest('button[data-view]');if(!b)return;S.heroView=b.dataset.view;renderHero();};
$('clearGear').onclick=()=>{S.accBundle.clear();renderAll();};
$('clearBuildGear').onclick=()=>{S.accBundle.clear();renderAll();};
/* cost-over-time tab wiring */
$('paySeg2').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  S.pay2=b.dataset.pay;
  $('paySeg2').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
  syncPayFields();
  calc2();
});
INPUT_IDS2.forEach(id=>{const el=$(id);if(el)el.addEventListener('input',calc2);});
/* state picker: populate the <select> from STATES (option value = 2-letter code), alphabetical by name */
$('i2_state').innerHTML=Object.keys(STATES).sort((a,b)=>STATES[a].name<STATES[b].name?-1:1).map(c=>`<option value="${c}">${STATES[c].name}</option>`).join('');
$('i2_state').value=S.state2;syncPropRow();renderStateSets();
$('i2_state').addEventListener('change',()=>{
  const code=$('i2_state').value;
  if(STATES[code]&&code!==S.state2){S.state2=code;applyStateDefaults();} /* refresh editable ins/propTax + toggle prop-tax row */
  calc2();
});
$('i2_years').addEventListener('input',()=>$('o2_years_l').textContent=$('i2_years').value);
/* horizon stepper in the fixed cost bar → clamp, write the source-of-truth input,
   then re-render once. One discrete calc2() per click, so no drag jank. */
function stepHorizon(delta){
  const y=Math.max(1,Math.min(12,(+$('i2_years').value||6)+delta));
  $('i2_years').value=y;              /* #i2_years is the source of truth */
  $('o2_years_l').textContent=y;      /* instant feedback on the down-page label */
  calc2();                            /* re-render once; calc2 mirrors value + bounds back into the stepper */
}
if($('cs_years_dec'))$('cs_years_dec').onclick=()=>stepHorizon(-1);
if($('cs_years_inc'))$('cs_years_inc').onclick=()=>stepHorizon(1);
$('finGearSw').onclick=()=>{S.financeGear=!S.financeGear;calc2();};
$('tradeSw').onclick=()=>{S.hasTrade=!S.hasTrade;if(!S.hasTrade){$('i2_trade').value=0;$('i2_owed').value=0;}calc2();};
$('exportScen').onclick=exportScenario;
$('copyShare').onclick=copyShareLink;
$('saveScen2').onclick=saveScenario2;
$('clearScen2').onclick=()=>{S.scenarios2=[];saveBuilds();renderScenarios2();};

/* ----- share link: build the #c= URL and copy it (does not touch the live hash) ----- */
function copyShareLink(){
  ensureExt();if(!S.cur2)calc2();
  const loc=S.state2;
  const url=location.href.split('#')[0]+'#c='+encodeURIComponent(b64u(JSON.stringify({v:1,loc,...snap2()})));
  const ok=()=>{const o=$('shareOk');if(o){o.classList.add('show');setTimeout(()=>o.classList.remove('show'),2800);}};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(ok,()=>copyFallback(url,ok));
  else copyFallback(url,ok);
}
/* decode #c= on load: hydrate the cost build from a shared link */
function bootShareLink(){
  const m=(location.hash||'').match(/^#c=(.+)$/);if(!m)return;
  let data;try{data=JSON.parse(unb64u(decodeURIComponent(m[1])));}catch(e){return;}
  if(!data||data.v!==1)return;
  S.ext=data.ext||S.ext;if(data.loc!=null&&STATES[data.loc])S.state2=data.loc;   /* set state before the cost tab renders; hydrate2 re-affirms it */
  const tab=document.querySelector('.tab[data-tab="cost2"]');if(tab)tab.click();
  hydrate2(data,data.loc);
}

renderVehicleToggle();
renderAll();
renderChangelog();
refreshScenarios2();
bootShareLink();
updateCostSticky();   /* cover a share link that deep-links into the cost tab already scrolled down */
window.addEventListener('scroll',()=>{updateMobileCmpHead();updateCostSticky();},{passive:true});
window.addEventListener('resize',()=>{updateMobileCmpHead();updateCostSticky();});
/* follow OS light/dark live: CSS vars flip on their own; re-render the charts
   so their JS-baked data colors re-pick from the theme palette. Guarded on
   S.cur2 so it's a no-op until the cost tab has rendered at least once. */
if(DARKQ){
  const onScheme=()=>{if(S.cur2)calc2();};
  if(DARKQ.addEventListener)DARKQ.addEventListener('change',onScheme);
  else if(DARKQ.addListener)DARKQ.addListener(onScheme); /* older Safari */
}
