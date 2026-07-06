import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroSection } from "@/components/hero/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { CraftedSection } from "@/components/sections/CraftedSection";
import { LearnSection } from "@/components/sections/LearnSection";
import { CompeteSection } from "@/components/sections/CompeteSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CraftedSection />
        <LearnSection />
        <CompeteSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <SiteFooter />
    </>
  );
}
