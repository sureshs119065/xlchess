import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const LEADERBOARD = [
  { rank: 1, handle: "Kestrel_Endgame", rating: 2412, trend: "+18" },
  { rank: 2, handle: "quietfianchetto", rating: 2389, trend: "+6" },
  { rank: 3, handle: "rook_lift_or_die", rating: 2371, trend: "-4" },
  { rank: 4, handle: "PawnStormCarla", rating: 2358, trend: "+22" },
  { rank: 5, handle: "d4_forever", rating: 2340, trend: "+2" },
];

const COMPETE_STATS = [
  { label: "Players in this week's ladder", value: "38,200" },
  { label: "Tournaments running right now", value: "142" },
  { label: "Average queue time", value: "9s" },
];

export function CompeteSection() {
  return (
    <section id="compete" aria-label="Compete" className="scroll-mt-20 border-b border-ink-700">
      <div className="mx-auto max-w-container px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Compete"
              title="A ladder that actually moves"
              description="Weekly tournaments, a live global leaderboard, and rating brackets tight enough that every game means something."
            />

            <RevealOnScroll delay={0.1} className="mt-8 grid grid-cols-3 gap-4">
              {COMPETE_STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-mono text-xl font-medium text-signal-500">{stat.value}</p>
                  <p className="mt-1 text-xs text-paper-500">{stat.label}</p>
                </div>
              ))}
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.15}>
            <div className="overflow-hidden rounded-lg border border-ink-600 bg-ink-800/60">
              <div className="flex items-center justify-between border-b border-ink-600 px-5 py-3">
                <p className="font-mono text-[11px] uppercase tracking-widest text-signal-500">
                  Global ladder · Blitz
                </p>
                <p className="font-mono text-[11px] text-paper-500">Live</p>
              </div>
              <ol className="divide-y divide-ink-600">
                {LEADERBOARD.map((player) => (
                  <li
                    key={player.rank}
                    className="flex items-center justify-between px-5 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-mono text-paper-500">{player.rank}</span>
                      <span className="font-medium text-paper-100">{player.handle}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-paper-300">{player.rating}</span>
                      <span
                        className={player.trend.startsWith("+") ? "text-state-success" : "text-state-danger"}
                      >
                        {player.trend}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
