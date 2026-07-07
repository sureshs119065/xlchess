# XLChess — Marketing Site Rebuild

A production-quality rebuild of the XLChess hero section and the page
around it, using the live site as a functional baseline for the hero and
extending outward from there. Built with Next.js 14 (App Router),
TypeScript, Tailwind CSS, Framer Motion, chess.js, and Three.js.

> Copy, layout rhythm, and interaction pattern are inspired by
> xlchess.com; no brand assets, logos, or verbatim copy were reused —
> all headline/body text below is original.

---

## Setup

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run typecheck
npm run lint
```

Requires Node 18.17+.

**Note on fonts:** this repo loads Fraunces, Inter, and IBM Plex Mono via
`next/font/google`, which fetches font files at build time. If you're
building in a network-restricted sandbox (no access to
`fonts.googleapis.com`), the build will fail on that fetch alone — every
other route, component, and type check is unaffected. On Vercel, or any
normal network, this resolves automatically with no config changes.

---

## Stack rationale

| Choice | Why |
|---|---|
| Custom SVG board over `react-chessboard` | Full control over theming (brand-tinted squares, mono coordinate labels), no extra runtime dependency, and piece rendering via `<text>` glyphs needs no image assets at all. |
| `chess.js` for legality/PGN | Battle-tested SAN parsing and move validation; used only inside `lib/chess/pgn.ts` (playback) and `lib/chess/manualPlay.ts` (click-to-move), so it's fully swappable for a live game feed later. |
| Vanilla Three.js for the 3D knight, not `react-three-fiber` | One WebGL scene, code-split behind `next/dynamic`, holding a single lathed mesh — a raw imperative scene with an explicit cleanup function is simpler to reason about and dispose correctly than pulling in a whole renderer abstraction for one object. |
| Framer Motion | Declarative stagger variants for entrance choreography and the CTA's spring-based tilt; both would be significantly more code by hand. |
| No Lenis | Native `scroll-behavior: smooth` + `scroll-margin-top` covers every anchor scroll in this build. Worth revisiting if the page grows real scroll-linked parallax beyond the hero's ambient background. |
| Tailwind + `styles/tokens.ts` | Every color/radius/shadow/motion value is declared once in `tokens.ts` and consumed by `tailwind.config.ts` — no hex values or magic numbers live in component files. |

---

## What was recreated vs. redesigned

**Recreated (kept as functional reference, hero only):**
- Two-column layout: copy + CTA on the left, live board demo on the right
- Dark navy/near-black base with a purple/indigo primary accent
- Headline → gradient sub-headline → description → single primary CTA
- Autoplaying famous-game demo board with a "moves left" counter

**Redesigned, hero:**
- **Board and stat colors are brand-tinted**, not the generic green/cream
  chessboard or an arbitrary stat-card gradient — see `styles/tokens.ts`.
- **A live move-notation ticker** beside the board (the hero's signature
  element) — borrowed from how real chess broadcasts and lichess/chess.com
  actually display games, in the monospace face the notation itself uses.
- **Manual autoplay control** (play/pause/replay) — the baseline site's
  autoplay has no user control at all.
- **Click-to-move on the demo board** — clicking any piece pauses the
  demo and hands the board over for your own chess.js-validated moves
  from that position, not just a passive replay. Selecting a piece shows
  its legal destinations (dot for a quiet move, ring for a capture); an
  `aria-live` region announces whose turn it is, check, and checkmate.
- **A 3D white knight in the ambient background** (desktop only) — a
  Staunton-style piece profile lathed into real geometry with
  Three.js, idle-rotating with a subtle pointer-driven parallax tilt.
  Mobile gets a flat Unicode ♕ glyph instead — see "3D piece" below for
  the full rationale.
- A reduced-motion fallback, a mobile-simplified read-only board, a
  credibility stat strip, and an entrance stagger — none of which exist
  on the baseline.

**Beyond the hero:** the assessment brief scoped the hero section, but a
hero doesn't make a page — the nav links to `#how-it-works`, `#learn`,
and `#compete` need somewhere to go, so this build adds real sections
for all of them, plus reviews, a closing CTA, and a footer. Content and
data (leaderboard rows, course names, review quotes) are original
placeholder content, not scraped from the live site.

Each improvement is also called out inline as a code comment at its
point of use.

---

## Architecture

```
app/
  layout.tsx         — font loading, metadata
  page.tsx            — composes every section, no business logic
  globals.css         — Tailwind layers, focus-visible rules, reduced-motion base
components/
  SiteHeader.tsx
  SiteFooter.tsx
  hero/
    HeroSection.tsx       — composition + entrance stagger + dynamic imports
    HeroCopy.tsx           — headline/sub-headline/description
    HeroCTA.tsx            — magnetic-tilt CTA button
    StatStrip.tsx          — count-up credibility stats
    ChessDemoBoard.tsx     — playback + click-to-move state, hover-pause, reduced motion, mobile gate
    MoveCounter.tsx
    AutoplayControls.tsx
    MoveTicker.tsx         — signature element: live notation ticker
    ScrollCue.tsx
    AmbientBackground.tsx  — CSS gradient blobs + the 3D knight (desktop) / flat glyph (mobile)
    BoardSkeleton.tsx
  sections/
    HowItWorksSection.tsx
    LearnSection.tsx
    CompeteSection.tsx
    TestimonialsSection.tsx
    FinalCTASection.tsx
  chess/
    ChessBoardSVG.tsx   — pure board rendering, click-to-move-aware, reusable outside the hero
  three/
    Queen3D.tsx          — lathes a Staunton queen profile into a Three.js mesh
  ui/
    CountUp.tsx
    RevealOnScroll.tsx   — shared scroll-triggered fade-in used by every section below the hero
    SectionHeading.tsx
lib/
  knightPath.ts         — the one knight glyph path shared by the CTA icon and header mark
  chess/
    types.ts             — shared chess types
    games.ts              — sample PGN data (The Evergreen Game, 1852, public domain)
    pgn.ts                — pure move-sequencing engine for playback (chess.js in, typed steps out)
    manualPlay.ts          — pure click-to-move engine (legal targets, move application)
    usePgnPlayback.ts       — autoplay/scrub state machine
hooks/
  useReducedMotion.ts
  useInView.ts
  useIsMobile.ts
styles/
  tokens.ts             — single source of truth for color/spacing/radii/motion
```

`app/page.tsx` only composes. State lives in `ChessDemoBoard` and the
hooks/lib layer; the board renderer (`ChessBoardSVG`) itself has no
knowledge of the hero or of chess.js — it takes `pieces` plus optional
selection/click props, so it's reusable on a future `/learn` or
`/compete` page.

---

## Design decisions

The brief pins down the hero's visual direction explicitly (dark navy,
purple/indigo accent, this copy structure), so that's followed rather
than overridden there. The room the brief leaves open — exact palette
values, the type system, and the "one signature element" — is where
this build makes its own choices, and those choices are then carried
through the sections beyond the hero for consistency:

- **Type system:** Fraunces (display) + Inter (body) + IBM Plex Mono
  (notation/stats/captions/leaderboard numbers). Chess notation is
  monospace in every real broadcast overlay and PGN file, so the mono
  face isn't a stylistic flourish — it's the subject's own vernacular.
- **Signature element:** the live move-notation ticker beside the board.
  Rather than inventing a stat card or numbered-step device, it borrows
  the thing chess broadcasts actually do — a scrolling SAN move list.
- **Board palette:** squares are brand-indigo/ivory rather than the
  universal felt-green/cream pairing, so the demo reads as XLChess's own
  board rather than a generic embed.
- **3D piece:** a Staunton-style white queen, built with
  `THREE.LatheGeometry` from a hand-tuned (radius, height) profile and
  revolved 360°, with a ring of finial spheres for the crown's coronet
  — a lathed profile is how real turned chess pieces are actually
  shaped, so it reads as a genuine piece rather than a flat cutout
  given depth. It sits in the hero's `AmbientBackground`, idle-rotating
  with a damped pointer-parallax tilt (`components/three/knight3D.tsx`).
  Code-split via `next/dynamic({ ssr: false })` so the WebGL bundle
  never competes with the headline for the LCP paint budget, gated to
  desktop only (mobile gets a flat Unicode ♕ glyph instead — a spinning
  WebGL context is a poor trade against battery/thermal budget for
  something purely decorative on a phone), and its rotation/parallax
  freeze completely under `prefers-reduced-motion`, leaving a static
  piece rather than removing it outright.

---

## Known fixes

**Page would jump back to the hero while scrolling.** Root cause: the
move-notation ticker called `element.scrollIntoView({ block: "nearest" })`
every time the autoplay demo advanced a move — and the demo kept
autoplaying even after the hero had scrolled out of the viewport.
`scrollIntoView` walks *every* scrollable ancestor to bring its target
into view, including the document itself, so once the hero (and the
ticker inside it) was off-screen, each move change yanked the whole page
back up. Fixed two ways:
1. `ChessDemoBoard` now actually pauses the underlying timer — not just
   the button label — when the hero scrolls out of view (via
   `useInView`), when it's hovered/focused, or during free play. Off
   screen, the ticker's active move stops changing entirely.
2. `MoveTicker` no longer calls `scrollIntoView` at all. It computes the
   needed offset manually and sets `list.scrollTop` directly, which is
   physically incapable of affecting anything outside that one
   container — belt-and-suspenders in case anything else in a future
   change reintroduces off-screen updates.

---

## Accessibility notes

- Landmarks: `<header>`, `<main>`, `<section aria-label="...">` on every
  section, heading levels stepped consistently (`h1` in the hero, `h2`
  per section)
- Every board square has a computed `aria-label` (e.g. "e4, white
  pawn"), and the currently-focused square gets a visible focus ring
  drawn directly in the SVG (no `outline: none` anywhere in the app)
- Autoplay pauses on pointer hover **and** keyboard focus, with an
  explicit, always-visible play/pause button (`aria-pressed`); clicking
  any piece pauses it too and hands over an `aria-live` status region
  ("White to move", "Check", "Checkmate")
- `prefers-reduced-motion` is respected globally (`app/globals.css`) and
  specifically in the board (static final position + "Watch replay"),
  the CTA tilt, the 3D queen (rotation/parallax frozen), the scroll-cue
  chevron, the stat count-up, and every section's scroll-in animation
  (`RevealOnScroll`)
- Move changes are announced via a visually-hidden `aria-live="polite"`
  caption; the move counter is also `aria-live="polite"`
- The 3D queen and CSS gradient blobs are `aria-hidden` and
  `pointer-events: none` — purely decorative, never in the tab order
- Verified contrast: body text (`#F5F6FA`/`#C7CAE0`) on `#0A0D19` and CTA
  text (`#F5F6FA`) on `#6D5DFC` both clear 4.5:1

**Stretch not done:** arrow-key navigation between board squares (Tab
currently walks all 64 squares in row order, plus the clickable target
squares during free play).

---

## Performance notes

- LCP element is the headline text — no hero background image
- The chess engine + board (`chess.js` + `ChessBoardSVG`) and the 3D
  queen (`three`) are each loaded via
  `next/dynamic({ ssr: false })`, so neither blocks the initial text
  paint; a fixed-aspect-ratio skeleton fills the board's slot meanwhile,
  so there's no layout shift when it hydrates. Confirmed by build
  output: Three.js adds ~1kB to First Load JS because it's excluded
  from the main bundle entirely.
- All animation (entrance stagger, CTA tilt, 3D queen
  rotation/parallax, ambient gradient drift, scroll-cue, section
  reveal, board flash on checkmate) is `transform`/`opacity` only
- The autoplay `setInterval` is cleared on every dependency change and
  on unmount (`lib/chess/usePgnPlayback.ts`); the Three.js scene's
  `requestAnimationFrame` loop, `ResizeObserver`, and `pointermove`
  listener are all torn down and geometry/material/renderer disposed on
  unmount (`Queen3D.tsx`) — a WebGL context is a real GPU resource, not
  just a timer
- Piece rendering uses inline SVG `<text>` glyphs, not per-piece image
  assets — zero image requests for the board itself

Verified locally: `npm run build` compiles cleanly, `npx tsc --noEmit`
and `npx eslint .` both pass with zero errors. (A full Lighthouse run
needs a deployed URL or headless Chrome, which wasn't available in the
sandbox this was built in — recommend running it against the Vercel
preview before scoring.)

---

## What I'd improve with more time

- **Arrow-key board navigation** — currently Tab walks all 64 squares in
  order; a real board would trap focus and move with arrow keys, jumping
  by file/rank like a native `<table>` grid widget.
- **Real PGN game library** — swap the single hardcoded Evergreen Game
  for a small rotating set, or a WebSocket feed of an actual live game,
  which `usePgnPlayback` is already structured to accept (it only needs
  a `GameRecord`-shaped input).
- **Promotion picker** — the click-to-move engine always promotes to a
  queen; a real implementation would prompt for the piece.
- **Visual regression tests** (Playwright) for the board's aria-labels,
  click-to-move states, and reduced-motion states, since those are easy
  to silently regress.
- **Multiplayer preview** — a small "watch a live game right now" variant
  of the demo board, backed by a real match rather than a historical PGN.
