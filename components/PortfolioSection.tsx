"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getDirectImageUrl, getInstagramCoverUrl } from '@/lib/imageUtils';
import styles from './PortfolioSection.module.css';

interface Project {
  _id?: string;
  id?: number;
  title: string;
  category: string;
  image?: string;
  link: string;
  stats: { likes: string; views: string };
}

const PortfolioSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        const r = await fetch("/api/projects");
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          // Double the projects list for seamless looping
          setProjects([...data, ...data]);
        } else {
          setProjects([]);
        }
      } catch {
        setProjects([]);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || projects.length <= 1) return;

    let animationFrameId: number;
    const speed = 1.0; // Higher = faster

    const scroll = () => {
      if (!isPaused && !isPointerDownRef.current) {
        container.scrollLeft += speed;

        // Infinite loop reset
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, projects.length]);

  const scheduleResume = () => {
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => {
      isPointerDownRef.current = false;
      setIsPaused(false);
    }, 1500);
  };

  const handlePointerStart = () => {
    isPointerDownRef.current = true;
    setIsPaused(true);
  };

  const handlePointerEnd = () => {
    scheduleResume();
  };

  const handleHoverStart = () => {
    if (!isPointerDownRef.current) {
      setIsPaused(true);
    }
  };

  const handleHoverEnd = () => {
    if (!isPointerDownRef.current) {
      setIsPaused(false);
    }
  };

  const getProjectImageSrc = (project: Project): string => {
    if (project.image?.trim()) {
      return getDirectImageUrl(project.image);
    }

    return getInstagramCoverUrl(project.link) || '/assets/img3.jpeg';
  };

  if (projects.length === 0) return null;

  return (
    <section id="portfolio" className={styles.portfolioContainer}>
      <div className={styles.backgroundGlow} aria-hidden="true" />
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <p className={styles.label}>MY WORK</p>
        <h2 className={styles.title}>Some of My Trending Reels</h2>
      </motion.div>

      <div
        className={styles.marqueeShell}
        ref={scrollContainerRef}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        onPointerDown={handlePointerStart}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className={styles.edgeFadeLeft} aria-hidden="true" />
        <div className={styles.edgeFadeRight} aria-hidden="true" />

        <div className={styles.marqueeTrack}>
          {projects.map((project, index) => (
            <a 
              key={`${project._id ?? project.id}-${index}`}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
            >
              <span className={styles.playBadge} aria-hidden="true">▶</span>
              <div className={styles.imageWrapper}>
                <Image 
                  src={getProjectImageSrc(project)}
                  alt={project.title} 
                  fill 
                  className={styles.image}
                  unoptimized={true}
                  sizes="(max-width: 768px) 80vw, 320px"
                />
                <div className={styles.overlay}>
                  <div className={styles.projectInfo}>
                    <p className={styles.projectCategory}>{project.category}</p>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                  </div>
                  <div className={styles.cardStats}>
                     <div className={styles.stat}>
                       <span className={styles.statVal}>{project.stats.likes}</span>
                        <span className={styles.statLabel}>LIKES</span>
                     </div>
                     <div className={styles.stat}>
                       <span className={styles.statVal}>{project.stats.views}</span>
                        <span className={styles.statLabel}>VIEWS</span>
                     </div>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
