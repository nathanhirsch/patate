# Reservations (no-payment pre-order mode)

The Morizot Passage theme can run in two modes. In **Buy** mode it behaves
normally (add-to-cart, cart, checkout). In **Reserve** mode every add-to-cart
is replaced by a pre-order form that takes **no payment** — it collects a name,
email, number of boxes, and a California ZIP code, and emails them to the store.
You then create a draft order by hand and send an invoice link.

The shop is a California Cottage Food Operation, so online sales are
**California only**. The form enforces this and nothing on the page implies an
out-of-state sale is possible.

## Switching between Reserve and Buy

**Online Store → Themes → Customize → Theme settings (bottom of the left rail) →
Reservations → Store mode.**

- `Buy (checkout)` — normal storefront. Use this once a payment provider is live.
- `Reserve (pre-order form, no payment)` — the reservation form shows in place of
  add-to-cart on the product page and the homepage hero, and the cart link is
  hidden from the header. `/cart` shows a short "taking reservations" notice.

One toggle changes all of it. Also in that panel: **Show price in reserve mode**
(on by default) — turn off if you don't want a price shown next to the form.

The pre-order copy (heading, sub-text, button label, disclaimer, success
message, out-of-California message, max boxes, cakes-per-box helper) is edited on
the product page: **Customize → Products template → MP Product → Reservation
form** block. The standalone **MP Reservation** section has the same settings for
use on any other page (e.g. a `/pages/pre-order` page).

## How reservation emails arrive

Submissions post through Shopify's native contact form, so they arrive as email
with **no app installed**. They go to the address set in **Settings → Notifications
→ "Sender email"** (and the store owner). Check spam on the first one.

Each email contains:

| Field | Notes |
|---|---|
| `name` | required |
| `email` | required — becomes the reply-to |
| `boxes` | required, whole number, 1–max (max is a block setting, default 20) |
| `zip` | required, 5 digits, validated to California (90001–96162) before submit |
| `note` | optional |
| `product` | the product title, so you know what was reserved |
| `source` | always `reservation`, so you can filter these from other contact mail |
| `nickname` | honeypot — if this has any value the submission is spam; ignore it |

The California check is client-side only (the ZIP field is never disabled). A
determined out-of-state submitter could still get through with JS off; treat the
ZIP in the email as the source of truth and don't fulfil anything outside CA.

## Fulfilling a reservation once payments are live

1. **Orders → Drafts → Create order.**
2. Add the product; set quantity to the number of **boxes** from the email
   (this store never sells a single cake — one line = one box).
3. **Customer** → add the person by the name/email from the email.
4. **Shipping address** → enter it from the customer; the address **must be in
   California**. If it isn't, don't proceed.
5. **Send invoice** → Shopify emails a checkout link. Payment happens there.
6. When it's paid the draft becomes a real order you fulfil normally.

Then, when you're ready to sell directly: set **Store mode → Buy** and the
storefront returns to normal checkout with no other changes.

## Known limits

- **No dedup.** Someone can submit twice; you'll get two emails.
- **No database.** Reservations live only in your inbox. Keep them in a
  spreadsheet if the list gets long.
- **Manual.** This is built for a launch list, not ongoing sales. Once volume is
  real, switch to Buy mode and use normal checkout.
- **One form per page.** Don't put the MP Reservation section and the product
  block on the same page — both would show a success message after any submit.
