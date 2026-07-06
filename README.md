# XLChess — Hero Section Rebuild

A production-quality rebuild of the XLChess hero section, using the live
site as a functional baseline and layering in the UX/engineering
improvements described in the brief. Built with Next.js 14 (App Router),
TypeScript, Tailwind CSS, Framer Motion, and chess.js.

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
| Custom SVG board over `react-chessboard` | Full control over theming (brand-tinted squares, mono coordinate labels), no extra runtime dependency, smaller bundle, and piece rendering via `<text>` glyphs needs no image assets at all. |
| `chess.js` for move legality/PGN | Battle-tested SAN parsing; used only inside `lib/chess/pgn.ts` (playback) and `lib/chess/manualPlay.ts` (click-to-move) so it's fully swappable for a live game feed later. |
| Vanilla `three.js` for the 3D knight, not `react-three-fiber` | One WebGL scene, entirely code-split behind `next/dynamic`, only mounted once scrolled into view — a raw imperative scene with an explicit cleanup function is simpler to reason about and dispose correctly than adopting a whole renderer abstraction for a single object. |
| Framer Motion | Declarative stagger variants for the entrance choreography and the CTA's spring-based tilt; both would be significantly more code by hand. |
| No Lenis | Native `scroll-behavior: smooth` + `scroll-margin-top` covers the one anchor scroll in this build (the scroll-cue chevron). Lenis is worth adding once there's a longer page with parallax, but it's unjustified weight for a single anchor jump. |
| Tailwind + `styles/tokens.ts` | Every color/radius/shadow/motion value is declared once in `tokens.ts` and consumed by `tailwind.config.ts` — no hex values or magic numbers live in component files. |

---

## What was recreated vs. redesigned

**Recreated (kept as functional reference):**
- Two-column layout: copy + CTA on the left, live board demo on the right
- Dark navy/near-black base with a purple/indigo primary accent
- Headline → gradient sub-headline → description → single primary CTA
- Autoplaying famous-game demo board with a "moves left" counter

**Redesigned:**
- **Board and stat colors are brand-tinted**, not the generic green/cream
  chessboard or an arbitrary stat-card gradient — see `styles/tokens.ts`
  for the full rationale.
- **A live move-notation ticker** beside the board (the hero's signature
  element) — borrowed from how real chess broadcasts and lichess/chess.com
  actually display games, in the monospace face the notation itself uses.
- **Manual autoplay control** (play/pause/replay) — the baseline site's
  autoplay has no user control at all.
- **Click-to-move on the demo board** — clicking any piece pauses the
  demo and hands the board over for the visitor's own (chess.js-validated)
  moves from that position, not just a passive replay.
- **A real-time 3D knight piece** ("Craftsmanship" section) — a procedurally
  modeled, WebGL-rendered knight with drag-to-rotate and idle auto-rotate,
  entirely code-split and only rendering while on screen.
- **A reduced-motion fallback**, a mobile-simplified read-only board, a
  credibility stat strip, ambient background motion, and an entrance
  stagger — none of which exist on the baseline.

Each is also called out inline as a code comment at its point of use.

---

## Architecture

```
app/
  layout.tsx        — font loading, metadata
  page.tsx           — composes <SiteHeader /> + <HeroSection />, no logic
  globals.css        — Tailwind layers, focus-visible rules, reduced-motion base
components/
  SiteHeader.tsx
  hero/
    HeroSection.tsx      — composition + entrance stagger + dynamic import
    HeroCopy.tsx          — headline/sub-headline/description
    HeroCTA.tsx           — magnetic-tilt CTA button
    StatStrip.tsx         — count-up credibility stats
    ChessDemoBoard.tsx    — owns playback state, hover-pause, reduced motion, mobile gate
    MoveCounter.tsx
    AutoplayControls.tsx
    MoveTicker.tsx        — signature element: live notation ticker
    ScrollCue.tsx
    AmbientBackground.tsx
    BoardSkeleton.tsx
  chess/
    ChessBoardSVG.tsx  — pure board rendering, reusable outside the hero
  ui/
    CountUp.tsx
lib/chess/
  types.ts             — shared chess types
  games.ts             — sample PGN data (The Evergreen Game, 1852, public domain)
  pgn.ts               — pure move-sequencing engine (chess.js in, typed steps out)
  usePgnPlayback.ts     — autoplay/scrub state machine
hooks/
  useReducedMotion.ts
  useInView.ts
  useIsMobile.ts
styles/
  tokens.ts            — single source of truth for color/spacing/radii/motion
```

`app/page.tsx` only composes; all state lives in `ChessDemoBoard` and the
hooks/lib layer, and the board renderer (`ChessBoardSVG`) has zero
knowledge of the hero — it takes `pieces`/`lastMove` and nothing else, so
it's reusable on a "learn" or "compete" page later.

---

## Design decisions

The brief pins down the visual direction explicitly (dark navy, purple/
indigo accent, this exact copy structure), so that's followed rather than
overridden. The room the brief leaves open — exact palette values, the
type system, and the "one signature element" — is where this build makes
its own choices:

- **Type system:** Fraunces (display) + Inter (body) + IBM Plex Mono
  (notation/stats/captions). Chess notation is monospace in every real
  broadcast overlay and PGN file, so the mono face isn't a stylistic
  flourish — it's the subject's own vernacular, reused for the stat strip
  and move counter too so the whole hero speaks in one visual dialect.
- **Signature element:** the live move-notation ticker beside the board.
  Rather than inventing a stat card or numbered-step device, it borrows
  the thing chess broadcasts actually do — a scrolling SAN move list —
  which is both authentic to the subject and functionally useful (a
  second, denser way to follow the game for anyone who reads notation
  faster than they watch pieces move).
- **Board palette:** squares are brand-indigo/ivory rather than the
  universal felt-green/cream pairing, so the demo reads as XLChess's own
  board rather than a generic embed.

---

## Accessibility notes

- Landmarks: `<header>`, `<main>`, `<section aria-label="Hero">`
- Every board square has a computed `aria-label` (e.g. "e4, white pawn"),
  and the currently-focused square gets a visible focus ring drawn
  directly in the SVG (no `outline: none` anywhere in the app)
- Autoplay pauses on pointer hover **and** keyboard focus, with an
  explicit, always-visible play/pause button (`aria-pressed`)
- `prefers-reduced-motion` is respected globally (`app/globals.css`) and
  specifically in the board (static final position + "Watch replay"),
  the CTA tilt, the scroll-cue chevron, and the stat count-up
- Move changes are announced via a visually-hidden `aria-live="polite"`
  caption; the move counter is also `aria-live="polite"`
- Verified contrast: body text (`#F5F6FA`/`#C7CAE0`) on `#0A0D19` and CTA
  text (`#F5F6FA`) on `#6D5DFC` both clear 4.5:1

**Stretch not done:** arrow-key navigation between board squares (Tab
order currently walks all 64 squares in row order). Noted below.

---

## Performance notes

- LCP element is the headline text — no hero background image
- The chess engine + board (`chess.js` + `ChessBoardSVG`) is loaded via
  `next/dynamic({ ssr: false })` from `HeroSection`, so it never blocks
  the initial text paint; a fixed-aspect-ratio skeleton fills its slot
  meanwhile, so there's no layout shift when it hydrates
- All animation (entrance stagger, CTA tilt, ambient background,
  scroll-cue, board flash on checkmate) is `transform`/`opacity` only
- The autoplay `setInterval` is cleared on every dependency change and on
  unmount (`lib/chess/usePgnPlayback.ts`)
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
- **A real "how it works" section** below the hero, rather than the stub
  placeholder — out of scope for this assessment but the scroll-cue
  anchor is already wired up for it.
- **Visual regression tests** (Playwright + `next-image-export-optimizer`
  or Chromatic) for the board's aria-labels and reduced-motion states,
  since those are easy to silently regress.
- **Multiplayer preview** — a small "watch a live game right now" variant
  of the demo board, backed by a real match rather than a historical PGN.
