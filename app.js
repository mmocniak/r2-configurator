/* ---------------- DATA (verified on rivian.com/r2, June 2026) ---------------- */
const IMG='https://media.rivian.com/image/upload/';
function chipURL(code){return IMG+'dpr_auto/f_auto/w_72,q_auto:good,f_auto,c_lfill/v4/gold-iris/visualizer/color-chips/'+code;}
/* wheel selector swatch (WHEEL_SWATCH map lives in data/vehicle.js) — no parametric
   wheel-chip path exists, so we hotlink the swatch Rivian serves per wheel code */
function wheelURL(code){return IMG+'dpr_auto/f_auto/w_120,q_auto:good,c_lfill/'+WHEEL_SWATCH[code];}
function interiorURL(code){return IMG+'dpr_auto/f_auto/w_72,q_auto:good,f_auto,c_lfill/v4/gold-iris/trims/interior-finishes-chips/'+code;}
function heroURL(trim,wheel,color){return IMG+'dpr_auto/f_auto/q_auto:good,f_auto,c_lfill/v4/gold-iris/visualizer/360/'+trim+'/'+wheel+'/'+color+'/00001.png';}
/* interior cabin photo (CABINS map lives in data/vehicle.js) — no parametric interior
   visualizer exists, so we hotlink the studio shot Rivian serves per interior code */
function cabinURL(code){return IMG+'dpr_auto/f_auto/q_auto:good,c_limit,w_1040/'+CABINS[code];}

/* --- vehicle + accessory data moved to data/vehicle.js --- */
const FEES={destination:1495,doc:377};/* national fees only; tax/title/reg/evFee are per-state (see LOC) */

/* ---------------- STATE ---------------- */
const S={trim:'standard',drive:'rwd',color:'esker',wheel:'19a',interior:'sbc',heroView:'ext',addons:new Set(),state2:'NC',
  cmpColor:{standard:'esker',premium:'esker',performance:'esker'},
  cmpInterior:{standard:'sbc',premium:'pbc',performance:'pbc'},
  cmpWheel:{standard:'19a',premium:'20b',performance:'21b'},
  cmpDrive:'rwd',cmpAddons:{standard:new Set(),premium:new Set(),performance:new Set()},
  accBundle:new Set()};
/* add-ons surfaced as selectable rows in the compare matrix (the Launch-included pair) */
const CMP_ADDONS=ADDONS.filter(a=>a.launchInc);
/* accessories sourced from the trim-comparison sheet (Gear Shop / configurator, June 2026) */
/* --- accessory catalog moved to data/vehicle.js --- */

/* ---------------- HELPERS ---------------- */
const $=id=>document.getElementById(id);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
/* theme-aware chart palette — dark values kick in with the OS scheme. Chart DATA
   colors (baked into SVG/inline styles) read these instead of hardcoded hex; the
   chart CHROME — axes/labels/legend — already flips via CSS vars. Evaluated per
   render so an OS theme flip is reflected on the next calc2(). */
const DARKQ=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)');
const CHART_LIGHT={yellow:'#f4cf17',gray:'#7b8794',blue:'#4f8fd0',red:'#d6453f',
  teal:'#1f7f8c',orange:'#d6783f',green:'#1f9d57',olive:'#b5790a',purple:'#9166cc',
  resale:'#cdd5dd',navy:'#1d2733',statetax:'#c9547d',
  tealFill:'rgba(31,127,140,.12)',tealFill2:'rgba(31,127,140,.16)',
  redFill:'rgba(214,69,63,.14)',redFillLt:'rgba(214,69,63,.07)',
  greenFill:'rgba(31,157,87,.10)',redGlow:'rgba(214,69,63,.5)'};
const CHART_DARK={yellow:'#f4cf17',gray:'#8f9caa',blue:'#5fa0e0',red:'#e8635d',
  teal:'#3fb2c0',orange:'#e0895a',green:'#3cc274',olive:'#d9a63a',purple:'#a986d8',
  resale:'#5a6673',navy:'#e6ecf2',statetax:'#e07aa0',
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
  rack:'<path d="M3 7h18"/><path d="M3 17h18"/><path d="M6 7v10"/><path d="M12 7v10"/><path d="M18 7v10"/>',
  mats:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18"/><path d="M4 9h4"/><path d="M4 15h4"/>',
  box:'<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
  monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
  tablet:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
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

/* keep selections valid when trim changes */
function reconcile(){
  const t=curTrim();
  if(t.drives&&!t.drives.find(d=>d.id===S.drive))S.drive=t.drives[0].id;
  if(!t.colors.includes(S.color))S.color='esker';
  if(!t.wheels.find(w=>w.id===S.wheel))S.wheel=t.wheels[0].id;
  if(!t.interior.find(i=>i.id===S.interior))S.interior=t.interior[0].id;
}

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
    d.onclick=()=>{S.trim=k;S.heroView='ext';reconcile();renderAll();};
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
  const price=o.price===null?'':(o.price>0?`+<b>${money(o.price)}</b>`:`<b>Included</b>`);
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
    label:i.name,price:i.price,sel:S.interior===i.id,chip:'interior',code:i.code,hex:(i.id==='pcc'?'#c9cfca':'#2c2c2e'),tag:i.note||'',avail:i.avail,
    onclick:()=>{S.interior=i.id;S.heroView='int';renderAll();}}))));

  const groups={};ADDONS.forEach(a=>{(groups[a.grp]=groups[a.grp]||[]).push(a);});
  const grpIcon={'Driver assistance':'steeringWheel','Towing & utility':'caravan'};
  Object.entries(groups).forEach(([g,items])=>{
    host.appendChild(branch(ico(grpIcon[g]||'zap'),g,'',items.map(a=>{
      const inc=t.autoIncl&&a.launchInc;
      return {label:a.name,price:inc?0:a.price,sel:inc||S.addons.has(a.id),locked:inc,
        tag:inc?'Included (Launch)':'',
        onclick:inc?null:()=>{S.addons.has(a.id)?S.addons.delete(a.id):S.addons.add(a.id);renderAll();}};
    })));
  });

  const lk=document.createElement('div');lk.className='note';
  lk.innerHTML=`Accessories &amp; gear: <a href="https://rivian.com/gear-shop" target="_blank" rel="noopener">Rivian Gear Shop ↗</a> · Driver assist: <a href="https://rivian.com/autonomy" target="_blank" rel="noopener">Autonomy+ ↗</a>`;
  host.appendChild(lk);
}

/* ---------------- BUILD: price + summary ---------------- */
function configuredPrice(){
  const t=curTrim();let p=t.price;
  const d=curDrive();if(d)p+=d.price;
  p+=COLORS[S.color].price;
  p+=curWheel().price;
  p+=(t.interior.find(i=>i.id===S.interior)||{price:0}).price;
  ADDONS.forEach(a=>{const inc=t.autoIncl&&a.launchInc;if(!inc&&S.addons.has(a.id))p+=a.price;});
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
  ADDONS.forEach(a=>{const inc=t.autoIncl&&a.launchInc;if(!inc&&S.addons.has(a.id))add(a.name,a.price);});
  lines.push(`<div class="sumline tot"><span>Configured price</span><span>${money(price)}</span></div>`);
  const gear=accBundleTotal();if(gear)lines.push(`<div class="sumline"><span>Gear &amp; accessories</span><span>+${money(gear)}</span></div>`);
  $('sumLines').innerHTML=lines.join('');
}

/* ---------------- COMPARE ---------------- */
/* per-column selections: each trim carries its own paint + interior; Standard also its own drive system */
function cmpDriveObj(){return TRIMS.standard.drives.find(d=>d.id===S.cmpDrive)||TRIMS.standard.drives[0];}
function cmpColorId(k){const c=S.cmpColor[k];return TRIMS[k].colors.includes(c)?c:TRIMS[k].colors[0];}
function cmpIntObj(k){const t=TRIMS[k];return t.interior.find(i=>i.id===S.cmpInterior[k])||t.interior[0];}
function cmpWheelObj(k){const t=TRIMS[k];return t.wheels.find(w=>w.id===S.cmpWheel[k])||t.wheels[0];}
function intHex(id){return id==='pcc'?'#c9cfca':'#2c2c2e';}
function cmpAddonTotal(k){
  const t=TRIMS[k];let sum=0;
  CMP_ADDONS.forEach(a=>{const inc=t.autoIncl&&a.launchInc;if(!inc&&S.cmpAddons[k].has(a.id))sum+=a.price;});
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
  if(k==='standard'){driveObj=cmpDriveObj();drive=driveObj.price;}
  const addon=cmpAddonTotal(k);const acc=accBundleTotal();
  const vehicle=t.price+drive+paint+interior+wheel+addon;
  return {price:vehicle+acc,vehicle,colId,c,io,paint,interior,wo,wheel,drive,driveObj,addon,acc};
}
function miniChip(code,hex,interior){return `<span class="chip mini" style="background:${hex}"><img src="${(interior?interiorURL:chipURL)(code)}" loading="lazy" onerror="this.style.display='none'"></span>`;}
/* interactive per-column selector cells (swatches live in the matrix) */
function selRow(label,kind){
  return `<tr class="cfgrow"><td class="lab cfg-lab">${label}</td>${selCell('standard',kind)}${selCell('premium',kind)}${selCell('performance',kind)}</tr>`;
}
function priceTag(p){return p>0?`<span class="opx add">+${money(p)}</span>`:`<span class="opx free">incl.</span>`;}
function selCell(k,kind){
  const cls=k==='performance'?'perfcol ':'';
  if(kind==='drive'){
    if(k!=='standard')return `<td class="${cls}"><div class="optlist"><div class="optchip ro"><span class="onm">Dual-motor AWD</span><span class="onote">not configurable</span></div></div></td>`;
    const chips=TRIMS.standard.drives.map(d=>
      `<div class="optchip${S.cmpDrive===d.id?' sel':''}" data-sw="drive" data-k="${k}" data-id="${d.id}" title="${d.name} · ${d.sub}"><span class="onm">${d.drive} · ${d.sub}</span>${priceTag(d.price)}</div>`
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
  return `<tr class="cfgrow"><td class="lab cfg-lab">${label}</td>${addonCell('standard',id,price)}${addonCell('premium',id,price)}${addonCell('performance',id,price)}</tr>`;
}
function addonCell(k,id,price){
  const cls=k==='performance'?'perfcol ':'';
  const a=ADDONS.find(x=>x.id===id);
  if(TRIMS[k].autoIncl&&a.launchInc)
    return `<td class="${cls}"><div class="optlist"><div class="optchip sel ro"><span class="onm">Included</span><span class="onote">with Launch Edition</span></div></div></td>`;
  const on=S.cmpAddons[k].has(id);
  return `<td class="${cls}"><div class="optlist"><div class="optchip toggle${on?' sel':''}" data-add="${id}" data-k="${k}" title="${a.name}">${on?`<span class="ack">${ico('check',11)}</span>`:''}<span class="onm">${on?'Added':'Add'}</span>${priceTag(price)}</div></div></td>`;
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
  const c={standard:trimCfg('standard'),premium:trimCfg('premium'),performance:trimCfg('performance')};
  const min=Math.min(c.standard.price,c.premium.price,c.performance.price);
  const anyAcc=['standard','premium','performance'].some(k=>c[k].acc>0);
  const cell=k=>totalCell(k,c[k],c[k].price===min,anyAcc);
  return `<tr class="totalrow"><td class="lab">Total</td>${cell('standard')}${cell('premium')}${cell('performance')}</tr>`;
}
function renderCompare(){
  const host=$('cmpCards');host.innerHTML='';
  [['standard',''],['premium',''],['performance',' perf']].forEach(([k,cls])=>{
    const t=TRIMS[k];const cfg=trimCfg(k);
    const colId=cfg.colId;const w=cfg.wo;const io=cfg.io;const hex=intHex(io.id);
    const availTxt=k==='standard'?cfg.driveObj.avail:t.avail;
    const brk=`${money(t.price)} base${cfg.drive?` + ${money(cfg.drive)} drive`:''}${cfg.paint?` + ${money(cfg.paint)} paint`:''}${cfg.wheel?` + ${money(cfg.wheel)} wheels`:''}${cfg.interior?` + ${money(cfg.interior)} interior`:''}${cfg.addon?` + ${money(cfg.addon)} add-ons`:''}${cfg.acc?` + ${money(cfg.acc)} accessories`:''}`;
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
      <button class="btn cmplaunch" data-launch="${k}" style="margin-top:13px">See cost over time <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>`;
    host.appendChild(card);
  });
  host.querySelectorAll('[data-launch]').forEach(b=>b.onclick=()=>launchCost2(b.dataset.launch));
  $('cmpMatrix').innerHTML=buildMatrix();
  $('cmpMatrix').querySelectorAll('[data-sw]').forEach(el=>el.onclick=()=>{
    const k=el.dataset.k,kind=el.dataset.sw,id=el.dataset.id;
    if(kind==='color')S.cmpColor[k]=id;else if(kind==='interior')S.cmpInterior[k]=id;else if(kind==='wheel')S.cmpWheel[k]=id;else if(kind==='drive')S.cmpDrive=id;
    renderCompare();
  });
  $('cmpMatrix').querySelectorAll('[data-add]').forEach(el=>el.onclick=()=>{
    const k=el.dataset.k,id=el.dataset.add;
    S.cmpAddons[k].has(id)?S.cmpAddons[k].delete(id):S.cmpAddons[k].add(id);
    renderCompare();
  });
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
/* fixed cost-summary bar: show once the charts section reaches the viewport top on the active cost tab */
function updateCostSticky(){
  const view=$('view-cost2'),bar=$('coststicky'),sec=$('costModelSection');
  if(!view||!bar||!sec)return;
  if(!view.classList.contains('active')){bar.classList.remove('show');bar.setAttribute('aria-hidden','true');return;}
  const show=sec.getBoundingClientRect().top<=0;   /* charts reached the top → summary scrolled away */
  bar.classList.toggle('show',show);
  bar.setAttribute('aria-hidden',show?'false':'true');
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
function mobileCmpRow(label,klass,s,p,f){
  return `<div class="mobile-cmp-row ${klass}"><div class="mobile-cmp-label">${label}</div><div class="mobile-cmp-values">${mobileCmpCell('standard',s)}${mobileCmpCell('premium',p)}${mobileCmpCell('performance',f)}</div></div>`;
}
function mobileCmpDivider(label,klass=''){
  return `<div class="mobile-cmp-divider ${klass}">${label}</div>`;
}
function mobileCmpHead(totals){
  const cells=['standard','premium','performance'].map(k=>{
    const t=TRIMS[k],cfg=totals[k];
    return `<div class="mobile-cmp-headcell"><span>${t.short}</span><b>${money(cfg.vehicle)}</b></div>`;
  }).join('');
  const visual=['standard','premium','performance'].map(k=>{
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
  const ids=Object.keys(COLORS).filter(id=>['standard','premium','performance'].some(k=>TRIMS[k].colors.includes(id)));
  return mobileOptGroup('Paint',ids.map(id=>{
    const o=COLORS[id];
    const sw=`<span class="mobile-opt-swatch" style="background:${o.hex}"><img src="${chipURL(o.code)}" loading="lazy" onerror="this.style.display='none'"></span>${o.name}`;
    const cells=['standard','premium','performance'].map(k=>{
      const supported=TRIMS[k].colors.includes(id);
      return mobileOptCell(k,{kind:'color',id,label:o.price?`+${money(o.price)}`:'Included',selected:cmpColorId(k)===id,unavailable:!supported});
    });
    return mobileOptRow(sw,cells);
  }).join(''));
}
function mobileWheelGroup(){
  const seen=new Set(),opts=[];
  ['standard','premium','performance'].forEach(k=>TRIMS[k].wheels.forEach(w=>{if(!seen.has(w.id)){seen.add(w.id);opts.push(w);}}));
  return mobileOptGroup('Wheels',opts.map(w=>{
    const label=`<span class="mobile-opt-swatch wheel"><img src="${wheelURL(w.code)}" loading="lazy" onerror="this.style.display='none'"></span>${w.name}`;
    const cells=['standard','premium','performance'].map(k=>{
      const tw=TRIMS[k].wheels.find(x=>x.id===w.id);
      return mobileOptCell(k,{kind:'wheel',id:w.id,label:tw?(tw.price?`+${money(tw.price)}`:'Included'):'—',selected:tw&&cmpWheelObj(k).id===w.id,unavailable:!tw});
    });
    return mobileOptRow(label,cells);
  }).join(''));
}
function mobileInteriorGroup(){
  const seen=new Set(),opts=[];
  ['standard','premium','performance'].forEach(k=>TRIMS[k].interior.forEach(i=>{if(!seen.has(i.id)){seen.add(i.id);opts.push(i);}}));
  return mobileOptGroup('Interior',opts.map(i=>{
    const label=`<span class="mobile-opt-swatch" style="background:${intHex(i.id)}"><img src="${interiorURL(i.code)}" loading="lazy" onerror="this.style.display='none'"></span>${i.name}`;
    const cells=['standard','premium','performance'].map(k=>{
      const ti=TRIMS[k].interior.find(x=>x.id===i.id);
      return mobileOptCell(k,{kind:'interior',id:i.id,label:ti?(ti.price?`+${money(ti.price)}`:'Included'):'—',selected:ti&&cmpIntObj(k).id===i.id,unavailable:!ti,readonly:!!ti&&TRIMS[k].interior.length<2});
    });
    return mobileOptRow(label,cells);
  }).join(''));
}
function mobileDriveGroup(){
  return mobileOptGroup('Drive system',TRIMS.standard.drives.map(d=>{
    const std=mobileOptCell('standard',{kind:'drive',id:d.id,label:d.price?`+${money(d.price)}`:'Included',selected:S.cmpDrive===d.id});
    const awd=d.id==='awdlr';
    const fixed=mobileOptCell('premium',{label:awd?'Included':'—',selected:awd,unavailable:!awd,readonly:true});
    const perf=mobileOptCell('performance',{label:awd?'Included':'—',selected:awd,unavailable:!awd,readonly:true});
    return mobileOptRow(`${d.drive} · ${d.sub}`,[std,fixed,perf]);
  }).join(''));
}
function mobileAddonGroup(){
  return mobileOptGroup('Packages',CMP_ADDONS.map(a=>{
    const cells=['standard','premium','performance'].map(k=>{
      const inc=TRIMS[k].autoIncl&&a.launchInc;
      const on=S.cmpAddons[k].has(a.id);
      return mobileOptCell(k,{id:a.id,label:inc?'Launch Edition':on?'Added':`+${money(a.price)}`,selected:inc||on,readonly:inc,add:true});
    });
    return mobileOptRow(a.name,cells);
  }).join(''));
}
function totalCell(k,cfg,best,anyAcc){
  const cls=k==='performance'?'perfcol ':'';
  const receipt=cfg.acc>0
    ?`<div class="trcpt"><div class="trln"><span>Vehicle</span><span>${money(cfg.vehicle)}</span></div><div class="trln"><span>+ Accessories</span><span>${money(cfg.acc)}</span></div></div>`
    :'';
  const tag=(best?'lowest ':'')+(anyAcc?'total':'as configured');
  return `<td class="${cls}"><div class="ttl">${TRIMS[k].short}</div>${receipt}<div class="ttlp${best?' best':''}">${money(cfg.price)}</div><div class="ttld">${tag}</div></td>`;
}
function buildMatrix(){
  const P=TRIMS.premium,F=TRIMS.performance,d=cmpDriveObj(),d0=TRIMS.standard.drives[0];
  const wS=cmpWheelObj('standard'),wP=cmpWheelObj('premium'),wF=cmpWheelObj('performance');
  const SPEC=[
    {l:'Availability',s:d.avail,s0:d0.avail,p:P.avail,f:F.avail,dyn:true},
    {l:'Drivetrain',s:`${d.motors} ${d.drive}`,s0:`${d0.motors} ${d0.drive}`,p:'Dual-motor AWD',f:'Dual-motor AWD',dyn:true},
    {l:'Horsepower',s:d.hp+' hp',s0:d0.hp+' hp',p:P.hp+' hp',f:F.hp+' hp',dyn:true},
    {l:'0–60 mph',s:d.z60,s0:d0.z60,p:P.z60,f:F.z60,dyn:true},
    {l:'EPA range',multi:true,s:d.range+wS.rd,s0:d0.range,p:P.range+wP.rd,p0:P.range,f:F.range+wF.rd,f0:F.range},
    {l:'Max towing',s:d.tow,s0:d0.tow,p:P.tow,f:F.tow,dyn:true},
    {l:'Premium interior — wood, heated + ventilated, heated rear, Torch',s:false,p:true,f:true},
    {l:'Premium audio',s:false,p:true,f:true},
    {l:'Rear drop glass (power rear window)',s:false,p:true,f:true},
    {l:'Matrix-LED adaptive lighting',s:false,p:true,f:true},
    {l:'Tow hooks',s:false,p:true,f:true},
    {l:'Semi-active suspension',s:false,p:false,f:true},
    {l:'Compass Yellow brake calipers + accents',s:false,p:false,f:true},
    {l:'Launch key fob',s:false,p:false,f:true},
    {l:'Exclusive paint (Launch Green, Borealis)',s:false,p:false,f:'excl2000'}
  ];
  const BASE=['NACS port · 21,000+ Tesla Superchargers','Autonomy+ 60-day trial','Rivian app, digital key & OTA updates','Driver+ safety suite (20+ features)','5 seats · 90.1 cu-ft max storage','9.6" ground clearance'];
  /* Standard spec cell: plain at the default drive; once a pick changes it, strike the base value and bold the new one */
  const stdSpecCell=r=>(r.s0!==undefined&&r.s0!==r.s)
    ?`<td class="val chg"><s class="was">${r.s0}</s><b class="now">${r.s}</b></td>`
    :`<td class="val">${r.s}</td>`;
  /* multi-column change cell: strike the base value and bold the new one when they differ (matches the Standard drive-change style) */
  const chgTd=(now,base,cls)=> now!==base
    ?`<td class="val chg${cls?' '+cls:''}"><s class="was">${base} mi</s><b class="now">${now} mi</b></td>`
    :`<td class="val${cls?' '+cls:''}">${now} mi</td>`;
  const row=r=> r.multi
    ?`<tr><td class="lab">${r.l}</td>${chgTd(r.s,r.s0,'')}${chgTd(r.p,r.p0,'')}${chgTd(r.f,r.f0,'perfcol')}</tr>`
    :`<tr><td class="lab">${r.l}</td>${r.dyn?stdSpecCell(r):cmpCell(r.s,'')}${cmpCell(r.p,'')}${cmpCell(r.f,'perfcol')}</tr>`;
  const baseRow=l=>`<tr><td class="lab">${l}</td>${cmpCell(true,'')}${cmpCell(true,'')}${cmpCell(true,'perfcol')}</tr>`;
  const mobileSpecRow=r=> r.multi
    ?mobileCmpRow(r.l,'',chgTd(r.s,r.s0,''),chgTd(r.p,r.p0,''),chgTd(r.f,r.f0,'perfcol'))
    :mobileCmpRow(r.l,'',r.dyn?stdSpecCell(r):cmpCell(r.s,''),cmpCell(r.p,''),cmpCell(r.f,'perfcol'));
  const totals={standard:trimCfg('standard'),premium:trimCfg('premium'),performance:trimCfg('performance')};
  const mobileRows=
     `<div class="mobile-cmp">`
    +mobileCmpHead(totals)
    +mobileCmpDivider('Configure each trim')
    +mobileDriveGroup()+mobileColorGroup()+mobileWheelGroup()+mobileInteriorGroup()+mobileAddonGroup()
    +mobileCmpDivider('Specs & equipment')
    +SPEC.map(mobileSpecRow).join('')
    +mobileCmpDivider('Included on every R2')
    +BASE.map(l=>mobileCmpRow(l,'',cmpCell(true,''),cmpCell(true,''),cmpCell(true,'perfcol'))).join('')
    +`</div>`;
  const rows=
     totalRow()
    +`<tr class="divider"><td colspan="4">Configure each column</td></tr>`
    +selRow('Drive system','drive')+selRow('Paint','color')+selRow('Wheels','wheel')+selRow('Interior','interior')
    +addonRow('Autonomy+ driver assist','autonomy',2500)+addonRow('Tow Package','tow',950)
    +`<tr class="divider"><td colspan="4">Specs &amp; equipment</td></tr>`
    +SPEC.map(row).join('')
    +`<tr class="divider"><td colspan="4">Included on every R2</td></tr>`
    +BASE.map(baseRow).join('');
  return `<div class="matrixdesk"><table class="matrix"><thead><tr><th>Feature</th><th>Standard</th><th>Premium</th><th class="perfcol">Performance</th></tr></thead><tbody>${rows}</tbody></table></div>${mobileRows}`;
}
function resetBuild(){
  const t=curTrim();
  if(t.drives)S.drive=t.drives[0].id;
  S.color='esker';S.wheel=t.wheels[0].id;S.interior=t.interior[0].id;S.addons.clear();
  renderAll();
}
/* reset every compare column back to its default paint, interior, drive and add-ons */
function resetCompare(){
  ['standard','premium','performance'].forEach(k=>{
    S.cmpColor[k]='esker';
    S.cmpInterior[k]=TRIMS[k].interior[0].id;
    S.cmpWheel[k]=TRIMS[k].wheels[0].id;
    S.cmpAddons[k].clear();
  });
  S.accBundle.clear();
  S.cmpDrive=TRIMS.standard.drives[0].id;
  renderCompare();
}
function updateVerdict(){
  const pc=trimCfg('premium'),fc=trimCfg('performance'),sc=trimCfg('standard');
  const values={standard:sc.vehicle,premium:pc.vehicle,performance:fc.vehicle};
  const ranked=['standard','premium','performance'].sort((a,b)=>values[a]-values[b]);
  const low=ranked[0],mid=ranked[1],high=ranked[2];
  const stepMid=values[mid]-values[low];
  const stepHigh=values[high]-values[mid];
  const launchVal=CMP_ADDONS.reduce((s,a)=>s+a.price,0);
  const card=(k,body)=>{
    const cfg={standard:sc,premium:pc,performance:fc}[k];
    const pos=k===low?'lowest':k===high?'highest':'middle';
    return `<div class="vcard ${pos}"><div class="vtop"><span>${TRIMS[k].short}</span><b>${money(cfg.vehicle)}</b></div><p>${body}</p></div>`;
  };
  const big=`${TRIMS[mid].short} is <b>+${money(stepMid)}</b> over ${TRIMS[low].short}, then <b>+${money(stepHigh)}</b> more for ${TRIMS[high].short}.`;
  const standardDrive=`${sc.driveObj.drive} · ${sc.driveObj.sub}`;
  const cards=[
    card('standard',`Cheapest of the three — and the longest wait. ${standardDrive}, ${sc.driveObj.range} mi range, arriving 2027.`),
    card('premium',`The middle ground on price, comfort, and timing. Adds the premium cabin, audio, rear glass, lighting, and tow hooks.`),
    card('performance',`Priciest, but the most powerful and ready now. Bundles the Launch Edition: Autonomy+, Tow Package, semi-active suspension, and accents.`)
  ].join('');
  const note=`<div class="vnote">Configured vehicle prices shown before shared gear. On Performance, the Launch Edition folds ${money(launchVal)} of add-ons into the price.</div>`;
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
S.rc={ins:1,maint:1,energy:1,reg:1,prop:1};S.financeGear=false;
const INPUT_IDS2=['i2_price','i2_gear','i2_trade','i2_years','i2_miles','i2_down','i2_apr','i2_term','i2_year','i2_lease','i2_leasedown','i2_leaseterm','i2_ins','i2_maint','i2_kwh','i2_eff','i2_home','i2_install','i2_proptax','i2_resale','i2_filing','i2_magi','i2_rate'];
const fmtK=n=>{const a=Math.abs(n);if(a>=1000)return (n<0?'-$':'$')+Math.round(a/1000)+'k';return (n<0?'-$':'$')+Math.round(a);};

/* ----- launch from Compare / Build into the cost tab ----- */
function buildExt(src){
  /* src.k = trim key; pulls from Compare column config (paint, interior, drive, add-ons) + shared gear */
  const k=src.k,t=TRIMS[k],cfg=trimCfg(k);
  const colId=cfg.colId,w=cfg.wo,io=cfg.io;
  const dObj=(k==='standard')?cfg.driveObj:null;
  const addonNames=[];CMP_ADDONS.forEach(a=>{const inc=t.autoIncl&&a.launchInc;if(inc)addonNames.push(a.name+' (Launch)');else if(S.cmpAddons[k].has(a.id))addonNames.push(a.name);});
  const gearItems=[];CMP_ACCESSORIES.forEach(g=>g.items.forEach(a=>{if(a.price&&S.accBundle.has(a.id))gearItems.push({name:a.name,price:a.price});}));
  return {source:'compare',trim:k,trimName:t.short,folder:t.folder,colCode:COLORS[colId].code,colName:COLORS[colId].name,
    wheelCode:w.code,wheelName:w.name,vehicle:cfg.vehicle,gear:cfg.acc,
    base:t.price,drive:cfg.drive,paint:cfg.paint,interior:cfg.interior,addon:cfg.addon,
    driveLabel:(k==='standard')?(dObj.drive+' · '+dObj.sub):(t.motors+' '+t.drive),
    intName:io.name,addonNames,gearItems,
    range:((k==='standard')?dObj.range:t.range)+w.rd,hp:(k==='standard')?dObj.hp:t.hp,
    z60:(k==='standard')?dObj.z60:t.z60,avail:(k==='standard')?dObj.avail:t.avail};
}
/* Build tab → cost-over-time: source the loaded vehicle from the actual Build config
   (Build has its own wheel + add-on selections and no gear bundle, unlike Compare). */
function buildExtFromBuild(){
  const k=S.trim,t=curTrim(),col=COLORS[S.color],io=t.interior.find(i=>i.id===S.interior)||t.interior[0];
  const dObj=curDrive(),w=curWheel();
  const addonNames=[];let addon=0;
  ADDONS.forEach(a=>{const inc=t.autoIncl&&a.launchInc;if(inc)addonNames.push(a.name+' (Launch)');else if(S.addons.has(a.id)){addonNames.push(a.name);addon+=a.price;}});
  const gearItems=[];CMP_ACCESSORIES.forEach(g=>g.items.forEach(a=>{if(a.price&&S.accBundle.has(a.id))gearItems.push({name:a.name,price:a.price});}));
  return {source:'build',trim:k,trimName:t.short,folder:t.folder,colCode:col.code,colName:col.name,
    wheelCode:w.code,wheelName:w.name,vehicle:configuredPrice(),gear:accBundleTotal(),
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
  const gearLine=e.gear>0?`<div class="pg">+ ${money(e.gear)} gear · ${e.gearItems.length} item${e.gearItems.length>1?'s':''}</div>`:'<div class="pg">no gear added</div>';
  host.innerHTML=`<div class="lthumb"><img loading="lazy" alt="${e.trimName}" src="${heroURL(e.folder,e.wheelCode,e.colCode)}" onerror="this.parentNode.style.display='none'"></div>
    <div class="lbody">
      <div class="ltrim">R2 ${e.trimName}</div>
      <div class="lcfg"><b>${e.colName}</b> · ${e.intName} · ${e.driveLabel} · ${e.range} mi · ${e.hp} hp · 0–60 ${e.z60}${addons}</div>
    </div>
    <div class="lprice"><div class="pv">${money(e.vehicle)}</div>${gearLine}</div>
    <button class="lswap" data-goto="${e.source==='build'?'build':'compare'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>Edit</button>`;
  const b=host.querySelector('[data-goto]');if(b)b.onclick=()=>document.querySelector('.tab[data-tab="'+b.dataset.goto+'"]').click();
}

/* ----- chart frame helpers (offline inline SVG) ----- */
const CW=340,CH=190,CL=44,CR=12,CT=12,CB=26,PW=CW-CL-CR,PH=CH-CT-CB;
const xM=(m,NM)=>CL+(NM?m/NM:0)*PW;
const yV=(v,Vmax)=>CT+(1-(Vmax?v/Vmax:0))*PH;
const lineP=pts=>pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
const areaP=(pts,baseY)=>pts.length?('M'+pts[0][0].toFixed(1)+' '+baseY.toFixed(1)+' '+pts.map(p=>'L'+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')+' L'+pts[pts.length-1][0].toFixed(1)+' '+baseY.toFixed(1)+' Z'):'';
function frameSVG(inner){return `<svg viewBox="0 0 ${CW} ${CH}" role="img">${inner}</svg>`;}
function yAxis(Vmax){
  let s='';const steps=[0,.5,1];
  steps.forEach(f=>{const y=CT+(1-f)*PH,v=Vmax*f;
    s+=`<line class="${f===0?'ax':'axg'}" x1="${CL}" y1="${y.toFixed(1)}" x2="${CW-CR}" y2="${y.toFixed(1)}"/>`;
    s+=`<text class="axlbl end" x="${CL-5}" y="${(y+3).toFixed(1)}">${fmtK(v)}</text>`;});
  return s;
}
function xYears(years,NM){
  let s='';const step=years<=8?1:2;
  for(let y=0;y<=years;y+=step){const x=xM(y*12,NM);
    s+=`<text class="axlbl mid" x="${x.toFixed(1)}" y="${CH-9}">${y===0?'now':y+'y'}</text>`;}
  return s;
}
function legendRow(items){return `<div class="clegend">${items.map(i=>`<span class="ci"><i class="${i.ln?'ln':''}" style="background:${i.c}"></i>${i.t}</span>`).join('')}</div>`;}

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
  el.innerHTML=`<b>${L.name}</b> sets <b>${L.tax}%</b> upfront tax · <b>$${L.title}</b> title · <b>${reg}</b> · <b>${prop}</b>`;
}
function applyStateDefaults(){const L=locRow();$('i2_ins').value=L.ins;$('i2_proptax').value=L.propTax;syncPropRow();renderStateSets();}
function model2(){
  const P=CC();
  const num=id=>+$(id).value||0;
  const inc=S.rc,gI=inc.ins?1:0,gM=inc.maint?1:0,gE=inc.energy?1:0,gR=inc.reg?1:0,gP=inc.prop?1:0;
  const price=num('i2_price'),gear=num('i2_gear'),trade=num('i2_trade');
  const years=Math.max(1,Math.round(num('i2_years'))),miles=num('i2_miles'),pay=S.pay2,NM=years*12;
  const finG=(S.financeGear&&pay==='finance');
  const ins=num('i2_ins'),maint=num('i2_maint'),kwh=num('i2_kwh')/100,eff=num('i2_eff')||3.5,home=num('i2_home')/100,install=num('i2_install');
  const proptaxRate=num('i2_proptax')/100,resalePct=num('i2_resale')/100;
  const energyAnnual=(miles/eff)*(home*kwh+(1-home)*0.45);
  const LOC=locRow();
  const grossVehicle=price+FEES.destination;
  const tradeCredit=Math.min(Math.max(trade,0),grossVehicle);
  const netVehicle=grossVehicle-tradeCredit;
  const hut=netVehicle*LOC.tax/100;
  const otd=netVehicle+FEES.doc+hut+LOC.title;
  const reg=LOC.reg+LOC.evFee;
  const rf=Math.max(0.02,resalePct);
  const valueAt=m=>price*Math.pow(rf,NM?m/NM:0);
  const resale=price*resalePct;
  const propYear=y=>valueAt((y-1)*12)*proptaxRate;
  let propTotal=0;for(let y=1;y<=years;y++)propTotal+=propYear(y);
  /* financing */
  const term=Math.max(1,Math.round(num('i2_term'))),apr=num('i2_apr'),down=num('i2_down'),startYear=Math.round(num('i2_year'))||2027;
  const rate=num('i2_rate')/100,cap=dedCap(num('i2_magi'),+$('i2_filing').value||200000);
  const lp=num('i2_lease'),ld=num('i2_leasedown'),lt=Math.max(1,Math.round(num('i2_leaseterm')));
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
  const runMo=y=>propYear(y)*gP/12+(ins*gI+maint*gM+energyAnnual*gE+reg*gR)/12;
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
  const trueCost=grossCum-netResale-(pay==='finance'?ded:0);
  /* structured breakdown rows — grp: acq | fin | run(toggleable) */
  const moPaid=Math.min(NM,lt);
  const stateUp=hut+LOC.title;                     /* the state's upfront cut: sales/use tax + title */
  const finLbl=(pay==='finance'?' (financed)':'');
  const acq=(pay==='lease')
    ?[{key:'lease',l:'Lease + signing',v:ld+lp*moPaid,c:P.yellow,grp:'acq'}]
    :[{key:'otd',l:'Vehicle + destination'+finLbl,v:otd-stateUp,c:P.yellow,grp:'acq'}];
  if(pay!=='lease'&&stateUp>0)acq.push({key:'statetax',l:'State tax + title'+finLbl,v:stateUp,c:P.statetax,grp:'acq'});
  acq.push({key:'gear',l:'Gear & accessories'+(finG?' (in loan)':''),v:gear,c:P.gray,grp:'acq'});
  acq.push({key:'install',l:'Charger install',v:install,c:P.blue,grp:'acq'});
  const fin=(pay==='finance')?[{key:'interest',l:'Loan interest',v:interestHold,c:P.red,grp:'fin'}]:[];
  const run=[
    {key:'ins',l:'Insurance',v:ins*years,c:P.teal,grp:'run',tog:1},
    {key:'maint',l:'Maintenance + tires',v:maint*years,c:P.orange,grp:'run',tog:1},
    {key:'energy',l:'Electricity',v:energyAnnual*years,c:P.green,grp:'run',tog:1},
    {key:'reg',l:'Registration + EV fee',v:reg*years,c:P.olive,grp:'run',tog:1},
    {key:'prop',l:'Property tax',v:propTotal,c:P.purple,grp:'run',tog:1}];
  const bdRows=acq.concat(fin,run).map(r=>{const on=r.tog?!!inc[r.key]:true;return Object.assign({on,active:on?r.v:0},r);});
  const buckets=bdRows.filter(r=>r.active>0).map(r=>({l:r.l,v:r.active,c:r.c}));
  /* per-year rows (running gated by toggles) */
  const yearRows=[];
  const upTax=(pay==='cash')?stateUp:0;   /* state tax is a year-1 cash outlay only when paying cash; financed/leased tax rides inside the payment bars */
  for(let y=1;y<=years;y++){const m0=(y-1)*12;let pmt=0;
    if(pay==='finance')for(let m=m0;m<m0+12&&m<term;m++)pmt+=monthlyPmt;
    if(pay==='lease')for(let m=m0;m<m0+12&&m<lt;m++)pmt+=lp;
    yearRows.push({y,up:(y===1?upfront-upTax:0),statetax:(y===1?upTax:0),pmt,ins:ins*gI,energy:energyAnnual*gE,reg:reg*gR,prop:propYear(y)*gP,maint:maint*gM,resaleCredit:(y===years?netResale:0)});
  }
  /* underwater */
  let underMonths=0,crossover=-1;
  if(pay==='finance'){for(let m=0;m<=NM;m++){const v=valueAt(m),b=balAt[m]!=null?balAt[m]:0;if(b>v)underMonths++;else if(crossover<0&&m>0)crossover=m;}if(crossover<0&&balAt[0]<=valueAt(0))crossover=0;}
  return {price,gear,trade,tradeCredit,grossVehicle,netVehicle,years,miles,pay,NM,otd,reg,ins,maint,energyAnnual,install,propTotal,resale,resalePct,
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
  if(M.netResale>0||M.ded>0){
    s+=`<line class="axg" x1="${endX.toFixed(1)}" y1="${yV(M.grossCum,Vmax).toFixed(1)}" x2="${endX.toFixed(1)}" y2="${tcY.toFixed(1)}" stroke="${P.olive}" stroke-dasharray="3 2"/>`;
    s+=`<circle class="cdot" cx="${endX.toFixed(1)}" cy="${tcY.toFixed(1)}" r="3.4" fill="${P.green}"/>`;
    s+=`<text class="clbl" x="${(endX-3).toFixed(1)}" y="${(tcY-6).toFixed(1)}" text-anchor="end">${fmtK(M.trueCost)} net</text>`;
  }else{
    s+=`<circle class="cdot" cx="${endX.toFixed(1)}" cy="${tcY.toFixed(1)}" r="3.4" fill="${P.teal}"/>`;
  }
  s+=`<circle class="cdot" cx="${xM(1,M.NM).toFixed(1)}" cy="${yV(M.cum[0],Vmax).toFixed(1)}" r="3" fill="${P.teal}"/>`;
  $('chartCum').innerHTML=frameSVG(s)+legendRow([{c:P.teal,t:'Cumulative cash out'},{c:P.green,t:'True cost (net of resale)'}]);
  $('cumSub').textContent=fmtK(M.trueCost)+' net';
  $('cumCap').innerHTML=`Day one: <b>${money(M.upfront)}</b>. Gross paid by year ${M.years}: <b>${money(M.grossCum)}</b>`+(M.pay==='lease'?`. No resale on a lease.`:`. Resale recovers <b>${money(M.netResale)}</b>${M.ded>0?`; deduction saves <b>${money(M.ded)}</b>`:''}. Net: <b>${money(M.trueCost)}</b>.`);
}
function chartAnnual(M){
  const P=CC();
  const hasStateTax=M.yearRows.some(r=>(r.statetax||0)>0);   /* cash only — financed/leased tax lives in the payment bars */
  const cats=[{k:'up',l:'Up-front',c:P.yellow}]
    .concat(hasStateTax?[{k:'statetax',l:'State tax + title',c:P.statetax}]:[])
    .concat([{k:'pmt',l:(M.pay==='lease'?'Lease':'Financing'),c:P.red},
    {k:'ins',l:'Insurance',c:P.teal},{k:'energy',l:'Electricity',c:P.green},
    {k:'reg',l:'Reg + EV',c:P.olive},{k:'prop',l:'Property tax',c:P.purple},{k:'maint',l:'Maintenance',c:P.orange}]);
  let maxPos=0,maxNeg=0;
  M.yearRows.forEach(r=>{let p=0;cats.forEach(ct=>p+=r[ct.k]||0);if(p>maxPos)maxPos=p;if(r.resaleCredit>maxNeg)maxNeg=r.resaleCredit;});
  const R=(maxPos+maxNeg)||1,unit=PH/R,base=CT+(maxPos/R)*PH;
  let s='';
  /* zero + helper gridlines */
  s+=`<line class="ax" x1="${CL}" y1="${base.toFixed(1)}" x2="${CW-CR}" y2="${base.toFixed(1)}"/>`;
  [0.5,1].forEach(f=>{const v=maxPos*f,y=base-v*unit;s+=`<line class="axg" x1="${CL}" y1="${y.toFixed(1)}" x2="${CW-CR}" y2="${y.toFixed(1)}"/><text class="axlbl end" x="${CL-5}" y="${(y+3).toFixed(1)}">${fmtK(v)}</text>`;});
  if(maxNeg>0){const y=base+maxNeg*unit;s+=`<text class="axlbl end" x="${CL-5}" y="${(y+3).toFixed(1)}">-${fmtK(maxNeg)}</text>`;}
  const n=M.years,slot=PW/n,bw=Math.min(34,slot*0.6);
  M.yearRows.forEach((r,i)=>{
    const cx=CL+slot*i+slot/2,x=cx-bw/2;let yTop=base;
    cats.forEach(ct=>{const v=r[ct.k]||0;if(v<=0)return;const h=v*unit;yTop-=h;s+=`<rect class="barseg" x="${x.toFixed(1)}" y="${yTop.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${ct.c}"><title>Y${r.y} ${ct.l}: ${money(v)}</title></rect>`;});
    if(r.resaleCredit>0){const h=r.resaleCredit*unit;s+=`<rect class="barseg" x="${x.toFixed(1)}" y="${base.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${P.resale}"><title>Y${r.y} resale: -${money(r.resaleCredit)}</title></rect>`;}
    s+=`<text class="axlbl mid" x="${cx.toFixed(1)}" y="${CH-9}">${r.y}</text>`;
  });
  $('chartAnnual').innerHTML=frameSVG(s)+legendRow(cats.map(ct=>({c:ct.c,t:ct.l})).concat(M.netResale>0?[{c:P.resale,t:'Resale (yr '+M.years+')'}]:[]));
  $('annSub').textContent='per year';
  const yr1=M.yearRows[0],g1=yr1.up+(yr1.statetax||0)+yr1.pmt+yr1.ins+yr1.energy+yr1.reg+yr1.prop+yr1.maint;
  const yr2=M.yearRows[1]||yr1,steady=yr2.pmt+yr2.ins+yr2.energy+yr2.reg+yr2.prop+yr2.maint;
  $('annCap').innerHTML=`Year 1: <b>${money(g1)}</b>. Typical later year: <b>${money(steady)}</b>`+(M.pay==='finance'&&M.payoffMonth<M.NM?`, then lower after payoff in year ${Math.ceil(M.payoffMonth/12)}.`:'.');
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
  const leg=[{c:P.green,t:'Vehicle value'}];if(M.pay==='finance')leg.push({c:P.red,t:'Loan balance',ln:1},{c:P.redGlow,t:'Underwater'});
  $('chartDep').innerHTML=frameSVG(s)+legendRow(leg);
  $('depSub').textContent=Math.round(M.resalePct*100)+'% retained';
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
function renderKPIs(M){
  const k=[];const yr1=M.yearRows[0];
  k.push({l:'Day-one cash',v:money(M.upfront),s:M.pay==='finance'?('down'+(M.finG?'':' + gear')+' + install'):M.pay==='lease'?'signing + gear':'full + gear'});
  if(M.pay==='finance'){k.push({l:'Total interest (hold)',v:money(M.interestHold),s:M.apr+'% · '+M.term+'-mo',cls:'warn'});
    k.push({l:M.payoffMonth<M.NM?'Loan paid off':'Owed at sale',v:M.payoffMonth<M.NM?('Year '+Math.ceil(M.payoffMonth/12)):money(M.remBal),s:M.payoffMonth<M.NM?'within your hold':'covered by resale'});
    k.push({l:'Underwater',v:M.underMonths>0?('~'+M.underMonths+' mo'):'Never',s:M.underMonths>0?'owe > value':'down keeps equity+',cls:M.underMonths>0?'warn':'good'});}
  if(M.pay!=='lease'){k.push({l:'Resale recovered',v:money(M.netResale),s:Math.round(M.resalePct*100)+'% at year '+M.years,cls:'good'});}
  if(M.pay==='finance'&&M.ded>0){k.push({l:'Deduction saved',v:money(M.ded),s:'total, 2025–28',cls:'good'});}
  k.push({l:'Most expensive year',v:'Year 1',s:money(yr1.up+(yr1.statetax||0)+yr1.pmt+yr1.ins+yr1.energy+yr1.reg+yr1.prop+yr1.maint)});
  $('kpiGrid').innerHTML=k.slice(0,6).map(x=>`<div class="kpi"><div class="kl">${x.l}</div><div class="kv ${x.cls||''}">${x.v}</div><div class="ks">${x.s}</div></div>`).join('');
}

/* ----- grouped, toggleable breakdown ----- */
function renderBreakdown2(M){
  const grossActive=M.bdRows.reduce((a,r)=>a+r.active,0)||1;
  const groups=[{id:'acq',t:'Up-front'},{id:'fin',t:'Financing'},{id:'run',t:'Running costs'}];
  let html='';let first=true;
  groups.forEach(g=>{
    const rows=M.bdRows.filter(r=>r.grp===g.id);if(!rows.length)return;
    const gtot=rows.reduce((a,r)=>a+r.active,0);
    html+=`<div class="bdgrp${first?' first':''}"><div class="gh"><span>${g.t}${g.id==='run'?' · tap to include/exclude':''}</span><span class="gt">${money(gtot)}</span></div>`;first=false;
    rows.forEach(r=>{
      const pc=r.on?Math.round(r.active/grossActive*100)+'%':'';
      const col3=r.tog?`<button class="tgl${r.on?' on':''}" data-rc="${r.key}" title="Toggle ${r.l}" aria-label="Toggle ${r.l}"></button>`:`<span class="pc">${pc}</span>`;
      html+=`<div class="bdrow${r.on?'':' off'}"><i style="background:${r.c}"></i><span class="nm">${r.l}</span>${col3}<span class="vl">${money(r.tog?r.v:r.active)}</span></div>`;
    });
    html+='</div>';
  });
  const rec=[];if(M.pay!=='lease')rec.push({l:'Resale recovered at end',v:M.netResale});if(M.pay==='finance'&&M.ded>0)rec.push({l:'Tax deduction (total)',v:M.ded});
  if(rec.length){html+=`<div class="bdgrp"><div class="gh"><span>Recovered later</span><span class="gt">−${money(rec.reduce((a,r)=>a+r.v,0))}</span></div>`;
    rec.forEach(r=>{html+=`<div class="bdrow sub"><i style="background:${CC().resale}"></i><span class="nm">${r.l}</span><span class="pc"></span><span class="vl">−${money(r.v)}</span></div>`;});html+='</div>';}
  $('bd2').innerHTML=html;
  $('bd2').querySelectorAll('[data-rc]').forEach(b=>b.onclick=()=>{const k=b.dataset.rc;S.rc[k]=S.rc[k]?0:1;calc2();});
}

/* ----- export scenario as a chat prompt ----- */
function exportScenario(){
  const M=model2(),e=S.ext,num=id=>+$(id).value||0;
  const L=[];
  L.push('Help me optimize the financing on this Rivian R2 cost scenario. Find the down-payment and loan-term combination that gives the lowest sensible monthly payment WITHOUT tying up more cash in the down payment than necessary — flag where extra down payment stops meaningfully lowering the monthly (diminishing returns). Show the trade-off between monthly payment, total interest paid, and cash up front, and recommend a balanced pick.');
  L.push('');
  L.push('VEHICLE: R2 '+(e?e.trimName:'(unloaded)')+(e?' · '+e.colName+' · '+e.driveLabel:''));
  L.push('Configured price (taxed + financeable): '+money(M.price));
  if(M.tradeCredit>0)L.push('Trade-in credit applied to purchase: '+money(M.tradeCredit));
  L.push('Gear & accessories ('+(M.finG?'rolled into loan':'upfront cash')+'): '+money(M.gear));
  L.push('Out-the-door (after trade + tax + fees): '+money(M.otd));
  L.push('Pay method: '+M.pay.toUpperCase());
  if(M.pay==='finance')L.push('Current financing: '+money(M.down)+' down · '+M.apr+'% APR · '+M.term+'-mo → '+money(M.monthlyPmt)+'/mo, '+money(M.interestHold)+' interest over the hold');
  L.push('Ownership horizon: '+M.years+' yrs at '+M.miles.toLocaleString()+' mi/yr');
  const rc=S.rc,onv=(k,v)=>rc[k]?money(v):'(excluded)';
  L.push('Running costs/yr: insurance '+onv('ins',M.ins)+', maintenance '+onv('maint',M.maint)+', electricity ~'+onv('energy',M.energyAnnual)+', registration+EV '+onv('reg',M.reg));
  L.push('Resale retained at horizon: '+Math.round(M.resalePct*100)+'% (~'+money(M.resale)+')');
  L.push('Tax: MAGI '+money(num('i2_magi'))+', '+((+$('i2_filing').value===100000)?'single':'married filing jointly')+', '+(M.rate*100).toFixed(0)+'% marginal → est. deduction '+money(M.ded)+' total over 2025–28');
  L.push('True cost over '+M.years+' yrs (net of resale + deduction): '+money(M.trueCost)+' · effective '+money(M.trueCost/M.NM)+'/mo');
  const txt=L.join('\n');
  const ok=()=>{const o=$('exportOk');if(o){o.classList.add('show');setTimeout(()=>o.classList.remove('show'),2800);}};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok,()=>copyFallback(txt,ok));
  else copyFallback(txt,ok);
}
function copyFallback(txt,ok){try{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);ok();}catch(e){window.prompt('Copy this scenario, then paste it into your chat:',txt);}}

/* ----- main calc + render for the new tab ----- */
function calc2(){
  const M=model2();
  /* results */
  if(M.pay==='lease'){$('r2_otd').textContent=money(M.ld);$('r2_otd_lbl').textContent='Due at signing';$('r2_otd_sub').textContent='up-front on a lease (excl. gear)';$('r2_pay_sub').textContent='to the lessor · '+M.lt+' mo';}
  else{$('r2_otd').textContent=money(M.otd);$('r2_otd_lbl').textContent='Out-the-door';$('r2_otd_sub').textContent=M.tradeCredit>0?'after trade + tax + fees':(M.pay==='finance'?'vehicle price + tax + fees':'cash to drive away, day one');$('r2_pay_sub').textContent=M.pay==='finance'?('to the bank · '+M.term+' mo @ '+M.apr+'%'):'no monthly payment';}
  $('r2_pay').textContent=M.monthlyPmt>0?money(M.monthlyPmt)+'/mo':(M.pay==='lease'?money(M.lp)+'/mo':'—');
  /* finance-gear toggle UI */
  $('finGearAmt').textContent=money(M.gear);
  $('finGearSw').classList.toggle('on',!!S.financeGear);
  $('finGearRow').style.display=(M.pay==='finance'&&M.gear>0)?'flex':'none';
  $('r2_years').textContent=M.years;$('o2_years_l').textContent=M.years;$('r2_horizonlbl').textContent='· over '+M.years+' yrs';$('modelHorizon').textContent=M.years+'-year hold · '+M.miles.toLocaleString()+' mi/yr';
  $('r2_true').textContent=money(M.trueCost);
  $('r2_permo').innerHTML=money(M.trueCost/M.NM)+'/mo'+(M.miles>0?'<span class="permi">$'+(M.trueCost/(M.miles*M.years)).toFixed(2)+'/mi</span>':'');
  /* mirror key figures + horizon into the fixed scroll-sticky bar (guarded so calc2 never throws if the markup is absent) */
  if($('cs_true')){
    $('cs_true').textContent=money(M.trueCost);
    $('cs_years_top').textContent=M.years;
    $('cs_permo').textContent=money(M.trueCost/M.NM)+'/mo';
    if(M.pay==='lease'){$('cs_pay_lbl').textContent='Lease';$('cs_pay').textContent=money(M.lp)+'/mo';}
    else if(M.pay==='cash'){$('cs_pay_lbl').textContent='Out-the-door';$('cs_pay').textContent=money(M.otd);}
    else{$('cs_pay_lbl').textContent='Monthly';$('cs_pay').textContent=M.monthlyPmt>0?money(M.monthlyPmt)+'/mo':'—';}
    $('cs_years_l').textContent=M.years;
    if($('cs_years').value!=M.years)$('cs_years').value=M.years; /* realign mirror on hydrate / state / pay-mode changes */
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
  const barHTML=shown.map(b=>`<div style="width:${(b.v/sum*100).toFixed(2)}%;background:${b.c}" title="${b.l}: ${money(b.v)}"></div>`).join('');
  $('costBar2').innerHTML=barHTML;
  if($('cs_bar'))$('cs_bar').innerHTML=barHTML;
  renderBreakdown2(M);
  $('r2_resaleNote').innerHTML=M.pay==='lease'?'Lease: you return the car — no resale, no deduction. R2 lease terms aren\'t public; treat as placeholders.':`Gross spend ${money(sum)} − ${money(M.netResale)} resale${M.ded>0?' − '+money(M.ded)+' deduction':''} = <b>${money(M.trueCost)}</b> true cost.`;
  /* charts + kpis */
  chartCum(M);chartAnnual(M);chartLoan(M);chartDep(M);renderKPIs(M);
  /* scenario snapshot */
  const terms=M.pay==='finance'?`${M.apr}% · ${M.term} mo · ${money(M.down)} down`:(M.pay==='lease'?`${money(M.lp)}/mo · ${M.lt} mo`:'paid in full');
  S.cur2={pay:M.pay,payLabel:M.pay.charAt(0).toUpperCase()+M.pay.slice(1),years:M.years,terms,
    trim:S.ext?S.ext.trimName:'—',otd:M.pay==='lease'?M.ld:M.otd,monthly:M.monthlyPmt||(M.pay==='lease'?M.lp:0),
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
function refreshScenarios2(){S.scenarios2=loadBuilds();renderScenarios2();}
function newScenId(){return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);}
function saveScenario2(){
  if(!S.cur2)calc2();
  const n=S.scenarios2.length+1,name='Scenario '+(n<=26?String.fromCharCode(64+n):n);
  const loc=S.state2;                                       /* selected state code (#3) */
  const encoded=b64u(JSON.stringify({v:1,loc,...snap2()}));  /* same encoding as share links */
  const summary={...S.cur2};delete summary.inputs;           /* display fields only; encoded supersedes inputs */
  S.scenarios2.push({id:newScenId(),name,loc,encoded,summary});
  saveBuilds();renderScenarios2();
}
/* shared hydration core — reused by Load (below) and share-link decode (bootShareLink) */
function hydrate2(inp,loc){
  if(!inp)return;
  if(loc!=null&&STATES[loc]){S.state2=loc;if($('i2_state'))$('i2_state').value=S.state2;syncPropRow();renderStateSets();} /* restore the saved/shared state + its tax/fees (ins/proptax values restored below) */
  S.ext=inp.ext||S.ext;INPUT_IDS2.forEach(k=>{const el=$(k);if(el&&inp[k]!=null)el.value=inp[k];});
  S.pay2=inp.pay||S.pay2;$('paySeg2').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.pay===S.pay2));
  $('financeFields2').style.display=S.pay2==='lease'?'none':'grid';$('leaseFields2').style.display=S.pay2==='lease'?'grid':'none';
  $('o2_years_l').textContent=$('i2_years').value;renderLoaded();calc2();
}
function loadScenario2(id){const s=S.scenarios2.find(x=>x.id===id);if(!s)return;
  let inp;try{inp=JSON.parse(unb64u(s.encoded));}catch(e){return;}
  hydrate2(inp,s.loc);
  const top=$('view-cost2').querySelector('.panel');if(top&&top.scrollIntoView)top.scrollIntoView({behavior:'smooth',block:'start'});}
function renderScenarios2(){
  const wrap=$('scenWrap2');
  if(!S.scenarios2.length){wrap.innerHTML='<div class="scenempty">No scenarios yet. Adjust inputs, then hit <b>Save current setup</b>.</div>';$('clearScen2').hidden=true;return;}
  $('clearScen2').hidden=false;
  const costs=S.scenarios2.map(s=>s.summary.trueCost),min=Math.min(...costs),multi=S.scenarios2.length>1;
  wrap.innerHTML='<div class="scengrid">'+S.scenarios2.map(s=>{const u=s.summary;const best=multi&&u.trueCost===min;const sum=u.buckets.reduce((a,b)=>a+b.v,0)||1;
    const bar=u.buckets.map(b=>`<div style="width:${(b.v/sum*100).toFixed(1)}%;background:${b.c}"></div>`).join('');
    const delta=(multi&&!best)?`<div class="scdelta">+${money(u.trueCost-min)} vs cheapest</div>`:'';
    return `<div class="scencard${best?' best':''}">${best?'<span class="sctag">Lowest true cost</span>':''}
      <input class="scname" value="${s.name.replace(/"/g,'&quot;')}" data-id="${s.id}" aria-label="Scenario name">
      <div class="scpay">${u.trim} · ${u.payLabel} · ${u.years} yr · ${u.terms}</div>
      <div class="sctrue">${money(u.trueCost)}</div><div class="sctruelbl">true cost over ${u.years} yrs</div>
      <div class="scbar">${bar}</div>
      <div class="scrow"><span>${u.pay==='lease'?'Due at signing':'Out-the-door'}</span><b>${money(u.otd)}</b></div>
      <div class="scrow"><span>Monthly</span><b>${u.monthly>0?money(u.monthly):'—'}</b></div>
      <div class="scrow"><span>Effective</span><b>${money(u.perMo)}/mo${u.perMi>0?' · $'+u.perMi.toFixed(2)+'/mi':''}</b></div>
      ${delta}<div class="scact"><button class="scload" data-id="${s.id}">Load</button><button class="scdel" data-id="${s.id}">Remove</button></div></div>`;
  }).join('')+'</div>';
  wrap.querySelectorAll('.scload').forEach(b=>b.onclick=()=>loadScenario2(b.dataset.id));
  wrap.querySelectorAll('.scdel').forEach(b=>b.onclick=()=>{S.scenarios2=S.scenarios2.filter(x=>x.id!==b.dataset.id);saveBuilds();renderScenarios2();});
  wrap.querySelectorAll('.scname').forEach(inp=>inp.onchange=()=>{const s=S.scenarios2.find(x=>x.id===inp.dataset.id);if(s){s.name=inp.value;saveBuilds();}});
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
    if(en.r2Config){const b=document.createElement('span');b.className='cl-badge';b.textContent='New config option';head.appendChild(b);}
    e.appendChild(head);
    const ul=document.createElement('ul');ul.className='cl-list';
    (en.changes||[]).forEach(c=>{const li=document.createElement('li');li.textContent=c;ul.appendChild(li);});
    e.appendChild(ul);panel.appendChild(e);
  });
  const foot=document.createElement('p');foot.className='cl-foot';
  const a=document.createElement('a');a.href='https://github.com/mmocniak/r2-configurator';
  a.target='_blank';a.rel='noopener';a.textContent='Contribute on GitHub ↗';
  foot.appendChild(a);panel.appendChild(foot);
  root.appendChild(panel);
}

/* ---------------- WIRING ---------------- */
function renderAll(){reconcile();renderTrims();renderHero();renderBranches();renderSummary();renderCompare();}
document.querySelectorAll('.tab').forEach(tb=>tb.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  $('navChangelog').classList.remove('active');
  $('navMore').classList.remove('active');
  tb.classList.add('active');$('view-'+tb.dataset.tab).classList.add('active');
  if(tb.dataset.tab==='compare'){
    ['standard','premium','performance'].forEach(k=>{
      S.cmpColor[k]=TRIMS[k].colors.includes(S.color)?S.color:'esker';
      S.cmpInterior[k]=TRIMS[k].interior.some(i=>i.id===S.interior)?S.interior:TRIMS[k].interior[0].id;
      S.cmpWheel[k]=TRIMS[k].wheels.some(w=>w.id===S.wheel)?S.wheel:TRIMS[k].wheels[0].id;
    });
    if(S.trim==='standard')S.cmpDrive=S.drive;
    renderCompare();
  }
  if(tb.dataset.tab==='cost2'){applyExt();refreshScenarios2();}
  updateCostSticky();   /* hide the bar when leaving cost2; re-evaluate scroll position on entry */
});
function showChangelog(){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  $('view-changelog').classList.add('active');
  $('navChangelog').classList.add('active');
  $('navMore').classList.add('active');   // mirror active state onto the ⋯ button (phones)
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
  $('financeFields2').style.display=S.pay2==='lease'?'none':'grid';
  $('leaseFields2').style.display=S.pay2==='lease'?'grid':'none';
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
/* mirrored horizon slider in the fixed cost bar → write the source-of-truth input, then re-render once */
if($('cs_years'))$('cs_years').addEventListener('input',()=>{
  $('i2_years').value=$('cs_years').value;          /* #i2_years is the source of truth */
  $('o2_years_l').textContent=$('cs_years').value;  /* instant feedback on the down-page label */
  calc2();                                          /* re-render once; calc2 mirrors value+label back into #cs_years */
});
$('finGearSw').onclick=()=>{S.financeGear=!S.financeGear;calc2();};
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
