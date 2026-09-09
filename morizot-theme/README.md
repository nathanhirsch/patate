# Morizot Passage — Shopify theme

A complete, uploadable Online Store 2.0 theme for a single-product bakery
storefront. Ink ground, cream paper, one rationed amber accent. Editorial
rhythm carrying a shop.

No build step, no npm. Upload the folder or push it with the Shopify CLI and
it runs.

## Install

**Shopify CLI**

```bash
cd morizot-theme
shopify theme push --unpublished
```

**Or from the admin:** zip the *contents* of `morizot-theme/` (so `layout/`,
`templates/`, … sit at the root of the zip) and upload it under
**Online Store → Themes → Add theme → Upload zip file**.

Then:

1. **Online Store → Customize.**
2. **MP Hero → Product** — pick the cake. Price, availability, variants and the
   add-to-cart button all read from that product.
3. On the **product template**, open **MP Product** and leave *Product* empty so
   it uses the page's own product.
4. Upload photographs into the **Where it goes**, **Logbook**, **Closer** and
   **Nutrition** blocks. Anything left empty renders a labelled stand-in — never
   a broken image box.
5. Point the header menu at a real navigation menu under **Navigation**.

## Structure

```
layout/
  theme.liquid              Document shell; loads fonts + mp-store.css, renders
                            the header and footer section groups around content
  password.liquid           Shell for the storefront password page
config/
  settings_schema.json      Theme settings (favicon, breadcrumbs, cart notes…)
  settings_data.json
locales/
  en.default.json           Every string the theme renders through `| t`
sections/
  header-group.json         Section group — the sticky masthead
  footer-group.json         Section group — the quiet mono footer
  mp-header / mp-footer      The sections those groups hold
  mp-hero                    Title → photograph → cream buy bar → claim band
  mp-where                   "Where it goes" + three-photograph grid (blocks)
  mp-logbook                 Ruled logbook run — one lead + two entries (blocks)
  mp-team                    The one cream card, faces as blocks
  mp-closer                  Full-bleed photograph, closing line
  mp-product                 Gallery + buy column: packs, plans, @app blocks
  mp-claims                  Nine-cell claims ledger (blocks)
  mp-timing                  "When to eat it" hairline timeline (blocks)
  mp-nutrition               Panel table + two photographs (blocks)
snippets/
  mp-assets                  CSS + JS include (also loaded by the layout)
  mp-figure                  Responsive image with a labelled stand-in fallback;
                             `fill: true` makes it fill a parent that owns the box
  mp-stats                   The three-cell claim band
  mp-card                    One product card for the collection grid
  mp-pagination              Paginate control
  mp-address-fields          Shared inputs for the customer address form
templates/
  index.json  product.json  The two designed pages
  collection · list-collections · page · blog · article · search · cart · 404 ·
  gift_card · password       Utility pages, same ink/cream language
  customers/*.liquid         Account, login, register, order, addresses, …
assets/
  mp-store.css               Tokens, type scale, every layout class, utility pages
  mp-store.js                Reveal, gallery dots, pack + plan selection, sticky bar
preview*.html                Static local previews (mobile / desktop switch)
```

## App ecosystem

- **Subscriptions** (Shopify Subscriptions, Recharge, Seal, Awtomic): the buy
  form posts `selling_plan` from `product.selling_plan_groups`, so plans and
  discounts render natively. The plan selector only appears when the product has
  plans.
- **App blocks**: `mp-product` accepts `{"type": "@app"}` blocks — reviews,
  badges, upsells, size guides and subscription widgets drop into the buy column
  from the theme editor with no code edit.
- **Cart / drawer / upsell apps**: add-to-cart is the native
  `{% form 'product' %}` with `id`, `quantity` and `selling_plan`; the cart page
  is the native `/cart` form; the header reads `cart.item_count`. Nothing is
  intercepted.
- **Analytics / pixels**: standard variant sales on one product, no custom line
  items, so Shopify analytics and pixel apps attribute correctly.
- **Markets / currency**: all money uses `| money`; the JS reformats live prices
  with `shop.money_format`.

## What changed from the section-pack drop

This folder replaces the earlier `mp-*` section pack. It is now a whole theme:

- Added `layout/theme.liquid`, `layout/password.liquid`, `config/`, `locales/`
  and every required template (cart, collection, blog, article, search, 404,
  gift card, customer accounts) so it uploads and runs on its own.
- Header and footer moved into **section groups** so every page — designed or
  utility — gets them automatically.
- **Photo-grid fix.** In "Where it goes" each figure used to set its own aspect
  ratio independent of its grid cell, so on the wide cell the photograph
  overflowed and collided with the row below, and the narrow cells left a dead
  gap. Figures now fill a cell that owns the box (`mp-fig--fill`): equal heights,
  no spill, no gap, at every width.
- Product gallery gets a trailing gutter so the last photo can scroll fully into
  view on mobile.

## Tokens

| Token | Value | Role |
|---|---|---|
| `--mp-ink` | `#16130F` | The ground |
| `--mp-ink-2` | `#221D17` | Raised ink, placeholder weave |
| `--mp-cream` | `#F4EEE3` | Paper, buy surfaces, primary text on ink |
| `--mp-amber` | `#C4651D` | Accent, rationed |
| `--mp-amber-lt` | `#E0A672` | Accent as small text on ink |

**Type.** DM Serif Display for headlines (italic = the accent word), Work Sans
for UI and body, JetBrains Mono for eyebrows, meta and captions.

**Layout.** 1440px max, gutter `clamp(20px, 4vw, 48px)`. Breakpoints at 900px
(hero splits, nav appears, photo grid goes 2fr 1fr 1fr) and 1000px (product page
splits into gallery + sticky buy column, sticky mobile bar hides).

**Motion.** `.mp-reveal` rises 20px and fades once at 12% visibility. Disabled
under `prefers-reduced-motion`; fully visible with JavaScript off.

## Local preview

`preview.html` / `preview-product.html` open the static frames with a
mobile/desktop switch. Drop photos named `cake-slice.jpeg`, `cakes-stack.jpeg`,
`cakes-four.jpeg`, `life-hoodoos.jpg`, `life-trail.jpg`, `life-canyon.jpg` and
`life-sunrise.jpg` into `assets/` to see them populated (these are git-ignored;
the theme itself ships with none). For a real preview run `shopify theme dev`.
