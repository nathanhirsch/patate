# Morizot Passage — cake feedback

A single-page, tap-only feedback form for in-person product sampling. Someone scans
a QR code at the sample stand, answers four questions plus an optional email, and the
response lands in Supabase. Static site, no build step, deploys to Vercel.

Files:

| File            | Purpose                                                        |
|-----------------|---------------------------------------------------------------|
| `index.html`    | The whole form (HTML + CSS + JS in one file).                 |
| `schema.sql`    | Supabase table + row-level security.                          |
| `print-qr.html` | Generates a printable A4 sheet with a QR code per location.   |

## Assumptions / choices made

- **Table name** is `cake_feedback` in the `public` schema.
- **`grant insert ... to anon`** was added to `schema.sql` in addition to the RLS
  policy. A policy alone is not enough for a table created via the SQL editor — the
  `anon` role also needs the table-level `INSERT` privilege. No other privilege is
  granted, so the anon key still cannot read, update, or delete.
- **Duplicate prevention** is a single `localStorage` flag
  (`morizot_cake_feedback_done`). Clearing site data or using another device/browser
  lets someone submit again — acceptable per the brief.
- **Honeypot**: a visually-hidden `website` text field. If it is filled, the page
  shows the thank-you state and sets the `localStorage` flag but inserts nothing.
- **Email validation** is a light `x@y.z` regex, only applied when the field is
  non-empty. Empty email is stored as SQL `NULL`.
- **Q3 "I wouldn't"** is mutually exclusive: selecting it clears and disables the
  other options; selecting any other option clears it.
- **Free-form "Other…"** on Q2 and Q3 reveals a text input (80-char max). The typed
  text is stored raw — in `change_one_thing` for Q2, appended to the `occasions`
  array for Q3. It is not prefixed or tagged, so anything that isn't one of the
  fixed option labels is a write-in. An empty "Other…" doesn't count toward the
  required answer. Selecting "I wouldn't" also clears a Q3 write-in.
- **Question numbers** ("1." … "4.") are shown before each required question's
  label. The optional email field is not numbered.
- The **Send** button is styled-disabled (via `aria-disabled`, not the `disabled`
  attribute) so a tap on it still fires — it scrolls to the first unanswered
  question and highlights it in red.
- `<meta name="robots" content="noindex">` is set — this page isn't meant to be
  found via search.
- No cookies, no analytics, no third-party calls except the Supabase client loaded
  from `esm.sh`. `navigator.userAgent` is the only automatic field.

## 1. Create the table

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of `schema.sql` and click **Run**.
3. Confirm under **Table editor** that `cake_feedback` exists with RLS enabled.

## 2. Add your Supabase keys to `index.html`

In Supabase: **Project Settings → API**. Copy **Project URL** and the **`anon` public**
key. Open `index.html`, find this block near the top of the `<script type="module">`:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Paste your values between the quotes. The `anon` key is safe to ship in client code —
RLS restricts it to inserts only.

## 3. Deploy to Vercel

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. In Vercel: **Add New… → Project** → import the repo.
3. Settings:
   - **Framework Preset:** `Other`
   - **Build Command:** *(leave empty)*
   - **Output Directory:** `.`
   - **Root Directory:** set to `cake-feedback` if the repo has other things in it.
4. **Deploy.** Your form is at `https://<domain>/`.

To test: open the URL, submit once, reload — you should see the thank-you state
(that's the `localStorage` flag). Clear site data to test again.

## 4. Generate QR codes (one per location)

The form reads a `src` query parameter and stores it as `source`, so you can tell
which stand a response came from. If `src` is missing it's stored as `"unknown"`.

URL pattern:

```
https://<domain>/?src=<location>
```

Examples: `https://<domain>/?src=coworking-a`, `https://<domain>/?src=market-sat`.

**To make the printable sheet:**

1. Open `print-qr.html` in a browser (locally is fine — double-click it, or
   `open print-qr.html`).
2. Enter your deployed URL and a location tag, click **Update & preview**.
3. **Print** (⌘P / Ctrl-P) → **Save as PDF**, paper size **A4**, margins **None**.
4. Change the location tag and repeat for each stand.

Keep the tag short, lowercase, no spaces (`coworking-a`, not `Coworking A`) — it's
stored verbatim.

## 5. Export responses

Supabase dashboard → **Table editor** → `cake_feedback` → **…** (top right) →
**Export to CSV**. Filter or sort by `source` to split results by location, or by
`created_at` for a date range.

`occasions` exports as a Postgres array literal, e.g. `{Breakfast,"On the go"}`.
