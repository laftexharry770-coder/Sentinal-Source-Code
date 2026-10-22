Product photos live in `products/`, one file each, referenced from
`assets/js/data.js` (e.g. `images: ["assets/img/products/hp-250-g9-1.webp"]`).
The 26 there now were written inside `data.js` by the Manage panel and moved out
by `tools/photos/unpack.js`, byte for byte: same pictures, named
`<product id>-<n>.webp`.

## Where the site's own images come from

`hero/` holds the three products floating in the first screen. Each is a crop of
the shop's own photo of that product, taken from its listing in
`assets/js/data.js` (the first photo in `images`), centred on the product and
saved at 256 × 256 as WebP, quality 74:

| File | Product id in data.js | Crop from the 677–900px original |
|---|---|---|
| `hero/hp-elite-dragonfly.webp` | `hp-250-g9` (HP Elite DragonFly) | 677 × 677 at 0, 150 |
| `hero/mechanical-keyboard.webp` | `kb-mech-rgb` (Mechanical Gaming Keyboard) | 677 × 677 at 112, 0 |
| `hero/oraimo-spacebuds.webp` | `oraimo-spacebuds` (Oraimo SpaceBuds) | 380 × 380 at 120, 275 |

Made with ffmpeg: `ffmpeg -i photo.webp -vf "crop=W:H:X:Y,scale=256:256:flags=lanczos" -c:v libwebp -quality 74 out.webp`.
When the listing's photo changes, `app.js` shows the new one in place of the crop
(it compares the photo's length with `data-photo-sig` in `index.html`).

`plates/` holds the glass plates shown for every product that has no photo
yet: for each category, Night and Day, at three angles, so 30 files in all,
square, 720 × 720 WebP (4–7 KB each). They are rendered, not drawn or
generated: `tools/plates/render.html` ray-traces a rounded slab of glass
(reflection, refraction in three wavelengths, absorption tinted by category)
on the card's own floor colour, at 1440 × 1440, and ffmpeg downsizes it
(`-vf scale=720:720:flags=lanczos -c:v libwebp -quality 76 -compression_level 6`).
Re-rendering with the same settings gives the same file, byte for byte.

| Category | `tint` | `seed` Night / Day |
|---|---|---|
| `computers` | `0.40,0.62,1.00` | -2 / -1 |
| `computer-accessories` | `0.52,0.56,1.00` | 0 / 1 |
| `phones` | `0.66,0.48,1.00` | 2 / -2 |
| `phone-accessories` | `0.80,0.48,1.00` | -1 / 0 |
| `other-tech` | `1.00,0.72,0.42` | 1 / 2 |

The three angles, and the file each makes:

| Angle | File | Render with | Words turned by (`styles.css`) |
|---|---|---|---|
| a, turned aside | `<category>-<night\|day>.webp` | no `pose` (rotY −0.36 + 0.02 × seed, rotX 0.24, rotZ 0.03) | `--plate-ry` = 0.36 − 0.02 × seed |
| b, tipped back, nearly square-on | `…-b.webp` | `pose=0.05,0.40,-0.12` | `.plate[data-pose="b"]` |
| c, turned further aside | `…-c.webp` | `pose=-0.02,0.12,-0.55` | `.plate[data-pose="c"]` |

Angles b and c turn toward the studio's strips and key lights more than a
does, so for them the renderer cuts the face's reflection and its glints
harder where the words sit; angle a renders exactly as it always did. Each
product takes the next angle in turn down the catalogue (`platePose` in
`app.js`), and a card's glass is only fetched when the card comes near the
screen, so the extra angles cost a visitor no more data than they see.

Every slab is centred (6–94% across, 16–84% down at most) so one image fills a
square pop-up, a 4:3 card (which crops 12.5% off the top and bottom) and a
thumbnail. By night the lower body of the glass is in shadow, which is where
the product's name is set. The words are not part of the image: the page lays
them on the slab's front face in CSS 3D, using the renderer's own camera and
that plate's turn (`.plate-face` in `styles.css`), so they recede with the
glass. Measured on the shipped files against the glass directly under the
letters (the brightest 2% of it): by night the smaller second line holds at
least 5.81:1 and the large lead at least 6.74:1 (8.91:1 on phone cards, which
carry the lead alone); by day at least 5.06:1 and 6.57:1. If a plate is
re-rendered with a different turn, its numbers in `styles.css` must follow.
A new category needs all six of its files; until it has them it borrows the
computers plates, and `tools/check-site.js` lists what is missing.

`light/` holds the light behind each section's head below the first screen:
`trails-night.svg`, a still fan of the hero's light streaks, and
`trails-day.svg`, its three violet glass ribbons. They are drawn by
`tools/light/trails.js` from the rules of the hero's own shader in
`assets/js/motion.js`: the same lane hash, the same fifth of lanes left dark,
the same line weights and two colours, the same ribbon tints and twist. Run
`node tools/light/trails.js` to redraw both; it writes the same bytes each time.
Each is about 2 KB compressed and is only fetched for the theme on screen.

The turntable frames in `demo-360/` are a drawing of a phone, there only to
show the 360° viewer working. The shop does not present them as the product:
a product whose only pictures are these frames shows its glass plate, and the
pop-up offers the frames behind a "360° sample" tab.

## The app icons and the link preview (`assets/icons/`)

These are the chrome H too, not a drawing of it. `tools/icons/render.html`
runs the first screen's own shader (from `assets/js/motion.js`) at twice each
file's size, still, at Night: the same letter, studio and light streaks, turned
a little and tipped back. `tools/icons/pack.py` then scales each one down and
keeps it to 256 colours, so a phone fetches 15–89 KB instead of 230 KB.

| File | Render (`render.html?…`) | Then |
|---|---|---|
| `icon-192.png` | `kind=any&size=192` | `python3 tools/icons/pack.py icon.png 192 icon-192.png` |
| `icon-512.png` | `kind=any&size=512` | `… 512 icon-512.png` |
| `icon-maskable-512.png` | `kind=maskable&size=512` | `… 512 icon-maskable-512.png` |
| `apple-touch-icon.png` | `kind=full&size=180` | `… 180 apple-touch-icon.png` |
| `apple-touch-icon-167.png` | `kind=full&size=167` | `… 167 apple-touch-icon-167.png` |
| `apple-touch-icon-152.png` | `kind=full&size=152` | `… 152 apple-touch-icon-152.png` |
| `og-image.jpg` | `kind=og` | `ffmpeg -i og-image.png -vf scale=1200:630:flags=lanczos -q:v 3 og-image.jpg` |

`any` is a rounded ink tile with clear corners and a lit top edge, for
installed apps on computers. `full` is full-bleed for iPhones, which round the
corners themselves. `maskable` is full-bleed with a smaller letter, inside the
circle Android may cut it to. The link preview is a JPEG of about 105 KB,
because WhatsApp can leave out a larger one; its words are set in the site's
typeface and colours. The tab icon is not a file: it is a small SVG written
into `index.html`, with a lighter chrome so it still reads as an H at 16px.

The chrome H in the first screen is not an image: `assets/js/motion.js` draws it
live from the logo's own geometry, and the stand-in under it is an inline SVG in
`index.html`. Icons are Phosphor (MIT, phosphoricons.com), inline in
`index.html`. The typeface in `assets/fonts/` is Hanken Grotesk (SIL Open Font
License, see `HankenGrotesk-LICENSE.txt`), subset to Latin.
