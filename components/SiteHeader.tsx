export function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-ink-700/60">
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-5 lg:px-10">
        <a href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold">
          <KnightMark />
          XLChess
        </a>
        <nav aria-label="Primary" className="hidden gap-8 text-sm text-paper-300 sm:flex">
          <a href="#how-it-works" className="transition-colors hover:text-paper-100">
            How it works
          </a>
          <a href="#learn" className="transition-colors hover:text-paper-100">
            Learn
          </a>
          <a href="#compete" className="transition-colors hover:text-paper-100">
            Compete
          </a>
        </nav>
        <a
          href="/play"
          className="rounded-md border border-ink-600 px-4 py-2 text-sm font-medium text-paper-100 transition-colors hover:border-accent-400 hover:text-accent-400"
        >
          Sign in
        </a>
      </div>
    </header>
  );
}

function KnightMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-accent-400">
      <path d="M19 21H5v-2h1v-1.5c0-1.4.7-2.6 1.8-3.4L9 13V9c0-2.8 2.2-5 5-5 .6 0 1.1.4 1.2 1l1.6 6.5c.3 1.2-.2 2.4-1.2 3.1l-2.1 1.5c-.6.4-.9 1-.9 1.7V19h1v2h5v0Zm-8-9.5c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1Z" />
    </svg>
  );
}
