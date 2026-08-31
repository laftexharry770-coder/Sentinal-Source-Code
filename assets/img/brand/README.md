# HOMCOM COMPUTERS — logo files

Everything here is built from one shape: an **H** whose two uprights are a phone
and a monitor. The left upright carries a phone's speaker slot, the right one a
monitor's power light. At large sizes you notice the devices; at favicon size it
settles into a clean H.

## Which file to use

| File | Use it for |
|---|---|
| `logo-mark.svg` | Favicon, app icon, anywhere small or square. Transparent corners. |
| `logo-horizontal.svg` | Website header, letterhead, invoices, email signature. **Light backgrounds.** |
| `logo-horizontal-dark.svg` | The same lockup for **dark backgrounds** — the site's dark theme, dark banners. |
| `logo-full.svg` | The shopfront card: name, what we sell, where we are, how to reach us. Signs, flyers, posters, price lists, receipts. |
| `profile-square.svg` | WhatsApp / Facebook / Instagram profile picture. Full-bleed on purpose — those apps crop to a circle, so a transparent rounded tile would lose its corners. |

Ready-made PNGs of all of these are in `png/`, including `logo-full-print.png`
at 2280×1740 for printing.

## Colours

| | Hex | Where |
|---|---|---|
| Brand blue | `#1f6feb` | Matches the website's accent exactly |
| Gradient | `#3b82f6` → `#1450b4` | The tile |
| Ink | `#0f1720` | "HOMCOM" |
| Muted | `#5a6472` | Supporting lines |
| WhatsApp green | `#25D366` | WhatsApp icon only |

## Rules of thumb

- **Never redraw the H by hand.** Scale the SVG; it stays sharp at any size.
- **Smallest sizes.** The mark works down to 16px. The horizontal lockup should
  not go below about 200px wide, or the tagline stops being readable — below
  that, use `logo-mark.svg` on its own.
- **Clear space.** Leave a gap around the logo at least as wide as the H's
  crossbar. Don't crowd it.
- **Don't** stretch it, recolour it, add a drop shadow, or put the light lockup
  on a dark background (there's a dark file for that).

## A note on the fonts

The SVGs ask for Segoe UI / Roboto / Helvetica Neue / Arial, in that order.
Every phone, PC and printer has at least one of them, so the files render
correctly everywhere without shipping a font. If you ever hand these to a
commercial printer who wants text converted to outlines, say so and they can do
it from the SVG.

## Changing the details

Phone numbers, address and hours are typed into `logo-full.svg` as plain text —
open it in any text editor and edit between the `<text>` tags. They are **not**
read from `assets/js/data.js`, so if the shop's number or address changes, it has
to be changed in both places.
