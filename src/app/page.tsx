"use client";

import HeroSection from "@/components/sections/HeroSection";
import ManifestoSection from "@/components/sections/ManifestoSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ServicesSection from "@/components/sections/ServicesSection";
import LeadSelectorSection from "@/components/sections/LeadSelectorSection";
import Footer from "@/components/sections/Footer";
import CookieBanner from "@/components/core/CookieBanner";
import StickyNav from "@/components/core/StickyNav";

export default function HomePage() {
  return (
    <>
      <StickyNav />
      <main id="main-content">
        <HeroSection />
        <ManifestoSection />
        <ProjectsSection />
        <ServicesSection />
        <LeadSelectorSection />
        <Footer />
      </main>

      <CookieBanner />
    </>
  );
}
