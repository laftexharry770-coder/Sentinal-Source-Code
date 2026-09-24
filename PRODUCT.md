# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Confirmed by the shop (2026-09-24): all four groups buy, and the site serves all of them.

- **Students and young workers** buying a phone, earbuds, a charger or a first laptop. Price-sensitive, browsing on a phone over mobile data.
- **Offices, cybers and small businesses** buying machines, printers, CCTV, networking and setup, often several at once, and wanting quotes and invoices in writing.
- **Walk-in CBD shoppers** already on or near Tom Mboya Street, checking stock, price or whether the shop is open before they walk over.
- **Repair customers** with a broken laptop or phone, looking for someone they can trust with it.

The job in every case: find out whether HOMCOM has it (or can fix it), what it costs, and reach the shop in one tap.

## Product Purpose

The shop's catalogue and repair desk online, for HOMCOM COMPUTERS on Tom Mboya Street, Nairobi. A customer browses laptops, desktops, phones, accessories and other tech with photos, specs, offers and a 360° view where one exists. They build an inquiry list and send it by WhatsApp or email, reach the separate repair desk with the fault already described, and check live whether the shop is open and whether calls are being answered. Nothing is bought on the site. Success is a customer who messages, calls or walks in knowing what they want.

## Positioning

What a customer should believe about HOMCOM over the shop next door, all confirmed by the shop:

- **Genuine and honestly priced.** Real stock, every price on the page, refurbished labelled as refurbished.
- **Repairs done right.** A repair desk with its own line and inbox, free diagnosis, screens and batteries while you wait.
- **Advice and after-care.** They say which machine fits the work and budget (even the cheaper one), set it up, and answer questions after the sale.
- **Low prices.** Shown through visible prices, offers and savings. There is no price-comparison evidence on hand, so no "cheapest in Nairobi" claim is made.

## Operating Context

- Customers are mostly on phones, often on weak mobile data. The previous build measured about 9 KB/s on the connection the shop sees. Every byte shipped is a design decision.
- Conversations happen on WhatsApp. Every product, the inquiry list, the repair desk and a failed search all end in a pre-filled WhatsApp message (email as the alternative).
- Two lines of contact: sales (two phone lines, WhatsApp, email) and the repair desk (its own phone, WhatsApp, email). Repair traffic must never land in the sales inbox.
- Two separate clocks: opening hours (Mon–Fri 07:00–20:00, Sat 08:00–09:00, Sun 10:00–17:00) and contact hours (08:00–20:00 daily), computed live in Africa/Nairobi time.
- Currency KSh, locale en-KE. Directions refer to Nairobi CBD landmarks (opposite Imenti House, near Odeon).
- The owner edits prices, offers, stock, photos and 360° frames from a phone at the counter through a hidden Manage panel, then publishes by uploading `data.js`.

## Capabilities and Constraints

- Static site, no build step, no framework, no server, no database: `index.html`, `assets/css/styles.css`, `assets/js/app.js`, `assets/js/data.js`, `service-worker.js`. Hosted on GitHub Pages at homcomtech.com behind Cloudflare.
- Installable PWA that works offline. A design change must bump `CACHE_VERSION`, and must reach phones already holding an older version. The previous redesign got stuck on phones for exactly this reason.
- `data.js` is about 0.9 MB, most of it inline photos, and it is the owner's export. The site must stay readable before it arrives, and must say clearly when it cannot load.
- Catalogue: 41 products in 5 categories, 12 on offer. **Only 11 have photos.** The other 30 must look deliberate without one. One product has a 360° spin.
- Features that must survive any redesign: hero and header search with alias matching and a `/` shortcut, category chips, sort, the On-offer filter, product modal with gallery and 360° spin, compare up to 4, inquiry list drawer, contact form (WhatsApp or email, repair routing), live open/answering status, map and directions, theme toggle, install button, Manage panel (via `#manage-<key>` or five taps on the logo), lite mode, the failsafe and stale-page repair, and `tools/check-site.js` passing.
- Terminology customers use: "spoilt", "cover", "buds", "earpods", "cyber", "ex-UK", "refurbished".

## Brand Commitments

- Name: **HOMCOM COMPUTERS**. Tagline on file: "Computers, phones, accessories and repairs — done properly."
- The H logo (`assets/img/brand/`) and its blue #1f6feb were made on 2026-08-31, but the shop has confirmed both are **open** in a redesign. They may be redrawn or recoloured. If the mark changes, the icons, OG image and brand files must change with it.
- Voice on the current site: plain, direct, honest, no hype ("we'll tell you honestly what it needs, what it costs, and whether it's worth fixing at all").

## Evidence on Hand

- Real: the shop's name, address, landmarks, phone numbers, emails, hours, services with turnaround times, and the 41 catalogue entries with prices. 11 have real product photos.
- Sample, not real: the Samsung A55 360° frames in `assets/img/demo-360/` are a demo.
- Absent, and must not be fabricated: customer reviews or testimonials, ratings, years in business, sales or repair counts, storefront or team photos, brand partnerships or authorised-reseller status, warranties beyond what individual product specs state.

## Product Principles

1. **Reaching the shop beats browsing the shop.** Every surface ends in one tap to WhatsApp, a call or directions, and the right desk (sales or repairs).
2. **Honesty is the differentiator.** Prices, stock, condition and offers are shown plainly. Nothing is implied that the shop cannot back up.
3. **Built for the slowest phone in the queue.** Weight, speed and legibility on weak data outrank decoration.
4. **The owner can run it from the counter.** Anything the design adds must survive being fed by the Manage panel: missing photos, long names, prices on request, new categories.

## Accessibility & Inclusion

WCAG 2.1 AA contrast in every theme. Touch targets at least 44px. Form fields at 16px so iOS does not zoom. Visible solid focus rings and full keyboard use. `prefers-reduced-motion`, `prefers-contrast` and Windows forced-colors are honoured. Safe-area insets on notched phones. Content stays readable if scripts fail or the catalogue is slow.
