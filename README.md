# Sentinal — product showcase website

A fast, minimal, mobile-friendly website for showing off computers, phones and
accessories, with full specs, side-by-side comparison, a Google map of the shop,
and a built-in way for customers to inquire by WhatsApp or email.

No build step, no frameworks, no database. Three files do the work — open
`index.html` in a browser and it runs.

```
index.html            the page
assets/css/styles.css the look (light + dark)
assets/js/data.js     ← YOUR details and YOUR products (this is the file you edit)
assets/js/app.js      the behaviour (search, filters, pop-ups, inquiry list, form)
assets/img/           drop product photos here (optional)
```

---

## 1. Put your real details in (2 minutes)

Open `assets/js/data.js` and edit the `SITE` block at the top:

```js
const SITE = {
  brand:    'Sentinal',
  tagline:  'Computers, phones and accessories — sold straight.',

  phone:    '254700000000',                 // digits only, with country code
  email:    'laftexharry770@gmail.com',
  location: 'Nairobi, Kenya',
  hours:    'Mon–Sat, 8:30am – 6:00pm',

  mapQuery: 'Kimathi Street, Nairobi, Kenya',   // what Google Maps searches for
  address:  'Kimathi Street, CBD, Nairobi',     // what's printed under the map
  mapNote:  'Free parking behind the building.',

  currency: 'KSh',
  locale:   'en-KE',
  formEndpoint: ''
};
```

**The phone number is the important one.** Write it in full international
format with no `+`, no spaces and no leading zero:

| Your number    | Write it as    |
| -------------- | -------------- |
| 0712 345 678   | `254712345678` |
| +254 712345678 | `254712345678` |

That single value powers the WhatsApp button, the tap-to-call link and the
number printed on the page.

### Getting the map pin exactly right

`mapQuery` is what gets searched on Google Maps. In order of accuracy:

1. **Coordinates** — most precise. Open Google Maps, right-click your shop,
   click the numbers at the top of the menu to copy them, and paste them in:
   `mapQuery: '-1.286389,36.817223'`.
2. **Business name + street + city** — good if you're listed on Google:
   `'Sentinal Computers, Kimathi Street, Nairobi'`.
3. **Plain street address** — fine for most cases.

No API key, no billing account and no Google login is needed — the map, the
"Open in Google Maps" button and the "Get directions" button all use public
links.

---

## 2. Add, edit or remove products

Everything in the catalogue comes from the `PRODUCTS` list in the same file.
Copy an existing block, change the values, done:

```js
{
  id: 'hp-840-g8',                    // unique — no two products share an id
  name: 'HP EliteBook 840 G8',
  category: 'computers',              // computers | computer-accessories | phones | phone-accessories
  price: 62000,                       // number only — no commas, no "KSh". Use null for "Price on request"
  desc: 'Ex-UK, tested and cleaned. Best value per shilling.',
  specs: {                            // any rows you like — shown in the pop-up
    Processor: 'Intel Core i5-1135G7',
    Memory: '16GB DDR4',
    Warranty: '3 months'
  },
  tag: 'Refurbished',                 // 'New' | 'Best seller' | 'Deal' | 'Refurbished' | '' for none
  stock: 'in',                        // 'in' | 'low' | 'out'
  image: ''                           // 'assets/img/elitebook.jpg', or '' for the built-in icon art
}
```

To remove a product, delete its block (including the trailing comma). To
reorder the catalogue, move blocks up or down — "Featured" sort shows them in
file order.

### Adding photos

1. Save the photo into `assets/img/` (e.g. `assets/img/elitebook.jpg`).
2. Set `image: 'assets/img/elitebook.jpg'` on that product.

Square-ish or 4:3 photos look best. Keep them under ~300KB each so the page
stays quick — any online image compressor will do that in one click. Products
without a photo fall back to clean line art, so a half-finished catalogue still
looks intentional.

---

## 3. Changing what's in stock — without touching code

Click **Manage stock** at the very bottom of the page (or add `#manage` to the
web address). You get a panel listing every product with a dropdown:
**In stock · Low stock · Out of stock**. Change one and the catalogue updates
instantly.

Two things to understand about where those changes live:

| | |
| --- | --- |
| **Right away** | The change is saved in the browser you made it in. Only you see it — handy for keeping track during the day. |
| **For everyone** | Click **Copy for data.js**, open `assets/js/data.js`, paste over the `STOCK_OVERRIDES` block, save and push. Now every visitor sees it. |

**Reset to the file's values** throws away your local changes and goes back to
whatever `data.js` says.

Out-of-stock items are not hidden — they show as "Order on request", so
customers can still ask you to source one.

---

## 4. Every product has its own link

Open any product and you'll see **Direct link to this product**, something like:

```
https://yoursite.com/#p=tp-t14-g3
```

Hit **Copy**, and paste it into WhatsApp, an email, an Instagram bio or an SMS.
Whoever opens it lands on your site with that exact product's spec sheet already
open. There are also **Share on WhatsApp** and **Share by email** buttons that
pre-write the message for you, and a copy-link button on every row of the
Manage stock panel for when you're answering messages in bulk.

The `#p=` part is the product's `id` from `data.js` — keep ids stable and old
links you've sent out keep working.

---

## 5. What customers can do

- **Browse and filter** by category, search by name or spec, sort by price.
- **See key specs on the card** and the full spec sheet in one tap.
- **Compare up to 4 products side by side** — tap the ⇄ button on any product,
  then **Compare**. Rows where the products differ are highlighted, and the
  lowest price is flagged, so the trade-off is obvious at a glance.
- **Build an inquiry list** with the `+` button — it survives a page refresh —
  then send the whole list to you in one WhatsApp message or email.
- **Use the contact form**, which composes a tidy message including their name,
  contact details and everything on their list.
- **Find the shop** on the embedded map, or tap through for turn-by-turn
  directions.
- **Switch to dark mode**, and use the whole site by keyboard.

Nothing is stored on a server. Inquiries arrive in your WhatsApp or inbox.

### Optional: also get an email copy automatically

If you'd like every form submission emailed to you even when the customer
closes WhatsApp, create a free form endpoint at [formspree.io](https://formspree.io)
and paste the URL into `formEndpoint` in `data.js`. Leave it as `''` to skip this.

---

## 6. Putting it online

### GitHub Pages (free, ~1 minute)

1. Push this branch and merge it to `main`.
2. On GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `root`**.
3. Wait a minute; your site is at
   `https://laftexharry770-coder.github.io/sentinal-source-code/`.

### Netlify / Cloudflare Pages / Vercel

Drag the folder onto their dashboard, or connect the repo. No build command, no
output directory — it's plain HTML.

### A custom domain

Buy the domain, then point it at whichever host above you chose (each has a
one-page guide). Add a file named `CNAME` containing just your domain if you
use GitHub Pages.

---

## 7. Previewing locally

Just double-click `index.html`. If you'd rather serve it properly:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Housekeeping

- **Prices change.** They're indicative on the page, and the footer says so —
  but keep them roughly current or customers will hold you to them.
- **Say when something's refurbished.** Use the `Refurbished` tag and a
  `Condition` spec row. It builds more trust than it costs in sales.
- **Out of stock ≠ hidden.** Items marked `'out'` still show and can still be
  inquired about, labelled "Order on request".
