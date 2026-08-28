# Packaging preference test

A single-page web app that shows two packaging designs at a time and asks one
question: **which one would you pick off the shelf?** After 7 rounds the visitor
gets two optional questions, the live leaderboard, and a light email capture.

Outputs you get back:

1. A defensible ranking of the designs (smoothed pairwise win rate).
2. An email list of people who want a launch note or a tasting invite.

Everything is in [`index.html`](index.html) — vanilla HTML, CSS, and JS, no build
step. Open it and read it top to bottom.

---

## 1. Run it locally

Any static file server works. For example:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. With no Supabase config (the default) the app
runs entirely on `localStorage` and prints a notice in the browser console. This
is enough to click through the whole flow and check the designs.

---

## 2. Create the Supabase project

1. Sign in at <https://supabase.com> and create a new project (free tier is fine).
2. In the dashboard, open **SQL Editor → New query**, paste the contents of
   [`schema.sql`](schema.sql), and run it. This creates the `votes` and
   `responses` tables and their Row Level Security policies.
3. Open **Project Settings → API** and copy two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (a long JWT)

The anon key is meant to live in client code — it is safe to commit. RLS is what
protects the data. **Never** copy the `service_role` key into this file.

---

## 3. Paste the two config values

Near the top of [`index.html`](index.html):

```js
const SUPABASE_URL      = '';
const SUPABASE_ANON_KEY = '';
```

Fill both in and reload. The console notice disappears and votes now write to
Supabase. If Supabase is ever unreachable, the app automatically falls back to
`localStorage` so voting is never blocked.

---

## 4. Add or remove a design

All designs live in one array near the top of [`index.html`](index.html):

```js
const DESIGNS = [
  { id: 'a', label: 'Morizot Passage — vanilla bites, sand',       img: 'designs/a.png' },
  { id: 'b', label: 'Morizot Passage — rum & vanilla bites, sage', img: 'designs/b.png' },
  // ...
];
```

To **add** a design: append one object and drop the matching image in
[`designs/`](designs/). Nothing else changes — pairing, the leaderboard, and the
progress ticks all derive from this array.

- `id` — written to the database. Keep it short and stable. **Never renumber an
  id once voting has started**, or old votes will point at the wrong design.
- `label` — for your eyes only (this file and the leaderboard). It is never shown
  during a duel; naming the variable on screen would bias the choice.
- `img` — path to the artwork. Produce it at a **4:5 ratio** (it is shown
  cover-cropped). A missing file renders a gray placeholder card with the id, so
  the app is testable before final artwork exists.

`ROUNDS` (default `7`) is right below the array. With 5 designs there are 10
possible pairs; the app never repeats a pair within a session until all pairs are
used, and it still works if you set `ROUNDS` higher than the number of pairs.

### Placeholder images

[`designs/`](designs/) ships with flat-colour placeholders (`a.png`–`e.png`).
Regenerate them any time with:

```bash
python3 designs/_generate_placeholders.py
```

Replace each file with the real concept art when it is ready, keeping the names.

---

## 5. Deploy as a static file

The repo is already a static site — no configuration needed.

- **Vercel** — `vercel` from the repo root, or import the repo and accept the
  defaults (framework preset: *Other*, no build command, output = repo root).
- **Netlify** — drag the folder onto <https://app.netlify.com/drop>, or connect
  the repo with no build command and publish directory `.`.
- **GitHub Pages** — push to GitHub, then **Settings → Pages → Deploy from a
  branch**, root folder.

After deploying, make a QR code and short link that point at the deployed URL for
markets and tastings. Share `https://your-url/#results` with yourself only — that
route shows the leaderboard without letting you vote.

---

## 6. Read the results

### Leaderboard

Live in the app (and at `/#results`). Designs are ranked by smoothed win rate,
`(wins + 1) / (wins + losses + 2)`, so a design that went 1–0 in one appearance
does not outrank one that went 18–7. Raw `W–L` counts are shown next to each bar,
with total sessions and total votes above the board.

### Export the email list as CSV

Contact info is in the `responses` table and is **not readable from the app** (by
design — there is no select policy on `responses`). Read it in the dashboard:

1. Open **Table Editor → `responses`** to browse, or **SQL Editor** to filter:

   ```sql
   select created_at, email, guess, why
   from responses
   where email is not null
   order by created_at desc;
   ```

2. In the SQL Editor results panel click **Download CSV**. In the Table Editor,
   use **Export → Export as CSV**.

A session can leave up to two rows in `responses` — one with `guess` / `why` from
the questions screen, one with `email` from the capture form. Join them on
`session_id` if you want them together:

```sql
select
  v.session_id,
  max(r.email)  as email,
  max(r.guess)  as guess,
  max(r.why)    as why,
  count(v.*)    as votes_cast
from responses r
join votes v using (session_id)
group by v.session_id;
```

### Watch the "rum" axis

Whether "rum" appears in the descriptor is worth reading as its own result, not
just as raw rank — it changes how a retail buyer reads the product and how the
ingredient statement is written. Compare the designs whose `label` contains
"rum & vanilla" against the plain "vanilla" ones.

---

## Files

| File | What it is |
| --- | --- |
| [`index.html`](index.html) | The entire app. |
| [`schema.sql`](schema.sql) | Tables and RLS policies. Run once in Supabase. |
| [`designs/`](designs/) | Design artwork (placeholders included). |
| `README.md` | This file. |

---

## Notes

- No analytics, no cookies, no third-party trackers.
- `prefers-reduced-motion` is respected — the shelf animation is skipped.
- Works down to 360px wide; on mobile the two packs stack and both stay visible.
- The artwork here is marketing concept art. The winning concept still has to be
  laid out against the San Diego County DEHQ Cottage Food label rules (the
  "Made in a Home Kitchen" 12-point wording, registration number, 1/16" x-height
  minimum, full sub-ingredient and allergen disclosure) before anything is
  printed.
