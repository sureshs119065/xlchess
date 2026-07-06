import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <RevealOnScroll className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-500">{eyebrow}</p>
      <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight text-paper-100 sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-paper-300">{description}</p>}
    </RevealOnScroll>
  );
}
