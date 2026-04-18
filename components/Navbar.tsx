"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Navbar.module.css";

interface NavbarSettings {
  heroTitle?: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<NavbarSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setSettings(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const goToAdmin = () => {
    closeMenu();
    window.location.href = "/admin";
  };

  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    opened: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  } as const;

  const linkVariants = {
    closed: { opacity: 0, y: 20 },
    opened: { opacity: 1, y: 0 },
  } as const;

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Education", href: "#education" },
    { name: "Gear", href: "#gear" },
    { name: "Portfolio", href: "#portfolio" },
    { name: "Feedback", href: "#feedback" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className={`${styles.navbarContainer} ${isScrolled ? styles.scrolled : ""}`}>
      <Link href="/#" className={styles.logoLink} onClick={closeMenu}>
        <span className="logo-circle">A</span>
        <span className={styles.logoText}>
          {settings?.heroTitle?.split(' ')[0] || "Vision"} <span className={styles.lower}>{settings?.heroTitle?.split(' ')[1] || "of"}</span> {settings?.heroTitle?.split(' ').slice(2).join(' ') || "Akash"}
        </span>
      </Link>

      {/* Desktop Links */}
      <nav className={styles.links}>
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href}>
            {link.name}
          </Link>
        ))}
        <Link href="/admin" className={styles.adminBtn} onClick={goToAdmin}>
          Admin
        </Link>
      </nav>

      {/* Mobile Toggle */}
      <button 
        className={`${styles.mobileToggle} ${isOpen ? styles.isOpen : ""}`} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <div className={styles.hamburger}></div>
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial="closed"
            animate="opened"
            exit="closed"
            variants={menuVariants}
          >
            {navLinks.map((link) => (
              <motion.div key={link.name} variants={linkVariants}>
                <Link href={link.href} onClick={closeMenu}>
                  {link.name}
                </Link>
              </motion.div>
            ))}
            <motion.div variants={linkVariants}>
              <Link href="/admin" onClick={goToAdmin} style={{ color: "var(--accent-color)", fontWeight: 700 }}>
                Admin Login
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
