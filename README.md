# HOMCOM Technologies — website

A fast, minimal, mobile-friendly website for HOMCOM Technologies: the product
catalogue with full specs and side-by-side comparison, the repair services, live
opening hours that say whether you're open right now, a Google map of the shop,
and a direct line to you by WhatsApp, phone or email.

No build step, no frameworks, no database. Open `index.html` in a browser and it
runs.

```
index.html            the page
assets/css/styles.css the look (light + dark)
assets/js/data.js     ← YOUR details, services and products (the file you edit)
assets/js/app.js      the behaviour (search, compare, hours, inquiries, manager)
assets/img/           drop product photos here (optional)
```

---

## 1. Your details

Everything about the business lives in the `SITE` block at the top of
`assets/js/data.js`:

```js
const SITE = {
  brand:   'HOMCOM Technologies',
  tagline: 'Computers, phones, accessories and repairs — done properly.',

  phones: [
    { number: '254724359797', label: 'Main line' },
    { number: '254738715271', label: 'Second line' }
  ],
  whatsapp: '254724359797',        // which number receives WhatsApp messages

  email:    'kariukilucy244@gmail.com',
  location: 'Nairobi, Kenya',

  mapQuery: 'Nairobi CBD, Nairobi, Kenya',
  address:  'Nairobi CBD, Nairobi',
  ...
};
```

**Phone numbers** go in full international format — digits only, no `+`, no
spaces, no leading zero:

| Your number    | Write it as    |
| -------------- | -------------- |
| 0724 359 797   | `254724359797` |
| 0738 715 271   | `254738715271` |

Add a third number by copying a line in `phones`; each one gets its own card on
the contact section. `whatsapp` decides which number every WhatsApp button on
the site opens.

### Getting the map pin exactly right

`mapQuery` is what gets searched on Google Maps. In order of accuracy:

1. **Coordinates** — most precise. Open Google Maps, right-click your shop,
   click the numbers at the top of the menu to copy them, then paste:
   `mapQuery: '-1.286389,36.817223'`.
2. **Business name + street + city** — good once you're listed on Google:
   `'HOMCOM Technologies, Kimathi Street, Nairobi'`.
3. **Plain street address** — fine for most cases.

No API key, no billing account and no Google login needed.

---

## 2. Opening hours and the open/closed badge

The site works out whether you're open **right now** and shows a live badge in
the header, the hero and the contact card — "Open now · closes 10pm", or
"Closed · opens tomorrow 7am". It updates every minute without a page refresh.

That all comes from one block:

```js
timezone: 'Africa/Nairobi',
hours: {
  mon: ['07:00', '22:00'],
  tue: ['07:00', '22:00'],
  wed: ['07:00', '22:00'],
  thu: ['07:00', '22:00'],
  fri: ['07:00', '22:00'],
  sat: ['08:00', '09:00'],
  sun: ['10:00', '17:00']
},
```

24-hour clock, `'HH:MM'`. Use `null` for a day you're closed
(`sun: null`). Days that share the same hours are grouped automatically, so the
list on the page reads "Mon – Fri  7am – 10pm".

Because the timezone is set, the badge stays correct for a customer browsing
from anywhere in the world.

> **Worth checking:** Saturday is currently set to `['08:00', '09:00']` — an
> hour, 8am to 9am, exactly as given. If you meant 8am to 9**pm**, change it to
> `['08:00', '21:00']`.

---

## 3. Repairs

The repair section is built from the `SERVICES` list in `data.js`. Each entry is
one card:

```js
{
  id: 'phone-repair',
  name: 'Phone repair',
  icon: 'phone',                  // computer | phone | drive | network
  desc: 'Screens, batteries and ports for iPhone, Samsung, Tecno and more.',
  items: [                        // the ticked list
    'Screen and glass replacement',
    'Battery replacement'
  ],
  turnaround: 'Screens and batteries while you wait'
}
```

Every card gets its own "Ask about this repair" button that opens WhatsApp with
the message already started.

---

## 4. Adding, removing and repricing products — no code

Click **Manage catalogue** at the bottom of the page (or add `#manage` to the
web address). You get a panel with every product where you can:

- **Change a price** — type over the number, it applies as you leave the box
- **Flip availability** — In stock / Low stock / Out of stock
- **Add a product** — name, category, price, badge, description, specs, photo
- **Edit everything** about a product with the pencil button
- **Delete** a product with the bin button
- **Copy a product's link** to paste into a chat

Changes show on the page immediately.

### Making them live for everyone

Your edits are saved in **your browser** — that keeps them instant and lets you
change things from your phone at the counter, but the live site still shows what
is in `data.js`. To publish:

1. In the panel, click **Download data.js**.
2. Put that file in `assets/js/`, replacing the old `data.js`.
3. Upload / push it.

Everyone now sees the new prices and stock. **Copy instead** puts the same file
on your clipboard if you'd rather paste it into GitHub's web editor, and
**Discard my edits** throws away your local changes and goes back to the file.

The exported file keeps your `SITE` details and services too — it's a complete
replacement, not a fragment.

> If you'd rather edits went live for everyone the instant you make them, that
> needs a small backend (a database and a login) rather than a static site.
> Worth doing if you're updating prices daily — say the word.

### Editing by hand instead

The same products live in the `PRODUCTS` list in `data.js`. Copy a block, change
the values:

```js
{
  id: 'mouse-m170',                   // unique — it's what the product's link uses
  name: 'Logitech M170 Wireless Mouse',
  category: 'computer-accessories',   // computers | computer-accessories | phones | phone-accessories
  price: 1800,                        // number only. null = "Price on request"
  desc: 'Plug the tiny receiver in and forget about it.',
  specs: {                            // any rows you like — shown in the pop-up
    Connection: '2.4GHz USB receiver',
    Battery: 'Up to 12 months',
    Warranty: '12 months'
  },
  tag: 'Deal',                        // 'New' | 'Best seller' | 'Deal' | 'Refurbished' | ''
  stock: 'in',                        // 'in' | 'low' | 'out'
  image: ''                           // 'assets/img/mouse.jpg', or '' for icon art
}
```

### A code for the panel

Anyone can open the Manage panel — it's a public web page. Their edits only ever
affect their own browser, so nothing on your live site can be broken by it, but
if you'd rather not have customers poking around, set a code:

```js
managePin: '4821'
```

It's a speed bump, not a lock — the code sits in a file anyone can read. Real
protection needs a backend login.

### Adding photos

1. Save the photo into `assets/img/` (e.g. `assets/img/mouse.jpg`).
2. Set `image: 'assets/img/mouse.jpg'` on that product, or paste that path into
   the Photo box in the manager.

Square-ish or 4:3 photos look best. Keep them under ~300KB so pages stay quick.
Products without a photo fall back to clean line art, so a half-finished
catalogue still looks deliberate.

---

## 5. Every product has its own link

Open any product and you'll see **Direct link to this product**:

```
https://yoursite.com/#p=mouse-m170
```

Hit **Copy** and paste it into WhatsApp, an email, an Instagram bio or an SMS.
Whoever opens it lands on your site with that product's spec sheet already open.
There are **Share on WhatsApp** and **Share by email** buttons that pre-write the
message, and a copy-link button on every row of the Manage panel for when you're
answering messages in bulk.

The `#p=` part is the product's `id` — keep ids stable and old links you've sent
out keep working.

---

## 6. What customers can do

- **Browse and filter** by category, search by name or spec, sort by price.
- **See key specs on the card** and the full spec sheet in one tap.
- **Compare up to 4 products side by side** — tap ⇄ on any product, then
  **Compare**. Rows that differ are highlighted and the lowest price is flagged.
- **Check if you're open** before travelling, and read the full week's hours.
- **Ask about a repair** with the fault already described in the message.
- **Build an inquiry list** with `+` — it survives a refresh — then send the
  whole list in one WhatsApp message or email.
- **Use the inquiry form**, which composes a tidy message with their name,
  contact details and everything on their list.
- **Find the shop** on the embedded map, or tap through for directions.
- **Switch to dark mode**, and use the whole site by keyboard.

Nothing is stored on a server. Inquiries arrive in your WhatsApp or inbox.

### Optional: an email copy of every form submission

Create a free endpoint at [formspree.io](https://formspree.io) and paste the URL
into `formEndpoint` in `data.js`. Leave it `''` to skip this.

---

## 7. Putting it online

### GitHub Pages (free, ~1 minute)

1. Merge this branch to `main`.
2. On GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `root`**.
3. Wait a minute; the site is at
   `https://laftexharry770-coder.github.io/sentinal-source-code/`.

### Netlify / Cloudflare Pages / Vercel

Drag the folder onto their dashboard, or connect the repo. No build command, no
output directory — it's plain HTML.

### A custom domain

Buy the domain, then point it at whichever host you chose (each has a one-page
guide). For GitHub Pages, add a file named `CNAME` containing just your domain.

---

## 8. Previewing locally

Double-click `index.html`. Or serve it properly:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Housekeeping

- **Prices change.** They're marked indicative in the footer, but keep them
  roughly current or customers will hold you to them.
- **Say when something's refurbished.** Use the `Refurbished` badge and a
  `Condition` spec row. It builds more trust than it costs in sales.
- **Out of stock isn't hidden.** Those items show as "Order on request", so
  customers can still ask you to source one.
- **The sample catalogue is a starting point.** The 34 products shipped here are
  realistic examples with invented prices — replace them with your real stock.
