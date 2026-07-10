/* Rivian R1T — vehicle spec + accessory data. One self-contained, ownable file per
   vehicle; loaded as a classic script before app.js. See CONTRIBUTING.md.
   Prices last verified against rivian.com builder coverage + the Gear Shop on 2026-07-09. */
var VEHICLES = (typeof VEHICLES !== 'undefined' && VEHICLES) || {};

VEHICLES.r1t = {
  id:'r1t',
  name:'R1T',
  verified:'2026-07',
  img:{compositor:'r1t',view:'side',ver:'2023.1',extra:['gen-2'],program:'gold-iris'},
  flagshipTrim:'quad',

  colors:{
    lasilver:{name:'LA Silver',price:0,code:'EXP-LSV',hex:'#b8bbbd',note:'Included'},
    glacier:{name:'Glacier White',price:1950,code:'EXP-GWT',hex:'#eef1f2'},
    halfmoon:{name:'Half Moon Grey',price:2500,code:'EXP-HMG',hex:'#7d8388'},
    rivianblue:{name:'Rivian Blue',price:2500,code:'EXP-RBL',hex:'#1d4063'},
    redcanyon:{name:'Red Canyon',price:2500,code:'EXP-CRD',hex:'#7a2b26'},
    forest:{name:'Forest Green',price:2500,code:'EXP-FGR',hex:'#2f4034'},
    midnight:{name:'Midnight',price:3000,code:'EXP-MDN',hex:'#12151b'},
    stormblue:{name:'Storm Blue',price:3000,code:'EXP-SBL',hex:'#2f4a63'}
  },

  trims:{
    dual:{name:'R1T Dual Motor',short:'Dual',price:79990,drive:'AWD',motors:'Dual-motor',hp:533,range:329,z60:'4.5s',tow:'7,700 lb',avail:'Available now',folder:'MOT-201',
      drives:[
        {id:'large',    name:'Dual Motor',        sub:'Large pack', price:0,     range:329, hp:533, z60:'4.5s', tow:'7,700 lb',  drive:'AWD', motors:'Dual-motor', pack:'Large pack',          avail:'Available now', note:'Included'},
        {id:'max',      name:'Dual Motor',        sub:'Max pack',   price:7000,  range:420, hp:533, z60:'4.5s', tow:'11,000 lb', drive:'AWD', motors:'Dual-motor', pack:'Max pack · 140 kWh',  avail:'Available now', note:'Longest range'},
        {id:'perflarge',name:'Performance Dual',  sub:'Large pack', price:5000,  range:329, hp:665, z60:'3.4s', tow:'7,700 lb',  drive:'AWD', motors:'Dual-motor', pack:'Large pack',          avail:'Available now', note:'665 hp'},
        {id:'perfmax',  name:'Performance Dual',  sub:'Max pack',   price:12000, range:420, hp:665, z60:'3.4s', tow:'11,000 lb', drive:'AWD', motors:'Dual-motor', pack:'Max pack · 140 kWh',  avail:'Available now', note:'665 hp · longest range'}
      ],
      colors:['lasilver','glacier','halfmoon','rivianblue','redcanyon','forest','midnight'],
      wheels:[
        {id:'sb22',code:'WHL-2SS',name:'22" Sport Bright',price:0,rd:0,note:'Included'},
        {id:'rg22',code:'WHL-2AR',name:'22" Range',price:1000,rd:0,note:'range-optimized tires'},
        {id:'sd22',code:'WHL-2SD',name:'22" Sport Dark',price:1750,rd:0,note:'with Darkout accents'},
        {id:'at20',code:'WHL-0A1',name:'20" All-Terrain',price:3950,rd:-15,note:'all-terrain'},
        {id:'ad20',code:'WHL-0AD',name:'20" All-Terrain Dark',price:4950,rd:-15,note:'all-terrain · Darkout accents'}
      ],
      interior:[
        {id:'bmda',code:'INT-BMP',name:'Black Mountain + Dark Ash Wood',price:0,hex:'#2c2c2e',note:'Included'},
        {id:'ocdw',code:'INT-OCDW',name:'Ocean Coast + Driftwood',price:2500,hex:'#bfc7c4'},
        {id:'slate',code:'INT-SSWW',name:'Slate Sky + Walnut Wood',price:3000,hex:'#8d9aa6'}
      ],
      includes:['Dual-motor AWD (533 hp)','22" Sport Bright wheels','Standard audio (Sound + Vision optional)','Tows 7,700 lb — 11,000 lb with Max pack','Performance Upgrade available (+$5,000: 665 hp, 0–60 3.4s)'],
      autoIncl:false},
    tri:{name:'R1T Tri Motor',short:'Tri',price:100990,drive:'AWD',motors:'Tri-motor',hp:850,range:371,z60:'2.9s',tow:'11,000 lb',avail:'Available now',folder:'MOT-301',
      drives:[
        {id:'max',name:'Tri Motor',sub:'Max pack',price:0,range:371,hp:850,z60:'2.9s',tow:'11,000 lb',drive:'AWD',motors:'Tri-motor',pack:'Max pack · 140 kWh',avail:'Available now',note:'Included'}
      ],
      colors:['lasilver','glacier','halfmoon','rivianblue','redcanyon','forest','midnight','stormblue'],
      wheels:[
        {id:'sb22',code:'WHL-2SS',name:'22" Sport Bright',price:0,rd:0,note:'Included'},
        {id:'rg22',code:'WHL-2AR',name:'22" Range',price:1000,rd:0,note:'range-optimized tires'},
        {id:'sd22',code:'WHL-2SD',name:'22" Sport Dark',price:1750,rd:0,note:'with Darkout accents'},
        {id:'at20',code:'WHL-0A1',name:'20" All-Terrain',price:3950,rd:-15,note:'all-terrain'},
        {id:'ad20',code:'WHL-0AD',name:'20" All-Terrain Dark',price:4950,rd:-15,note:'all-terrain · Darkout accents'}
      ],
      interior:[
        {id:'bmba',code:'INT-PBMP',name:'Black Mountain + Brown Ash Wood',price:0,hex:'#2c2c2e',note:'Included'},
        {id:'ocdw',code:'INT-OCDW',name:'Ocean Coast + Driftwood',price:2500,hex:'#bfc7c4'},
        {id:'slate',code:'INT-SSWW',name:'Slate Sky + Walnut Wood',price:3000,hex:'#8d9aa6'}
      ],
      includes:['Everything in Dual, plus:','Tri-motor AWD (850 hp · 0–60 2.9s)','Max pack standard (371 mi)','Sound + Vision: Dolby Atmos premium audio + dynamic glass roof','11,000 lb towing'],
      autoIncl:false},
    quad:{name:'R1T Quad Motor',short:'Quad',price:115990,drive:'AWD',motors:'Quad-motor',hp:1025,range:374,z60:'2.5s',tow:'11,000 lb',avail:'Available now',folder:'MOT-401',
      drives:[
        {id:'max',name:'Quad Motor',sub:'Max pack',price:0,range:374,hp:1025,z60:'2.5s',tow:'11,000 lb',drive:'AWD',motors:'Quad-motor',pack:'Max pack · 140 kWh',avail:'Available now',note:'Included'}
      ],
      colors:['lasilver','glacier','halfmoon','rivianblue','redcanyon','forest','midnight','stormblue'],
      wheels:[
        {id:'sb22',code:'WHL-2SS',name:'22" Sport Bright',price:0,rd:0,note:'Included'},
        {id:'rg22',code:'WHL-2AR',name:'22" Range',price:1000,rd:0,note:'range-optimized tires'},
        {id:'sd22',code:'WHL-2SD',name:'22" Sport Dark',price:1750,rd:0,note:'with Darkout accents'},
        {id:'at20',code:'WHL-0A1',name:'20" All-Terrain',price:3950,rd:-15,note:'all-terrain'},
        {id:'ad20',code:'WHL-0AD',name:'20" All-Terrain Dark',price:4950,rd:-15,note:'all-terrain · Darkout accents'}
      ],
      interior:[
        {id:'bmba',code:'INT-PBMP',name:'Black Mountain + Brown Ash Wood',price:0,hex:'#2c2c2e',note:'Included'},
        {id:'ocdw',code:'INT-OCDW',name:'Ocean Coast + Driftwood',price:2500,hex:'#bfc7c4'},
        {id:'slate',code:'INT-SSWW',name:'Slate Sky + Walnut Wood',price:3000,hex:'#8d9aa6'}
      ],
      includes:['Everything in Tri, plus:','Quad-motor · 1,025 hp · 0–60 2.5s','RAD Tuner custom drive modes','Launch Edition available (+$4,000: Launch Green paint, Burnished Bronze wheels)'],
      autoIncl:false},
  },

  compareSpecs:[
    {label:'Sound + Vision — Dolby Atmos premium audio + dynamic glass roof',values:{dual:'opt25',tri:true,quad:true}},
    {label:'Performance Dual upgrade — 665 hp, 0–60 3.4s',values:{dual:'Optional · +$5,000',tri:false,quad:false}},
    {label:'Max battery pack (140 kWh)',values:{dual:'Optional · +$7,000',tri:true,quad:true}},
    {label:'11,000 lb max towing',values:{dual:'with Max pack',tri:true,quad:true}},
    {label:'RAD Tuner custom drive modes',values:{dual:false,tri:false,quad:true}},
    {label:'Launch Edition — Launch Green paint, Burnished Bronze wheels',values:{dual:false,tri:false,quad:'Optional · +$4,000'}}
  ],
  baseLabel:'Included on every R1T',
  baseIncludes:['NACS port · 21,000+ Tesla Superchargers','Air suspension with adaptive damping','Autonomy+ 60-day trial · Driver+ safety suite','Gear tunnel · powered frunk · spare-tire well','Camp Mode + bed & cabin power outlets','Rivian app, digital key & OTA updates'],

  verdictNotes:{
    dual:'The value pick and the range king: {motors} {drive}, {range} mi as configured — and the only trim that takes the $5,000 Performance Upgrade (665 hp).',
    tri:'The performance sweet spot. 850 hp, 0–60 in {z60}, with the Max pack, Sound + Vision, and 11,000 lb towing all standard.',
    quad:'The 1,025-hp flagship with RAD Tuner. Add the $4,000 Launch Edition for Launch Green and Burnished Bronze wheels.'
  },

  addons:[
    {id:'autonomy',name:'Autonomy+ driver assist',price:2500,grp:'Driver assistance',cmp:true,link:'https://rivian.com/autonomy'},
    {id:'spare',name:'Full-Size Spare Tire',price:1247,grp:'Towing & utility',link:'https://gearshop.rivian.com/products/full-size-spare-tire'}
  ],
  connectPlus:{
    id:'connect-plus',
    name:'Connect+',
    link:'https://rivian.com/connect-plus',
    note:'Built-in media streaming, live security camera, Wi-Fi hotspot, satellite maps and Rivian Assistant. Required for Dolby Atmos decoding on Sound + Vision.',
    plans:{
      yearly:{id:'yearly',name:'Yearly',price:149.99,period:'yr'},
      monthly:{id:'monthly',name:'Monthly',price:14.99,period:'mo'}
    }
  },
  interiors:{
    bmda:{name:'Black Mountain + Dark Ash Wood',code:'INT-BMP',price:0,hex:'#2c2c2e'},
    bmba:{name:'Black Mountain + Brown Ash Wood',code:'INT-PBMP',price:0,hex:'#2c2c2e'},
    ocdw:{name:'Ocean Coast + Driftwood',code:'INT-OCDW',price:2500,hex:'#bfc7c4'},
    slate:{name:'Slate Sky + Walnut Wood',code:'INT-SSWW',price:3000,hex:'#8d9aa6'}
  },

  cabins:{
    'INT-BMP':'shop/PDP/interiors/black-mountain-dark-ash/BMDarkWood-R1T-Cover_sdnf29',
    'INT-PBMP':'shop/PDP/interiors/black-mtn-brown-ash/R1T-Black-Mountain-B-Ash-D-Cover_zmvy0n',
    'INT-OCDW':'shop/PDP/interiors/ocean-coast-driftwood/R1T-Ocean-Coast-Drift-Wood-D-Cover_za5n4v',
    'INT-SSWW':'shop/PDP/interiors/slate-sky-walnut/SlateSky-R1T-Cover_dxfhvi'
  },
  wheelSwatch:{
    'WHL-2SS':'shop/PDP/wheels/22-sport-bright/face_f78qas',
    'WHL-2AR':'shop/PDP/wheels/22-range/face_nvtmi6',
    'WHL-2SD':'shop/PDP/wheels/22-sport-dark/face_uzid0m',
    'WHL-0A1':'shop/PDP/wheels/20-all-terrain-bright/face_jbp8y8',
    'WHL-0AD':'shop/PDP/wheels/20-all-terrain-dark/face_zlbzlm'
  },

  gearImg:'https://gearshop.rivian.com/cdn/shop/',
  accessories:[
    {grp:'Charging & power',items:[
      {id:'wall',name:'Wall Charger (NACS, L2)',price:800,icon:'charge',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-Wall-Charger-Primary-01_3e0c66d1-08bb-4943-9c42-219bd3238b62.jpg?v=1752689296&width=240',link:'https://gearshop.rivian.com/products/rivian-wall-charger-nacs',note:'Home Level&nbsp;2 charger, NACS native — up to 25 mi/hr on R1.'},
      {id:'portable',name:'Portable Charger (L1/L2)',price:400,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-Portable-Charger-Primary-01.jpg?v=1752268037&width=240',link:'https://gearshop.rivian.com/products/rivian-portable-charger-nacs',note:'Level&nbsp;1 / Level&nbsp;2 on the go; 120V and 240V adapters included.'},
      {id:'j1772',name:'J1772 AC Adapter',price:50,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-to-J1772-Adapter-Primary-01.jpg?v=1752274237&width=240',link:'https://gearshop.rivian.com/products/j1772-ac-adapter',note:'For older Level&nbsp;2 chargers.'},
      {id:'ccs',name:'Combo CCS1 DC Adapter',price:200,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-to-Combo-CCS-Adapter-Primary-01.jpg?v=1752274970&width=240',link:'https://gearshop.rivian.com/products/combo-ccs1-dc-adapter',note:'For older (non-Tesla) DC fast chargers.'}
    ]},
    {grp:'Cargo, utility & protection',items:[
      {id:'tonneau',name:'Powered Tonneau Cover',price:3300,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/files/250124-NICK-MAHER-DUNE-620A6715-Final_1_0f37edc2-c127-4029-b0c1-132011b3f16b.jpg?v=1754512906&width=240',link:'https://gearshop.rivian.com/products/r1t-powered-tonneau-cover',note:'Motorized, weather-resistant bed cover.'},
      {id:'crossbars',name:'Cargo Crossbars',price:700,icon:'rack',img:'https://gearshop.rivian.com/cdn/shop/files/Cargo-Crossbars-Silver-Primary-01.jpg?v=1753119496&width=240',link:'https://gearshop.rivian.com/products/cargo-crossbars',note:'Bright finish $700, Dark $800 in the builder; needed for roof racks.'},
      {id:'mats',name:'All-Weather Floor Mats',price:225,icon:'mats',img:'https://gearshop.rivian.com/cdn/shop/files/R1T-All-Weather-Mats-Gen-2-Black-Primary-01.jpg?v=1764101262&width=240',link:'https://gearshop.rivian.com/products/r1t-all-weather-floor-mats',note:'Custom-fit floor protection set (Gen&nbsp;2).'},
      {id:'tunnelmat',name:'Gear Tunnel Mat',price:100,icon:'mats',img:'https://gearshop.rivian.com/cdn/shop/files/R1T_Gear_Tunnel_All-Weather_Mat-PDP-01_ze5pf9.jpg?v=1750723972&width=240',link:'https://gearshop.rivian.com/products/r1t-gear-tunnel-mat',note:'All-weather liner for the gear tunnel.'},
      {id:'molle',name:'MOLLE Panels',price:435,icon:'rack',img:'https://gearshop.rivian.com/cdn/shop/files/RivianR1TCabWall.9.jpg?v=1773184126&width=240',link:'https://gearshop.rivian.com/products/r1t-molle-panels',note:'Modular mounting panels for the bed cab wall.'},
      {id:'cargonet',name:'Cargo Bed Net',price:225,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/files/9122024_Alice_Le_VAR1TCN001_Front_6679.jpg?v=1764874845&width=240',link:'https://gearshop.rivian.com/products/r1t-cargo-net',note:'Keeps bed cargo secured.'},
      {id:'tailgate',name:'Tailgate Pad',price:200,icon:'bike',img:'https://gearshop.rivian.com/cdn/shop/files/Tailgate-Pad-Primary-01_zavm7x.jpg?v=1750724177&width=240',link:'https://gearshop.rivian.com/products/rivian-tailgate-pad',note:'Protects the tailgate when hauling bikes.'},
      {id:'sunshade',name:'Front Sunshade',price:125,icon:'sun',img:'https://gearshop.rivian.com/cdn/shop/files/Sunshade-White-Primary-01_mkmwpz.webp?v=1750724093&width=240',link:'https://gearshop.rivian.com/products/r1-front-sunshade',note:'Folding windshield sun shade.'},
      {id:'kitchen',name:'Travel Kitchen',price:1400,icon:'utensils',img:'https://gearshop.rivian.com/cdn/shop/files/Travel-Kitchen-Hero.jpg?v=1752682568&width=240',link:'https://gearshop.rivian.com/products/travel-kitchen',note:'Portable camp kitchen with induction cooktop; pairs with Camp Mode.'}
    ]}
  ],
  accFootnote:'Prices verified against Rivian&rsquo;s R1T builder and Gear Shop, July 2026. Sound + Vision ($2,500 on Dual — Dolby Atmos premium audio + dynamic glass roof) is included on Tri and Quad. The 20&quot; All-Terrain wheel prices include Rivian&rsquo;s All-Terrain Package; dark wheels include Darkout accents. A limited-run Forest Edge interior package ($9,000, Dual Max only) bundles the Forest Edge cabin, dark wheels, Darkout and Sound + Vision. Rivian&rsquo;s R1 destination charge is $1,895 — the cost tab&rsquo;s default destination fee reflects the R2&rsquo;s $1,495, so adjust if you want exact out-the-door numbers.'
};
