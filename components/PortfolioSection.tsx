import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getDirectImageUrl } from '@/lib/imageUtils';
import styles from './PortfolioSection.module.css';

interface Project {
  _id?: string;
  id?: number;
  title: string;
  category: string;
  image: string;
  link: string;
  stats: { likes: string; views: string };
}

const PortfolioSection = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const requestRef = React.useRef<number>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const r = await fetch("/api/projects");
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        } else {
          setProjects([]);
        }
      } catch (err) {
        setProjects([]);
      }
    }
    loadProjects();
  }, []);

  // Smooth auto-scroll logic
  const animate = useCallback(() => {
    if (!scrollContainerRef.current || isPaused) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const container = scrollContainerRef.current;
    
    // Right to left scroll
    container.scrollLeft += 0.8; // Speed

    // Reset loop if halfway through (since we have 2 groups)
    if (container.scrollLeft >= container.scrollWidth / 2) {
      container.scrollLeft = 0;
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [isPaused]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cardWidth = container.querySelector(`.${styles.card}`)?.clientWidth || 300;
    const scrollAmount = cardWidth + 20; // card + gap
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
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
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className={styles.edgeFadeLeft} aria-hidden="true" />
        <div className={styles.edgeFadeRight} aria-hidden="true" />

        {/* Manual Navigation Buttons */}
        <div className={styles.controls}>
          <button 
            className={`${styles.navBtn} ${styles.prev}`} 
            onClick={() => handleScroll('left')}
            aria-label="Previous reel"
          >
            ←
          </button>
          <button 
            className={`${styles.navBtn} ${styles.next}`} 
            onClick={() => handleScroll('right')}
            aria-label="Next reel"
          >
            →
          </button>
        </div>

        <div className={styles.marqueeTrack}>
          {[0, 1].map((group) => (
            <div key={group} className={styles.marqueeGroup} aria-hidden={group === 1}>
              {projects.map((project, index) => (
                <a 
                  key={`${group}-${project._id ?? project.id}-${index}`}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  <span className={styles.playBadge} aria-hidden="true">▶</span>
                  <div className={styles.imageWrapper}>
                    <Image 
                      src={getDirectImageUrl(project.image)} 
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
