/* Rivian R1S — vehicle spec + accessory data (trims, colors, wheels, interiors,
   gear). One self-contained, ownable file per vehicle; loaded as a classic script
   before app.js. See CONTRIBUTING.md → "Adding or maintaining a vehicle dataset".
   Data owner: mmocniak.
   Prices last verified against rivian.com's R1S builder ruleset + the Gear Shop
   (Shopify product JSON) on 2026-08-30 via validation/r2-config/snapshot.js --vehicle r1s.
   Still draft pending the human browser QA pass — see the PR description. */
var VEHICLES = (typeof VEHICLES !== 'undefined' && VEHICLES) || {};

VEHICLES.r1s = {
  id:'r1s',
  name:'R1S',
  draft:true,
  verified:'2026-08',
  /* R1S has no parametric visualizer program (R2's img.program); hero renders come from
     Rivian's layer compositor instead. Each trim supplies folder (its MOT-* motor code,
     passed to the compositor by app.js) and codes (the same code, read by the tracker's
     image checker). extra:['gen-2'] selects the Gen-2 body sprite layers. */
  img:{compositor:'r1s',view:'side',ver:'2023.1',extra:['gen-2']},
  flagshipTrim:'quad',
  /* national fees owned per vehicle; both R1 builders charge $1,895 vs the R2's $1,495 —
     app.js's global FEES is the R2 fallback, this overrides it for the cost tab. */
  fees:{destination:1895},
  /* cost-tab financing defaults, seeded when switching to this vehicle. apr/term/down reuse
     the R2 Chase-financing baseline because Rivian publishes no standing R1 rate; lease is the builder's own
     Premium 'Est. Lease $1,239/mo' figure (Aug 2026); leasedown/leaseterm follow Rivian's standard structure. note renders under the payment inputs. */
  costDefaults:{down:15000,apr:5.79,term:60,lease:1239,leasedown:4895,leaseterm:36,note:'Defaults as of August 2026. Rivian rotates R1 APR and lease offers monthly, so check rivian.com/offers for the current promo.'},

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
    premium:{name:'R1S Premium',short:'Premium',price:83990,drive:'AWD',motors:'Dual-motor',hp:533,range:329,z60:'4.5s',tow:'7,700 lb',avail:'Available now',folder:'MOT-201',codes:['MOT-201'],
      drives:[
        {id:'dual',  name:'Dual-Motor AWD',sub:'Standard pack',price:0,   range:329,hp:533,z60:'4.5s',tow:'7,700 lb',drive:'AWD',motors:'Dual-motor',pack:'Standard pack',avail:'Available now',note:'Included'},
        {id:'duallr',name:'Dual-Motor AWD',sub:'Long Range',   price:7000,range:410,hp:533,z60:'4.5s',tow:'7,700 lb',drive:'AWD',motors:'Dual-motor',pack:'Long Range pack',avail:'Available now',note:'Longest range'}
      ],
      colors:['esker','glacier','limestone','forest','midnight','rivianblue','halfmoon'],
      wheels:[
        {id:'2ar',code:'WHL-2AR',name:'22" Range',price:0,rd:0,note:'Included'},
        {id:'2ss',code:'WHL-2SS',name:'22" Sport Bright',price:1000,rd:0},
        {id:'2sd',code:'WHL-2SD',name:'22" Sport Dark',price:2000,rd:0,note:'bundles the Darkout Package'},
        {id:'0ad',code:'WHL-0AD',name:'20" All-Terrain Dark',price:5700,rd:0,note:'requires the Long Range pack; bundles the All-Terrain Package, Darkout accents + underbody shield'}
      ],
      interior:[
        {id:'bmp',code:'INT-BMP',name:'Black Mountain',price:0,hex:'#2c2c2e',note:'Included'},
        {id:'gyp',code:'INT-GYP',name:'Ocean Coast',price:4500,hex:'#c9cfca'}
      ],
      includes:['Dual-motor AWD (533 hp)','22" Range wheels','Wood interior accents + standard audio','Power Upgrade available (+$5,000: 665 hp, 0–60 3.4s)'],
      autoIncl:false},
    performance:{name:'R1S Performance',short:'Performance',price:106990,drive:'AWD',motors:'Tri-motor',hp:850,range:371,z60:'2.9s',tow:'7,700 lb',avail:'Available now',folder:'MOT-301',codes:['MOT-301'],
      colors:['esker','glacier','limestone','forest','midnight','redcanyon','rivianblue','stormblue','halfmoon'],
      wheels:[
        {id:'2ar',code:'WHL-2AR',name:'22" Range',price:0,rd:0,note:'Included'},
        {id:'2ss',code:'WHL-2SS',name:'22" Sport Bright',price:1000,rd:0},
        {id:'2sd',code:'WHL-2SD',name:'22" Sport Dark',price:1000,rd:0},
        {id:'0ad',code:'WHL-0AD',name:'20" All-Terrain Dark',price:4700,rd:0,note:'bundles the All-Terrain Package + underbody shield'}
      ],
      interior:[
        {id:'pbmp',code:'INT-PBMP',name:'Black Mountain Signature',price:0,hex:'#2c2c2e',note:'Included'},
        {id:'ocdw',code:'INT-OCDW',name:'Ocean Coast Signature',price:4000,hex:'#bfc7c4'},
        {id:'ssw',code:'INT-SSWW',name:'Slate Sky Signature',price:4500,hex:'#8d9aa6'}
      ],
      includes:['Everything in Premium, plus:','Tri-motor AWD (850 hp · 0–60 2.9s)','Sound + Vision: premium audio + Dynamic Glass Roof','Darkout Package + Compass Yellow accents'],
      autoIncl:false},
    quad:{name:'R1S Quad',short:'Quad',price:121990,drive:'AWD',motors:'Quad-motor',hp:1025,range:374,z60:'2.6s',tow:'7,700 lb',avail:'Available now',folder:'MOT-401',codes:['MOT-401'],
      colors:['esker','glacier','forest','midnight','redcanyon','rivianblue','stormblue','halfmoon'],
      wheels:[
        {id:'2sp',code:'WHL-2SP',name:'22" Super Sport',price:0,rd:-36,note:'Included · 0–60 in 2.5s with Launch mode, but shortest range; not recommended below 40°F'},
        {id:'2sb',code:'WHL-2SB',name:'22" Sport Burnished Bronze',price:0,rd:0,note:'Included'},
        {id:'0dd',code:'WHL-0DD',name:'20" Dune Satin Graphite All-Terrain',price:0,rd:0,note:'Included · all-terrain'}
      ],
      interior:[
        {id:'pbmp',code:'INT-PBMP',name:'Black Mountain Signature',price:0,hex:'#2c2c2e',note:'Included'},
        {id:'ocdw',code:'INT-OCDW',name:'Ocean Coast Signature',price:4000,hex:'#bfc7c4'},
        {id:'ssw',code:'INT-SSWW',name:'Slate Sky Signature',price:4500,hex:'#8d9aa6'}
      ],
      includes:['Everything in Performance, plus:','Quad-motor AWD (1,025 hp · 0–60 2.6s)','RAD Tuner custom drive modes','3 wheel options at no charge'],
      autoIncl:false},
  },

  compareSpecs:[
    {label:'Sound + Vision — premium audio + Dynamic Glass Roof',values:{premium:'+$2,500 optional',performance:true,quad:true}},
    {label:'Darkout Package (black exterior accents)',values:{premium:'Bundled with Sport Dark / All-Terrain Dark wheels',performance:true,quad:true}},
    {label:'RAD Tuner custom drive modes',values:{premium:false,performance:false,quad:true}},
    {label:'Power Upgrade — 665 hp, 0–60 3.4s',values:{premium:'+$5,000 optional',performance:false,quad:false}},
    {label:'20" All-Terrain wheel package',values:{premium:'+$5,700 optional',performance:'+$4,700 optional',quad:'Included (3 wheel choices)'}}
  ],
  baseLabel:'Included on every R1S',
  baseIncludes:['NACS port · 21,000+ Tesla Superchargers','Air suspension with adaptive damping','Air compressor','Autonomy+ 60-day trial · Connect+ 60-day trial','Driver+ safety suite','7 seats · powered frunk + gear tunnel','7,700 lb towing · Camp Mode + cabin outlets','Rivian app, digital key & OTA updates'],

  verdictNotes:{
    premium:'The value pick and the only trim with a selectable pack — {motors} {drive}, {range} mi as configured. Add the $5,000 Power Upgrade for 665 hp.',
    performance:'The performance sweet spot: {hp} hp, 0–60 in {z60}, with Sound + Vision and the Darkout Package standard.',
    quad:'The 1,025-hp flagship with RAD Tuner drive modes and three no-cost wheel choices.'
  },

  addons:[
    {id:'autonomy',name:'Autonomy+ driver assist',price:2500,grp:'Driver assistance',cmp:true,link:'https://rivian.com/autonomy'},
    {id:'power',name:'Power Upgrade (665 hp · 0–60 3.4s)',price:5000,grp:'Performance',onlyTrims:['premium'],link:'https://rivian.com/r1s',note:'Premium only — raises output from 533 hp/4.5s to 665 hp/3.4s. Not offered on Performance or Quad, which already exceed this.'},
    {id:'soundvision',name:'Sound + Vision — premium audio + Dynamic Glass Roof',price:2500,grp:'Packages',cmp:true,inclTrims:['performance','quad'],link:'https://rivian.com/r1s'},
    {id:'captains',name:"Captain's Chairs (6-seat layout)",price:1500,grp:'Seating',link:'https://rivian.com/r1s',note:'Settled flat approximation. Rivian’s builder prices this $1,500–$6,000 depending on trim + interior (sometimes bundled free with Ocean Coast/Slate Sky interiors, sometimes bundled with Sound + Vision on Premium).'},
    {id:'spare',name:'Compact Spare Tire',price:0,grp:'Towing & utility',link:'https://rivian.com/gear-shop',note:'Priced at $0 in Rivian’s current ruleset and not yet a selectable line item in the online builder for any trim — order through a Rivian Service Center.'}
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
  interiors:{
    bmp:{name:'Black Mountain',code:'INT-BMP',price:0,hex:'#2c2c2e'},
    gyp:{name:'Ocean Coast',code:'INT-GYP',price:4500,hex:'#c9cfca'},
    pbmp:{name:'Black Mountain Signature',code:'INT-PBMP',price:0,hex:'#2c2c2e'},
    ocdw:{name:'Ocean Coast Signature',code:'INT-OCDW',price:4000,hex:'#bfc7c4'},
    ssw:{name:'Slate Sky Signature',code:'INT-SSWW',price:4500,hex:'#8d9aa6'}
  },

  /* Interior cabin photos hotlinked from Rivian's CDN, keyed by interior code. INT-GYP is
     the Ocean Coast + Dark Ash cover mined from the builder payload's PDP media (same
     naming convention as the other covers); visually verified 2026-08-30. */
  cabins:{
    'INT-BMP':'shop/PDP/interiors/black-mountain-dark-ash/BMDarkWood-R1S-Cover_x75zmy',
    'INT-GYP':'shop/PDP/interiors/ocean-coast-dark-ash/R1S-Ocean-Coast-D-Ash-D-Cover_vjzlwz',
    'INT-PBMP':'shop/PDP/interiors/black-mtn-brown-ash/R1S-Black-Mountain-B-Ash-D-Cover_oxqtfw',
    'INT-OCDW':'shop/PDP/interiors/ocean-coast-driftwood/R1S-Ocean-Coast-Drift-Wood-D-Cover_m9ldpt',
    'INT-SSWW':'shop/PDP/interiors/slate-sky-walnut/SlateSky-R1S-Cover_zbv7uk'
  },

  /* Wheel selector swatches hotlinked from Rivian's Builder CDN, keyed by wheel code. */
  wheelSwatch:{
    'WHL-2AR':'v1716329150/shop/Builder/Options/Wheels/Swatches/WHL-2AR_bdgxek',
    'WHL-2SS':'v1716329150/shop/Builder/Options/Wheels/Swatches/WHL-2SS_sdw1tu',
    'WHL-2SD':'v1723843501/shop/Builder/Options/Wheels/Swatches/WHL-2SD_zq2l6x',
    'WHL-0AD':'v1716329150/shop/Builder/Options/Wheels/Swatches/WHL-0AD_fdhdoa',
    'WHL-2SP':'v1748894945/shop/Builder/Options/Wheels/Swatches/WHL-2SP_xaj6os',
    'WHL-2SB':'v1748894945/shop/Builder/Options/Wheels/Swatches/WHL-2SB_kzxscg',
    'WHL-0DD':'v1716329150/shop/Builder/Options/Wheels/Swatches/WHL-0DD_du2ofm'
  },

  gearImg:'https://gearshop.rivian.com/cdn/shop/',
  accessories:[
    {grp:'Charging & power',items:[
      {id:'wall',name:'Wall Charger (NACS, L2)',price:800,icon:'charge',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-Wall-Charger-Primary-01_3e0c66d1-08bb-4943-9c42-219bd3238b62.jpg?v=1752689296&width=240',link:'https://gearshop.rivian.com/products/rivian-wall-charger-nacs',note:'Home Level&nbsp;2 charger, NACS native — no adapter needed.'},
      {id:'portable',name:'Portable Charger (L1/L2)',price:400,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-Portable-Charger-Primary-01.jpg?v=1752268037&width=240',link:'https://gearshop.rivian.com/products/rivian-portable-charger-nacs',note:'Level&nbsp;1 / Level&nbsp;2 on the go.'},
      {id:'ccs',name:'Combo CCS1 DC Adapter',price:200,icon:'plug',img:'https://gearshop.rivian.com/cdn/shop/files/NACS-to-Combo-CCS-Adapter-Primary-01.jpg?v=1752274970&width=240',link:'https://gearshop.rivian.com/products/combo-ccs1-dc-adapter',note:'For older (non-Tesla) DC fast chargers. Included standard on Quad; a $200 option on Premium and Performance.'}
    ]},
    {grp:'Cargo, utility & protection',items:[
      {id:'crossbars',name:'Cargo Crossbars (Bright)',price:700,icon:'rack',img:'https://gearshop.rivian.com/cdn/shop/files/Cargo-Crossbars-Silver-Primary-01.jpg?v=1753119496&width=240',link:'https://gearshop.rivian.com/products/cargo-crossbars',note:'Needed for roof racks, tents and cargo boxes. Dark finish also available.'},
      {id:'crossbarsdark',name:'Cargo Crossbars (Dark)',price:800,icon:'rack',img:'https://gearshop.rivian.com/cdn/shop/files/Cargo-Crossbars-Dark-Primary-01.jpg?v=1753119496&width=240',link:'https://gearshop.rivian.com/products/cargo-crossbars',note:'Dark-finish version of the Cargo Crossbars above (same product page, different variant).'},
      {id:'mats',name:'All-Weather Floor Mats',price:250,icon:'mats',img:'https://gearshop.rivian.com/cdn/shop/files/R1S-All-Weather-Mats-Gen-2-Black-Primary-01.jpg?v=1764028404&width=240',link:'https://gearshop.rivian.com/products/r1s-all-weather-floor-mats',note:'Custom-fit set for the standard second-row bench.'},
      {id:'matscapt',name:"All-Weather Floor Mats (Captain's Chairs)",price:250,icon:'mats',img:'https://gearshop.rivian.com/cdn/shop/files/R1S-Captains-Chairs-All-Weather-Floor-Mats.png?v=1780005849&width=240',link:'https://gearshop.rivian.com/products/r1s-all-weather-floor-mats',note:'Same set, cut for the second-row Captain’s Chairs layout (same product page, different variant).'},
      {id:'cargocover',name:'Cargo Cover',price:250,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/files/R1S-Cargo-Cover-Primary.jpg?v=1751479374&width=240',link:'https://gearshop.rivian.com/products/r1s-cargo-cover',note:'Retractable cover that keeps rear storage out of sight.'},
      {id:'carcover',name:'Outdoor Car Cover',price:500,icon:'box',full:true,img:'https://gearshop.rivian.com/cdn/shop/files/R1S_Car_Cover_zoomed_out.png?v=1779381402&width=240',link:'https://gearshop.rivian.com/products/r1s-outdoor-car-cover',note:'Custom-fit, water-resistant, breathable cover with storage bag.'},
      {id:'sunshade',name:'Front Sunshade',price:125,icon:'sun',img:'https://gearshop.rivian.com/cdn/shop/files/Sunshade-White-Primary-01_mkmwpz.webp?v=1750724093&width=240',link:'https://gearshop.rivian.com/products/r1-front-sunshade',note:'Folding windshield sun shade.'},
      {id:'screen',name:'Screen Protectors',price:75,icon:'monitor',img:'https://gearshop.rivian.com/cdn/shop/files/R1.Main.Display.ScreenProtector.001.png?v=1778779256&width=240',link:'https://gearshop.rivian.com/products/r1-screen-protectors',note:'Protectors for the center + driver displays.'},
      {id:'seatback',name:'Seatback Device Holder',price:150,icon:'tablet',img:'https://gearshop.rivian.com/cdn/shop/files/Seatback-Device-Holder-Vertical-Front-ND.png?v=1764965097&width=240',link:'https://gearshop.rivian.com/products/seatback-device-holder',note:'Mounts a tablet or phone to the seatback.'},
      {id:'kitchen',name:'Travel Kitchen',price:1400,icon:'utensils',img:'https://gearshop.rivian.com/cdn/shop/files/Travel-Kitchen-Hero.jpg?v=1752682568&width=240',link:'https://gearshop.rivian.com/products/travel-kitchen',note:'Portable camp kitchen with induction cooktop; pairs with Camp Mode.'},
      {id:'tent',name:'Three-Person Tent',price:3000,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/files/R1SGEN2_pewter_tent_open.png?v=1758133095&width=240',link:'https://gearshop.rivian.com/products/r1s-three-person-tent',note:'Yakima-built rooftop tent. Rivian’s builder bundles it with Cargo Crossbars for $3,000; the tent alone is $2,200 on the Gear Shop (crossbars sold separately there).'},
      {id:'awning',name:'Kammok Crosswing Awning',price:1300,icon:'sun',img:'https://gearshop.rivian.com/cdn/shop/files/Kammok-Crosswing-Awning-Primary-01.webp?v=1750723984&width=240',link:'https://gearshop.rivian.com/products/kammok-crosswing-awning',note:'Side-mounted shade; requires Cargo Crossbars.'},
      {id:'gearcable',name:'Gear Guard Cable',price:100,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/products/Extended-Length-Gear-Guard-Cable-Primary-01_vuisnr.webp?v=1750724232&width=240',link:'https://gearshop.rivian.com/products/gear-guard-cable',note:'Locking cable to secure gear to the vehicle.'},
      {id:'organizer',name:'Center Console Organizer',price:50,icon:'box',img:'https://gearshop.rivian.com/cdn/shop/files/R1-Center-Console-Organizer-PDP-01.jpg?v=1744250393&width=240',link:'https://gearshop.rivian.com/products/r1-center-console-organizer',note:'Console tray insert for small items.'},
      {id:'keyfob',name:'Extra Key Fob',price:250,icon:'zap',img:'https://gearshop.rivian.com/cdn/shop/files/R1T-FOB-2.0-Primary-02_903227e6-5394-4d5b-b51c-e7f94a72737b.jpg?v=1750723969&width=240',link:'https://gearshop.rivian.com/products/key-fob',note:'Extra or replacement key fob (one is included with every R1S).'}
    ]}
  ],
  accFootnote:'Prices verified against Rivian&rsquo;s R1S builder ruleset and Gear Shop, August 2026. Skipped as $0/included, not separately purchasable: the J1772 AC Adapter (standard on every trim) and the vehicle&rsquo;s included key fob. The Combo CCS1 Adapter is included standard on Quad ($0) but priced here at its $200 Premium/Performance rate. The 20&quot; All-Terrain Dark wheel bundles Rivian&rsquo;s All-Terrain Package (and, on Premium, the Darkout Package); priced at what a buyer actually pays for the wheel, not the underlying WHL-* code alone. Captain&rsquo;s Chairs is a settled flat $1,500 approximation of a price that really runs $1,500&ndash;$6,000 by trim and interior. Rivian&rsquo;s R1 destination charge is $1,895.'
};
