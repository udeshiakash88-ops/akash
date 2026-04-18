import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Feedback.module.css';

export default function Feedback() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);

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

  if (feedbackList.length === 0) return null;

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

      <div className={styles.marqueeShell}>
        <div className={styles.edgeFadeLeft} aria-hidden="true" />
        <div className={styles.edgeFadeRight} aria-hidden="true" />

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
