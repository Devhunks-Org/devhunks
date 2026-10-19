"use client";

import { useState, useCallback } from "react";
import Preloader from "@/components/core/Preloader";
import Navbar from "@/components/core/Navbar";
import MenuOverlay from "@/components/core/MenuOverlay";
import CookieBanner from "@/components/core/CookieBanner";
import HeroSection from "@/components/sections/HeroSection";
import ManifestoSection from "@/components/sections/ManifestoSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ServicesSection from "@/components/sections/ServicesSection";
import LeadSelectorSection from "@/components/sections/LeadSelectorSection";
import Footer from "@/components/sections/Footer";

export default function HomePage() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    setReady(true);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <>
      {/* Preloader — renders on top until complete */}
      {!ready && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Navigation */}
      <Navbar onMenuToggle={toggleMenu} menuOpen={menuOpen} />

      {/* Full-screen crimson overlay menu */}
      <MenuOverlay isOpen={menuOpen} onClose={closeMenu} />

      {/* Main content */}
      <main id="main-content">
        <HeroSection ready={ready} />
        <ManifestoSection />
        <ProjectsSection />
        <ServicesSection />
        <LeadSelectorSection />
        <Footer />
      </main>

      {/* Cookie banner */}
      <CookieBanner />
    </>
  );
}
