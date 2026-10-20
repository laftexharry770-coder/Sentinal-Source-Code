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

The chrome H in the first screen is not an image: `assets/js/motion.js` draws it
live from the logo's own geometry, and the stand-in under it is an inline SVG in
`index.html`. Icons are Phosphor (MIT, phosphoricons.com), inline in
`index.html`. The typeface in `assets/fonts/` is Hanken Grotesk (SIL Open Font
License, see `HankenGrotesk-LICENSE.txt`), subset to Latin.
