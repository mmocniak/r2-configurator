/* Rivian R1S — vehicle spec + accessory data. One self-contained, ownable file per
   vehicle; loaded as a classic script before app.js. See CONTRIBUTING.md.
   Prices last verified against rivian.com builder coverage + the Gear Shop on 2026-07-09. */
var VEHICLES = (typeof VEHICLES !== 'undefined' && VEHICLES) || {};

VEHICLES.r1s = {
  id:'r1s',
  name:'R1S',
  verified:'2026-07',
  img:{compositor:'r1s',view:'side',ver:'2023.1',extra:['gen-2'],program:'gold-iris'},
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
    dual:{name:'R1S Dual Motor',short:'Dual',price:83990,drive:'AWD',motors:'Dual-motor',hp:533,range:330,z60:'4.5s',tow:'7,700 lb',avail:'Available now',folder:'MOT-201',
      drives:[
        {id:'large',    name:'Dual Motor',       sub:'Large pack', price:0,     range:330, hp:533, z60:'4.5s', tow:'7,700 lb', drive:'AWD', motors:'Dual-motor', pack:'Large pack',         avail:'Available now', note:'Included'},
        {id:'max',      name:'Dual Motor',       sub:'Max pack',   price:7000,  range:410, hp:533, z60:'4.5s', tow:'7,700 lb', drive:'AWD', motors:'Dual-motor', pack:'Max pack · 140 kWh', avail:'Available now', note:'Longest range'},
        {id:'perflarge',name:'Performance Dual', sub:'Large pack', price:5000,  range:330, hp:665, z60:'3.4s', tow:'7,700 lb', drive:'AWD', motors:'Dual-motor', pack:'Large pack',         avail:'Available now', note:'665 hp'},
        {id:'perfmax',  name:'Performance Dual', sub:'Max pack',   price:12000, range:410, hp:665, z60:'3.4s', tow:'7,700 lb', drive:'AWD', motors:'Dual-motor', pack:'Max pack · 140 kWh', avail:'Available now', note:'665 hp · longest range'}
      ],
      colors:['lasilver','glacier','halfmoon','rivianblue','redcanyon','forest','midnight'],
      wheels:[
        {id:'sb22',code:'WHL-2SS',name:'22" Sport Bright',price:0,rd:0,note:'Included'},
        {id:'rg22',code:'WHL-2AR',name:'22" Range',price:1000,rd:0,note:'range-optimized tires'},
        {id:'sd22',code:'WHL-2SD',name:'22" Sport Dark',price:2000,rd:0,note:'with Darkout accents'},
        {id:'at20',code:'WHL-0A1',name:'20" All-Terrain',price:3700,rd:-15,note:'all-terrain'},
        {id:'ad20',code:'WHL-0AD',name:'20" All-Terrain Dark',price:4700,rd:-15,note:'all-terrain · Darkout accents'}
      ],
      interior:[
        {id:'bmda',code:'INT-BMP',name:'Black Mountain + Dark Ash Wood',price:0,hex:'#2c2c2e',note:'Included'},
        {id:'ocdw',code:'INT-OCDW',name:'Ocean Coast + Driftwood',price:2500,hex:'#bfc7c4'},
        {id:'slate',code:'INT-SSWW',name:'Slate Sky + Walnut Wood',price:3000,hex:'#8d9aa6'}
      ],
      includes:['Dual-motor AWD (533 hp)','22" Sport Bright wheels','Standard audio (Sound + Vision optional)','7 seats across three rows','Performance Upgrade available (+$5,000: 665 hp, 0–60 3.4s)'],
      autoIncl:false},
    tri:{name:'R1S Tri Motor',short:'Tri',price:106990,drive:'AWD',motors:'Tri-motor',hp:850,range:371,z60:'2.9s',tow:'7,700 lb',avail:'Available now',folder:'MOT-301',
      drives:[
        {id:'max',name:'Tri Motor',sub:'Max pack',price:0,range:371,hp:850,z60:'2.9s',tow:'7,700 lb',drive:'AWD',motors:'Tri-motor',pack:'Max pack · 140 kWh',avail:'Available now',note:'Included'}
      ],
      colors:['lasilver','glacier','halfmoon','rivianblue','redcanyon','forest','midnight','stormblue'],
      wheels:[
        {id:'sb22',code:'WHL-2SS',name:'22" Sport Bright',price:0,rd:0,note:'Included'},
        {id:'rg22',code:'WHL-2AR',name:'22" Range',price:1000,rd:0,note:'range-optimized tires'},
        {id:'sd22',code:'WHL-2SD',name:'22" Sport Dark',price:2000,rd:0,note:'with Darkout accents'},
        {id:'at20',code:'WHL-0A1',name:'20" All-Terrain',price:3700,rd:-15,note:'all-terrain'},
        {id:'ad20',code:'WHL-0AD',name:'20" All-Terrain Dark',price:4700,rd:-15,note:'all-terrain · Darkout accents'}
      ],
      interior:[
        {id:'bmba',code:'INT-PBMP',name:'Black Mountain + Brown Ash Wood',price:0,hex:'#2c2c2e',note:'Included'},
        {id:'ocdw',code:'INT-OCDW',name:'Ocean Coast + Driftwood',price:2500,hex:'#bfc7c4'},
        {id:'slate',code:'INT-SSWW',name:'Slate Sky + Walnut Wood',price:3000,hex:'#8d9aa6'}
      ],
      includes:['Everything in Dual, plus:','Tri-motor AWD (850 hp · 0–60 2.9s)','Max pack standard (371 mi)','Sound + Vision: Dolby Atmos premium audio + dynamic glass roof'],
      autoIncl:false},
    quad:{name:'R1S Quad Motor',short:'Quad',price:121990,drive:'AWD',motors:'Quad-motor',hp:1025,range:374,z60:'2.6s',tow:'7,700 lb',avail:'Available now',folder:'MOT-401',
      drives:[
        {id:'max',name:'Quad Motor',sub:'Max pack',price:0,range:374,hp:1025,z60:'2.6s',tow:'7,700 lb',drive:'AWD',motors:'Quad-motor',pack:'Max pack · 140 kWh',avail:'Available now',note:'Included'}
      ],
      colors:['lasilver','glacier','halfmoon','rivianblue','redcanyon','forest','midnight','stormblue'],
      wheels:[
        {id:'sb22',code:'WHL-2SS',name:'22" Sport Bright',price:0,rd:0,note:'Included'},
        {id:'rg22',code:'WHL-2AR',name:'22" Range',price:1000,rd:0,note:'range-optimized tires'},
        {id:'sd22',code:'WHL-2SD',name:'22" Sport Dark',price:2000,rd:0,note:'with Darkout accents'},
        {id:'at20',code:'WHL-0A1',name:'20" All-Terrain',price:3700,rd:-15,note:'all-terrain'},
        {id:'ad20',code:'WHL-0AD',name:'20" All-Terrain Dark',price:4700,rd:-15,note:'all-terrain · Darkout accents'}
      ],
      interior:[
        {id:'bmba',code:'INT-PBMP',name:'Black Mountain + Brown Ash Wood',price:0,hex:'#2c2c2e',note:'Included'},
        {id:'ocdw',code:'INT-OCDW',name:'Ocean Coast + Driftwood',price:2500,hex:'#bfc7c4'},
        {id:'slate',code:'INT-SSWW',name:'Slate Sky + Walnut Wood',price:3000,hex:'#8d9aa6'}
      ],
      includes:['Everything in Tri, plus:','Quad-motor · 1,025 hp · 0–60 2.6s','RAD Tuner custom drive modes','Launch Edition available (+$4,000: Launch Green paint, Burnished Bronze wheels)'],
      autoIncl:false},
  },

  compareSpecs:[
    {label:'Sound + Vision — Dolby Atmos premium audio + dynamic glass roof',values:{dual:'opt25',tri:true,quad:true}},
    {label:'Performance Dual upgrade — 665 hp, 0–60 3.4s',values:{dual:'Optional · +$5,000',tri:false,quad:false}},
    {label:'Max battery pack (140 kWh)',values:{dual:'Optional · +$7,000',tri:true,quad:true}},
    {label:'RAD Tuner custom drive modes',values:{dual:false,tri:false,quad:true}},
    {label:'Launch Edition — Launch Green paint, Burnished Bronze wheels',values:{dual:false,tri:false,quad:'Optional · +$4,000'}}
  ],
  baseLabel:'Included on every R1S',
  baseIncludes:['NACS port · 21,000+ Tesla Superchargers','Air suspension with adaptive damping','Autonomy+ 60-day trial · Driver+ safety suite','7 seats · 91 cu-ft max cargo · powered frunk','7,700 lb towing · Camp Mode + cabin outlets','Rivian app, digital key & OTA updates'],

  verdictNotes:{
    dual:'The family value pick: {motors} {drive}, {range} mi as configured — and the only trim that takes the $5,000 Performance Upgrade (665 hp).',
    tri:'The performance sweet spot. 850 hp, 0–60 in {z60}, with the Max pack and Sound + Vision standard.',
    quad:'The 1,025-hp flagship with RAD Tuner. Add the $4,000 Launch Edition for Launch Green and Burnished Bronze wheels.'
  },

  addons:[
    {id:'autonomy',name:'Autonomy+ driver assist',price:2500,grp:'Driver assistance',cmp:true,link:'https://rivian.com/autonomy'},
    {id:'soundvision',name:'Sound + Vision — Dolby Atmos premium audio + dynamic glass roof',price:2500,grp:'Packages',inclTrims:['tri','quad'],link:'https://rivian.com/r1s'}
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
    'INT-BMP':'shop/PDP/interiors/black-mountain-dark-ash/BMDarkWood-R1S-Cover_x75zmy',
    'INT-PBMP':'shop/PDP/interiors/black-mtn-brown-ash/R1S-Black-Mountain-B-Ash-D-Cover_oxqtfw',
    'INT-OCDW':'shop/PDP/interiors/ocean-coast-driftwood/R1S-Ocean-Coast-Drift-Wood-D-Cover_m9ldpt',
    'INT-SSWW':'shop/PDP/interiors/slate-sky-walnut/SlateSky-R1S-Cover_zbv7uk'
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
      {id:'mats',name:'All-Weather Floor Mats',price:250,icon:'mats',img:'https://gearshop.rivian.com/cdn/shop/files/R1S-All-Weather-Mats-Gen-2-Black-Primary-01.jpg?v=1764028404&width=240',link:'https://gearshop.rivian.com/products/r1s-all-weather-floor-mats',note:'Custom-fit floor protection set (Gen&nbsp;2).'},
      {id:'cargocover',name:'Cargo Cover',price:250,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/files/R1S-Cargo-Cover-Primary.jpg?v=1751479374&width=240',link:'https://gearshop.rivian.com/products/r1s-cargo-cover',note:'Keeps rear storage out of sight.'},
      {id:'crossbars',name:'Cargo Crossbars',price:700,icon:'rack',img:'https://gearshop.rivian.com/cdn/shop/files/Cargo-Crossbars-Silver-Primary-01.jpg?v=1753119496&width=240',link:'https://gearshop.rivian.com/products/cargo-crossbars',note:'Bright finish $700, Dark $800 in the builder; needed for roof racks.'},
      {id:'tent',name:'Three-Person Tent',price:2200,icon:'sun',img:'https://gearshop.rivian.com/cdn/shop/files/R1SGEN2_pewter_tent_open.png?v=1758133095&width=240',link:'https://gearshop.rivian.com/products/r1s-three-person-tent',note:'Attaches to the open tailgate area for car camping.'},
      {id:'roofshades',name:'Glass Roof Sunshades',price:150,icon:'sun',img:'https://gearshop.rivian.com/cdn/shop/files/R_R1S_Roof_1_-_optimized.jpg?v=1782862337&width=240',link:'https://gearshop.rivian.com/products/r1s-glass-roof-sunshades',note:'Shades for the fixed glass roof panels.'},
      {id:'sunshade',name:'Front Sunshade',price:125,icon:'sun',img:'https://gearshop.rivian.com/cdn/shop/files/Sunshade-White-Primary-01_mkmwpz.webp?v=1750724093&width=240',link:'https://gearshop.rivian.com/products/r1-front-sunshade',note:'Folding windshield sun shade.'},
      {id:'kitchen',name:'Travel Kitchen',price:1400,icon:'utensils',img:'https://gearshop.rivian.com/cdn/shop/files/Travel-Kitchen-Hero.jpg?v=1752682568&width=240',link:'https://gearshop.rivian.com/products/travel-kitchen',note:'Portable camp kitchen with induction cooktop; pairs with Camp Mode.'}
    ]}
  ],
  accFootnote:'Prices verified against Rivian&rsquo;s R1S builder and Gear Shop, July 2026. Sound + Vision ($2,500 on Dual — Dolby Atmos premium audio + dynamic glass roof) is included on Tri and Quad. The 20&quot; All-Terrain wheel prices include Rivian&rsquo;s All-Terrain Package; dark wheels include Darkout accents. A limited-run Forest Edge interior package ($9,000, Dual Max only) bundles the Forest Edge cabin, dark wheels, Darkout and Sound + Vision. Rivian&rsquo;s R1 destination charge is $1,895 — the cost tab&rsquo;s default destination fee reflects the R2&rsquo;s $1,495, so adjust if you want exact out-the-door numbers.'
};
