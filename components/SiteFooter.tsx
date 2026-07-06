const COLUMNS = [
  {
    title: "Product",
    links: ["Play", "Learn", "Compete", "Mobile apps"],
  },
  {
    title: "Resources",
    links: ["Opening explorer", "Puzzle archive", "Community forum", "API docs"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-container px-6 py-14 lg:px-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold text-paper-100">XLChess</p>
          <p className="mt-2 max-w-xs text-sm text-paper-500">
            A complete chess platform to play, learn, compete, and grow.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="font-mono text-xs uppercase tracking-widest text-paper-500">
              {column.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-paper-300 transition-colors hover:text-paper-100"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-ink-700 pt-6 text-xs text-paper-500">
        © {new Date().getFullYear()} XLChess. All rights reserved.
      </div>
    </footer>
  );
}
