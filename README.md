# HOMCOM Technologies — website

The shop online: the full catalogue with photos, 360° views, offers and specs;
the repair services with their own contact line; live opening and contact hours;
a Google map of the shop on Tom Mboya Street; and a direct line to you by
WhatsApp, phone or email.

It installs on Android, iPhone and desktop like an app, and keeps working when
the network doesn't.

No build step, no frameworks, no database.

```
index.html              the page
manifest.webmanifest    makes it installable as an app
service-worker.js       makes it work offline
assets/css/styles.css   the look (light + dark)
assets/js/data.js       ← YOUR details, services and products
assets/js/app.js        the behaviour
assets/img/             product photos
assets/img/demo-360/    the sample 360° frames (replace with your own)
assets/icons/           app icons
```

---

## 1. Your details

All of it is the `SITE` block at the top of `assets/js/data.js`.

```js
phones: [                                   // SALES
  { number: '254724359797', label: 'Main line' },
  { number: '254738715271', label: 'Second line' }
],
whatsapp: '254724359797',
email:    'kariukilucy244@gmail.com',

repairs: {                                  // REPAIRS — its own line and inbox
  phone:    '254751851228',
  whatsapp: '254751851228',
  email:    'mwangiherbert225@gmail.com'
},
```

Everything in the Repairs section — the "Describe your fault" button, each
service card's ask button, the three repair contact cards, and any inquiry where
the customer picks "A repair" — goes to the repair desk. Everything else goes to
sales.

Phone numbers are digits only, full international format, no `+`, no leading
zero: `0751 851 228` becomes `254751851228`.

### The shop address

```js
mapQuery: 'Rasulmal House, Tom Mboya Street, Nairobi, Kenya',
address:  'Rasulmal House, ground floor, first shop — Tom Mboya Street, Nairobi',
mapNote:  'Opposite Imenti House, near Odeon. Ground floor, first shop on your right.',
```

`mapQuery` is what Google Maps searches for. **Worth doing once:** open Google
Maps, right-click exactly on your shop, click the coordinates at the top of the
menu to copy them, and paste them in as `mapQuery: '-1.2841,36.8265'`. That
puts the pin on your door rather than on the street.

---

## 2. Opening hours and contact hours — two different things

**Opening hours** — when the shop is physically open:

```js
hours: {
  mon: ['07:00', '22:00'], ... sat: ['08:00', '09:00'], sun: ['10:00', '17:00']
},
```

**Contact hours** — when calls, texts, WhatsApp and emails get answered, every
day:

```js
contactHours: ['08:00', '20:00'],
contactNote:  'Calls, texts, WhatsApp and emails are answered between 8am and 8pm, every day…',
```

Both are live on the page. The header badge says "Open now · closes 10pm"; every
phone and WhatsApp card says "Answering now · until 8pm" or "Outside contact
hours · we reply from 8am". They recompute every minute, in Nairobi time, so
they stay right for a customer browsing from anywhere.

> **Worth checking:** Saturday is set to `['08:00', '09:00']` — one hour, 8am to
> 9am, exactly as given. If you meant 8am to 9**pm**, change it to
> `['08:00', '21:00']`.

---

## 3. Getting into the Manage panel

There is **no link to it anywhere on the site.** You reach it by typing the
secret address:

```
https://yoursite.com/#manage-homcom
```

then entering the code. Both are yours to change, at the bottom of `SITE`:

```js
manageKey: 'homcom',      // the bit after #manage-
managePin: '1754',        // the code it asks for
```

**Change both before you go live.** Pick a key nobody would guess
(`#manage-lucy7431`) and a code only you know. Once you're in, it stays unlocked
for that browser tab and a "Manage catalogue" link appears at the bottom of the
page; close the tab and it's locked again.

### What actually keeps the site yours

Be clear about this, because it matters. Anyone determined enough can read a
website's code, so the key and the code are a lock on the door, not a safe.
**They don't need to be a safe.** Here's why:

- Anything typed into that panel only changes what **that person sees in their
  own browser**. It never touches the live site or anyone else's screen.
- The live site changes **only** when a new `data.js` is uploaded to your
  hosting — and that needs your hosting login.

So the worst a stranger who guessed the code could do is rearrange a copy of the
catalogue that only they can see, on their own phone, until they close the tab.
**You are the only person who can change what the world sees.**

---

## 4. Running the shop from the panel

Open the panel and you can:

| | |
| --- | --- |
| **Change a price** | Type over the number in the row |
| **Put something on offer** | Type the old price in the small "was" box — the card instantly shows the struck-out old price, a red −X% badge, "save KSh …", and joins the **On offer** filter |
| **End an offer** | Clear the "was" box |
| **Flip availability** | In stock / Low stock / Out of stock |
| **Add a product** | Name, category, price, old price, badge, description, specs, photos, 360° frames |
| **Add photos** | Straight from your phone camera roll — see below |
| **Add a 360° view** | Upload the turntable shots — see below |
| **Add a category** | "New category" — for stock that doesn't fit the existing ones |
| **Delete** | A product, or an empty category |
| **Copy a product's link** | To paste into a chat |

Every change shows on the page immediately.

### Publishing what you changed

Your edits are saved in **your browser**, so you can update prices from your
phone at the counter without touching a computer. The live site still shows
`data.js` until you publish:

1. In the panel, tap **Download data.js**.
2. Put that file in `assets/js/`, replacing the old one.
3. Upload it (or commit and push).

Everyone now sees the new prices, offers, products and photos. **Copy instead**
puts the same file on your clipboard, which is easier if you're editing through
GitHub's website. **Discard my edits** throws your local changes away and goes
back to the file.

> Prices update live for everyone the moment you publish. If you want them to go
> live the instant you type them — no upload step — that needs a small backend
> with a login instead of a static site. It's a day's work; say the word.

---

## 5. Photos and 360° views

### Photos

In the product editor, tap **Choose photos** and pick them from your phone or
computer — several at once is fine. Each one is automatically shrunk to about
100KB before it's stored, so a 6MB camera photo won't slow the site down. The
first photo is the main one shown on the card; drop any of them with the ×.

A browser can hold roughly 4–5MB of photos in total, which is around 40. The
panel shows how much you've used. **For a big catalogue, use files instead:**
put the photos in `assets/img/` and reference them from `data.js`:

```js
images: ['assets/img/epson-l3210.jpg', 'assets/img/epson-l3210-back.jpg'],
```

That has no size limit and keeps `data.js` small.

### 360° views

Photograph the product from 12–36 angles all the way around — a turntable, or
just move around it — keeping the camera in the same spot and the lighting even.
Name the files so they sort in order (`01.jpg`, `02.jpg`, …). Then tap **Choose
the turntable shots** and select all of them at once.

Customers get a "360°" badge on the card, and in the pop-up they can drag to
spin, tap play/pause, or use the arrow keys. It spins once by itself when the
pop-up opens so they know it's there.

The Samsung A55 in the catalogue has a demo spin so you can see it working — its
frames are in `assets/img/demo-360/`. Replace them with real photos of your own
stock and delete the demo.

For a large set, files beat uploads here too:

```js
spin: ['assets/img/a55-360/01.jpg', 'assets/img/a55-360/02.jpg', ...],
```

---

## 6. It works on Android, iPhone and computers — and installs like an app

The site is one web address that works everywhere: Android, iPhone, iPad,
Windows, Mac. Send the link by WhatsApp and it opens for anyone.

It's also a proper installable app:

- **Android / Chrome / Edge:** an **Install app** button appears in the header.
  One tap and HOMCOM sits on the home screen with your icon, opening full-screen
  with no browser bars.
- **iPhone / Safari:** tap **Share → Add to Home Screen**. Same result — Apple
  just doesn't allow the one-tap button.
- **Windows / Mac:** the install icon appears in the address bar.

Once someone has opened it, the catalogue is stored on their phone, so it opens
instantly next time **and still works with no network** — useful in a building
with bad reception, or for a customer browsing on the matatu.

### Keeping it running 24/7

The site is plain files with no server to crash and no database to fill up. Host
it on any of these and it's up around the clock, free, with HTTPS included:

- **GitHub Pages** — merge to `main`, then **Settings → Pages → Deploy from a
  branch → `main` / root**.
- **Netlify** or **Cloudflare Pages** — connect the repo, or drag the folder
  onto their dashboard. No build command, no output directory.

All three run on networks that serve the file from the closest place to whoever
is looking, so it stays fast in Nairobi and abroad.

**One thing to remember:** after uploading changed files, bump `CACHE_VERSION`
at the top of `service-worker.js` (`homcom-v1` → `homcom-v2`). That's what tells
phones that already have the site saved to fetch the new version.

### A custom domain

Buy the domain, then point it at whichever host you chose — each has a one-page
guide. For GitHub Pages, add a file called `CNAME` containing just your domain.

---

## 7. Editing `data.js` by hand

Everything the panel does can be done in the file directly:

```js
{
  id: 'epson-l3210',                  // unique — it's what the product's link uses
  name: 'Epson L3210 Ink Tank Printer',
  category: 'other-tech',             // any key from CATEGORIES
  price: 31000,                       // what you charge now. null = "Price on request"
  wasPrice: 35000,                    // old price → shows as an offer. null = no offer
  desc: 'Refillable ink tanks — cheap per page for a busy shop.',
  specs: {
    Functions: 'Print, scan, copy',
    Warranty: '12 months'
  },
  tag: '',                            // 'New' | 'Best seller' | 'Refurbished' | ''
  stock: 'in',                        // 'in' | 'low' | 'out'
  images: [],                         // ['assets/img/epson.jpg']
  spin: []                            // ['assets/img/epson-360/01.jpg', ...]
}
```

New categories go in `CATEGORIES`; new repair services go in `SERVICES`. A
category with nothing in it is hidden from customers automatically.

---

## 8. Search

There are three ways in, all opening the same search:

- the **big search bar in the hero**, first thing on the page;
- the **Search button in the header**, on every scroll position;
- the **`/` key** (or Ctrl/Cmd + K) on a computer.

It searches products, repairs and the page sections at once, and understands the
words customers actually use rather than the words on the label:

| They type | They find |
| --- | --- |
| headphones, earpods, buds | the earphones, earbuds and AirPods |
| cover | the cases and screen protectors |
| my laptop is spoilt | the repair services |
| fix my cracked screen | computer and phone repair |
| tom mboya, directions | the map section |
| offers, cheap, deal | whatever is on offer |

Filler words ("do you have a…", "I need…") are ignored. Arrow keys move, Enter
opens, Esc closes. **See all in the catalogue** hands the words to the catalogue
filter so they can browse the full list of matches.

When nothing matches, they get a "we source to order" message with a WhatsApp
button that already has their words in it — so a search that fails still turns
into an inquiry.

The words are widened by the `ALIAS_GROUPS` table near the top of `app.js`. Add
a group, or add a word to one, whenever you notice customers asking for
something by a name the site doesn't know.

---

## 9. What customers can do

- **Search from anywhere** — the hero bar, the header button or the `/` key.
- **Browse and filter** by category, sort by price or biggest saving, and
  filter to **On offer** only.
- **See photos, specs and a 360° spin** of anything you've photographed.
- **Compare up to 4 products** side by side — differences highlighted, lowest
  price and offers flagged.
- **Check whether you're open** and whether calls are being answered right now,
  before they travel or ring.
- **Ask the repair desk** directly, with the fault already in the message.
- **Build an inquiry list** and send the lot in one WhatsApp message or email.
- **Find the shop** on the map, or tap through for directions.
- **Install the site** as an app, and use it offline.
- **Switch to dark mode**, and use the whole site by keyboard.

Nothing is stored on a server. Inquiries arrive in your WhatsApp or inbox.

### Optional: an email copy of every form submission

Create a free endpoint at [formspree.io](https://formspree.io) and paste the URL
into `formEndpoint` in `data.js`.

---

## 10. Previewing locally

A service worker needs a real server, so double-clicking `index.html` works for
everything except the offline behaviour. To see all of it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

---

## Look and feel

### Light and dark

Every colour on the site comes from a named variable with a light value and a
dark value, at the top of `styles.css` — including the ones that used to be
fixed: the red on discount badges and error messages, the amber on "low stock"
and "outside contact hours", the refurbished badge. Nothing is stuck in one
theme, and the reds and ambers are lifted in dark mode so they stay readable
against a near-black page. Every text colour clears the WCAG AA contrast
threshold in both themes.

### Ambience

Two fixed layers sit behind the page: a soft wash of colour, and a fine grain
that stops large flat areas from banding. Dark mode adds a gentle vignette.
Raised surfaces — cards, panels, the form — get a one-pixel highlight along
their top edge, the way lit surfaces catch light. Tune it all with `--amb-1`,
`--amb-2`, `--amb-3`, `--amb-grain` and `--sheen-top`.

### Glass

The search bar, the header search button and the search overlay are "liquid
glass": translucent panes that frost whatever is behind them, with a bright top
edge, a highlight that follows the cursor and a slow glint sliding across.
`--glass-bg`, `--glass-brd` and `--glass-blur` control it, per theme. On phones
the blur radius drops automatically — it's the most expensive thing on the page
to scroll and nobody can tell at that size.

### Motion

A reading-progress line under the header; cards that lift and light up under
the cursor; product images that ease in; a sweep of light across buttons; spring
feedback when a filter or product is picked; sections that fade up in sequence;
the hero's haze drifting against the pointer.

Four rules keep it from becoming a nuisance:

- **Nothing blurs while it moves.** Animated blur is what makes interfaces look
  smeary, and it's the most expensive thing to draw. The panes still frost what
  is behind them — that's the material, not the motion.
- **Nothing important moves on its own.** The search bar rises into place once
  and then holds still; the background wash doesn't drift. A full-screen
  animated gradient cost about 35ms of every scroll frame for movement nobody
  could point at.
- **Touch devices skip the cursor effects** — they cost battery and nobody
  sees them.
- **"Reduce motion" is obeyed.** If a visitor's device is set to reduce motion,
  every animation switches off and pointer tracking never starts.

Measured on a full-page scroll: 16.7ms median frame, 17ms at the 95th
percentile, nothing above 32ms — a steady 60fps, and that's on a machine with
no graphics card at all.

### Any screen, any refresh rate

Every animation is described in time, not in frames. CSS transitions and
keyframes interpolate by the clock, and the 360° spinner advances on elapsed
milliseconds rather than on each frame drawn. So the site runs at the same
speed on a 60Hz phone, a 90Hz mid-range, a 120Hz tablet and a 144Hz monitor —
the faster screen just draws more steps in between. Verified by simulating all
five rates: the spinner advanced exactly 22 frames in two seconds every time.

What differs between devices is whether they can *keep* their own rate. About a
second after the page settles, it measures real frame times; if the device is
delivering under roughly 42 frames a second — an old phone missing its target,
or a screen that only refreshes 30 times a second — it quietly drops the blur,
the grain and the cursor effects and keeps everything else. Add `?lite=1` to
the web address to force that mode, or `?lite=0` to force it off. Screens that
redraw slowly by nature, like e-ink, are detected by CSS (`update: slow`) and
get no animation at all.

If a spinning product is left in a background tab, it stops until the tab is
looked at again.

---

## Housekeeping

- **Prices change.** The footer marks them indicative, but keep them current.
- **Say when something's refurbished.** Use the badge and a `Condition` spec
  row. It builds more trust than it costs in sales.
- **Out of stock isn't hidden.** Those items read "Order on request", so
  customers can still ask you to source one.
- **The catalogue shipped here is a starting point** — realistic products with
  invented prices. Replace them with your real stock.
- **Change `manageKey` and `managePin`** before you go live.
