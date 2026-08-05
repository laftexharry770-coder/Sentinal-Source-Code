/* ==========================================================================
   data.js — THIS IS THE ONLY FILE YOU NEED TO EDIT DAY TO DAY.
   1. SITE     → your business name and contact details
   2. PRODUCTS → everything shown in the catalogue
   ========================================================================== */

/* ── 1. Your details ─────────────────────────────────────────────────────────
   phone  : full international format, digits only, no "+" and no spaces.
            Kenya example: 254712345678  (i.e. drop the leading 0 of 0712345678)
            This one value powers the WhatsApp link, the tap-to-call link
            and the number shown on the page.
   ------------------------------------------------------------------------- */
const SITE = {
  brand:    'Sentinal',
  tagline:  'Computers, phones and accessories — sold straight.',

  phone:    '254700000000',                 // ← CHANGE ME (digits only, with country code)
  email:    'laftexharry770@gmail.com',     // ← CHANGE ME if you use a business address
  location: 'Nairobi, Kenya',               // ← CHANGE ME (short label shown on the page)
  hours:    'Mon–Sat, 8:30am – 6:00pm',     // ← CHANGE ME

  /* Google Maps. `mapQuery` is what gets searched — the more exact, the better
     the pin. A full street address works; so does "Business Name, Street, City"
     or even raw coordinates like "-1.286389,36.817223".
     `address` is the human-readable version printed under the map. */
  mapQuery: 'Kimathi Street, Nairobi, Kenya',   // ← CHANGE ME
  address:  'Kimathi Street, CBD, Nairobi',     // ← CHANGE ME
  mapNote:  'Free parking behind the building. Ring when you arrive.',

  currency: 'KSh',        // shown before every price, e.g. KSh 84,500
  locale:   'en-KE',      // number formatting

  /* Optional: a Formspree (or similar) endpoint so the form also emails you
     silently in the background. Leave '' to rely on WhatsApp / email only.
     Get one free at https://formspree.io — paste the URL here. */
  formEndpoint: ''
};

/* ── 2. Products ─────────────────────────────────────────────────────────────
   Copy any block below to add a product. Fields:

     id        unique short slug (used for the inquiry list — keep it unique)
     name      product name shown on the card
     category  one of: computers | computer-accessories | phones | phone-accessories
     price     number only, no commas, no currency symbol. Use null for "Ask"
     desc      one or two lines shown on the card
     specs     { label: value } — any number of rows, shown in the pop-up
     tag       optional badge: 'New' | 'Best seller' | 'Refurbished' | 'Deal' | ''
     stock     'in'  → green "In stock"
               'low' → "Low stock"
               'out' → "Out of stock" (still inquirable, sold as "order on request")
     image     optional photo. Drop a file in assets/img/ and write
               'assets/img/my-photo.jpg'. Leave '' to use the built-in icon art.
   ------------------------------------------------------------------------- */
const PRODUCTS = [
  /* ── Computers ─────────────────────────────────────────────────────────── */
  {
    id: 'tp-t14-g3',
    name: 'Lenovo ThinkPad T14 Gen 3',
    category: 'computers',
    price: 84500,
    desc: 'The dependable work laptop. Intel i7, 16GB RAM and a keyboard you can type on all day.',
    specs: {
      Processor: 'Intel Core i7-1255U',
      Memory: '16GB DDR4',
      Storage: '512GB NVMe SSD',
      Display: '14" FHD IPS, matte',
      Battery: 'Up to 9 hrs',
      Warranty: '6 months'
    },
    tag: 'Best seller',
    stock: 'in',
    image: ''
  },
  {
    id: 'mba-m2-13',
    name: 'MacBook Air 13" (M2)',
    category: 'computers',
    price: 149000,
    desc: 'Silent, light and fast. The one to buy if you edit, design or simply want it to last.',
    specs: {
      Chip: 'Apple M2, 8-core',
      Memory: '8GB unified',
      Storage: '256GB SSD',
      Display: '13.6" Liquid Retina',
      Battery: 'Up to 18 hrs',
      Warranty: '12 months'
    },
    tag: 'New',
    stock: 'in',
    image: ''
  },
  {
    id: 'hp-840-g8',
    name: 'HP EliteBook 840 G8',
    category: 'computers',
    price: 62000,
    desc: 'Ex-UK, tested and cleaned. Best value per shilling for office work and study.',
    specs: {
      Processor: 'Intel Core i5-1135G7',
      Memory: '16GB DDR4',
      Storage: '256GB NVMe SSD',
      Display: '14" FHD',
      Condition: 'Refurbished — grade A',
      Warranty: '3 months'
    },
    tag: 'Refurbished',
    stock: 'in',
    image: ''
  },
  {
    id: 'dell-opti-7090',
    name: 'Dell OptiPlex 7090 Desktop',
    category: 'computers',
    price: 58000,
    desc: 'Small-form desktop for the shop counter, the front desk or a cyber setup.',
    specs: {
      Processor: 'Intel Core i5-10500',
      Memory: '8GB DDR4 (expandable)',
      Storage: '512GB SSD',
      Ports: '6× USB, DisplayPort, HDMI',
      Includes: 'Keyboard and mouse',
      Warranty: '6 months'
    },
    tag: '',
    stock: 'low',
    image: ''
  },
  {
    id: 'gaming-rig-rtx',
    name: 'Custom Gaming PC — RTX 4060',
    category: 'computers',
    price: 185000,
    desc: 'Built to order in-house. 1080p ultra, 1440p high. Cable-managed and stress-tested.',
    specs: {
      Processor: 'AMD Ryzen 5 7600',
      Graphics: 'NVIDIA RTX 4060 8GB',
      Memory: '32GB DDR5',
      Storage: '1TB NVMe Gen4',
      Cooling: '3× ARGB intake, 1× exhaust',
      Warranty: '12 months on parts'
    },
    tag: 'Built to order',
    stock: 'in',
    image: ''
  },

  /* ── Computer accessories ──────────────────────────────────────────────── */
  {
    id: 'lg-27-monitor',
    name: 'LG 27" IPS Monitor (75Hz)',
    category: 'computer-accessories',
    price: 24500,
    desc: 'Slim-bezel FHD panel with HDMI and VESA mounting. Easy on the eyes for long shifts.',
    specs: {
      Size: '27 inch',
      Resolution: '1920 × 1080',
      'Refresh rate': '75Hz, FreeSync',
      Ports: 'HDMI ×2, VGA',
      Mount: 'VESA 100 × 100',
      Warranty: '12 months'
    },
    tag: '',
    stock: 'in',
    image: ''
  },
  {
    id: 'logi-mx-combo',
    name: 'Logitech MX Keys + MX Master 3S',
    category: 'computer-accessories',
    price: 21500,
    desc: 'The quiet, precise desk combo. One receiver, three paired devices, weeks per charge.',
    specs: {
      Connection: 'Bluetooth + Logi Bolt',
      Battery: 'Up to 10 days backlit',
      Devices: 'Pairs with 3 machines',
      Compatible: 'Windows, macOS, Linux',
      'In the box': 'Keyboard, mouse, USB-C cable',
      Warranty: '12 months'
    },
    tag: 'Best seller',
    stock: 'in',
    image: ''
  },
  {
    id: 'ssd-1tb-ext',
    name: 'SanDisk Extreme 1TB Portable SSD',
    category: 'computer-accessories',
    price: 13800,
    desc: 'Pocket-size, rubberised and quick. Backs up a full laptop in a few minutes.',
    specs: {
      Capacity: '1TB',
      Speed: 'Up to 1050MB/s read',
      Interface: 'USB-C 3.2 Gen 2',
      Rating: 'IP55 water and dust resistant',
      Includes: 'USB-C and USB-A cables',
      Warranty: '12 months'
    },
    tag: '',
    stock: 'in',
    image: ''
  },
  {
    id: 'usbc-hub-8n1',
    name: '8-in-1 USB-C Docking Hub',
    category: 'computer-accessories',
    price: 5200,
    desc: 'HDMI 4K, gigabit ethernet, card readers and 100W pass-through charging in one plug.',
    specs: {
      Ports: 'HDMI 4K30, RJ45, 3× USB-A, USB-C PD, SD, microSD',
      'Pass-through': '100W',
      Build: 'Aluminium shell',
      Cable: '18cm braided',
      Compatible: 'MacBook, Windows, iPad Pro',
      Warranty: '6 months'
    },
    tag: 'Deal',
    stock: 'in',
    image: ''
  },
  {
    id: 'ups-1000va',
    name: 'APC 1000VA UPS Backup',
    category: 'computer-accessories',
    price: 18500,
    desc: 'Rides out the blackouts. Around 20 minutes for a desktop and monitor.',
    specs: {
      Capacity: '1000VA / 600W',
      Outlets: '4 battery-backed, 2 surge-only',
      Runtime: '~20 min typical desktop',
      Protection: 'Surge and overload',
      Warranty: '12 months'
    },
    tag: '',
    stock: 'low',
    image: ''
  },

  /* ── Phones ────────────────────────────────────────────────────────────── */
  {
    id: 'iphone-15',
    name: 'Apple iPhone 15 (128GB)',
    category: 'phones',
    price: 118000,
    desc: 'USB-C at last, a 48MP main camera and the Dynamic Island. Sealed and unlocked.',
    specs: {
      Display: '6.1" Super Retina XDR',
      Chip: 'A16 Bionic',
      Storage: '128GB',
      Camera: '48MP main + 12MP ultra-wide',
      Battery: 'Up to 20 hrs video',
      Warranty: '12 months'
    },
    tag: 'New',
    stock: 'in',
    image: ''
  },
  {
    id: 'sam-a55',
    name: 'Samsung Galaxy A55 5G',
    category: 'phones',
    price: 46500,
    desc: 'The sweet spot in the mid-range: bright AMOLED, four years of updates, solid camera.',
    specs: {
      Display: '6.6" Super AMOLED 120Hz',
      Chip: 'Exynos 1480',
      Memory: '8GB RAM / 128GB',
      Camera: '50MP OIS main',
      Battery: '5000mAh, 25W',
      Warranty: '12 months'
    },
    tag: 'Best seller',
    stock: 'in',
    image: ''
  },
  {
    id: 'pixel-8a',
    name: 'Google Pixel 8a',
    category: 'phones',
    price: 62000,
    desc: 'The best point-and-shoot camera at this price, plus seven years of Android updates.',
    specs: {
      Display: '6.1" OLED 120Hz',
      Chip: 'Google Tensor G3',
      Memory: '8GB RAM / 128GB',
      Camera: '64MP OIS main',
      Updates: '7 years of OS and security',
      Warranty: '12 months'
    },
    tag: '',
    stock: 'in',
    image: ''
  },
  {
    id: 'tecno-spark-20',
    name: 'Tecno Spark 20 Pro',
    category: 'phones',
    price: 21000,
    desc: 'Big screen, big battery, small price. A sensible first smartphone or a spare line.',
    specs: {
      Display: '6.78" 120Hz',
      Chip: 'Helio G99',
      Memory: '8GB RAM / 256GB',
      Camera: '108MP main',
      Battery: '5000mAh, 33W',
      Warranty: '12 months'
    },
    tag: 'Deal',
    stock: 'in',
    image: ''
  },

  /* ── Phone accessories ─────────────────────────────────────────────────── */
  {
    id: 'anker-20k',
    name: 'Anker 20,000mAh Power Bank (22.5W)',
    category: 'phone-accessories',
    price: 6800,
    desc: 'Four full phone charges. Fast enough to top a laptop up in a pinch.',
    specs: {
      Capacity: '20,000mAh',
      Output: '22.5W USB-C PD + 2× USB-A',
      Recharge: '~4 hrs at 20W',
      Display: 'Digital battery readout',
      Warranty: '12 months'
    },
    tag: 'Best seller',
    stock: 'in',
    image: ''
  },
  {
    id: 'gan-65w',
    name: '65W GaN Fast Charger',
    category: 'phone-accessories',
    price: 3900,
    desc: 'One small brick that charges a phone, tablet and laptop. Replaces three chargers.',
    specs: {
      Output: '65W total — 2× USB-C, 1× USB-A',
      Tech: 'GaN III, PD 3.0 + PPS',
      Size: 'Foldable pins, palm-sized',
      Safety: 'Over-current and thermal protection',
      Warranty: '6 months'
    },
    tag: '',
    stock: 'in',
    image: ''
  },
  {
    id: 'buds-anc',
    name: 'Wireless Earbuds with ANC',
    category: 'phone-accessories',
    price: 7500,
    desc: 'Active noise cancelling for matatu rides and open-plan offices. 30 hrs with the case.',
    specs: {
      Type: 'True wireless, in-ear',
      ANC: 'Hybrid, up to 35dB',
      Battery: '7 hrs + 23 hrs case',
      Charging: 'USB-C and wireless',
      Rating: 'IPX5 sweat resistant',
      Warranty: '6 months'
    },
    tag: '',
    stock: 'in',
    image: ''
  },
  {
    id: 'case-glass-bundle',
    name: 'Clear Case + Tempered Glass Bundle',
    category: 'phone-accessories',
    price: 1500,
    desc: 'Shock-absorbing corners and 9H glass, fitted for you in the shop. Most models stocked.',
    specs: {
      Case: 'Anti-yellow TPU, raised lip',
      Glass: '9H tempered, oleophobic',
      Fitting: 'Free, done while you wait',
      Models: 'iPhone, Samsung, Tecno, Infinix and more',
      Warranty: 'Replacement if it cracks on fitting'
    },
    tag: 'Deal',
    stock: 'in',
    image: ''
  },
  {
    id: 'smartwatch-fit',
    name: 'Fitness Smartwatch (AMOLED)',
    category: 'phone-accessories',
    price: 9800,
    desc: 'Calls, steps, sleep and SpO₂ on a bright always-on screen. A week per charge.',
    specs: {
      Display: '1.43" AMOLED always-on',
      Calls: 'Bluetooth calling with mic',
      Tracking: 'Heart rate, SpO₂, sleep, 100+ modes',
      Battery: 'Up to 7 days',
      Rating: 'IP68',
      Warranty: '6 months'
    },
    tag: '',
    stock: 'out',
    image: ''
  }
];

/* ── 3. Stock overrides ──────────────────────────────────────────────────────
   The "Manage stock" panel on the site (footer link, or add #manage to the web
   address) lets you flip any product between In stock / Low stock / Out of
   stock without touching code. Those changes are saved in YOUR browser only.

   When you're happy with them, the panel gives you a "Copy for data.js"
   button — paste what it copies over the block below and every visitor sees
   the new availability.                                                     */
const STOCK_OVERRIDES = {
  // 'tp-t14-g3': 'out',
};

/* Category labels shown on the filter chips — edit the text, keep the keys. */
const CATEGORIES = [
  { key: 'all',                  label: 'Everything' },
  { key: 'computers',            label: 'Computers' },
  { key: 'computer-accessories', label: 'Computer accessories' },
  { key: 'phones',               label: 'Phones' },
  { key: 'phone-accessories',    label: 'Phone accessories' }
];
