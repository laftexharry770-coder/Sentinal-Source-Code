/* ==========================================================================
   data.js — exported from the Manage panel on 2026-08-13 12:01.
   Put this file in assets/js/ (replacing the old one) and upload it to
   publish these products, prices, offers and photos to everyone.
   ========================================================================== */

const SITE = {
  "brand": "HOMCOM COMPUTERS",
  "tagline": "Computers, phones, accessories and repairs — done properly.",
  "phones": [
    {
      "number": "254724359797",
      "label": "Main line"
    },
    {
      "number": "254738715271",
      "label": "Second line"
    }
  ],
  "whatsapp": "254724359797",
  "email": "homcomcomputers@gmail.com",
  "repairs": {
    "label": "Repair desk",
    "phone": "254106998733",
    "whatsapp": "254106998733",
    "email": "mwangiherbert225@gmail.com"
  },
  "contactHours": [
    "08:00",
    "20:00"
  ],
  "contactNote": "Calls, texts, WhatsApp and emails are answered between 8am and 8pm, every day. Messages sent outside those hours are answered first thing.",
  "location": "Tom Mboya Street, Nairobi",
  "mapQuery": "Rasumal House, Tom Mboya Street, Nairobi, Kenya",
  "address": "Rasumal House, ground floor, first shop — Tom Mboya Street, Nairobi",
  "mapNote": "Opposite Imenti House, near Odeon. Ground floor, first shop on your right.",
  "timezone": "Africa/Nairobi",
  "hours": {
    "mon": [
      "07:00",
      "20:00"
    ],
    "tue": [
      "07:00",
      "20:00"
    ],
    "wed": [
      "07:00",
      "20:00"
    ],
    "thu": [
      "07:00",
      "20:00"
    ],
    "fri": [
      "07:00",
      "20:00"
    ],
    "sat": [
      "08:00",
      "21:00"
    ],
    "sun": [
      "10:00",
      "17:00"
    ]
  },
  "holidayNote": "Open 7 days a week, public holidays included.",
  "currency": "KSh",
  "locale": "en-KE",
  "formEndpoint": "",
  "manageKey": "malvel",
  "managePin": "1754"
};

const SERVICES = [
  {
    "id": "computer-repair",
    "name": "Computer repair",
    "icon": "computer",
    "desc": "Laptops and desktops, any make. Free diagnosis before you commit to anything.",
    "items": [
      "Cracked screen replacement",
      "Keyboard, trackpad and hinges",
      "Battery and charging faults",
      "Windows / macOS reinstall",
      "Virus removal and clean-ups",
      "RAM and SSD upgrades"
    ],
    "turnaround": "Most jobs same day · free diagnosis"
  },
  {
    "id": "phone-repair",
    "name": "Phone repair",
    "icon": "phone",
    "desc": "Screens, batteries and ports for iPhone, Samsung, Tecno, Infinix and more.",
    "items": [
      "Screen and glass replacement",
      "Battery replacement",
      "Charging port cleaning and rebuild",
      "Water damage treatment",
      "Software, updates and unlocking",
      "Data transfer to a new phone"
    ],
    "turnaround": "Screens and batteries while you wait"
  },
  {
    "id": "data-recovery",
    "name": "Data recovery & backup",
    "icon": "drive",
    "desc": "Dead drive, deleted files, phone that will not boot — bring it in before you try anything else.",
    "items": [
      "Failed hard drive and SSD recovery",
      "Deleted photo and document recovery",
      "Phone-to-phone and phone-to-cloud backup",
      "Setting up automatic backups"
    ],
    "turnaround": "Assessed first, quoted before work starts"
  },
  {
    "id": "setup",
    "name": "Setup & networking",
    "icon": "network",
    "desc": "Getting a new machine, an office or a cyber running the way it should.",
    "items": [
      "New machine setup and data transfer",
      "Office and cyber installations",
      "Wi-Fi, routers and extenders",
      "Printer and CCTV setup",
      "Software licensing and installs"
    ],
    "turnaround": "On-site visits by appointment"
  }
];

const CATEGORIES = [
  {
    "key": "all",
    "label": "Everything"
  },
  {
    "key": "computers",
    "label": "Computers"
  },
  {
    "key": "computer-accessories",
    "label": "Computer accessories"
  },
  {
    "key": "phones",
    "label": "Phones"
  },
  {
    "key": "phone-accessories",
    "label": "Phone accessories"
  },
  {
    "key": "other-tech",
    "label": "Other tech"
  }
];

const PRODUCTS = [
  {
    "id": "hp-840-g8",
    "name": "Oraimo BoomPop Lite",
    "category": "phone-accessories",
    "price": 3500,
    "wasPrice": 4000,
    "desc": "HavyBass, high quality, comfortable headphones.",
    "specs": {
      "Connection": "Bluetooth v5.3/3.5mm AUX Cable",
      "Charging Time": "10mins",
      "Playtime": "6Hrs",
      "BT Range": "10m",
      "Warranty": "365 Days Oraimo Warranty",
      "Charging Port": "USB-C",
      "Included": "Cables and Accessories"
    },
    "tag": "New",
    "stock": "in",
    "images": [
      "assets/img/products/hp-840-g8-1.webp",
      "assets/img/products/hp-840-g8-2.webp"
    ],
    "spin": [],
    "updated": 1786094729739
  },
  {
    "id": "hp-250-g9",
    "name": "HP Elite DragonFly",
    "category": "computers",
    "price": 60000,
    "wasPrice": 62000,
    "desc": "High-end productivity touch-screen laptop with great visuals and performance",
    "specs": {
      "Processor": "Intel Core i7-8565U @ 1.8GHz",
      "Memory": "16GB DDR4",
      "Storage": "512GB SSD",
      "Display": "13.2\" FHD",
      "Warranty": "6 months"
    },
    "tag": "Refurbished",
    "stock": "in",
    "images": [
      "assets/img/products/hp-250-g9-1.webp",
      "assets/img/products/hp-250-g9-2.webp",
      "assets/img/products/hp-250-g9-3.webp",
      "assets/img/products/hp-250-g9-4.webp"
    ],
    "spin": [],
    "updated": 1786098580182
  },
  {
    "id": "dell-opti-7090",
    "name": "Samaung 45PD Adapter",
    "category": "phone-accessories",
    "price": 1500,
    "wasPrice": 1800,
    "desc": "Fast and reliable Samsung USB-C to USB-C adapter.",
    "specs": {
      "Power Output": "45 Watts maxInput.",
      "Voltage": "AC 100–240V (1.0A–1.5A), suitable for worldwide use with standard plug converters.",
      "Protocols": "USB Power Delivery (PD 3.0) / PPS for safe, optimized device communication."
    },
    "tag": "New",
    "stock": "in",
    "images": [
      "assets/img/products/dell-opti-7090-1.webp",
      "assets/img/products/dell-opti-7090-2.webp",
      "assets/img/products/dell-opti-7090-3.webp"
    ],
    "spin": [],
    "updated": 1786622026672
  },
  {
    "id": "mouse-m170",
    "name": "Dell Flat Wireless Mouse",
    "category": "computer-accessories",
    "price": 800,
    "wasPrice": null,
    "desc": "Small, portable and reliable wireless mouse.",
    "specs": {
      "Design": "Low-profile, flat, and lightweight shape ideal for travel and laptop bags.",
      "Connectivity": "Stable 2.4GHz wireless link via a plug-and-play USB nano receiver up to a 10-meter range.",
      "Sensitivity": "Adjustable optical sensor ranging from 800 to 1200 DPI for cursor control.",
      "Power": "Runs on 2 AAA batteries with an integrated on/off switch to conserve battery life."
    },
    "tag": "",
    "stock": "in",
    "images": [
      "assets/img/products/mouse-m170-1.webp"
    ],
    "spin": [],
    "updated": 1786622261282
  },
  {
    "id": "mouse-mx-master",
    "name": "Logitech MX Master 3S Mouse",
    "category": "computer-accessories",
    "price": 12500,
    "wasPrice": null,
    "desc": "Near-silent clicks, a scroll wheel that flies, and pairing for three machines.",
    "specs": {
      "Connection": "Bluetooth + Logi Bolt",
      "Sensor": "8000 DPI, works on glass",
      "Battery": "70 days per charge",
      "Devices": "Pairs with 3 machines",
      "Charging": "USB-C",
      "Warranty": "12 months"
    },
    "tag": "Best seller",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "kb-mk270",
    "name": "Logitech MK270 Keyboard & Mouse Combo",
    "category": "computer-accessories",
    "price": 3500,
    "wasPrice": null,
    "desc": "Full-size wireless keyboard and mouse on one receiver. The office standard.",
    "specs": {
      "Connection": "2.4GHz USB receiver (one for both)",
      "Layout": "Full size with number pad",
      "Battery": "24 months keyboard, 12 months mouse",
      "Keys": "8 media shortcut keys",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "kb-mech-rgb",
    "name": "Mechanical Gaming Keyboard (RGB)",
    "category": "computer-accessories",
    "price": 5000,
    "wasPrice": 5500,
    "desc": "Blue switches, per-key lighting and a metal top plate. Loud, in a good way.",
    "specs": {
      "Switches": "Blue mechanical, hot-swappable",
      "Layout": "TKL, 61 keys",
      "Lighting": "Per-key RGB, 18 presets",
      "Build": "Strong Plastic top plate",
      "Cable": "Detachable USB-C",
      "Warranty": "6 months",
      "Color": "Black and White"
    },
    "tag": "Best seller",
    "stock": "in",
    "images": [
      "assets/img/products/kb-mech-rgb-1.webp",
      "assets/img/products/kb-mech-rgb-2.webp"
    ],
    "spin": [],
    "updated": 1786086637399
  },
  {
    "id": "lg-27-monitor",
    "name": "LG 27\" IPS Monitor (75Hz)",
    "category": "computer-accessories",
    "price": 24500,
    "wasPrice": null,
    "desc": "Slim-bezel FHD panel with HDMI and VESA mounting. Easy on the eyes for long shifts.",
    "specs": {
      "Size": "27 inch",
      "Resolution": "1920 × 1080",
      "Refresh rate": "75Hz, FreeSync",
      "Ports": "HDMI ×2, VGA",
      "Mount": "VESA 100 × 100",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "ext-4way",
    "name": "4-Way Power Extension with Surge Protection",
    "category": "computer-accessories",
    "price": 2200,
    "wasPrice": null,
    "desc": "Protects the machine from the spikes that come with our power. 3-metre cable.",
    "specs": {
      "Sockets": "4 universal",
      "Cable": "3 metres, heavy duty",
      "Protection": "Surge and overload cut-out",
      "Rating": "13A / 3250W",
      "Warranty": "6 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "ext-6way-usb",
    "name": "6-Socket Extension Cable + USB Ports",
    "category": "computer-accessories",
    "price": 3200,
    "wasPrice": null,
    "desc": "Six sockets plus four USB ports, so the desk stops fighting over chargers.",
    "specs": {
      "Sockets": "6 universal + 4 USB-A",
      "Cable": "3 metres",
      "USB output": "2.4A shared",
      "Protection": "Surge, overload, child-safety shutters",
      "Mounting": "Wall-mountable",
      "Warranty": "6 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "usbc-hub-8n1",
    "name": "8-in-1 USB-C Docking Hub",
    "category": "computer-accessories",
    "price": 5200,
    "wasPrice": null,
    "desc": "HDMI 4K, gigabit ethernet, card readers and 100W pass-through charging in one plug.",
    "specs": {
      "Ports": "HDMI 4K30, RJ45, 3× USB-A, USB-C PD, SD, microSD",
      "Pass-through": "100W",
      "Build": "Aluminium shell",
      "Cable": "18cm braided",
      "Compatible": "MacBook, Windows, iPad Pro",
      "Warranty": "6 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "ssd-1tb-ext",
    "name": "SanDisk Extreme 1TB Portable SSD",
    "category": "computer-accessories",
    "price": 13800,
    "wasPrice": null,
    "desc": "Pocket-size, rubberised and quick. Backs up a full laptop in a few minutes.",
    "specs": {
      "Capacity": "1TB",
      "Speed": "Up to 1050MB/s read",
      "Interface": "USB-C 3.2 Gen 2",
      "Rating": "IP55 water and dust resistant",
      "Includes": "USB-C and USB-A cables",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "laptop-charger-65w",
    "name": "Universal 65W Laptop Charger",
    "category": "computer-accessories",
    "price": 3500,
    "wasPrice": null,
    "desc": "One charger, eight tips — HP, Dell, Lenovo, Asus and USB-C machines.",
    "specs": {
      "Output": "65W, auto-voltage 18.5–20V",
      "Tips": "8 interchangeable + USB-C",
      "Cable": "1.8m",
      "Protection": "Short-circuit and over-heat",
      "Warranty": "6 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "ups-1000va",
    "name": "APC 1000VA UPS Backup",
    "category": "computer-accessories",
    "price": 18500,
    "wasPrice": null,
    "desc": "Rides out the blackouts. Around 20 minutes for a desktop and monitor.",
    "specs": {
      "Capacity": "1000VA / 600W",
      "Outlets": "4 battery-backed, 2 surge-only",
      "Runtime": "~20 min typical desktop",
      "Protection": "Surge and overload",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "low",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "iphone-15",
    "name": "Apple iPhone 15 (128GB)",
    "category": "phones",
    "price": 118000,
    "wasPrice": null,
    "desc": "USB-C at last, a 48MP main camera and the Dynamic Island. Sealed and unlocked.",
    "specs": {
      "Display": "6.1\" Super Retina XDR",
      "Chip": "A16 Bionic",
      "Storage": "128GB",
      "Camera": "48MP main + 12MP ultra-wide",
      "Battery": "Up to 20 hrs video",
      "Warranty": "12 months"
    },
    "tag": "New",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "sam-a55",
    "name": "Samsung Galaxy A55 5G",
    "category": "phones",
    "price": 42000,
    "wasPrice": 46500,
    "desc": "The sweet spot in the mid-range: bright AMOLED, four years of updates, solid camera.",
    "specs": {
      "Display": "6.6\" Super AMOLED 120Hz",
      "Chip": "Exynos 1480",
      "Memory": "8GB RAM / 128GB",
      "Camera": "50MP OIS main",
      "Battery": "5000mAh, 25W",
      "Warranty": "12 months"
    },
    "tag": "Best seller",
    "stock": "in",
    "images": [],
    "spin": [
      "assets/img/demo-360/frame-01.svg",
      "assets/img/demo-360/frame-02.svg",
      "assets/img/demo-360/frame-03.svg",
      "assets/img/demo-360/frame-04.svg",
      "assets/img/demo-360/frame-05.svg",
      "assets/img/demo-360/frame-06.svg",
      "assets/img/demo-360/frame-07.svg",
      "assets/img/demo-360/frame-08.svg",
      "assets/img/demo-360/frame-09.svg",
      "assets/img/demo-360/frame-10.svg",
      "assets/img/demo-360/frame-11.svg",
      "assets/img/demo-360/frame-12.svg",
      "assets/img/demo-360/frame-13.svg",
      "assets/img/demo-360/frame-14.svg",
      "assets/img/demo-360/frame-15.svg",
      "assets/img/demo-360/frame-16.svg",
      "assets/img/demo-360/frame-17.svg",
      "assets/img/demo-360/frame-18.svg",
      "assets/img/demo-360/frame-19.svg",
      "assets/img/demo-360/frame-20.svg",
      "assets/img/demo-360/frame-21.svg",
      "assets/img/demo-360/frame-22.svg",
      "assets/img/demo-360/frame-23.svg",
      "assets/img/demo-360/frame-24.svg"
    ],
    "updated": null
  },
  {
    "id": "pixel-8a",
    "name": "Google Pixel 8a",
    "category": "phones",
    "price": 62000,
    "wasPrice": null,
    "desc": "The best point-and-shoot camera at this price, plus seven years of Android updates.",
    "specs": {
      "Display": "6.1\" OLED 120Hz",
      "Chip": "Google Tensor G3",
      "Memory": "8GB RAM / 128GB",
      "Camera": "64MP OIS main",
      "Updates": "7 years of OS and security",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "tecno-spark-20",
    "name": "Tecno Spark 20 Pro",
    "category": "phones",
    "price": 21000,
    "wasPrice": null,
    "desc": "Big screen, big battery, small price. A sensible first smartphone or a spare line.",
    "specs": {
      "Display": "6.78\" 120Hz",
      "Chip": "Helio G99",
      "Memory": "8GB RAM / 256GB",
      "Camera": "108MP main",
      "Battery": "5000mAh, 33W",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "infinix-hot-40i",
    "name": "Infinix Hot 40i",
    "category": "phones",
    "price": 15500,
    "wasPrice": null,
    "desc": "Two-day battery and a screen that stays readable in the sun, for very little money.",
    "specs": {
      "Display": "6.6\" 90Hz",
      "Chip": "Unisoc T606",
      "Memory": "8GB RAM / 256GB",
      "Camera": "50MP main",
      "Battery": "5000mAh, 18W",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "case-glass-bundle",
    "name": "Clear Case + Tempered Glass Bundle",
    "category": "phone-accessories",
    "price": 1500,
    "wasPrice": null,
    "desc": "Shock-absorbing corners and 9H glass, fitted for you in the shop. Most models stocked.",
    "specs": {
      "Case": "Anti-yellow TPU, raised lip",
      "Glass": "9H tempered, oleophobic",
      "Fitting": "Free, done while you wait",
      "Models": "iPhone, Samsung, Tecno, Infinix and more",
      "Warranty": "Replacement if it cracks on fitting"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "case-flip-wallet",
    "name": "Leather Flip Wallet Case",
    "category": "phone-accessories",
    "price": 1200,
    "wasPrice": null,
    "desc": "Covers the screen when it drops face-down, and holds two cards and a note.",
    "specs": {
      "Material": "PU leather with soft inner lining",
      "Slots": "2 card slots + cash pocket",
      "Feature": "Folds into a video stand",
      "Closure": "Magnetic",
      "Models": "Most iPhone, Samsung, Tecno and Infinix"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "gan-65w",
    "name": "65W GaN Fast Charger",
    "category": "phone-accessories",
    "price": 3900,
    "wasPrice": null,
    "desc": "One small brick that charges a phone, tablet and laptop. Replaces three chargers.",
    "specs": {
      "Output": "65W total — 2× USB-C, 1× USB-A",
      "Tech": "GaN III, PD 3.0 + PPS",
      "Size": "Foldable pins, palm-sized",
      "Safety": "Over-current and thermal protection",
      "Warranty": "6 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "charger-20w",
    "name": "20W USB-C Fast Charger",
    "category": "phone-accessories",
    "price": 1800,
    "wasPrice": null,
    "desc": "Half a charge in half an hour on most phones. The one to keep by the bed.",
    "specs": {
      "Output": "20W USB-C Power Delivery",
      "Compatible": "iPhone 8 and newer, USB-C Android",
      "Safety": "Over-voltage and short-circuit protection",
      "Warranty": "6 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "cable-usbc-braided",
    "name": "Braided USB-C Charging Cable (2m)",
    "category": "phone-accessories",
    "price": 800,
    "wasPrice": null,
    "desc": "Nylon braid and reinforced ends — the bit that usually frays first.",
    "specs": {
      "Length": "2 metres",
      "Rating": "60W / 3A charging",
      "Data": "USB 2.0, 480Mbps",
      "Build": "Nylon braid, aluminium shell",
      "Warranty": "3 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "cable-lightning-mfi",
    "name": "MFi Lightning Cable (1m)",
    "category": "phone-accessories",
    "price": 1500,
    "wasPrice": null,
    "desc": "Apple-certified, so no \"accessory not supported\" nonsense after an update.",
    "specs": {
      "Length": "1 metre",
      "Certification": "Apple MFi",
      "Charging": "Up to 20W with a PD charger",
      "Compatible": "iPhone 5 through 14, iPad, AirPods",
      "Warranty": "6 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "anker-20k",
    "name": "Anker 20,000mAh Power Bank (22.5W)",
    "category": "phone-accessories",
    "price": 6800,
    "wasPrice": null,
    "desc": "Four full phone charges. Fast enough to top a laptop up in a pinch.",
    "specs": {
      "Capacity": "20,000mAh",
      "Output": "22.5W USB-C PD + 2× USB-A",
      "Recharge": "~4 hrs at 20W",
      "Display": "Digital battery readout",
      "Warranty": "12 months"
    },
    "tag": "Best seller",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "airpods-pro-2",
    "name": "Apple AirPods Pro (2nd gen)",
    "category": "phone-accessories",
    "price": 32000,
    "wasPrice": null,
    "desc": "The noise cancelling everyone compares the rest to. Sealed, with USB-C case.",
    "specs": {
      "ANC": "Active, with Transparency mode",
      "Battery": "6 hrs + 30 hrs case",
      "Case": "USB-C, MagSafe and Qi charging",
      "Rating": "IP54 dust and sweat resistant",
      "Warranty": "12 months"
    },
    "tag": "New",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "buds-anc",
    "name": "Wireless Earbuds with ANC",
    "category": "phone-accessories",
    "price": 6200,
    "wasPrice": 7500,
    "desc": "Active noise cancelling for matatu rides and open-plan offices. 30 hrs with the case.",
    "specs": {
      "Type": "True wireless, in-ear",
      "ANC": "Hybrid, up to 35dB",
      "Battery": "7 hrs + 23 hrs case",
      "Charging": "USB-C and wireless",
      "Rating": "IPX5 sweat resistant",
      "Warranty": "6 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "earphones-wired",
    "name": "Wired Earphones with Mic",
    "category": "phone-accessories",
    "price": 600,
    "wasPrice": null,
    "desc": "No charging, no pairing, no losing one down the seat. USB-C or 3.5mm.",
    "specs": {
      "Connector": "3.5mm or USB-C — say which you need",
      "Driver": "10mm dynamic",
      "Controls": "In-line mic with play/pause",
      "Cable": "1.2m tangle-resistant",
      "Warranty": "3 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "smartwatch-fit",
    "name": "Fitness Smartwatch (AMOLED)",
    "category": "phone-accessories",
    "price": 9800,
    "wasPrice": null,
    "desc": "Calls, steps, sleep and SpO₂ on a bright always-on screen. A week per charge.",
    "specs": {
      "Display": "1.43\" AMOLED always-on",
      "Calls": "Bluetooth calling with mic",
      "Tracking": "Heart rate, SpO₂, sleep, 100+ modes",
      "Battery": "Up to 7 days",
      "Rating": "IP68",
      "Warranty": "6 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "apple-watch-se",
    "name": "Apple Watch SE (40mm, GPS)",
    "category": "phone-accessories",
    "price": 34000,
    "wasPrice": null,
    "desc": "Crash and fall detection, proper workout tracking, and it just works with an iPhone.",
    "specs": {
      "Display": "40mm Retina",
      "Chip": "S8 SiP",
      "Features": "Crash detection, fall detection, heart alerts",
      "Battery": "Up to 18 hrs",
      "Rating": "50m water resistant",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "low",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "router-ac1200",
    "name": "Dual-Band Wi-Fi Router (AC1200)",
    "category": "other-tech",
    "price": 6500,
    "wasPrice": null,
    "desc": "Covers a three-bedroom house or a small office. Four antennas, easy phone setup.",
    "specs": {
      "Speed": "1200Mbps (300 + 867)",
      "Bands": "2.4GHz and 5GHz",
      "Antennas": "4 × 5dBi",
      "Ports": "4 LAN + 1 WAN",
      "Setup": "Phone app or browser",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "printer-hp-2320",
    "name": "HP DeskJet 2320 All-in-One Printer",
    "category": "other-tech",
    "price": 12500,
    "wasPrice": null,
    "desc": "Print, scan and copy for the house or the shop. Cartridges always in stock here.",
    "specs": {
      "Functions": "Print, scan, copy",
      "Speed": "7.5 ppm black, 5.5 ppm colour",
      "Connection": "USB",
      "Paper": "60-sheet input tray",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "cctv-4cam-kit",
    "name": "4-Camera CCTV Kit with DVR",
    "category": "other-tech",
    "price": 38000,
    "wasPrice": 42000,
    "desc": "Night vision, phone viewing from anywhere, and we install it for you.",
    "specs": {
      "Cameras": "4 × 1080p, weatherproof",
      "Recorder": "4-channel DVR, 1TB drive",
      "Night vision": "Up to 20 metres",
      "Viewing": "Phone app, anywhere",
      "Installation": "Quoted separately",
      "Warranty": "12 months"
    },
    "tag": "",
    "stock": "in",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "projector-hd",
    "name": "HD Mini Projector (1080p support)",
    "category": "other-tech",
    "price": 17500,
    "wasPrice": null,
    "desc": "Film nights, church and presentations. HDMI, USB and phone mirroring.",
    "specs": {
      "Resolution": "1280 × 720 native, 1080p supported",
      "Brightness": "6000 lumens",
      "Screen size": "40\" to 200\"",
      "Inputs": "HDMI, USB, AV, phone mirroring",
      "Speaker": "Built-in stereo",
      "Warranty": "6 months"
    },
    "tag": "",
    "stock": "low",
    "images": [],
    "spin": [],
    "updated": null
  },
  {
    "id": "hp-elitebook-840-g5",
    "name": "HP EliteBook 840 G5",
    "category": "computers",
    "price": 29000,
    "wasPrice": 32000,
    "desc": "The dependable, efficient, portable work laptop.",
    "specs": {
      "Processor": "Intel Core i5-8550U @1.8GHZ",
      "Memory": "8GB DDR4 RAM",
      "Storage": "256GB NVMe SSD",
      "Display": "14\" FHD IPS, matte",
      "Warranty": "6 months"
    },
    "tag": "Refurbished",
    "stock": "in",
    "images": [
      "assets/img/products/hp-elitebook-840-g5-1.webp",
      "assets/img/products/hp-elitebook-840-g5-2.webp",
      "assets/img/products/hp-elitebook-840-g5-3.webp",
      "assets/img/products/hp-elitebook-840-g5-4.webp"
    ],
    "spin": [],
    "updated": null
  },
  {
    "id": "amaya-usb-c-pd-20w-power-adapter",
    "name": "Amaya USB-C PD 20W Power Adapter",
    "category": "phone-accessories",
    "price": 700,
    "wasPrice": 1000,
    "desc": "Fast charging and reliable USB-C to USB-C adapter.",
    "specs": {
      "Charging Speed": "20W USB-C Power Adapter.",
      "Warranty": "365 Days Amaya warranty.",
      "Color": "White",
      "Condition": "Brand New."
    },
    "tag": "New",
    "stock": "in",
    "images": [
      "assets/img/products/amaya-usb-c-pd-20w-power-adapter-1.webp",
      "assets/img/products/amaya-usb-c-pd-20w-power-adapter-2.webp"
    ],
    "spin": [],
    "updated": 1786029924449
  },
  {
    "id": "oraimo-spacebuds-air",
    "name": "Oraimo SpaceBuds Air",
    "category": "phone-accessories",
    "price": 2500,
    "wasPrice": 3000,
    "desc": "HavyBass Sound\nComfortable Half-In-Ear Fit\nSmart Earbud Finder\nFree Anti-Lost Lanyard included\nRequires Oraimo Sound App",
    "specs": {
      "Connection": "Bluetooth V5.4 Earpods",
      "Battery": "Case provides additional 31.5hrs",
      "Range": "10m",
      "Playtime": "Up to 6.5hrs",
      "Active Noice Cancellation (ANC)": "No",
      "Warranty": "365 Days Oraimo Warranty"
    },
    "tag": "New",
    "stock": "in",
    "images": [
      "assets/img/products/oraimo-spacebuds-air-1.webp",
      "assets/img/products/oraimo-spacebuds-air-2.webp"
    ],
    "spin": [],
    "updated": 1786030542091
  },
  {
    "id": "amaya-freebuds-pro",
    "name": "Amaya FreeBuds Pro",
    "category": "phone-accessories",
    "price": 1500,
    "wasPrice": 1800,
    "desc": "Excellent Sound Quality.",
    "specs": {
      "Connection": "Bluetooth v5.0",
      "Battery": "40hrs Long Playtime",
      "Warranty": "365 Days Amaya Warranty",
      "Sound": "Pure Bass Dound Tunning Technology",
      "Case": "USB-C Charging Port",
      "Charging Time": "Approx. 1.5hrs(case), Approx. 1hr(earbuds)",
      "Range": "10m"
    },
    "tag": "New",
    "stock": "in",
    "images": [
      "assets/img/products/amaya-freebuds-pro-1.webp",
      "assets/img/products/amaya-freebuds-pro-2.webp"
    ],
    "spin": [],
    "updated": 1786031021220
  },
  {
    "id": "smart-trimmer-2",
    "name": "Smart Trimmer 2",
    "category": "other-tech",
    "price": 3000,
    "wasPrice": 3200,
    "desc": "Multi-Functional Trimmer, High-performance motor with Durable blades.",
    "specs": {
      "Speed": "Adjustable Speed",
      "Battery": "Extra Long-Lasting Battery",
      "Warranty": "365 Days Oraimo Warranty",
      "Charging Time": "2Hrs",
      "Full Working Time": "2.5Hrs"
    },
    "tag": "New",
    "stock": "in",
    "images": [
      "assets/img/products/smart-trimmer-2-1.webp",
      "assets/img/products/smart-trimmer-2-2.webp"
    ],
    "spin": [],
    "updated": 1786111090701
  },
  {
    "id": "oraimo-spacebuds",
    "name": "Oraimo SpaceBuds",
    "category": "phone-accessories",
    "price": 6000,
    "wasPrice": null,
    "desc": "HavyBass, has ANC(50dB Hybrid Noise Cancelling, Personalized Lighting Effect and Smart Chat Mode.",
    "specs": {
      "Connection": "Bluetooth v5.4",
      "Range": "10m",
      "Playtime": "Up to 11Hrs(ANC OFF), 8Hrs(ANC ON)",
      "Warranty": "365 Days Oraimo Warranty",
      "Case Input": "USB-C"
    },
    "tag": "New",
    "stock": "in",
    "images": [
      "assets/img/products/oraimo-spacebuds-1.webp",
      "assets/img/products/oraimo-spacebuds-2.webp"
    ],
    "spin": [],
    "updated": 1786111776117
  }
];
