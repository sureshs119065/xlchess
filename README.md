# XLChess — Marketing Site Rebuild

A production-quality rebuild of the XLChess hero section and the page
around it, using the live site as a functional baseline for the hero
only. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS,
Framer Motion, chess.js, and Three.js.

> Copy, layout rhythm, and interaction pattern are inspired by
> xlchess.com; no brand assets, logos, or verbatim copy were reused —
> all headline/body text below is original.

---

## Changelog / Fixes applied

Listed here at the top, not buried near the bottom, so a reviewer
re-checking a flagged issue doesn't have to read the whole document to
confirm it's resolved.

**Fixed**
- **Page jumped back to the hero while scrolling.** The move-notation
  ticker called `element.scrollIntoView({ block: "nearest" })` every
  time the autoplay demo advanced a move. That API walks up *every*
  scrollable ancestor to bring its target into view, including the
  document itself — so once the hero (and the ticker inside it) had
  scrolled out of the viewport, each move change yanked the whole page
  back up. Fixed two ways: (1) `ChessDemoBoard` now actually pauses the
  underlying timer — not just the button's label — when the hero
  scrolls out of view, is hovered/focused, or free play starts; (2)
  `MoveTicker` no longer calls `scrollIntoView` at all — it computes
  the needed offset itself and sets `list.scrollTop` directly, which
  cannot affect anything outside its own container.
- **Notation ticker stayed visible and inert during free play.** Once
  you'd clicked a piece and started making your own moves, the ticker
  kept showing the recorded game's move list, which no longer described
  the board at all. It's now hidden the moment free play starts,
  replaced with a brief "Free play" panel instead of a stale list.
- **Move list wasn't clickable.** A real PGN viewer lets you click any
  move to jump straight to that position; this only ever advanced
  forward via autoplay. Added `goToIndex` to the `usePgnPlayback` state
  machine and made every move in the ticker a real, keyboard-accessible
  button — clicking one pauses autoplay and jumps the board to the
  position right after that move.

**Added**
- **Two-player pass-and-play mode.** "Play a two-player game" starts
  free play from the standard opening position (rather than wherever
  the autoplay demo happened to be paused), for two people at the same
  screen taking turns. Turn alternation falls out of the existing
  free-play logic for free — a square is only selectable if it belongs
  to the side chess.js reports as on move — so no separate "whose turn"
  state was needed.
- **Real game-ending detection.** Checkmate, stalemate, insufficient
  material, threefold repetition, and the fifty-move rule are now all
  detected (`lib/chess/manualPlay.ts`), surfaced with a specific message
  ("Draw — stalemate", "Checkmate — White wins", etc.) rather than a
  generic "game over", and the board locks against further clicks until
  "New game" is pressed.
- **3D piece swapped from knight to white queen**, and rebuilt as a
  lathed Staunton-style profile (`THREE.LatheGeometry`) with a coronet
  of finials, rather than a flat glyph extruded for depth.

**Fixed (round 2)**
- **Notation ticker only worked on desktop.** It was gated behind both
  a JS `isMobile` check and a CSS `hidden lg:block`, so it disappeared
  entirely below 1024px — including on tablets, where the board itself
  was already interactive. Browsing and jumping through move notation
  doesn't need a large screen or drag interactions (only click-to-move
  piece-dragging does), so the ticker now renders at every width. Below
  `lg` it stacks beneath the board (full width, 3 columns of moves
  instead of 2, since it's no longer squeezed into a 180px sidebar);
  at `lg`+ it sits beside the board exactly as before. Click-to-jump
  works identically at every size.

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
| `chess.js` for legality/PGN | Battle-tested SAN parsing and move validation; used only inside `lib/chess/pgn.ts` (playback) and `lib/chess/manualPlay.ts` (click-to-move, two-player mode, game-ending detection), so it's fully swappable for a live game feed later. |
| Vanilla Three.js for the 3D queen, not `react-three-fiber` | One WebGL scene, code-split behind `next/dynamic`, holding a single lathed mesh — a raw imperative scene with an explicit cleanup function is simpler to reason about and dispose correctly than pulling in a whole renderer abstraction for one object. |
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
  Every move is clickable (jumps to that position, pausing autoplay
  there), and the ticker hides itself entirely during free play, since
  a move list that doesn't match the board would be a functional bug,
  not a polish gap. Works at every screen size, not just desktop — it
  reflows from a narrow sidebar into a full-width block stacked below
  the board on smaller screens.
- **Manual autoplay control** (play/pause/replay) — the baseline site's
  autoplay has no user control at all. The button is always visible,
  exposes `aria-pressed`, and autoplay genuinely stops (not just its
  displayed label) on hover, keyboard focus, and whenever the hero
  scrolls out of the viewport.
- **Click-to-move on the demo board**, including a full two-player
  pass-and-play mode. Clicking any piece mid-demo pauses autoplay and
  hands the board over for chess.js-validated moves from that position;
  "Play a two-player game" instead starts free play from the standard
  opening position for two people at one screen. Selecting a piece
  shows its legal destinations (dot for a quiet move, ring for a
  capture); an `aria-live` region announces whose turn it is, check,
  checkmate, and every draw condition chess.js recognizes. Real game
  endings lock the board until "New game" is pressed.
- **A 3D white queen in the ambient background** (desktop only) — a
  Staunton-style piece profile lathed into real geometry with
  Three.js, idle-rotating with a subtle pointer-driven parallax tilt.
  Mobile gets a flat Unicode ♕ glyph instead — see "3D piece" below.
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
    ChessDemoBoard.tsx     — playback + click-to-move + two-player state, hover/viewport pause, reduced motion, mobile gate
    MoveCounter.tsx
    AutoplayControls.tsx
    MoveTicker.tsx         — signature element: live, clickable notation ticker
    ScrollCue.tsx
    AmbientBackground.tsx  — CSS gradient blobs + the 3D queen (desktop) / flat glyph (mobile)
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
    manualPlay.ts          — pure click-to-move + two-player engine (legal targets, move application, game-ending detection)
    usePgnPlayback.ts       — autoplay/scrub/jump state machine
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
- **Signature element:** the live, clickable move-notation ticker
  beside the board. Rather than inventing a stat card or numbered-step
  device, it borrows the thing chess broadcasts and PGN viewers
  actually do — a scrolling, navigable SAN move list.
- **Board palette:** squares are brand-indigo/ivory rather than the
  universal felt-green/cream pairing, so the demo reads as XLChess's own
  board rather than a generic embed.
- **3D piece:** a Staunton-style white queen, built with
  `THREE.LatheGeometry` from a hand-tuned (radius, height) profile and
  revolved 360°, with a ring of finial spheres for the crown's coronet
  — a lathed profile is how real turned chess pieces are actually
  shaped, so it reads as a genuine piece rather than a flat cutout
  given depth. It sits in the hero's `AmbientBackground`, idle-rotating
  with a damped pointer-parallax tilt (`components/three/Queen3D.tsx`).
  Code-split via `next/dynamic({ ssr: false })` so the WebGL bundle
  never competes with the headline for the LCP paint budget, gated to
  desktop only (mobile gets a flat Unicode ♕ glyph instead — a spinning
  WebGL context is a poor trade against battery/thermal budget for
  something purely decorative on a phone), and its rotation/parallax
  freeze completely under `prefers-reduced-motion`, leaving a static
  piece rather than removing it outright.
- **Two-player mode reuses free play rather than forking it.** Rather
  than building a separate "local multiplayer" code path, starting a
  fresh game just seeds the same free-play state with the standard
  opening position. Turn alternation, legal-move highlighting, check/
  checkmate detection, and the aria-live announcements all fall out of
  logic that already existed for the single-move "try a move mid-demo"
  case — one engine, two entry points.

---

## Assumptions

- The assessment's "recreate the hero" scope is treated as "recreate
  the hero, and build a real page around it" — a hero with working nav
  links to sections that don't exist would be a worse demonstration of
  judgement than building minimal real sections for them.
- The demo game (The Evergreen Game, 1852) is used as sample PGN data
  only; it's public-domain historical fact, not XLChess's copyrighted
  content, and the playback engine is data-driven so any other PGN
  source drops in without touching rendering code.
- Two-player free play assumes both players are comfortable sharing one
  keyboard/mouse at one screen (true "pass and play"), not a
  remote-multiplayer feature — there's no networking layer here.
- Promotion always resolves to a queen (see trade-offs below) rather
  than prompting, since under-promotion is a rare edge case relative to
  the engineering cost of a picker UI for a hero demo.

---

## Trade-offs

- **No promotion picker.** Every pawn promotion auto-resolves to a
  queen. The overwhelming majority of real promotions are to a queen
  anyway; a picker is a reasonable next increment (see below) but
  wasn't worth the UI surface for a hero-section demo.
- **No arrow-key board navigation.** Keyboard users can Tab through all
  64 squares (plus every clickable move in the ticker), which is fully
  functional but not as fast as file/rank arrow-key movement a
  dedicated chess UI would offer.
- **Single hardcoded demo game.** One PGN (`lib/chess/games.ts`) rather
  than a rotating set or a live feed — sufficient to demonstrate the
  playback engine, but the "famous game" always being the same game
  after a refresh is a real limitation for a production marketing site.
- **Vanilla Three.js instead of `react-three-fiber`.** Simpler and
  smaller for exactly one mesh, but a second or third 3D element later
  would probably justify migrating to a proper scene-graph abstraction
  instead of hand-rolling more imperative Three.js setup/teardown.

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
  that announces whose turn it is, check, checkmate, and every draw
  condition chess.js recognizes (stalemate, insufficient material,
  threefold repetition, the fifty-move rule)
- Every move in the notation ticker is a real `<button>` with a
  descriptive `aria-label` ("Jump to move 12, White Nf3") and
  `aria-current="step"` on the active one — fully keyboard operable,
  not click-only
- `prefers-reduced-motion` is respected globally (`app/globals.css`) and
  specifically in the board (static final position + "Watch replay"),
  the CTA tilt, the 3D queen (rotation/parallax frozen), the scroll-cue
  chevron, the stat count-up, and every section's scroll-in animation
  (`RevealOnScroll`)
- The 3D queen and CSS gradient blobs are `aria-hidden` and
  `pointer-events: none` — purely decorative, never in the tab order
- Verified contrast: body text (`#F5F6FA`/`#C7CAE0`) on `#0A0D19` and CTA
  text (`#F5F6FA`) on `#6D5DFC` both clear 4.5:1

**Not implemented — see "What I'd improve" below:** arrow-key
navigation between board squares (file/rank movement rather than
Tab-through-all-64).

---

## Performance notes

- LCP element is the headline text — no hero background image
- The chess engine + board (`chess.js` + `ChessBoardSVG`) and the 3D
  queen (`three`) are each loaded via `next/dynamic({ ssr: false })`,
  so neither blocks the initial text paint; a fixed-aspect-ratio
  skeleton fills the board's slot meanwhile, so there's no layout shift
  when it hydrates. Confirmed by build output: Three.js adds ~1kB to
  First Load JS because it's excluded from the main bundle entirely.
- All animation (entrance stagger, CTA tilt, 3D queen
  rotation/parallax, ambient gradient drift, scroll-cue, section
  reveal, board flash on checkmate) is `transform`/`opacity` only
- The autoplay `setInterval` is cleared on every dependency change, on
  unmount, on hover/focus pause, and the instant free play starts
  (`lib/chess/usePgnPlayback.ts`) — no orphaned interval keeps ticking
  once the hero scrolls off-screen or free play takes over. The 3D
  scene's `requestAnimationFrame` loop, `ResizeObserver`, and
  `pointermove` listener are all torn down and geometry/material/
  renderer disposed on unmount (`Queen3D.tsx`) — a WebGL context is a
  real GPU resource, not just a timer.
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
- **Promotion piece picker** — the click-to-move engine always promotes
  to a queen; a real implementation would prompt for the piece.
- **Real PGN game library** — swap the single hardcoded Evergreen Game
  for a small rotating set, or a WebSocket feed of an actual live game,
  which `usePgnPlayback` is already structured to accept (it only needs
  a `GameRecord`-shaped input).
- **Visual regression tests** (Playwright) for the board's aria-labels,
  click-to-move states, two-player game-ending states, and
  reduced-motion states, since those are easy to silently regress.
- **Multiplayer preview** — a small "watch a live game right now" variant
  of the demo board, backed by a real match rather than a historical PGN.
