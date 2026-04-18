import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { getDirectImageUrl } from '@/lib/imageUtils'; // Assuming avatars might use this if they are URLs
import styles from './Feedback.module.css';

export default function Feedback() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    fetch("/api/feedback")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFeedbackList(data);
        } else {
          setFeedbackList([]);
        }
      })
      .catch(() => setFeedbackList([]));
  }, []);

  const animate = useCallback(() => {
    if (!scrollContainerRef.current || isPaused) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const container = scrollContainerRef.current;
    container.scrollLeft += 0.6; // Slightly slower speed for reading

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
    const cardWidth = container.querySelector(`.${styles.card}`)?.clientWidth || 360;
    const scrollAmount = cardWidth + 24; // card + gap
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (feedbackList.length === 0) return null;

  // Duplicate for infinite scroll
  const marqueeTestimonials = [...feedbackList, ...feedbackList];

  return (
    <section className={styles.feedbackContainer}>
      <div className={styles.backdropGlow} aria-hidden="true" />
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <p className={styles.label}>TESTIMONIALS</p>
        <h2 className={styles.title}>What People Say</h2>
        <p className={styles.subtitle}>
          Creators, founders ane brands taraf thi real feedback, jemne content ma strong impact ane premium visual quality joi ti hati.
        </p>
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

        <div className={styles.controls}>
          <button 
            className={`${styles.navBtn} ${styles.prev}`} 
            onClick={() => handleScroll('left')}
            aria-label="Previous testimonial"
          >
            ←
          </button>
          <button 
            className={`${styles.navBtn} ${styles.next}`} 
            onClick={() => handleScroll('right')}
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>

        <div className={styles.marqueeTrack}>
          {marqueeTestimonials.map((item, index) => (
            <article
              key={`${item._id ?? item.id}-${index}`}
              className={styles.card}
              aria-hidden={index >= feedbackList.length}
            >
              <div className={styles.cardTopLine} />
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>{item.avatar}</div>
                <div className={styles.identity}>
                  <h4 className={styles.name}>{item.name}</h4>
                  <p className={styles.role}>{item.role}</p>
                </div>
              </div>

              <p className={styles.rating}>★★★★★</p>
              <p className={styles.feedbackText}>"{item.text}"</p>

              <div className={styles.cardFooter}>
                <span className={styles.brand}>{item.brand}</span>
                <span className={styles.metric}>{item.metric}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
