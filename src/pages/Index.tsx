import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import GallerySection from '@/components/GallerySection';

export default function Index() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const sections = ['home', 'about', 'gallery'];
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Navbar activeSection={activeSection} />
      <HeroSection />
      <AboutSection />
      <GallerySection />
      <footer className="py-8 text-center text-xs text-muted-foreground border-t border-border">
        © 2024 Widia Sari. All rights reserved.
      </footer>
    </div>
  );
}
