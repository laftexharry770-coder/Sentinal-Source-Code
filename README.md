# HOMCOM COMPUTERS — website

The shop online: the full catalogue with photos, 360° views, offers and specs;
the repair services with their own contact line; live opening and contact hours;
a Google map of the shop on Tom Mboya Street; and a direct line to you by
WhatsApp, phone or email.

It installs on Android, iPhone and desktop like an app, and keeps working when
the network doesn't.

No build step, no frameworks, no database.

```
index.html              the page (and the icon set, drawn once at the top)
manifest.webmanifest    makes it installable as an app
service-worker.js       makes it work offline
assets/css/styles.css   the look (Night + Day)
assets/js/data.js       ← YOUR details, services and products
assets/js/app.js        the behaviour
assets/js/motion.js     the chrome H, scroll reveals, and the menu and theme
                        switch working before the catalogue has loaded
assets/fonts/           the typeface (Hanken Grotesk) and its licence
assets/img/products/    product photos, one file each (see section 5)
assets/img/hero/        the three products floating in the first screen
assets/img/plates/      the glass plates shown for products with no photo yet
assets/img/light/       the light behind each section's head (Night and Day)
assets/img/demo-360/    the sample 360° frames (replace with your own)
assets/icons/           app icons and the link preview (drawn by tools/icons/)
tools/check-site.js     checks everything before you upload (section 9)
tools/plates/           the renderer the glass plates were made with
tools/light/            the script that draws assets/img/light/
tools/icons/            the renderer the app icons and link preview were made with
tools/photos/           moves photos out of data.js into files (section 5)

.claude/, .mcp.json     design tools for Claude (section 11) — not part of the site
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
email:    'homcomcomputers@gmail.com',

repairs: {                                  // REPAIRS — its own line and inbox
  phone:    '254106998733',
  whatsapp: '254106998733',
  email:    'mwangiherbert225@gmail.com'
},
```

Everything in the Repairs section — the "Describe your fault" button, each
service card's ask button, the three repair contact cards, and any inquiry where
the customer picks "A repair" — goes to the repair desk. Everything else goes to
sales.

Phone numbers are digits only, full international format, no `+`, no leading
zero: `0106 998 733` becomes `254106998733`.

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
  mon: ['07:00', '20:00'], ... sat: ['08:00', '21:00'], sun: ['10:00', '17:00']
},
```

**Contact hours** — when calls, texts, WhatsApp and emails get answered, every
day:

```js
contactHours: ['08:00', '20:00'],
contactNote:  'Calls, texts, WhatsApp and emails are answered between 8am and 8pm, every day…',
```

Both are live on the page. The header badge says "Open now · closes 8pm"; every
phone and WhatsApp card says "Answering now · until 8pm" or "Outside contact
hours · we reply from 8am". They recompute every minute, in Nairobi time, so
they stay right for a customer browsing from anywhere.

**If you change the hours, change them in two places.** `index.html` keeps a
copy of them near the bottom (`<script id="shopHours">`), so "Open now" shows
the moment the page opens instead of after the catalogue has finished arriving,
which on a weak connection can take over a minute. Copy the same hours,
`contactHours` and `timezone` across. If the two ever disagree, the check that
runs on GitHub after every change goes red and names the day that differs.

---

## 3. Getting into the Manage panel

There is **no link to it anywhere on the site.** Two ways in, both asking for
the same code:

**In a browser** — type the secret address:

```
https://homcomtech.com/#manage-homcom
```

**In the installed app** (added to your home screen) there is no address bar,
so instead: **tap the logo five times quickly** — five taps inside a second and
a half. It asks for the code exactly the same way. Three taps, or five slow
ones, do nothing at all, so a customer will never stumble into it.

Either way you then enter the code. Both are yours to change, at the bottom of `SITE`:

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
panel shows how much you've used.

**The panel writes new photos inside `data.js`.** That works, but every visitor
then downloads every photo before a single price can show. So before you
upload a `data.js` with new photos in it, move them out into files:

    node tools/photos/unpack.js

It puts each photo in `assets/img/products/` (byte for byte the same picture)
and changes `data.js` to point at it. Upload `data.js` and the new files
together. `tools/check-site.js` reminds you when there are photos inside
`data.js`. The shop's 26 photos were moved this way: `data.js` went from 917 KB
to 30 KB, so prices show in a second or two on a slow phone instead of after
the whole catalogue of pictures, and each photo is only fetched as its card
comes near the screen.

You can also add photos as files yourself: put them in `assets/img/products/`
and reference them from `data.js`:

```js
images: ['assets/img/products/epson-l3210.jpg', 'assets/img/products/epson-l3210-back.jpg'],
```

A photo that cannot be fetched (offline, for a card never seen while online)
shows the product's glass plate instead, never a broken picture.

### 360° views

Photograph the product from 12–36 angles all the way around — a turntable, or
just move around it — keeping the camera in the same spot and the lighting even.
Name the files so they sort in order (`01.jpg`, `02.jpg`, …). Then tap **Choose
the turntable shots** and select all of them at once.

Customers get a "360°" badge on the card, and in the pop-up they can drag to
spin, tap play/pause, or use the arrow keys. It spins once by itself when the
pop-up opens so they know it's there.

The Samsung A55 in the catalogue has a demo spin so you can see it working — its
frames are in `assets/img/demo-360/`. They are a drawing, not a photo, so the
site does not pass them off as the phone: its card shows the glass plate, and
the pop-up offers the frames behind a tab marked "360° sample". Replace them
with real photos of your own stock and delete the demo; real frames get the
full treatment (the 360° view opens first when there are no photos).

### Products without a photo

Until a product has a photo it is shown on a plate of glass with its name,
tinted by category (`assets/img/plates/`). Nothing to do: add a photo and the
plate gives way to it. If you add a new category, it borrows the computers
plates until it gets its own six (see `assets/img/README.md`).

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

- **GitHub Pages** — the site is already on `main`; turning Pages on is the one
  step left, and it has to be you. GitHub deliberately won't let an automated
  token switch Pages on for a repository.

  1. Open **github.com in a browser**. The GitHub phone app doesn't show this
     screen — on a phone use Chrome and tap ⋮ → **Desktop site**.
  2. Repository → **Settings** → **Pages** (left-hand menu).
  3. **Build and deployment → Source: Deploy from a branch.**
  4. Branch **main**, folder **/ (root)** → **Save**.

  Every future push to `main` republishes it. No build step, no workflow to
  maintain. The empty `.nojekyll` file tells GitHub to serve the files as they
  are rather than running them through its blog engine first.

- **Netlify** or **Cloudflare Pages** — connect the repo, or drag the folder
  onto their dashboard. No build command, no output directory.

All three run on networks that serve the file from the closest place to whoever
is looking, so it stays fast in Nairobi and abroad.

**Prices and stock need nothing.** `data.js` is always fetched fresh when there
is a signal, so a price you publish this morning is the price a returning
customer sees this afternoon — the saved copy is only used when they have no
network at all.

**Only if you change the design** (`index.html`, `styles.css`, `app.js`,
`motion.js`) bump the version number, in four places that must agree:

- `CACHE_VERSION` at the top of `service-worker.js` (`homcom-v29` → `homcom-v30`);
- `BUILD` in `app.js` (`v29` → `v30`), which the Manage panel shows;
- the `?v=29` after `styles.css`, `motion.js` and `app.js` in `index.html`;
- the same three `?v=29` addresses in the `SHELL` list in `service-worker.js`.

The first tells phones which already have the site saved to fetch the new
files. The `?v=` numbers make sure a phone still running the old version never
shows the new page wearing the old stylesheet while it updates. The check on
GitHub fails if any of the four is left behind.

### The domain: homcomtech.com

The domain is **live**. Pages is on, `CNAME` in the repository root says
`homcomtech.com`, and GitHub rebuilds the site on every push to `main`. The
`github.io` address now redirects to the custom domain.

`homcomtech.com` is registered and its DNS points at **Cloudflare**. That is a
perfectly good setup — Cloudflare sits in front and passes traffic to GitHub —
but it has two well-known snags worth knowing about:

**"Enforce HTTPS" stays greyed out in Settings → Pages.** GitHub issues the
certificate by answering a challenge on your domain, and it cannot do that
while Cloudflare is proxying (the orange cloud). The fix:

1. In Cloudflare → DNS, click the orange cloud on the `homcomtech.com` and
   `www` records so they go grey (DNS only).
2. Wait a few minutes, then in GitHub → Settings → Pages, remove and re-enter
   the domain. The certificate is usually issued within the hour.
3. Tick **Enforce HTTPS**, then turn the orange cloud back on if you want
   Cloudflare's caching.

**A redirect loop ("too many redirects").** If Cloudflare's SSL mode is
*Flexible*, it talks to GitHub over plain HTTP while GitHub redirects to HTTPS,
and the two bounce forever. In Cloudflare → SSL/TLS set the mode to **Full**.

If you would rather skip Cloudflare entirely, point the DNS straight at GitHub:

| Type | Name / Host | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `laftexharry770-coder.github.io.` |

To go back to the `github.io` address at any time, delete the `CNAME` file and
clear the custom domain in Settings → Pages.

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
  images: [],                         // ['assets/img/products/epson.jpg']
  spin: []                            // ['assets/img/epson-360/01.jpg', ...]
}
```

New categories go in `CATEGORIES`; new repair services go in `SERVICES`. A
category with nothing in it is hidden from customers automatically.

### Publishing without breaking anything

**Use "Download data.js", not "Copy instead."** GitHub's editor inserts
where your cursor is rather than replacing what is already there, so pasting
a fresh export over the old file can leave the old one sitting underneath.
The browser then cannot read the file at all. Uploading the downloaded file
replaces the whole thing, so it cannot happen.

If it does happen anyway, four things now stand between that and a broken
shop:

1. **It repairs itself.** A check runs on GitHub after every change. If it
   finds the old copy left underneath the new one, it removes the leftovers,
   keeps everything you uploaded, and commits the repair — usually within a
   minute, without you doing anything.
2. **Everything gets checked.** The same run reads the whole site: every
   script parses, every product has a name and a real category, every photo
   exists, the offer prices make sense, the phone numbers and emails look
   right, and nothing points at a missing file. A green tick on your commit
   means the site is sound; a red cross tells you exactly what is wrong.
   Run it yourself any time with `node tools/check-site.js`.
3. **The page still works.** If the catalogue cannot load, the site does not
   go blank. It fetches a fresh copy once, and if that fails too it shows the
   shop name, both numbers, the repair desk, the email, the hours and the map
   — everything a customer needs to reach you — plus a note telling you what
   to re-upload.
4. **A stale phone repairs itself.** A device holding an old copy is offered
   a one-tap "Reload it", and new versions load themselves from now on.

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
- **Find the shop** on a sketch of the street, open the live Google map in
  place with one tap, or tap through for directions.
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

## 11. Designing with Claude

Any Claude Code session opened on this repository, in the cloud or on your own
machine, loads a design toolkit from `.claude/`, so what it builds does not come
out looking like every other AI-made site. Nothing here is loaded by the website
itself.

| What | Where it comes from | What it gives Claude |
|---|---|---|
| **Impeccable** 4.3.1 | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | one skill with 24 commands, and a detector that checks every page or stylesheet Claude edits for the tell-tale AI look |
| **Emil Kowalski** skills (10) | [emilkowalski/skills](https://github.com/emilkowalski/skills) | rules for animation, easing, polish, and making a website feel native on a phone |
| **Taste Skill** (6) | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | design direction drawn from great websites, a redesign audit, three ready-made styles, and a rule against half-finished output |
| **Playwright** browser | `.mcp.json` → `.claude/mcp/playwright.mjs` | opens the site in a real browser, clicks through it and screenshots it at phone and desktop sizes |
| **Playwright CLI** 0.1.21 | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) | the same browser through short terminal commands, about a quarter of the tokens the browser tools above use |
| **DESIGN.md library** (74) | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | the design systems of sites like Apple, Stripe, Linear and Airbnb, as references for spacing, type, colour and components |
| **img2threejs** 2.0.0 | [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs) | rebuilds an object from one photo as an interactive 3D model written in code |
| **Figma** | your claude.ai connectors | reads and writes Figma designs. The Starter plan allows 20 read calls a month |

In cloud sessions, `.claude/hooks/session-start.sh` installs the Playwright CLI, points it at
the browser the cloud provides, and fetches Impeccable's engine before you start. On your own
machine it does nothing; there, run `npm install -g @playwright/cli@0.1.21` and
`playwright-cli install-browser chromium` once.

The DESIGN.md library is kept inside its skill folder on purpose. A `DESIGN.md` at the root of
this repository is the shop's own design system as far as Impeccable is concerned, so never copy
one of the library's files there.

Just ask for what you want and the right skill loads on its own, or name one:

```
/impeccable critique the product cards      a design review, before changing anything
/impeccable polish the header               a final pass
/redesign-existing-projects                 audit the whole site and lift it
/mobile-native                              fix what feels "website" rather than "app" on a phone
/emil-design-eng                            animation and interaction polish
/prototype a new hero section               several versions behind a switcher to pick from
/playwright-cli check the inquiry form      drive the real page and screenshot the result
/design-md-library                          "make the product cards as calm as Apple's"
/img2threejs                                turn a product photo into a 3D model you can spin
```

Left out on purpose: skills for Swift, React Native, the React-only Sonner
library, GPT/Codex, Google Stitch, and the ones that need Claude to generate
images, which it cannot do.

To update, run these from the repository root and commit what changes:

```bash
npx skills update -p        # Emil Kowalski + Taste Skill, pinned in skills-lock.json
npx impeccable update       # Impeccable — on your own machine; Claude's cloud
                            # sessions block the download it needs
playwright-cli install --skills      # the Playwright CLI skill
node .claude/skills/design-md-library/update.mjs <checkout of awesome-design-md>
```

img2threejs updates by replacing `.claude/skills/img2threejs` with a fresh copy of its
repository, leaving out `.git`, `.github`, `forge/tests` and the contributor notes
(`CLAUDE.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `LAB-FINDINGS.md`).

The design detector's settings live in `.impeccable/config.json`. Switch it off
with `/impeccable hooks off`.

---

## Look and feel

The page is a product launch for the shop itself: the HOMCOM H in polished
chrome, turning in its own light, with real stock and the open/closed status
round it. Two themes share one world.

- **Night** is deep space ink (`#07080C`) with ion light running from violet
  (`#7B6BFF`) to blue (`#4C8DFF`), and amber (`#FFB45A`) kept for offers.
- **Day** is pale lavender (`#F3F2F8`) with the same light at low strength and
  violet glass ribbons behind the H. By day the chrome reflects that room: the
  pale field and the ribbons' violet, never a black the page does not show.
- **The light carries on below the first screen.** Each section's head is lit
  from the top right by a still drawing of the same streaks (by day, the same
  ribbons). A line of that light runs along the hairline above each section,
  and pools of it rise down the sides of the long shelf. The drawings are two
  small SVGs in `assets/img/light/`, made by `node tools/light/trails.js`:
  change that script, not the files. No word on the page is harder to read
  for it; every line of text over the light was measured.

Every colour is a named variable at the top of `styles.css`, with a Night value
and a Day value, written as plain `rgba()` so older iPhones get exactly the same
page. Every text colour was measured against WCAG AA in both themes (the values
are noted beside them). Surfaces are defined by a hairline and a lit top edge at
night, and by soft elevation by day: never both.

### Type and icons

One typeface, **Hanken Grotesk**, self-hosted in `assets/fonts/` and cut down to
the characters the shop uses (30 KB for every weight). Big lines are set light;
prices are set heavier, and its figures are all one width, so prices line up in
every list. While the font is still arriving the text uses the phone's own sans,
resized to the same proportions so nothing jumps when it lands.

Icons are [Phosphor](https://phosphoricons.com) (MIT), drawn once in a sprite at
the top of `index.html` and reused everywhere as `<use href="#i-name">`. To add
one, copy its `<symbol>` from Phosphor's `regular` set into the sprite with the
id `i-<name>`.

### The first screen

- **The chrome H** is drawn by `motion.js` on the phone's graphics chip: the
  logo's two bars and crossbar, the phone speaker slot and the monitor power
  light, reflecting a studio of light strips. It turns gently by itself, leans
  toward a mouse, and a finger can spin it; it coasts and swings back to face
  front. Under it sits a drawn picture of the same H, which stays on any device
  where the 3D version should not run (an old phone, lite mode, high-contrast
  settings) and crossfades away where it does.
- **The three floating products** are real listings: the HP Elite DragonFly,
  the mechanical keyboard and the Oraimo SpaceBuds. Their photos are small crops
  in `assets/img/hero/` so they show long before the catalogue has arrived; once
  it has, `app.js` corrects each name and price from `data.js`, swaps in a
  changed photo, and takes a tile away if the product is gone or has no photo.
  To feature a different product, change the `data-hero-product` id, the name,
  the price and the image in the `float-tile` markup in `index.html`, and set
  `data-photo-sig` to the length of that product's first photo in `data.js`.
- **Products without a photo** are not given clip-art. They become a pane of
  glass with the maker's name set large and the model under it; where there is
  no maker's name, the plate carries only what defines it (65W, 2m, AC1200,
  8-in-1), so it never repeats the name printed under it. Phone cards show
  the lead line alone; the full name is printed under every card. The glass is
  rendered for each category, for Night and for Day, at three angles taken in
  turn down the catalogue (`assets/img/plates/`, made with
  `tools/plates/render.html`); the words are laid on its face in 3D, so they
  recede with it, and a card's glass loads only as the card nears the screen.

### The rest of the page

- **The catalogue is led by the photographed stock.** In the shop's own order a
  product with a photo takes a wide card, its photo beside the details; every
  card gives the name, the price under it, then whether it is in stock. Sorted by
  price or name, every product takes one place so the order reads straight.
  Specs and descriptions live in the pop-up.
- **Repairs read like a price list**: one ruled row per service, with what it
  covers, how long it takes and a direct line to the repair desk.
- **Contact details are ruled rows**, not boxes: what each one is, the number
  itself, and whether it is answered right now.
- **The map is a sketch until asked for.** It shows only what the shop's own
  directions say (Rasumal House on Tom Mboya Street, opposite Imenti House) and
  is marked "not to scale". The live Google map is one to two megabytes, so it
  loads only when someone taps **Show the live map**.

### Motion

The H turning in its light; light streaks flowing into it at night; the product
tiles floating; sections rising into place as they scroll into view, each one's
light coming in along the streaks as its first words rise; cards
lifting under a cursor; the product pop-up rising as a sheet from the bottom of a
phone. Entrances use a strong ease-out, everything is described in time rather
than frames, and only transform and opacity move, so the compositor does the
work.

- **The catalogue is small.** `data.js` holds the shop's words and prices
  (30 KB, 8 KB as it travels); the photos are separate files fetched as their
  cards come near. Measured on a phone slowed to a low-end one's speed, the
  first priced product shows after 1.3 s on 3G (6 s before) and 3.6 s on slow
  3G (18 s before).
- **Before the catalogue arrives, the page already works.** `motion.js` loads
  on its own, so the menu, the theme switch, the open/closed badge, Directions,
  WhatsApp and the H are live within the first seconds, whichever script
  arrives first, and the shelf shows that prices are on their way, with a
  WhatsApp link for anyone who will not wait.
- **Nothing stalls the page while it starts.** Cards off the screen are not
  laid out or painted until they come near it, the page is measured after the
  browser's own layout rather than in the middle of it, prices share one number
  formatter, and the shop's clock (Nairobi is UTC+3 all year) is worked out
  without loading the browser's time-zone tables. The H's shader is built by
  the graphics chip while the page carries on.
- **The H only works when it can be seen.** It stops when scrolled away or in a
  background tab, measures how long the graphics chip takes per frame, drops to
  fewer pixels if it is slow, and stops turning by itself on a device that still
  cannot keep up.
- **"Reduce motion" is obeyed.** Nothing moves by itself: sections are simply
  there, the tiles stay put, and the H is drawn once (it still turns under a
  finger, because that is the visitor moving it).
- **Touch devices skip the cursor effects and the blur**, which cost battery and
  nobody can see.

### Any screen, any refresh rate

Every animation runs on the clock, so a 60Hz phone and a 144Hz monitor show the
same speed; the faster screen just draws more steps. About a second after the
page settles it measures real frame times, and if the device is delivering
under roughly 42 frames a second it drops the blur, the 3D H (back to the drawn
one) and the cursor effects, and keeps everything else. Add `?lite=1` to the web
address to force that mode, or `?lite=0` to force everything on. Screens that
redraw slowly by nature, like e-ink, get no animation at all.

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
