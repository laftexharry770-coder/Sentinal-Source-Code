---
name: design-md-library
description: Reference library of 74 DESIGN.md design-system analyses of real websites (Apple, Stripe, Linear, Vercel, Airbnb, Nike, Tesla, Spotify, Notion, Figma and more), from VoltAgent/awesome-design-md. Use when the user asks for a page or component that looks like a named brand, asks for design references or inspiration, or when a design task needs a concrete craft bar for colour, typography, spacing, buttons, cards or layout. Read INDEX.md first, then only the files you need.
---

# DESIGN.md library

`library/<name>.md` holds one design system each: palette with hex values, type scale,
spacing, radii, component rules (buttons, cards, inputs, nav), layout principles and
responsive behaviour, written from the public site. `INDEX.md` lists all of them with a
one-line summary.

## How to use it

1. Read `INDEX.md` and pick the one to three systems closest to what the user asked for.
   When they name a brand, open that brand's file. When they describe a feeling ("calm",
   "premium", "dense and technical"), pick by the summaries.
2. Read only those files. Take the decisions that carry the quality: the type scale and its
   ratios, how spacing steps, how many colours carry weight and where, how buttons and cards
   are built, how the layout breathes at each width.
3. Apply those decisions to this project's own brand, content and constraints. The result
   should have the reference's discipline, not its identity.

## Rules

- **Never copy a library file to the project root as `DESIGN.md`.** The upstream README says
  to, but in this repository the root `DESIGN.md` belongs to the Impeccable skill, which reads
  it as the shop's own design system. A borrowed file there would silently replace HOMCOM's.
  If the user explicitly wants to base the project on one of these systems, adapt it to the
  shop first and record the result through Impeccable (`/impeccable document`).
- **Never ship another company's identity.** Logos, brand names, signature colours used as a
  brand mark, proprietary typefaces (SF Pro, Airbnb Cereal and the like) and trade dress stay
  with their owners. Borrow principles and proportions; use the project's own name, mark and
  licensed fonts.
- **Check the constraints before the aesthetics.** A reference built for fast desktop
  broadband can still teach a site whose customers are on weak phone data, but only the parts
  that survive its performance and accessibility budget (see `PRODUCT.md`).
- The files describe public websites as they were when analysed. Treat hex values and sizes as
  measured observations, not official brand guidelines.

## Updating

```bash
git clone --depth 1 https://github.com/VoltAgent/awesome-design-md /tmp/awesome-design-md
node .claude/skills/design-md-library/update.mjs /tmp/awesome-design-md
```

That rewrites `library/` and `INDEX.md` from the checkout and records its commit in the
index. The collection is MIT licensed (`LICENSE`, © VoltAgent).
