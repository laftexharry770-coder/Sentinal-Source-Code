---
name: HOMCOM COMPUTERS
description: The shop's stock, prices and repair desk on Tom Mboya Street, shown like a product launch in chrome and ion light.
colors:
  night-bg: "#07080C"
  night-bg-2: "#0C0E16"
  night-panel: "#11121A"
  night-glass-solid: "#11121B"
  night-card: "#0D0E15"
  night-ink: "#F2F1F7"
  night-ink-2: "#B4B1C9"
  night-ink-3: "#8E8BA6"
  night-line: "rgba(255, 255, 255, .08)"
  night-line-2: "rgba(255, 255, 255, .15)"
  night-glass: "rgba(255, 255, 255, .035)"
  night-glass-2: "rgba(255, 255, 255, .07)"
  night-glass-edge: "rgba(255, 255, 255, .13)"
  night-ion-text: "#A99CFF"
  night-accent: "#8E80FF"
  night-plate-ink-2: "#D2CFE2"
  night-ok: "#5BE49B"
  night-warn: "#FFC56B"
  night-danger: "#FF7F7A"
  day-bg: "#F3F2F8"
  day-bg-2: "#ECEAF4"
  day-panel: "#FFFFFF"
  day-glass-solid: "#FCFBFF"
  day-media: "#F4F3F9"
  day-ink: "#14121F"
  day-ink-2: "#454259"
  day-ink-3: "#5E5B74"
  day-line: "rgba(20, 16, 50, .10)"
  day-line-2: "rgba(20, 16, 50, .18)"
  day-glass: "rgba(255, 255, 255, .6)"
  day-glass-2: "rgba(255, 255, 255, .85)"
  day-ion-text: "#5140D9"
  day-accent: "#5B4BEF"
  day-amber-text: "#A5560A"
  day-plate-ink-2: "#2E2B40"
  day-ok: "#0E7A43"
  day-warn: "#9A5B00"
  day-danger: "#C4312B"
  ion-violet: "#7B6BFF"
  ion-blue: "#4C8DFF"
  cta-violet: "#5A4BEF"
  cta-blue: "#3563D6"
  amber: "#FFB45A"
  amber-ink: "#1E1203"
  on-cta: "#FFFFFF"
typography:
  display:
    fontFamily: "Hanken Grotesk, Hanken Fallback, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 5.2vw, 4.6rem)"
    fontWeight: 300
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Hanken Grotesk, Hanken Fallback, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3.25rem)"
    fontWeight: 300
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Hanken Grotesk, Hanken Fallback, system-ui, sans-serif"
    fontSize: "clamp(1.35rem, 2.2vw, 1.75rem)"
    fontWeight: 350
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  card-title:
    fontFamily: "Hanken Grotesk, Hanken Fallback, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 550
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Hanken Grotesk, Hanken Fallback, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Hanken Grotesk, Hanken Fallback, system-ui, sans-serif"
    fontSize: ".86rem"
    fontWeight: 550
    lineHeight: 1.3
  price:
    fontFamily: "Hanken Grotesk, Hanken Fallback, system-ui, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.02em"
    fontFeature: "tnum, lnum"
  plate-lead:
    fontFamily: "Hanken Grotesk, Hanken Fallback, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 13cqi, 3rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.04em"
rounded:
  field: "13px"
  media: "17px"
  card: "22px"
  panel: "24px"
  panel-xl: "32px"
  pill: "999px"
spacing:
  gutter: "24px"
  gutter-phone: "16px"
  grid-gap: "18px"
  grid-gap-phone: "10px"
  card-body: "16px 18px 18px"
  section: "clamp(64px, 9vw, 120px)"
  wrap: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.cta-violet}"
    textColor: "{colors.on-cta}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-glass:
    backgroundColor: "{colors.night-glass-2}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  chip:
    backgroundColor: "{colors.night-glass}"
    textColor: "{colors.night-ink-2}"
    rounded: "{rounded.pill}"
    padding: "8px 15px"
    height: "38px"
  chip-selected:
    backgroundColor: "{colors.night-ink}"
    textColor: "{colors.night-bg}"
    rounded: "{rounded.pill}"
    padding: "8px 15px"
  chip-offer-selected:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.amber-ink}"
    rounded: "{rounded.pill}"
    padding: "8px 15px"
  input-search:
    backgroundColor: "{colors.night-glass}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.pill}"
    padding: "0 46px 0 44px"
    height: "48px"
  input-field:
    backgroundColor: "{colors.night-glass}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
    height: "48px"
  card-product:
    backgroundColor: "{colors.night-card}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-body}"
  card-product-day:
    backgroundColor: "{colors.day-panel}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-body}"
  panel-reading:
    backgroundColor: "{colors.night-glass-solid}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.panel-xl}"
  panel-reading-day:
    backgroundColor: "{colors.day-glass-solid}"
    textColor: "{colors.day-ink}"
    rounded: "{rounded.panel-xl}"
  status-pill:
    backgroundColor: "{colors.night-glass}"
    textColor: "{colors.night-ink-2}"
    rounded: "{rounded.pill}"
    padding: "4px 12px 4px 10px"
    height: "30px"
  tag-offer:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.amber-ink}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: HOMCOM COMPUTERS

## Overview

**Creative North Star: "The Launch Stage"**

HOMCOM is shown the way a maker introduces a product: the shop's H in polished chrome, lit in its own studio, with real stock, real prices and the shop's live status around it. There are two themes and they are one world. Night is deep space ink lit by an ion light running from violet to blue, with warm amber kept for offers. Day is pale lavender-white with the same light turned low and violet glass ribbons passing through. Both are made of the same few materials: chrome, glass with a bright top edge, hairlines, and one typeface.

The stage belongs to the first viewport. From the catalogue down the page is an instrument: dense, ruled, price-led, built for a phone on weak data. Display lines are big and light (300 weight) and everything that does work is set heavier (550 to 700). Products without a photo are never given an icon. They get a rendered glass plate with the maker's name laid on the slab's face. Glass is used as a material with a job: it holds a product name, lifts a floating stock tile, or frames the header. It is never there just to blur things. Wherever someone reads, the surface is opaque.

The system was built to be cheap: one self-hosted font file, rasters of 4 to 7 KB, a live map that loads only when asked for, and motion that runs on the compositor. Reduced motion, lite mode, high contrast and forced colours each strip back to a still, complete page.

**Key Characteristics:**
- Two themes, one world: Night ink with ion light, Day lavender with the same light at low intensity.
- One family, Hanken Grotesk, light for display and heavy for prices and controls.
- Prices lead every product, in tabular lining figures.
- Night surfaces are defined by their edge, Day surfaces by elevation.
- Rendered glass plates stand in for missing photos, with the words set in the slab's plane.
- Ruled rows, not boxes, for services, contact lines, specs and facts.
- Pills for every control. Generous rounded rectangles for surfaces.

## Colors

Two palettes share one ion light and one amber: cool ink or lavender ground, violet-to-blue light, and warm amber reserved for offers. Every text pair was measured against WCAG AA in both themes. The ratios sit beside each token in `assets/css/styles.css`.

### Primary
- **Ion Violet** (`ion-violet`) and **Ion Blue** (`ion-blue`): the light of the world. Used in the stage glow, the section light (each head's streaks or ribbons, the seams and the shelf's pools), the reading-progress line, cursor light on cards, and the WebGL streaks and ribbons. This pair is light, never text.
- **Launch Violet to Launch Blue** (`cta-violet` to `cta-blue`, at 135deg): the one action gradient, carrying white text (5.4:1 or better). Used for primary buttons, WhatsApp buttons, the inquiry badge, and pressed compare/add toggles.
- **Ion Text** (`night-ion-text` / `day-ion-text`): ion light dense enough to read. Used for icons beside contact windows, hovered contact values, and attached-item headings.
- **Focus Violet** (`night-accent` / `day-accent`): focus rings, the caret, `accent-color`, focused field borders, and the map pin.

### Secondary
- **Rim Amber** (`amber`, with `amber-ink` text on it): offers only. Used for the offer tag, the selected On-offer chip, the "lowest" pill, the saving percentage, and manage-panel offer flags. By Day, amber used as text darkens to `day-amber-text` (4.8:1). Amber as a fill keeps `amber`.

### Neutral
- **Space Ink** (`night-bg`, `night-bg-2`) and **Lavender Paper** (`day-bg`, `day-bg-2`): page ground and footer ground.
- **Card Floor** (`night-card` / `day-panel`): product cards and the repair panel. Also the floor the plates were rendered on (`--media-bg`: `night-card` by Night, `day-media` by Day).
- **Solid Glass** (`night-glass-solid` / `day-glass-solid`): every panel you read in, such as the modal, search, drawer, compare bar and phone nav.
- **Ink ramp** (`*-ink`, `*-ink-2`, `*-ink-3`): primary text, secondary text, and tertiary text with placeholders. Ink-3 is the floor (5.5:1 or better on glass).
- **Hairlines** (`*-line`, `*-line-2`): dividers, ruled rows, and the Night edges of surfaces.
- **Glass tints** (`*-glass`, `*-glass-2`, `night-glass-edge`): fills for controls, pills and fields, plus the bright top edge.
- **Status**: `*-ok` for open, answering and in stock. `*-warn` for low stock and refurbished. `*-danger` for errors and removal.

### Named Rules
**The Amber Means Offer Rule.** Amber marks a price that has come down and nothing else. Low stock and refurbished use the warn yellow, and decoration never uses amber.

**The Measured Pair Rule.** No text colour ships until its ratio has been measured against the surface it sits on, in both themes. Write the ratio next to the token.

**The Ours, Not Theirs Rule.** A WhatsApp button is the page's own primary action, in the Launch gradient. The label and the logo say which app it is. No brand green.

## Typography

**Display Font:** Hanken Grotesk (self-hosted variable woff2, 200–900), with the metric-matched "Hanken Fallback" (Arial or Helvetica, size-adjusted) to avoid layout shift
**Body Font:** Hanken Grotesk
**Label/Mono Font:** Hanken Grotesk. There is no second family and no monospace.

**Character:** One grotesque, played across its whole weight range. Light, tightly tracked display lines give the launch-page voice. Medium and semibold weights do the shop's work: names, prices and controls.

### Hierarchy
- **Display** (300, `clamp(2.3rem, 5.2vw, 4.6rem)`, 1.02, -0.04em, max 12–14ch): the hero line only. On phones it is 2.3rem.
- **Headline** (300, `clamp(2rem, 4.2vw, 3.25rem)`, 1.05, -0.035em): section titles (h2). On phones it is 2.1rem.
- **Title** (350, `clamp(1.35rem, 2.2vw, 1.75rem)`, 1.15, -0.025em): repair service names, panel headings, the map head, the contact form. The why-list (1.4–1.9rem) and modal product names (1.5–2rem) use the same light, tight voice one step up.
- **Card title** (550, 1rem, 1.3, clamped to 2 lines): product names on cards. Set as a paragraph, not a heading, because the whole card is one button.
- **Price** (650, 1.3rem on cards, 1.7rem on wide cards and in the modal, -0.02em, tabular lining figures).
- **Body** (400, 16px, 1.6): running text. Section subs cap at 56ch and descriptions at 46–60ch.
- **Label** (550, .8–.86rem): field labels, contact-row kinds, the status pill, and the keys in spec and fact lists.
- **Plate lead** (700, `clamp(1.25rem, 13cqi, 3rem)`, .95, -0.04em) with a 400-weight second line at `clamp(.8rem, 7.2cqi, 1.6rem)`, both sized in container units of the plate.

### Named Rules
**The Name, Then Price Rule.** On every product surface the name comes first and the price sits directly under it, the largest figure on the card. Under the price comes what the product was and what that saves, or "incl. VAT". Every figure that lines up (prices, totals, counts, hours, badges) uses `tabular-nums lining-nums`.

**The Light Voice, Heavy Hands Rule.** Big type is light (300–350). Anything you act on or compare is 550 or heavier. Never set a display line bold.

## Layout

A centred column of 1200px with a 24px gutter (16px on phones). The hero is a two-column grid (5fr copy, 6fr stage) that stacks at 960px with the stage first. On phones the stage bleeds to full width, 236–420px tall. Sections are padded `clamp(64px, 9vw, 120px)` (64px on phones) and separated by one hairline. The first screen's light runs on down the page: each section's head is lit from the top right, and the hairline between sections carries a line of the same light (see Section Light).

The catalogue is an `auto-fill` grid of 250px-minimum columns with an 18px gap. On phones it is exactly two columns with a 10px gap, so four products show at a time. Controls sit as search, then chips, then sort. On phones the chips become one swipeable row with scroll-snap. Repairs, contact lines, why-list and specs are **ruled rows**, not boxes. Panels slide in as sheets: the drawer from the right, and the modal from the bottom on phones. Breakpoints are 380, 720, 960 and 1200px. Sticky elements and anchors respect the header height (64px, 60px on phones) and safe-area insets.

### Named Rules
**The Light Runs On Rule.** The hero's light does not stop at the first screen. Every section below is lit from the top right, by a still drawing of the hero's streaks at Night and of its glass ribbons by Day. Words placed in that light keep their measured contrast. It is painted once with the section and never moves with the scroll.

**The Photo Earns Width Rule.** A product with a real photo takes two columns, photo beside a short fact list, only in the shop's own (featured) order. Sorted by price or name, every product takes one cell, so the order reads straight. On phones the wide card becomes a full row with the photo on top and no facts.

## Elevation & Depth

This is a hybrid system, and the theme decides which half applies. At Night a drop shadow on near-black does not show, so a surface is its **edge**: a 1px hairline (`night-line`) plus a lit top (`inset 0 1px 0 rgba(255,255,255,.06)`). By Day the hairline goes (`border: transparent`) and a surface is its **elevation**: a tight contact shadow over a long, soft, tinted fall. Glass has a bright top edge in both themes. Depth inside the stage comes from the chrome H's own studio reflections and from the float tiles' blur.

### Shadow Vocabulary
- **Night edge** (`inset 0 1px 0 rgba(255,255,255,.06)`, hover `.1`, plus hairline): cards, repair panel, contact form, map block.
- **Day rest** (`0 1px 2px rgba(20,16,50,.06), 0 14px 30px -20px rgba(20,16,50,.26)`): cards and panels by Day.
- **Day lift** (`0 1px 2px rgba(20,16,50,.06), 0 22px 40px -22px rgba(20,16,50,.34)`): card hover by Day, with a 4px rise.
- **Day overlay** (`0 30px 70px -24px rgba(0,0,0,.28)`): modal, search and drawer by Day.
- **Day tile** (`inset 0 1px 0 rgba(255,255,255,.95), 0 18px 36px -18px rgba(0,0,0,.26)`): floating stock tiles.
- **Action** (`inset 0 1px 0 rgba(255,255,255,.22), 0 10px 22px -10px rgba(0,0,0,.7)` by Night, `-12px … .3` by Day): the Launch-gradient buttons only. A button is an object, not a surface.

### Named Rules
**The Edge or Lift Rule.** A surface is defined by an edge at Night and by elevation by Day, never both. A Night card has no drop shadow. A Day card has no hairline.

**The Opaque Reading Rule.** Any panel someone reads in is opaque: the modal, search, drawer, compare bar, phone nav and repair panel. Translucent, blurred glass is kept for small floating things (header, stock tiles, media tags). On touch screens and in lite mode it falls back to solid colour, because blur behind moving content is the most expensive thing a phone can scroll.

## Shapes

Controls are pills (999px): buttons, chips, the status pill, search, sort, tags and badges. Round icon buttons are 40px (44px on touch). Surfaces are generous rounded rectangles: cards 22px (18px on phones), card media inset 6px at 17px, fields 13px, small media and thumbnails 11–14px, the search panel 26px, and the modal, repair panel, contact form and map block 32px (24px on phones). The phone modal is a bottom sheet with 26px top corners. The toast is a 16px rectangle, not a pill, so a long message can wrap. Dividers are always 1px. The recurring silhouette is the rounded glass slab of the plates and the H itself.

## Components

### Buttons
Confident pills that press in. A button is a single tap that gets you to the shop.
- **Shape:** full pill (999px), 44px minimum height, 20px side padding. Small is 38px, large is 52px.
- **Primary:** the Launch gradient (`cta-violet` to `cta-blue`, 135deg), white 600-weight .95rem text, Action shadow. WhatsApp buttons are this same button.
- **Hover / Focus:** brightness 1.1 on fine pointers. Pressing scales to .97. Focus shows a 2px Focus Violet outline at 3px offset that follows the pill.
- **Ghost:** transparent with a `line-2` hairline. Hover fills with `glass-2` and the border darkens to ink-3.
- **Glass:** `glass-2` fill, glass edge, and a bright top inset.

### Chips
- **Style:** pill, 38px, `glass` fill, hairline, ink-2 .88rem 500, with a tabular count in ink-3.
- **State:** selected flips to ink on ground (`aria-pressed`). The On-offer chip is amber text with an amber hairline and turns solid amber with `amber-ink` text when selected.

### Cards / Containers
- **Corner Style:** 22px, with the media inset 6px at 17px. The media is 4:3 (1:1 on phones).
- **Background:** the Card Floor, with a faint top-lit gradient at Night.
- **Shadow Strategy:** Edge or Lift (see Elevation). On hover the card rises 4px, the media scales 1.04, and a 240px ion spotlight follows the cursor.
- **Internal Padding:** 16px 18px 18px (10px 11px 12px on phones).
- **Order:** media, name, price, then a hairline foot with a stock dot and two 40px round toggles (compare, add to inquiry). The media carries at most one tag: the offer percentage or the product's condition.

### Inputs / Fields
- **Style:** fields are 48px, 13px radius, `glass` fill, `line-2` hairline, 16px text on touch so iOS does not zoom. Search and sort are pills with the glass top edge.
- **Focus:** the border turns Focus Violet with a 1px ring and a 5px soft ion halo (`rgba(123,107,255,.2)`).
- **Error:** danger border, `danger-soft` fill, and an .82rem danger message that names the problem.

### Navigation
- **Style:** a sticky header (64px) in translucent ground with an 18px blur, which gets a hairline and a 2px ion progress line once scrolled. Links are ink-2 .93rem 500 pills, and the active link gets a `glass-2` fill.
- **Mobile:** links fold into an opaque dropdown panel with 12px-radius rows at 1.05rem. The theme switch moves into the menu. Search and inquiry collapse to 44px icon buttons with the count badge pinned on.

### Status Pill
A pill holding a dot and a live line. When open, the text is `ok` and a ring breathes out of the dot (scale and opacity only). When closed, the text is ink-2. The hero carries it once, and the header copy steps aside while the hero's line is in view. In a section's head it sits in that section's light, so there it is solid glass (`glass-solid`).

### Glass Plate (signature)
Shown for every product without a photo. The glass is a **rendered raster** (`assets/img/plates/`, per category and theme at three angles, 720px WebP), ray-traced by `tools/plates/render.html` with category tints and documented in `assets/img/README.md`. It is never imitated in CSS. Products take the angles in turn down the catalogue, so no two neighbours stand the same way, and a card's glass loads only as the card nears the screen.

**The One-Thing Plate Rule.** A plate says the brand large with the model under it. With no brand, it says only the one spec that defines the product ("65W", "2m", "8-in-1", "Case + Glass"), never the title again and never an icon. Phone cards carry the lead alone.

**The Words on Glass Rule.** The plate's words are laid on the slab's front face in CSS 3D (`.plate-face`), using the renderer's own camera and each plate's turn (`--plate-ry`), so they recede with the glass. If a plate is re-rendered, its `--plate-ry` follows it. Without container-query units the words sit flat in the slab's lower left.

### The Chrome H (signature)
A WebGL distance-field H that reflects a studio with hard edges, one studio per theme. By Night the background has light streaks flowing into the letter. By Day it has violet glass ribbons, and the Day chrome's darks are the ribbons' violet, never black or navy. You can drag it with inertia, it tilts toward the pointer on desktop, and it eases back to an idle turn. An inline SVG poster of the same size stands in until the canvas is live, and stays in lite mode, high contrast and forced colours, or when WebGL is missing. The app icons and the link preview are this same letter, rendered still by the same shader (`tools/icons/`), so the shop looks the same on a home screen and in a chat as it does on the page.

### Section Light (signature)
The first screen's light, carried on below it. Each section's head has three parts:
- **The trails:** a still drawing of the hero's streaks (`assets/img/light/trails-night.svg`), or by Day of its three glass ribbons (`trails-day.svg`). Both are drawn by `tools/light/trails.js` to the shader's own rules, sit at the top right, and fade before the words on the left. The shelf's light fades in from the hero's, because no hairline separates the two.
- **The seam:** a 1px line of Ion Violet into Ion Blue along the hairline, brightest where the trails come in. The footer's seam is at the left, over its pool.
- **The pools:** the radial pool is lit from the top right too. Down the long shelf, further pools rise from one side and then the other. Their tiles are rounded to fit a whole number, so none is cut off at the end.

The trails come in as the section's first words rise: 1.6s with `--ease-out`, sliding 56px along the streaks, on opacity and transform only. With reduced motion, no script, or no `:has()`, they are simply there. They are dropped in high contrast, forced colours and print. Every line of text over the light measures the same as it does with the light hidden; the lowest is 4.87:1, for the Day closed-hours line, whose colour is unchanged.

### Ruled Rows
Repair services, contact lines, spec lists and card facts are rows divided by hairlines, with no boxes. A contact row shows what it is (an ink-3 label), the number or address (1.05rem 550), and when it is answered. On hover the value turns Ion Text and the arrow nudges 2px.

### Map
**The Map on Request Rule.** The live map loads only when someone taps for it. Until then an inline SVG sketch of Tom Mboya Street, in theme tokens, marks the shop and the building opposite.

## Do's and Don'ts

### Do:
- **Do** write every new colour as a token in both `:root`/`[data-theme="dark"]` and `[data-theme="light"]`, with its measured AA ratio in a comment.
- **Do** lead every product surface with the price in 650 weight and tabular lining figures.
- **Do** give a new surface a hairline and lit top at Night and a soft two-layer shadow by Day, never both.
- **Do** make any panel someone reads in opaque (`--glass-solid` or `--card-solid`).
- **Do** use rows divided by hairlines for lists of facts, services and contact lines.
- **Do** animate only transform and opacity, with `--ease-out` (`cubic-bezier(.23,1,.32,1)`) for arrivals and `--ease-sheet` for drawers and sheets. Start from a visible default, so nothing depends on a script to appear.
- **Do** honour `prefers-reduced-motion` (everything simply there, the H still turns under a finger), `html.lite` (no canvas, no blur, no drift), `prefers-contrast` and forced colours.
- **Do** keep every tap target at least 44px on touch and every field at 16px.
- **Do** draw icons from the inline Phosphor sprite only.

### Don't:
- **Don't** put a category label, eyebrow or kicker above a title. The heading carries itself.
- **Don't** number repair services or any other rows (01–04) when the order carries no information.
- **Don't** put spec chips on product cards. Facts belong in the wide card's ruled list or in the pop-up.
- **Don't** colour WhatsApp buttons in WhatsApp green.
- **Don't** imitate the glass plates with CSS gradients or blur. Plates are rendered rasters with recorded provenance.
- **Don't** edit the section light's SVGs by hand, or make it move with the scroll. Change `tools/light/trails.js` and run it.
- **Don't** let black or navy into the Day chrome's reflection. Day darks are ribbon violet.
- **Don't** use amber for anything but offers and savings.
- **Don't** give a photo product a wide card outside the shop's own sort.
- **Don't** add a second typeface, a monospace or a bold display line.
- **Don't** load the live map, or any other heavy embed, before it is asked for.
