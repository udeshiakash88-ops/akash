"use client"
import React, { useState, useEffect } from "react";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/Navbar";
import SplashScreen from "@/components/SplashScreen";

// Dynamically import client components to prevent SSR/Hydration issues
const PortfolioSection = dynamic(() => import("@/components/PortfolioSection"), { ssr: false });
const AboutMe = dynamic(() => import("@/components/AboutMe"), { ssr: false });
const Services = dynamic(() => import("@/components/Services"), { ssr: false });
const Education = dynamic(() => import("@/components/Education"), { ssr: false });
const Gear = dynamic(() => import("@/components/Gear"), { ssr: false });
const Feedback = dynamic(() => import("@/components/Feedback"), { ssr: false });
const Contact = dynamic(() => import("@/components/Contact"), { ssr: false });
import HeroVisuals from "@/components/HeroVisuals";

interface HeroStat {
  value: string;
  label: string;
}

interface HeroSocial {
  platform: string;
  url: string;
}

const getSocialIcon = (platform: string) => {
  const key = platform.toLowerCase();

  if (key.includes("instagram")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  
  if (key.includes("youtube")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 1.96C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    );
  }
  
  if (key.includes("facebook")) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3.1l.9-4H14V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
};

interface HomeSettings {
  heroSubTitle?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: string;
  stats?: HeroStat[];
  socials?: HeroSocial[];
  heroBadgeText?: string;
  heroBadgeShow?: boolean;
}

export default function Home() {
  const [settings, setSettings] = useState<HomeSettings | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const { scrollYProgress } = useScroll();
  const textY = useTransform(scrollYProgress, [0, 0.35], ["0%", "15%"]);
  const heroStats = (settings?.stats ?? []).filter((stat) => stat.value || stat.label);
  const heroSocials = (settings?.socials ?? []).filter((social) => social.platform && social.url);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setSettings(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2000);
    document.body.classList.toggle("splash-active", showSplash);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("splash-active");
    };
  }, [showSplash]);

  useEffect(() => {
    if (showSplash) return;

    const selectors = [
      ".hero-label",
      ".hero-heading",
      ".hero-para",
      ".hero-stats",
      ".hero-cta-row",
      ".hero-socials-v2",
      ".live-floating-btn",
      ".timeline-item__label",
      ".aboutContainer .skillCardSingle",
      ".section .featuredCard",
      ".section .grid > *",
      ".portfolioContainer .header",
      ".portfolioContainer .card",
      ".feedbackContainer .header",
      ".feedbackContainer .card",
      ".contactContainer .infoItem",
      ".contactContainer .inputGroup",
      ".contactContainer .submitBtn",
    ];

    const elements = selectors
      .flatMap((selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)))
      .filter((element, index, arr) => arr.indexOf(element) === index);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    elements.forEach((element, index) => {
      if (!element.classList.contains("reveal-on-scroll")) {
        element.classList.add("reveal-on-scroll");
      }
      element.style.setProperty("--reveal-delay", `${Math.min((index % 8) * 70, 490)}ms`);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [showSplash, settings]);

  return (
    <div className="flex flex-col min-h-screen" style={{ overflowX: 'hidden' }}>
      <SplashScreen visible={showSplash} onSkip={() => setShowSplash(false)} />
      <Navbar />

      {!showSplash ? (
        <motion.main
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* ── HERO SECTION ─────────────────────────────────── */}
          <section id="home" className="hero-v2">
            {/* LEFT — Content Panel */}
            <motion.div
              className="hero-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="hero-label"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="label-line" />
                <span className="label-text">{settings?.heroSubTitle}</span>
              </motion.div>

              <motion.h1
                className="hero-heading"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                 <span className="heading-thin">{settings?.heroTitle?.split(' ')[0]}</span>
                <br />
                <span className="heading-bold">{settings?.heroTitle?.split(' ').slice(1).join(' ')}</span>
              </motion.h1>

              <motion.p
                className="hero-para"
                style={{ y: textY }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                {settings?.heroDescription}
              </motion.p>

              {heroStats.length > 0 && (
                <motion.div
                  className="hero-stats"
                  style={{ y: textY }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  {heroStats.map((stat, i: number) => (
                    <React.Fragment key={i}>
                      <div className="stat">
                        <span className="stat-num">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                      </div>
                      {i < heroStats.length - 1 && <div className="stat-divider" />}
                    </React.Fragment>
                  ))}
                </motion.div>
              )}

              <motion.div
                className="hero-cta-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <a href="#contact" className="btn-primary">
                  Start a Project
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
                <a href="#portfolio" className="btn-outline">View Work</a>
              </motion.div>

              {heroSocials.length > 0 && (
                <motion.div
                  className="hero-socials-v2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                >
                  {heroSocials.map((social, i: number) => (
                    <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="social-v2" title={social.platform}>
                      {getSocialIcon(social.platform)}
                    </a>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* RIGHT — Hero Visuals (extracted or kept inline but wrapped) */}
            <HeroVisuals scrollYProgress={scrollYProgress} heroImage={settings?.heroImage} />

            {/* Hero badge — only shown when enabled in settings */}
            {settings?.heroBadgeShow && settings?.heroBadgeText && (
            <motion.a
              href="#contact"
              className="live-floating-btn"
              initial={{ opacity: 0, y: -50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              transition={{ delay: 2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.05, y: -2, x: "-50%" }}
              whileTap={{ scale: 0.95, x: "-50%" }}
            >
              <span className="live-dot" />
              <span className="live-text">{settings.heroBadgeText}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </motion.a>
            )}
          </section>

          <AboutMe />
          <Services />
          <Education />
          <Gear />
          <PortfolioSection />
          <section id="feedback">
            <Feedback />
          </section>
          <Contact />
        </motion.main>
      ) : null}

      <footer className="footer-note"></footer>
    </div>
  );
}
