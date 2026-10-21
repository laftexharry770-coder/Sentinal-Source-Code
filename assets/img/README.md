Put product photos here and reference them from assets/js/data.js, e.g. image: "assets/img/laptop.jpg".

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
yet: one per category, for Night and for Day, square, 720 × 720 WebP (4–7 KB
each). They are rendered, not drawn or generated: `tools/plates/render.html`
ray-traces a rounded slab of glass (reflection, refraction in three
wavelengths, absorption tinted by category) on the card's own floor colour,
at 1440 × 1440, and ffmpeg downsizes it
(`-vf scale=720:720:flags=lanczos -c:v libwebp -quality 76 -compression_level 6`).
Re-rendering with the same settings gives the same file, byte for byte.

| Category | `tint` | `seed` Night / Day |
|---|---|---|
| `computers` | `0.40,0.62,1.00` | -2 / -1 |
| `computer-accessories` | `0.52,0.56,1.00` | 0 / 1 |
| `phones` | `0.66,0.48,1.00` | 2 / -2 |
| `phone-accessories` | `0.80,0.48,1.00` | -1 / 0 |
| `other-tech` | `1.00,0.72,0.42` | 1 / 2 |

The slab is centred (8–90% across, 17–81% down) so one image fills a square
pop-up, a 4:3 card (which crops 12.5% off the top and bottom) and a thumbnail.
By night the lower body of the glass is in shadow, which is where the
product's name is set. The words are not part of the image: the page lays them
on the slab's front face in CSS 3D, using the renderer's own camera and the
slab's turn for that plate (`.plate-face` in `styles.css`), so they recede
with the glass. Measured against the brightest 2% of the glass behind each
line on the shipped files: by night the smaller second line holds at least
5.69:1 and the large lead at least 5.56:1 (8.4:1 on phone cards, which carry
the lead alone); by day at least 5.07:1 and 6.69:1. If a plate is
re-rendered with a different turn, its `--plate-ry` in `styles.css` must
follow (rotY = 0.36 − 0.02 × seed). A new
category with no plates of its own borrows the computers ones;
`tools/check-site.js` lists it.

The turntable frames in `demo-360/` are a drawing of a phone, there only to
show the 360° viewer working. The shop does not present them as the product:
a product whose only pictures are these frames shows its glass plate, and the
pop-up offers the frames behind a "360° sample" tab.

The chrome H in the first screen is not an image: `assets/js/motion.js` draws it
live from the logo's own geometry, and the stand-in under it is an inline SVG in
`index.html`. Icons are Phosphor (MIT, phosphoricons.com), inline in
`index.html`. The typeface in `assets/fonts/` is Hanken Grotesk (SIL Open Font
License, see `HankenGrotesk-LICENSE.txt`), subset to Latin.
