/* Rivian R2 — vehicle spec + accessory data (trims, colors, wheels, interiors,
   gear). One self-contained, ownable file per vehicle; loaded as a classic script
   before app.js. See CONTRIBUTING.md → "Adding or maintaining a vehicle dataset".
   Data owner: mmocniak.
   Prices last verified against rivian.com builder coverage + the Gear Shop
   (Shopify product JSON) on 2026-07-05. */
var VEHICLES = (typeof VEHICLES !== 'undefined' && VEHICLES) || {};

VEHICLES.r2 = {
  id:'r2',
  name:'R2',
  verified:'2026-07',
  /* Rivian visualizer program segment used in the CDN image URLs (color chips,
     interior chips, 360 hero renders). Discover a vehicle's program from the live
     configurator's 360 image URL. */
  img:{program:'gold-iris'},
  /* trim column to visually highlight in the compare matrix (the halo column) */
  flagshipTrim:'performance',
  /* optional per-trim "verdict" copy under the compare cards; omit and the app writes a
     data-driven line instead. verdictNotesLaunchOff overrides while the promo is toggled off. */
  verdictNotes:{
    standard:'Cheapest of the range — and the longest wait. Single-motor RWD, arriving 2027.',
    premium:'The middle ground on price, comfort, and timing. Adds the premium cabin, audio, rear glass, lighting, and tow hooks.',
    performance:'Priciest, but the most powerful and ready now. Bundles the Launch Edition: Autonomy+, Tow Package, semi-active suspension, and accents.'
  },
  verdictNotesLaunchOff:{
    performance:'Priciest, but the most powerful and ready now. Shown as if the Launch Edition promo has ended — Autonomy+ and Tow Package price individually.'
  },

  colors:{
    esker:{name:'Esker Silver',price:0,code:'EXP-ESV',hex:'#c9ccce',note:'Included'},
    glacier:{name:'Glacier White',price:1000,code:'EXP-GWT',hex:'#eef1f2'},
    halfmoon:{name:'Half Moon Grey',price:1500,code:'EXP-HMG',hex:'#7d8388'},
    forest:{name:'Forest Green',price:1500,code:'EXP-FGR',hex:'#2f4034',avail:'August 2026'},
    midnight:{name:'Midnight',price:2000,code:'EXP-MDN',hex:'#12151b'},
    catalina:{name:'Catalina Cove',price:2000,code:'EXP-CBL',hex:'#3f6f8f'},
    launch:{name:'Launch Green',price:2000,code:'EXP-LGR',hex:'#5d7d3a'},
    borealis:{name:'Borealis',price:2000,code:'EXP-BPR',hex:'#6a5a8f',avail:'September 2026'}
  },

  trims:{
    standard:{name:'R2 Standard',short:'Standard',price:44990,drive:'RWD',motors:'Single-motor',hp:350,range:275,z60:'5.9s',tow:'3,500 lb',avail:'2027',folder:'standard',
      drives:[
        {id:'rwd',  name:'Rear-Wheel Drive', sub:'Standard pack', price:0,    range:275, hp:350, z60:'5.9s', tow:'3,500 lb', drive:'RWD', motors:'Single-motor', pack:'Standard pack',        avail:'Summer 2027', note:'Included'},
        {id:'rwdlr',name:'Rear-Wheel Drive', sub:'Long range',    price:3500, range:345, hp:350, z60:'5.9s', tow:'3,500 lb', drive:'RWD', motors:'Single-motor', pack:'Large pack · ~87.9 kWh', avail:'Spring 2027', note:'Longest range'},
        {id:'awdlr',name:'All-Wheel Drive',  sub:'Long range',    price:7000, range:330, hp:450, z60:'4.6s', tow:'4,400 lb', drive:'AWD', motors:'Dual-motor',   pack:'Large pack · ~87.9 kWh', avail:'Spring 2027', note:'All-Terrain drive mode'}
      ],
      colors:['esker','glacier','midnight','halfmoon','forest'],
      wheels:[{id:'19a',code:'19A',name:'19" Machined Graphite',price:0,rd:0,note:'Included'},{id:'20b',code:'20B',name:'20" Bicolor Carbon',price:1000,rd:-5}],
      interior:[{id:'sbc',code:'INT-SBC',name:'Black Crater',price:0,hex:'#2c2c2e',note:'Standard'}],
      includes:['Single-motor RWD','Standard interior + audio','19" all-season wheels'],
      autoIncl:false},
    premium:{name:'R2 Premium',short:'Premium',price:53990,drive:'AWD',motors:'Dual-motor',hp:450,range:330,z60:'4.6s',tow:'4,400 lb',avail:'Late 2026',folder:'premium',
      colors:['esker','glacier','midnight','catalina','halfmoon','forest'],
      wheels:[{id:'20b',code:'20B',name:'20" Bicolor Carbon',price:0,rd:0,note:'Included'},{id:'21b',code:'21B',name:'21" Liquid Tungsten',price:2000,rd:-8}],
      interior:[{id:'pbc',code:'INT-PBC',name:'Black Crater Signature',price:0,hex:'#2c2c2e',note:'Included'},{id:'pcc',code:'INT-PCC',name:'Coastal Cloud Signature',price:1000,hex:'#c9cfca',avail:'August 2026'}],
      includes:['Dual-motor AWD','Premium interior: wood accents, heated + ventilated front seats, heated rear, Rivian Torch','Premium audio','Rear drop glass (power rear window)','Matrix-LED Dynamic Adventure Lighting','Tow hooks','20" all-season wheels'],
      autoIncl:false},
    performance:{name:'R2 Performance',short:'Performance',price:57990,drive:'AWD',motors:'Dual-motor',hp:656,range:330,z60:'3.6s',tow:'4,400 lb',avail:'Available now',folder:'performance',
      colors:['esker','glacier','midnight','catalina','halfmoon','forest','borealis','launch'],
      wheels:[{id:'21b',code:'21B',name:'21" Liquid Tungsten',price:0,rd:0,note:'Included'},{id:'20at',code:'20AT',name:'20" Black Sand A/T',price:1000,rd:-16,note:'all-terrain'}],
      interior:[{id:'pbc',code:'INT-PBC',name:'Black Crater Signature',price:0,hex:'#2c2c2e',note:'Included'},{id:'pcc',code:'INT-PCC',name:'Coastal Cloud Signature',price:1000,hex:'#c9cfca',avail:'August 2026'}],
      includes:['Everything in Premium, plus:','Semi-active suspension','Compass Yellow brake calipers + accents','21" all-season wheels','Launch Package: lifetime Autonomy+, Tow Package, Launch key fob'],
      autoIncl:true},
  },

  /* feature-comparison rows for the "Compare trims" matrix. Dynamic spec rows
     (availability, drivetrain, hp, 0-60, range, towing) are derived live from each
     column's selected drive + wheel — these are the vehicle-specific equipment rows.
     values: true→check, false→dash, or a cmpCell token ('excl2000', 'launchFob', …). */
  compareSpecs:[
    {label:'Premium interior — wood, heated + ventilated, heated rear, Torch',values:{standard:false,premium:true,performance:true}},
    {label:'Premium audio',values:{standard:false,premium:true,performance:true}},
    {label:'Rear drop glass (power rear window)',values:{standard:false,premium:true,performance:true}},
    {label:'Matrix-LED adaptive lighting',values:{standard:false,premium:true,performance:true}},
    {label:'Tow hooks',values:{standard:false,premium:true,performance:true}},
    {label:'Semi-active suspension',values:{standard:false,premium:false,performance:true}},
    {label:'Compass Yellow brake calipers + accents',values:{standard:false,premium:false,performance:true}},
    {label:'Launch key fob',values:{standard:false,premium:false,performance:'launchFob'}},
    {label:'Exclusive paint (Launch Green, Borealis)',values:{standard:false,premium:false,performance:'excl2000'}}
  ],
  baseLabel:'Included on every R2',
  baseIncludes:['NACS port · 21,000+ Tesla Superchargers','Autonomy+ 60-day trial','Rivian app, digital key & OTA updates','Driver+ safety suite (20+ features)','5 seats · 90.1 cu-ft max storage','9.6" ground clearance'],

  addons:[
    {id:'autonomy',name:'Autonomy+ driver assist',price:2500,grp:'Driver assistance',launchInc:true,link:'https://rivian.com/autonomy'},
    {id:'tow',name:'Tow Package',price:950,grp:'Towing & utility',launchInc:true,link:'https://rivian.com/configurations/builder/r2'},
    {id:'spare',name:'Compact Spare Tire',price:755,grp:'Towing & utility',link:'https://rivian.com/gear-shop'}
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
  interiors:{pbc:{name:'Black Crater Signature',code:'INT-PBC',price:0,hex:'#2c2c2e'},pcc:{name:'Coastal Cloud Signature',code:'INT-PCC',price:1000,hex:'#c9cfca'}},

  /* Interior cabin photos hotlinked from Rivian's CDN, keyed by interior code. No parametric
     interior visualizer exists (the exterior 360 path has no interior axis), so these are the
     fixed studio shots the live configurator serves per interior; update if Rivian swaps them. */
  cabins:{
    'INT-SBC':'shop/RetailCodeModalContent/INT-SBC/media1_gafbag',
    'INT-PBC':'shop/RetailCodeModalContent/INT-PBC/251203_BRANDON-DELACRUZ_R2-INTERIORS_0079-Final_1_ktfhsg.jpg',
    'INT-PCC':'shop/RetailCodeModalContent/INT-PCC/20260211_ElliotRoss_Rivian_R2_CatalinaBlue_0293-FPO_1_kxekq6.jpg'
  },

  /* Wheel selector swatches hotlinked from Rivian's Builder CDN, keyed by wheel code.
     Each has its own Cloudinary filename + version (no parametric wheel-chip path exists).
     NB: the 20AT (Black Sand A/T) swatch is named "20a…" on Rivian's CDN — not a typo. */
  wheelSwatch:{
    '19A':'v1772237143/shop/Builder/Options/Wheels/Swatches/whl-19a_trdbcs.png',
    '20B':'v1772237143/shop/Builder/Options/Wheels/Swatches/whl-20b_yxhhqk.png',
    '21B':'v1771872482/shop/Builder/Options/Wheels/Swatches/21b_v3v9z0.png',
    '20AT':'v1771872482/shop/Builder/Options/Wheels/Swatches/20a_emtwr0.png'
  },

  gearImg:'https://gearshop.rivian.com/cdn/shop/',
  accessories:[
    {grp:'Charging & power',items:[
      {id:'wall',name:'Wall Charger (NACS, L2)',price:800,icon:'charge',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-Wall-Charger-Primary-01_3e0c66d1-08bb-4943-9c42-219bd3238b62.jpg?v=1752689296&width=240',link:'https://gearshop.rivian.com/products/rivian-wall-charger-nacs',note:'Home Level&nbsp;2 charger, NACS native — no adapter needed.'},
      {id:'portable',name:'Portable Charger (L1/L2)',price:400,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-Portable-Charger-Primary-01.jpg?v=1752268037&width=240',link:'https://gearshop.rivian.com/products/rivian-portable-charger-nacs',note:'Level&nbsp;1 / Level&nbsp;2 on the go. Free via rebate in some states — <a href="https://afdc.energy.gov/laws/state" target="_blank" rel="noopener">check incentives ↗</a>.'},
      {id:'j1772',name:'J1772 AC Adapter',price:50,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-to-J1772-Adapter-Primary-01.jpg?v=1752274237&width=240',link:'https://gearshop.rivian.com/products/j1772-ac-adapter',note:'For older Level&nbsp;2 chargers. Free via rebate in some states — <a href="https://afdc.energy.gov/laws/state" target="_blank" rel="noopener">check incentives ↗</a>.'},
      {id:'ccs',name:'Combo CCS1 DC Adapter',price:200,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-to-Combo-CCS-Adapter-Primary-01.jpg?v=1752274970&width=240',link:'https://gearshop.rivian.com/products/combo-ccs1-dc-adapter',note:'For older (non-Tesla) DC fast chargers. Free via rebate in some states — <a href="https://afdc.energy.gov/laws/state" target="_blank" rel="noopener">check incentives ↗</a>.'}
    ]},
    {grp:'Cargo, utility & protection',items:[
      {id:'crossbars',name:'Roof Cargo Crossbars',price:700,icon:'rack',img:'https://gearshop.rivian.com/cdn/shop/files/crossbars_gunmetal_qtr_R2.png?v=1776971211&width=240',link:'https://gearshop.rivian.com/products/r2-cargo-crossbars',avail:'Coming soon',note:'R2-specific (not R1-compatible). One-hand snap-on; needed for roof racks.'},
      {id:'spare',name:'Compact Spare Tire',price:755,icon:'wheel',img:'https://gearshop.rivian.com/cdn/shop/files/R2_Compact_SpareFRONT_DEF.png?v=1780073810&width=240',link:'https://gearshop.rivian.com/products/r2-compact-spare-tire',note:'Drops into the R2’s dedicated spare well; tire service kit included. <b>Phone / Service Center order.</b>'},
      {id:'mats',name:'All-Weather Floor Mats',price:225,icon:'mats',img:'https://gearshop.rivian.com/cdn/shop/files/R2_All_Weather_Mats.png?v=1775245910&width=240',link:'https://gearshop.rivian.com/products/r2-all-weather-floor-mats',note:'Custom-fit floor protection set.'},
      {id:'cargocover',name:'Cargo Cover',price:200,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/files/CargoCover_R2.png?v=1778789991&width=240',link:'https://gearshop.rivian.com/products/r2-cargo-cover',avail:'Coming soon',note:'Retractable cover that keeps rear storage out of sight.'},
      {id:'sunshade',name:'Front Sunshade',price:125,icon:'sun',img:'https://gearshop.rivian.com/cdn/shop/files/R2_SUNSHADE_STUDIO_v01_b864c8bf-d4a9-41f2-8040-2b004727501b.png?v=1780093224&width=240',link:'https://gearshop.rivian.com/products/r2-front-sunshade',note:'Folding windshield sun shade.'},
      {id:'screen',name:'Screen Protectors',price:65,icon:'monitor',img:'https://gearshop.rivian.com/cdn/shop/files/R2_Screen_protector_Center_Display_Final.png?v=1778790077&width=240',link:'https://gearshop.rivian.com/products/r2-screen-protectors',note:'Protectors for the center + driver displays.'},
      {id:'seatback',name:'Seatback Device Holder',price:150,icon:'tablet',img:'https://gearshop.rivian.com/cdn/shop/files/Seatback-Device-Holder-Vertical-Front-ND.png?v=1764965097&width=240',link:'https://gearshop.rivian.com/products/seatback-device-holder',note:'Mounts a tablet or phone to the seatback.'},
      {id:'kitchen',name:'Travel Kitchen',price:1400,icon:'utensils',img:'https://gearshop.rivian.com/cdn/shop/files/Travel-Kitchen-Hero.jpg?v=1752682568&width=240',link:'https://gearshop.rivian.com/products/travel-kitchen',note:'Portable camp kitchen with induction cooktop; pairs with Camp Mode.'},
      {id:'bikeroof',name:'Rooftop Bike Mount',price:300,icon:'bike',img:'https://gearshop.rivian.com/cdn/shop/products/Bike-Mount-Primary-01_znecvj.webp?v=1750724235&width=240',link:'https://gearshop.rivian.com/products/rooftop-bike-mount',note:'Roof-mounted bike carrier. <b>Needs crossbars.</b>'},
      {id:'bikehitch',name:'Küat Piston SR Hitch Rack',price:575,icon:'bike',img:'https://gearshop.rivian.com/cdn/shop/files/KUAT-for-Rivian-Bike-Mount-Primary-01_1.jpg?v=1750724157&width=240',link:'https://gearshop.rivian.com/products/kuat-piston-sr',note:'Hitch-mounted Küat Piston SR; holds 2 bikes, tool-free.'}
    ]}
  ],
  accFootnote:'Not yet priced by Rivian: Field Outlet (V2L power-out), Treehouse rooftop tent, detachable wheeled cargo box and roof cargo box; the HEST Foamy sleeping mat is priced at HEST. Optional wheel/tire sets (20&quot; Black Sand all-terrain $5,248, 21&quot; Liquid Tungsten $4,508) install at a Service Center. Every R2 also includes built-in camping features at no cost — fold-flat rear seats, open-air cabin, in-cabin 120V outlet, Camp Mode auto-leveling and a heat pump. Prices from Rivian&rsquo;s R2 Gear Shop / configurator, July 2026.'
};
