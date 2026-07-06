import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const COURSES = [
  {
    level: "Beginner",
    title: "Opening Repertoire Builder",
    description: "Pick one opening per color and drill it until it's automatic — no memorization grind.",
    lessons: 24,
    progress: 0,
  },
  {
    level: "Intermediate",
    title: "Endgame Fundamentals",
    description: "King and pawn endings, the Lucena position, and the handful of patterns that decide most amateur games.",
    lessons: 18,
    progress: 45,
  },
  {
    level: "Advanced",
    title: "Tactics Vision Training",
    description: "Timed puzzle sets built from your own recent losses, so you drill the patterns you actually miss.",
    lessons: 32,
    progress: 12,
  },
];

const LEVEL_STYLES: Record<string, string> = {
  Beginner: "bg-state-success/15 text-state-success",
  Intermediate: "bg-signal-subtle text-signal-500",
  Advanced: "bg-accent-subtle text-accent-400",
};

export function LearnSection() {
  return (
    <section id="learn" aria-label="Learn" className="scroll-mt-20 border-b border-ink-700">
      <div className="mx-auto max-w-container px-6 py-20 lg:px-10 lg:py-28">
        <SectionHeading
          eyebrow="Learn"
          title="Structured lessons that remember where you left off"
          description="Every course adapts to the games you've actually played — not a fixed curriculum everyone gets."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {COURSES.map((course, index) => (
            <RevealOnScroll key={course.title} delay={index * 0.08}>
              <div className="flex h-full flex-col rounded-lg border border-ink-600 bg-ink-800/50 p-6">
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${LEVEL_STYLES[course.level]}`}
                >
                  {course.level}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-paper-100">
                  {course.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-paper-300">{course.description}</p>

                <div className="mt-6">
                  <div className="flex items-center justify-between font-mono text-xs text-paper-500">
                    <span>{course.lessons} lessons</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-600">
                    <div
                      className="h-full rounded-full bg-accent-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
