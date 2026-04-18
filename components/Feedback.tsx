"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Feedback.module.css';

interface FeedbackItem {
  _id?: string;
  id?: number;
  avatar: string;
  brand: string;
  metric: string;
  name: string;
  role: string;
  text: string;
}

export default function Feedback() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resumeTimeoutRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);

  useEffect(() => {
    fetch("/api/feedback")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Double the list for seamless looping
          setFeedbackList([...data, ...data]);
        } else {
          setFeedbackList([]);
        }
      })
      .catch(() => setFeedbackList([]));
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || feedbackList.length <= 1) return;

    let animationFrameId: number;
    const speed = 1.0; // Higher = faster

    const scroll = () => {
      if (!isPaused && !isPointerDownRef.current) {
        container.scrollLeft += speed;

        // Create the seamless loop effect
        // When we reach the half-way point (the end of the first list),
        // we snap back to the start. The second copy ensures no gap.
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, feedbackList.length]);

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

  if (feedbackList.length === 0) return null;

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
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        onPointerDown={handlePointerStart}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className={styles.edgeFadeLeft} aria-hidden="true" />
        <div className={styles.edgeFadeRight} aria-hidden="true" />

        <div className={styles.marqueeTrack}>
          {feedbackList.map((item, index) => (
            <article
              key={`${item._id ?? item.id}-${index}`}
              className={styles.card}
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
              <p className={styles.feedbackText}>
                <span aria-hidden="true">&ldquo;</span>
                {item.text}
                <span aria-hidden="true">&rdquo;</span>
              </p>

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
