/* Rivian R1T — vehicle spec + accessory data (trims, colors, wheels, interiors, gear).
   One self-contained, ownable file per vehicle; loaded as a classic script before app.js.
   See CONTRIBUTING.md → "Adding or maintaining a vehicle dataset".
   Data owner: mmocniak.
   Prices, specs and image paths verified against rivian.com's R1T builder ruleset + the
   Gear Shop (Shopify product JSON) on 2026-08-30 via validation/r2-config/snapshot.js.
   draft:true until a human confirms the hero renders, cabin photos and the judgment calls
   called out inline below (and in the PR description) in the live app / browser QA. */
var VEHICLES = (typeof VEHICLES !== 'undefined' && VEHICLES) || {};

VEHICLES.r1t = {
  id:'r1t',
  name:'R1T',
  draft:true,
  verified:'2026-08',
  /* R1's layer compositor, not R2's named visualizer program — see CONTRIBUTING.md and
     validation/r2-config/README.md ("Different hero images"). Wheel/interior codes below
     are Rivian's full option codes (e.g. 'WHL-0AAS'), which the compositor URL needs. */
  img:{compositor:'r1t',view:'side',ver:'2023.1',extra:['gen-2']},
  flagshipTrim:'quad',
  /* national fees owned per vehicle; app.js FEES is the fallback */
  fees:{destination:1895},
  /* cost-tab financing defaults, seeded when switching to this vehicle. Rivian publishes no
     standing R1 loan/lease rate (it rotates R1 APR and lease promos monthly, unlike the R2's
     own Chase-backed terms), so apr/term/down here are carried over from the R2's own Chase
     baseline as a placeholder floor rather than an R1-specific verified rate — see the PR
     description for how this compares to the R1T Premium's own quoted lease figure. */
  costDefaults:{down:15000,apr:5.79,term:60,lease:1229,leasedown:4895,leaseterm:36,note:'Defaults as of August 2026. Rivian rotates R1 APR and lease offers monthly, so check rivian.com/offers for the current promo.'},

  colors:{
    esker:{name:'Esker Silver',price:0,code:'EXP-ESV',hex:'#c9ccce',note:'Included'},
    glacier:{name:'Glacier White',price:1950,code:'EXP-GWT',hex:'#eef1f2'},
    limestone:{name:'Limestone',price:0,code:'EXP-LST',hex:'#d8d4c8',avail:'Coming soon'},
    forest:{name:'Forest Green',price:2500,code:'EXP-FGR',hex:'#2f4034'},
    midnight:{name:'Midnight',price:3000,code:'EXP-MDN',hex:'#12151b'},
    rivianblue:{name:'Rivian Blue',price:2500,code:'EXP-RBL',hex:'#1d4063'},
    halfmoon:{name:'Half Moon Grey',price:2500,code:'EXP-HMG',hex:'#7d8388'},
    redcanyon:{name:'Red Canyon',price:2500,code:'EXP-CRD',hex:'#7a2b26'},
    stormblue:{name:'Storm Blue',price:3000,code:'EXP-SBL',hex:'#2f4a63'}
  },

  trims:{
    premium:{name:'R1T Premium',short:'Premium',price:79990,drive:'AWD',motors:'Dual-motor',hp:533,range:329,z60:'4.5s',tow:'7,700 lb',avail:'Available now',folder:'MOT-201',codes:['MOT-201'],
      drives:[
        {id:'dual',  name:'Dual-Motor', sub:'Standard pack', price:0,    range:329, hp:533, z60:'4.5s', tow:'7,700 lb',  drive:'AWD', motors:'Dual-motor', pack:'Standard pack', avail:'Available now', note:'Included'},
        {id:'duallr',name:'Dual-Motor', sub:'Long Range',    price:7000, range:420, hp:533, z60:'4.5s', tow:'11,000 lb', drive:'AWD', motors:'Dual-motor', pack:'Max pack',      avail:'Available now', note:'Longest range · highest tow'}
      ],
      colors:['esker','glacier','limestone','forest','midnight','rivianblue','halfmoon'],
      wheels:[
        {id:'0aas',code:'WHL-0AAS',name:'20" Adventure All-Season',price:0,note:'Included'},
        {id:'2sd', code:'WHL-2SD', name:'22" Sport Dark',          price:1000,note:'with Darkout accents'},
        {id:'2ar', code:'WHL-2AR', name:'22" Range',               price:1000,note:'range-optimized tires'},
        {id:'0ad', code:'WHL-0AD', name:'20" All-Terrain Dark',    price:4950,note:'bundles the All-Terrain Package, reinforced underbody shield and a full-size spare'}
      ],
      interior:[
        {id:'bmp',code:'INT-BMP',name:'Black Mountain',price:0,   hex:'#2c2c2e',note:'Included'},
        {id:'gyp',code:'INT-GYP',name:'Ocean Coast',    price:4500,hex:'#b9c2c4'}
      ],
      includes:['Dual-motor AWD','20" Adventure All-Season wheels','Wood interior accents','Utility Panel + Powered Tonneau Cover','Autonomy+ & Connect+ 60-day trials'],
      autoIncl:false},
    performance:{name:'R1T Performance',short:'Performance',price:100990,drive:'AWD',motors:'Tri-motor',hp:850,range:371,z60:'2.9s',tow:'11,000 lb',avail:'Available now',folder:'MOT-301',codes:['MOT-301'],
      colors:['esker','glacier','limestone','forest','midnight','redcanyon','rivianblue','stormblue','halfmoon'],
      wheels:[
        {id:'2ar', code:'WHL-2AR', name:'22" Range',               price:0,   note:'Included'},
        {id:'0aas',code:'WHL-0AAS',name:'20" Adventure All-Season',price:0,   note:'Included alternate'},
        {id:'2sd', code:'WHL-2SD', name:'22" Sport Dark',          price:1000,note:'with Darkout accents'},
        {id:'0ad', code:'WHL-0AD', name:'20" All-Terrain Dark',    price:4950,note:'bundles the All-Terrain Package, reinforced underbody shield and a full-size spare'}
      ],
      interior:[
        {id:'pbmp',code:'INT-PBMP',name:'Black Mountain Signature',price:0,   hex:'#2c2c2e',note:'Included'},
        {id:'ssww',code:'INT-SSWW',name:'Slate Sky Signature',     price:3000,hex:'#8d9aa6'}
      ],
      includes:['Everything in Premium, plus:','Tri-motor AWD (850 hp)','Sound + Vision: premium audio + dynamic glass roof','Signature wood interior + sueded headliner','Compass Yellow brake calipers + accents'],
      autoIncl:false},
    quad:{name:'R1T Quad',short:'Quad',price:115990,drive:'AWD',motors:'Quad-motor',hp:1025,range:374,z60:'2.5s',tow:'11,000 lb',avail:'Available now',folder:'MOT-401',codes:['MOT-401'],
      colors:['esker','glacier','forest','midnight','redcanyon','rivianblue','stormblue','halfmoon'],
      wheels:[
        {id:'2sp',code:'WHL-2SP',name:'22" Super Sport',                    price:0,note:'Included'},
        {id:'2sb',code:'WHL-2SB',name:'22" Sport Burnished Bronze',         price:0,note:'Included alternate'},
        {id:'0dd',code:'WHL-0DD',name:'20" Dune Satin Graphite All-Terrain',price:0,note:'all-terrain · Included alternate'}
      ],
      interior:[
        {id:'pbmp',code:'INT-PBMP',name:'Black Mountain Signature',price:0,   hex:'#2c2c2e',note:'Included'},
        {id:'ssww',code:'INT-SSWW',name:'Slate Sky Signature',     price:3000,hex:'#8d9aa6'}
      ],
      includes:['Everything in Performance, plus:','Quad-motor AWD (1,025 hp)','RAD Tuner custom drive modes','Reinforced underbody shield standard','Laguna Beach Blue brake calipers + accents'],
      autoIncl:false}
  },

  /* feature-comparison rows for the "Compare trims" matrix. Dynamic spec rows (availability,
     drivetrain, hp, 0-60, range, towing) are derived live from each column's selected drive +
     wheel — these are the vehicle-specific equipment rows. values: true→check, false→dash,
     a cmpCell token ('opt25', …), or a plain string rendered as-is. */
  compareSpecs:[
    {label:'Sound + Vision — Dolby Atmos premium audio + dynamic glass roof',values:{premium:'opt25',performance:true,quad:true}},
    {label:'Power Upgrade — 665 hp, 0–60 in 3.4s',values:{premium:'Optional · +$5,000',performance:false,quad:false}},
    {label:'Long Range pack — 420 mi, 11,000 lb tow',values:{premium:'Optional · +$7,000',performance:false,quad:false}},
    {label:'Signature wood interior + sueded headliner',values:{premium:false,performance:true,quad:true}},
    {label:'Colored brake calipers + accents',values:{premium:false,performance:'Compass Yellow',quad:'Laguna Beach Blue'}},
    {label:'RAD Tuner custom drive modes',values:{premium:false,performance:false,quad:true}},
    {label:'Reinforced underbody shield',values:{premium:'With All-Terrain wheels (+$4,950)',performance:'With All-Terrain wheels (+$4,950)',quad:true}}
  ],
  baseLabel:'Included on every R1T',
  baseIncludes:['NACS port · 21,000+ Tesla Superchargers','Powered Tonneau Cover · Utility Panel (frunk)','Autonomy+ 60-day trial','Connect+ 60-day trial','Rivian app, digital key & OTA updates','Driver+ safety suite'],

  /* optional per-trim "verdict" copy under the compare cards; omit and the app writes a
     data-driven line instead. Copy may embed {tokens} — drive, motors, driveSub, range, hp,
     z60, tow, avail — filled from that column's live drive + wheel pick. */
  verdictNotes:{
    premium:'The value pick and the range leader: {motors} {drive}, {range} mi as configured — and the only trim that takes the $5,000 Power Upgrade (665 hp).',
    performance:'The performance sweet spot — {hp} hp, 0–60 in {z60}, with Sound + Vision and the Max pack standard.',
    quad:'The 1,025-hp flagship with RAD Tuner drive modes and the shortest 0–60 in the lineup.'
  },

  /* Power Upgrade is Premium-only in Rivian's ruleset (hidden/unselectable on Performance and
     Quad), but app.js's addon rendering has no per-trim eligibility gate today (only
     inclTrims, which marks an addon as already-included — the opposite effect) — it will
     still render as a selectable $5,000 checkbox on the Performance/Quad option panels. The
     name below flags this inline; see the PR description for the underlying app.js gap. */
  addons:[
    {id:'autonomy',name:'Autonomy+ driver assist',price:2500,grp:'Driver assistance',cmp:true,link:'https://rivian.com/autonomy'},
    {id:'power',name:'Power Upgrade (Premium only) — 665 hp, 0–60 in 3.4s',price:5000,grp:'Performance',onlyTrims:['premium'],link:'https://rivian.com/r1t'},
    {id:'soundvision',name:'Sound + Vision — Dolby Atmos audio + dynamic glass roof',price:2500,grp:'Packages',inclTrims:['performance','quad'],cmp:true,link:'https://rivian.com/r1t'}
  ],
  connectPlus:{
    id:'connect-plus',
    name:'Connect+',
    link:'https://rivian.com/connect-plus',
    note:'Built-in media streaming, live security camera, Wi-Fi hotspot, satellite maps, Google Maps details and Rivian Assistant.',
    plans:{
      yearly:{id:'yearly',name:'Yearly',price:149.99,period:'yr'},
      monthly:{id:'monthly',name:'Monthly',price:14.99,period:'mo'}
    }
  },
  interiors:{
    bmp:{name:'Black Mountain',code:'INT-BMP',price:0,hex:'#2c2c2e'},
    gyp:{name:'Ocean Coast',code:'INT-GYP',price:4500,hex:'#b9c2c4'},
    pbmp:{name:'Black Mountain Signature',code:'INT-PBMP',price:0,hex:'#2c2c2e'},
    ssww:{name:'Slate Sky Signature',code:'INT-SSWW',price:3000,hex:'#8d9aa6'}
  },

  /* Interior cabin photos hotlinked from Rivian's CDN, keyed by interior code. INT-BMP,
     INT-PBMP and INT-SSWW paths carry over unchanged from a prior (price-stale) community PR
     since those codes/finishes are unchanged; INT-GYP is a fresh find (same "PDP/interiors"
     convention, "oc-r1t-cover" naming), visually verified 2026-08-30 to render Ocean Coast. */
  cabins:{
    'INT-BMP':'shop/PDP/interiors/black-mountain-dark-ash/BMDarkWood-R1T-Cover_sdnf29',
    'INT-GYP':'shop/PDP/interiors/ocean-coast/oc-r1t-cover_k1rjxh',
    'INT-PBMP':'shop/PDP/interiors/black-mtn-brown-ash/R1T-Black-Mountain-B-Ash-D-Cover_zmvy0n',
    'INT-SSWW':'shop/PDP/interiors/slate-sky-walnut/SlateSky-R1T-Cover_dxfhvi'
  },

  /* Wheel selector swatches hotlinked from Rivian's Builder CDN, keyed by wheel code (full
     'WHL-*' form — see the img comment above). All seven mined from the live builder payload. */
  wheelSwatch:{
    'WHL-0AAS':'v1785860241/shop/Builder/Options/Wheels/Swatches/whl0aas_y0msrc.png',
    'WHL-2SD':'v1723843501/shop/Builder/Options/Wheels/Swatches/WHL-2SD_zq2l6x',
    'WHL-2AR':'v1716329150/shop/Builder/Options/Wheels/Swatches/WHL-2AR_bdgxek',
    'WHL-0AD':'v1716329150/shop/Builder/Options/Wheels/Swatches/WHL-0AD_fdhdoa',
    'WHL-2SP':'v1748894945/shop/Builder/Options/Wheels/Swatches/WHL-2SP_xaj6os',
    'WHL-2SB':'v1748894945/shop/Builder/Options/Wheels/Swatches/WHL-2SB_kzxscg',
    'WHL-0DD':'v1716329150/shop/Builder/Options/Wheels/Swatches/WHL-0DD_du2ofm'
  },

  gearImg:'https://gearshop.rivian.com/cdn/shop/',
  /* Covers the builder's Accessories group as resolved on the Quad trim (the tracker's
     accTrim reference). PROC40WJ94 (J1772 AC Adapter) and ACERKFT001 (the included key fob)
     are the ruleset's $0/included codes and are handled per-item below rather than listed at
     their Gear Shop retail price. */
  accessories:[
    {grp:'Charging & power',items:[
      {id:'wall',name:'Wall Charger (NACS, L2)',price:800,icon:'charge',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-Wall-Charger-Primary-01_3e0c66d1-08bb-4943-9c42-219bd3238b62.jpg?v=1752689296&width=240',link:'https://gearshop.rivian.com/products/rivian-wall-charger-nacs',note:'Home Level&nbsp;2 charger, NACS native — no adapter needed.'},
      {id:'portable',name:'Portable Charger (L1/L2)',price:400,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-Portable-Charger-Primary-01.jpg?v=1752268037&width=240',link:'https://gearshop.rivian.com/products/rivian-portable-charger-nacs',note:'Level&nbsp;1 / Level&nbsp;2 on the go.'},
      {id:'ccs',name:'Combo CCS1 DC Adapter',price:200,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-to-Combo-CCS-Adapter-Primary-01.jpg?v=1752274970&width=240',link:'https://gearshop.rivian.com/products/combo-ccs1-dc-adapter',note:'Bundled free on Quad; $200 on Premium/Performance and at the Gear Shop.'}
    ]},
    {grp:'Cargo, utility & protection',items:[
      {id:'mats',name:'All-Weather Floor Mats',price:225,icon:'mats',img:'https://gearshop.rivian.com/cdn/shop/files/R1T-All-Weather-Mats-Gen-2-Black-Primary-01.jpg?v=1764101262&width=240',link:'https://gearshop.rivian.com/products/r1t-all-weather-floor-mats',note:'Custom-fit floor protection set (Gen&nbsp;2).'},
      {id:'crossbars',name:'Cargo Crossbars (Bright)',price:700,icon:'rack',img:'https://gearshop.rivian.com/cdn/shop/files/Cargo-Crossbars-Silver-Primary-01.jpg?v=1753119496&width=240',link:'https://gearshop.rivian.com/products/cargo-crossbars',note:'One-hand snap-on; needed for roof racks.'},
      {id:'crossbarsdark',name:'Cargo Crossbars (Dark)',price:800,icon:'rack',img:'https://gearshop.rivian.com/cdn/shop/files/Cargo-Crossbars-Silver-Primary-01.jpg?v=1753119496&width=240',link:'https://gearshop.rivian.com/products/cargo-crossbars',note:'Darkout-matched finish of the crossbars above (same product page).'},
      {id:'tailgatepad',name:'Tailgate Pad',price:200,icon:'bike',img:'https://gearshop.rivian.com/cdn/shop/files/Tailgate-Pad-Primary-01_zavm7x.jpg?v=1750724177&width=240',link:'https://gearshop.rivian.com/products/rivian-tailgate-pad',note:'Protects the tailgate when hauling bikes.'},
      {id:'bednet',name:'R1T Cargo Bed Net',price:225,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/files/9122024_Alice_Le_VAR1TCN001_Front_6679.jpg?v=1764874845&width=240',link:'https://gearshop.rivian.com/products/r1t-cargo-net',note:'Keeps bed cargo secured.'},
      {id:'organizer',name:'Center Console Organizer',price:50,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/files/R1-Center-Console-Organizer-PDP-01.jpg?v=1744250393&width=240',link:'https://gearshop.rivian.com/products/r1-center-console-organizer',note:'Modular front console tray.'},
      {id:'gearcable',name:'Gear Guard Cable',price:100,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/products/Extended-Length-Gear-Guard-Cable-Primary-01_vuisnr.webp?v=1750724232&width=240',link:'https://gearshop.rivian.com/products/gear-guard-cable',note:'14 ft locking security cable.'},
      {id:'sunshade',name:'Front Sunshade',price:125,icon:'sun',img:'https://gearshop.rivian.com/cdn/shop/files/Sunshade-White-Primary-01_mkmwpz.webp?v=1750724093&width=240',link:'https://gearshop.rivian.com/products/r1-front-sunshade',note:'Folding windshield sun shade.'},
      {id:'screen',name:'Screen Protectors',price:75,icon:'monitor',img:'https://gearshop.rivian.com/cdn/shop/files/R1.Main.Display.ScreenProtector.001.png?v=1778779256&width=240',link:'https://gearshop.rivian.com/products/r1-screen-protectors',note:'Protectors for the center + driver displays.'},
      {id:'seatback',name:'Seatback Device Holder',price:150,icon:'tablet',img:'https://gearshop.rivian.com/cdn/shop/files/Seatback-Device-Holder-Vertical-Front-ND.png?v=1764965097&width=240',link:'https://gearshop.rivian.com/products/seatback-device-holder',note:'Mounts a tablet or phone to the seatback.'},
      {id:'carcover',name:'R1T Outdoor Car Cover',price:500,icon:'box',full:true,img:'https://gearshop.rivian.com/cdn/shop/files/260515_BRANDON-DELA-CRUZ_GEAR-SHOP-R1T-COVER_0158.jpg?v=1779224939&width=240',link:'https://gearshop.rivian.com/products/r1t-outdoor-car-cover',note:'Custom-fit, water-resistant, breathable cover with storage bag.'},
      {id:'kitchen',name:'Travel Kitchen',price:1400,icon:'utensils',img:'https://gearshop.rivian.com/cdn/shop/files/Travel-Kitchen-Hero.jpg?v=1752682568&width=240',link:'https://gearshop.rivian.com/products/travel-kitchen',note:'Portable camp kitchen with induction cooktop; pairs with Camp Mode.'},
      {id:'awning',name:'Kammok Crosswing Awning',price:1300,icon:'sun',img:'https://gearshop.rivian.com/cdn/shop/files/Kammok-Crosswing-Awning-Primary-01.webp?v=1750723984&width=240',link:'https://gearshop.rivian.com/products/kammok-crosswing-awning',note:'Shade awning; mounts to the cab or crossbars. Shows disabled on the builder&rsquo;s default configuration — confirm it unlocks with your chosen options before ordering.'},
      {id:'keyfob',name:'Key Fob',price:250,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/files/R1T-FOB-2.0-Primary-02_903227e6-5394-4d5b-b51c-e7f94a72737b.jpg?v=1750723969&width=240',link:'https://gearshop.rivian.com/products/key-fob',note:'Spare/replacement key fob.'}
    ]}
  ],
  accFootnote:'Prices verified against Rivian&rsquo;s R1T builder ruleset and Gear Shop, August 2026. The J1772 AC Adapter ships standard/included (Gear Shop sells a spare separately for $50). The Combo CCS1 DC Adapter is bundled free on Quad only — Premium and Performance pay the $200 shown here, which matches the Gear Shop. The 20&quot; All-Terrain Dark wheel price ($4,950) bundles Rivian&rsquo;s All-Terrain Package, Darkout accents and a full-size spare tire — pricing it as a standalone add-on would double-count that package, so it isn&rsquo;t listed separately here. Every R1T also includes a Utility Panel and Powered Tonneau Cover standard — both are now bundled at no charge in the builder, not a paid add-on.'
};
