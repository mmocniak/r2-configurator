/* Rivian R1S — vehicle spec + accessory data.
   ⚠️  DRAFT SCAFFOLD (draft:true → hidden from the vehicle toggle, exercised only by
   tests/selftest.html as warnings). The structure is complete and real, but the numbers,
   option codes, image program and CDN paths are APPROXIMATE / PLACEHOLDER and NOT verified.
   To ship the R1S: a data owner must verify every value against rivian.com's R1S builder +
   Gear Shop, discover the real visualizer `img.program` and per-code swatch/cabin paths,
   add a `verified` stamp + a `config:true` changelog entry, then remove `draft:true`.
   See CONTRIBUTING.md → "Adding or maintaining a vehicle dataset". */
var VEHICLES = (typeof VEHICLES !== 'undefined' && VEHICLES) || {};

VEHICLES.r1s = {
  id:'r1s',
  name:'R1S',
  draft:true,                     /* hides the vehicle from the live toggle until verified */
  /* PLACEHOLDER — the real R1S visualizer program must be read off the live configurator's
     360 image URL. Wrong program just means renders 404 and fall back to the placeholder. */
  img:{program:'gold-iris'},
  flagshipTrim:'quad',

  colors:{
    limestone:{name:'Limestone',price:0,code:'EXP-LMS',hex:'#d8d4c8',note:'Included'},
    elcap:{name:'El Cap Granite',price:1500,code:'EXP-ECG',hex:'#6d6e6f'},
    stormblue:{name:'Storm Blue',price:1500,code:'EXP-STB',hex:'#2f4a63'},
    redcanyon:{name:'Red Canyon',price:2500,code:'EXP-RDC',hex:'#7a2b26'},
    forestgreen:{name:'Forest Green',price:2500,code:'EXP-FGN',hex:'#26362b'}
  },

  trims:{
    dual:{name:'R1S Dual Motor',short:'Dual',price:77700,drive:'AWD',motors:'Dual-motor',hp:533,range:270,z60:'4.5s',tow:'7,700 lb',avail:'Available now',folder:'dual',
      drives:[
        {id:'std', name:'Dual Motor', sub:'Standard pack', price:0,     range:270, hp:533, z60:'4.5s', tow:'7,700 lb', drive:'AWD', motors:'Dual-motor', pack:'Standard pack', avail:'Available now', note:'Included'},
        {id:'large',name:'Dual Motor', sub:'Large pack',    price:6000,  range:330, hp:533, z60:'4.5s', tow:'7,700 lb', drive:'AWD', motors:'Dual-motor', pack:'Large pack',    avail:'Available now', note:'More range'},
        {id:'max',  name:'Dual Motor', sub:'Max pack',      price:12000, range:410, hp:533, z60:'4.5s', tow:'7,700 lb', drive:'AWD', motors:'Dual-motor', pack:'Max pack',      avail:'Available now', note:'Longest range'}
      ],
      colors:['limestone','stormblue','forestgreen','redcanyon'],
      wheels:[{id:'r1s20',code:'R1S20',name:'20" All-Terrain',price:0,rd:0,note:'Included'},{id:'r1s22',code:'R1S22',name:'22" Sport',price:3500,rd:-20}],
      interior:[{id:'r1sbm',code:'INT-R1S-BM',name:'Black Mountain',price:0,hex:'#2c2c2e',note:'Included'}],
      includes:['Dual-motor AWD','Standard interior + audio','20" all-terrain wheels'],
      autoIncl:false},
    tri:{name:'R1S Tri Motor',short:'Tri',price:105900,drive:'AWD',motors:'Tri-motor',hp:850,range:380,z60:'2.9s',tow:'7,700 lb',avail:'Available now',folder:'tri',
      drives:[
        {id:'large',name:'Tri Motor', sub:'Large pack', price:0,    range:340, hp:850, z60:'2.9s', tow:'7,700 lb', drive:'AWD', motors:'Tri-motor', pack:'Large pack', avail:'Available now', note:'Included'},
        {id:'max',  name:'Tri Motor', sub:'Max pack',   price:9000, range:380, hp:850, z60:'2.9s', tow:'7,700 lb', drive:'AWD', motors:'Tri-motor', pack:'Max pack',   avail:'Available now', note:'Longest range'}
      ],
      colors:['limestone','stormblue','forestgreen','redcanyon','elcap'],
      wheels:[{id:'r1s22',code:'R1S22',name:'22" Sport',price:0,rd:0,note:'Included'},{id:'r1s20',code:'R1S20',name:'20" All-Terrain',price:0,rd:15,note:'all-terrain'}],
      interior:[{id:'r1sbm',code:'INT-R1S-BM',name:'Black Mountain',price:0,hex:'#2c2c2e',note:'Included'},{id:'r1sog',code:'INT-R1S-OG',name:'Ocean Coast + Dark',price:1500,hex:'#b9c2c4',note:'optional'}],
      includes:['Tri-motor AWD','Premium interior + audio','Air suspension','22" wheels'],
      autoIncl:false},
    quad:{name:'R1S Quad Motor',short:'Quad',price:115990,drive:'AWD',motors:'Quad-motor',hp:1025,range:374,z60:'2.5s',tow:'7,700 lb',avail:'Available now',folder:'quad',
      colors:['limestone','stormblue','forestgreen','redcanyon','elcap'],
      wheels:[{id:'r1s22',code:'R1S22',name:'22" Sport',price:0,rd:0,note:'Included'},{id:'r1s20',code:'R1S20',name:'20" All-Terrain',price:0,rd:15,note:'all-terrain'}],
      interior:[{id:'r1sbm',code:'INT-R1S-BM',name:'Black Mountain',price:0,hex:'#2c2c2e',note:'Included'},{id:'r1sog',code:'INT-R1S-OG',name:'Ocean Coast + Dark',price:1500,hex:'#b9c2c4',note:'optional'}],
      includes:['Everything in Tri, plus:','Quad-motor (1,025 hp)','RAD Tuner drive modes','Max pack standard'],
      autoIncl:false},
  },

  compareSpecs:[
    {label:'Air suspension + adaptive damping',values:{dual:false,tri:true,quad:true}},
    {label:'Rivian premium audio (Dolby Atmos)',values:{dual:false,tri:true,quad:true}},
    {label:'RAD Tuner custom drive modes',values:{dual:false,tri:false,quad:true}},
    {label:'Kneel / raise ride height',values:{dual:true,tri:true,quad:true}}
  ],
  baseLabel:'Included on every R1S',
  baseIncludes:['NACS port · 21,000+ Tesla Superchargers','Driver+ safety suite','Rivian app, digital key & OTA updates','7 seats · large frunk + gear tunnel','Camp Mode + in-cabin outlets'],

  addons:[
    {id:'autonomy',name:'Autonomy+ driver assist',price:2500,grp:'Driver assistance',cmp:true,link:'https://rivian.com/autonomy'},
    {id:'spare',name:'Full-Size Spare Tire',price:900,grp:'Towing & utility',link:'https://rivian.com/gear-shop'}
  ],
  connectPlus:{
    id:'connect-plus',
    name:'Connect+',
    link:'https://rivian.com/connect-plus',
    note:'Built-in media streaming, live security camera, Wi-Fi hotspot, satellite maps and Rivian Assistant.',
    plans:{
      yearly:{id:'yearly',name:'Yearly',price:149.99,period:'yr'},
      monthly:{id:'monthly',name:'Monthly',price:14.99,period:'mo'}
    }
  },
  interiors:{r1sbm:{name:'Black Mountain',code:'INT-R1S-BM',price:0,hex:'#2c2c2e'},r1sog:{name:'Ocean Coast + Dark',code:'INT-R1S-OG',price:1500,hex:'#b9c2c4'}},

  /* PLACEHOLDER cabin photos — replace with the real R1S CDN paths, keyed by interior code */
  cabins:{
    'INT-R1S-BM':'shop/RetailCodeModalContent/INT-R1S-BM/placeholder',
    'INT-R1S-OG':'shop/RetailCodeModalContent/INT-R1S-OG/placeholder'
  },
  /* PLACEHOLDER wheel swatches — replace with the real R1S Builder CDN swatch paths */
  wheelSwatch:{
    'R1S20':'v1/shop/Builder/Options/Wheels/Swatches/r1s-20_placeholder.png',
    'R1S22':'v1/shop/Builder/Options/Wheels/Swatches/r1s-22_placeholder.png'
  },

  gearImg:'https://gearshop.rivian.com/cdn/shop/',
  accessories:[
    {grp:'Charging & power',items:[
      {id:'wall',name:'Wall Charger (NACS, L2)',price:800,icon:'charge',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-Wall-Charger-Primary-01_3e0c66d1-08bb-4943-9c42-219bd3238b62.jpg?v=1752689296&width=240',link:'https://gearshop.rivian.com/products/rivian-wall-charger-nacs',note:'Home Level&nbsp;2 charger, NACS native.'},
      {id:'portable',name:'Portable Charger (L1/L2)',price:400,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-Portable-Charger-Primary-01.jpg?v=1752268037&width=240',link:'https://gearshop.rivian.com/products/rivian-portable-charger-nacs',note:'Level&nbsp;1 / Level&nbsp;2 on the go.'}
    ]},
    {grp:'Cargo, utility & protection',items:[
      {id:'mats',name:'All-Weather Floor Mats',price:250,icon:'mats',img:'https://gearshop.rivian.com/cdn/shop/files/R2_All_Weather_Mats.png?v=1775245910&width=240',link:'https://gearshop.rivian.com/products/r1s-all-weather-floor-mats',note:'Custom-fit floor protection set.'},
      {id:'crossbars',name:'Roof Cargo Crossbars',price:800,icon:'rack',img:'https://gearshop.rivian.com/cdn/shop/files/crossbars_gunmetal_qtr_R2.png?v=1776971211&width=240',link:'https://gearshop.rivian.com/products/r1s-cargo-crossbars',note:'One-hand snap-on; needed for roof racks.'}
    ]}
  ],
  accFootnote:'DRAFT scaffold — R1S accessory prices are placeholders. Replace with values from Rivian&rsquo;s R1S Gear Shop / configurator and verify before shipping.'
};
