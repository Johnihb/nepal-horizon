# Nepal Horizon — Frontend Design System

The landing route (`/`) is the reference. Every other page is built from the
same material: ink, charcoal, paper, hairline rules, square corners, and one
italicised word per headline.

Nothing outside this document is a free variable. If a page needs something
that is not here, extend this file and `app/globals.css` — do not invent a
second visual language.

---

## 1. Material

| Token | Value | Meaning |
|---|---|---|
| `--nh-ink` | `#000` | ground, primary buttons, nav bar |
| `--nh-charcoal` | `#111` | raised dark surface |
| `--nh-graphite` | `#333` | body copy on paper |
| `--nh-mist` | `#bdbdbd` | secondary copy on ink |
| `--nh-paper` | `#fff` | text on ink, page ground |
| `--nh-line` | `rgba(255,255,255,.26)` | hairline on ink |

Inside a page shell the tokens re-map so a component never has to know which
half of the range it sits on:

| Token | `.nh-page` (paper) | `.nh-page--ink` |
|---|---|---|
| `--nh-page-bg` | `#fff` | `#000` |
| `--nh-page-fg` | `#333` | `#fff` |
| `--nh-page-line` | `rgba(0,0,0,.16)` | `rgba(255,255,255,.24)` |
| `--nh-page-muted` | `#6a6a6a` | `#bdbdbd` |
| `--nh-accent` | `#1a6b72` | `#6fc6ce` |
| `--nh-accent-2` | `#9c5311` | `#e7a25a` |
| `--nh-danger` | `#b3261e` | `#ff8a80` |

**Colour rule.** The page is monochrome. Teal and ochre appear only where they
encode data — booking status, chart series, an accent word. Never as
decoration, never as a button fill.

**Data on the ink shell.** Anything that draws data on `.nh-page--ink` — the
booking chart, the stat rules — uses that shell's own tokens: `--nh-accent`
(`#6fc6ce`) for bookings, `--nh-accent-2` (`#e7a25a`) for revenue,
`--nh-mist` (`#bdbdbd`) for the third series. The paper-shell accents
(`#1a6b72`, `#9c5311`) fail the 3:1 a data line needs against black, so they
never cross over.

## 2. Type

- **Display** — Work Sans (`var(--font-display)`), weight 500, tracking
  `-0.07em`, line-height `0.9`. Scales: `.nh-display-1` (page title),
  `.nh-display-2` (section), `.nh-display-3` (card / price).
- **Emphasis** — one word per headline set in Georgia italic via `<em>`.
  This is the signature of the whole site; a headline without it feels off.
- **Metadata** — Geist Mono (`var(--font-mono)`), uppercase, tracking `.09em`,
  `.nh-meta` / `.nh-eyebrow` / `.nh-label` / `.nh-btn`.
- **Body** — Work Sans 400, `1.6` line-height, `--nh-page-muted` for secondary.

## 3. Structure

- Every page is wrapped in `<SiteShell tone="paper" | "ink">`.
- Every page opens with `<PageHero eyebrow index title lede />` — a ledger
  index band separated by a hairline.
- The ledger index (`01`, `02`, `03`) is meaningful: it is the position of the
  section in the product, not decoration.
- Content width is `clamp(1.25rem, 9vw, 10.5rem)` inline padding, matching the
  landing route.
- Lists are hairline-ruled rows, not cards in a grid of boxes.

## 4. Kit

| Class | Use |
|---|---|
| `.nh-page` / `.nh-page--ink` | page shell |
| `.nh-page-nav` `.nh-page-nav-inner` `.nh-page-nav-links` | sticky ink nav |
| `.nh-mark-dark` | boxed `NH` monogram + wordmark |
| `.nh-page-footer` | footer rule + metadata |
| `.nh-page-hero` `.nh-page-hero-inner` | opening band |
| `.nh-eyebrow` `.nh-eyebrow-row` | mono label / split ledger index |
| `.nh-display-1/2/3` `.nh-page-lede` `.nh-meta` `.nh-muted` `.nh-num` | type |
| `.nh-link` | underlined mono link |
| `.nh-panel` `.nh-panel-flush` `.nh-frame` | surfaces |
| `.nh-btn` + `.nh-btn-ink` `.nh-btn-ghost` `.nh-btn-danger` `.nh-btn-sm` | buttons |
| `.nh-label` `.nh-input` `.nh-field-error` | forms |
| `.nh-table` `.nh-table-wrap` `.nh-badge` + status modifiers | data |
| `.nh-stat` `.nh-stat-label` `.nh-stat-value` | metric tiles |
| `.nh-alert` + `.nh-alert-error` `.nh-alert-info` `.nh-alert-ok` | messages |
| `.nh-skeleton` | loading placeholder |
| `.nh-border` `.nh-accent` `.nh-accent-2` `.nh-danger` `.nh-band-ink` `.nh-band-paper` | token shortcuts |

Buttons are square. Nothing in the kit has a border radius except the badges,
which are pills.

## 5. Rules

1. Every interactive element has a visible `:focus-visible` outline (2px,
   `currentColor`, 3px offset). Never remove it.
2. Every icon-only control has `aria-label`. Every image has `alt`.
3. Forms: `<label htmlFor>` on every control, `name` set, correct `type`,
   `autocomplete` where it applies, errors inline under the field.
4. Destructive actions are confirmed before they fire.
5. Loading, empty and error states are all designed — never a blank screen.
6. `prefers-reduced-motion` is honoured; the app pages use no scroll animation
   at all, so there is nothing to disable.
7. Dates and money go through `Intl.DateTimeFormat` / `Intl.NumberFormat`.
8. Copy is plain and second-person: "Book this journey", not "Submit".

## 6. Data layer

`lib/api.ts` owns every endpoint. `hooks/get.ts` holds queries, `hooks/post.ts`
holds mutations, `hooks/session.ts` holds the session. Never call `axios`
directly from a component.

Response envelope: `{ statusCode, body }` — the payload is always `body`.
Errors are not uniform; `toApiError()` flattens them.

**Backend strings are not UI copy.** `POST /user/package/booking/:id` answers
`"Package booked successfully"`; that message is rendered nowhere. Every
confirmation is written in the product's voice — the API's message is kept in
the mutation data for debugging, not printed on the page.

## 7. State and routes

- **Pagination lives in the URL.** Both ledgers — `/packages` and `/admin` —
  read `?page=`, and the value is a **page index**, not a row offset. The
  controls are `<Link>`s, so a page can be shared, bookmarked and reached with
  the back button. A client component that calls `useSearchParams` sits under
  a `<Suspense>` boundary.
- **The nav mirrors access.** The Console link is rendered only for
  `session.user.role === "ADMIN"`; the field-office and console links hide
  below 720px (`.nh-nav-hide`), where the wordmark shortens to its monogram.
- **Both headers lead somewhere.** The landing header (`components/nepal-horizon.tsx`)
  and the page header (`components/site/site-header.tsx`) each carry the ledger
  (`/packages`) and the account route (`/login`). The landing's in-page anchors
  (`.nh-nav-section`) drop below 720px instead — route links are never the
  things that get clipped. The Sign In / Sign Out control is `.nh-nav-auth`, a
  framed button that is rendered even while the session is still resolving, so
  the way in is never missing.
- **Locales are fixed.** Dates are `en-GB` (`lib/format.ts` `formatDate`,
  `components/dashboard/chart-config.ts`), money and counts are `en-US`. A date
  never reads in one style while a price reads in another.
- **Errors move the caret.** Every form that validates calls
  `focusFirstError(form, field)` (`lib/focus.ts`) so the first field that
  failed takes focus. Notices are announced — `role="status"` for a
  confirmation, `role="alert"` for a failure.
- **Destructive and destructive-shaped actions ask first.** Deleting a journey
  arms a confirmation; cancelling an edited draft turns the button into
  "Discard Changes". Neither fires the request on the first click.
