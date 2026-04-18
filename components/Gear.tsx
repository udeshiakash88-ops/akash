import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";
import styles from "./Gear.module.css";

const icons: Record<string, React.ReactNode> = {
  iphone: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  gimbal: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  drone: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M5 5h2l2 2M17 5h-2l-2 2M5 19h2l2-2M17 19h-2l-2-2M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4z" />
    </svg>
  ),
  mic: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  light: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  camera: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
  ),
  laptop: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  tripod: (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" /><path d="M12 6v4M12 10l-6 10M12 10l6 10M10 14h4" />
    </svg>
  ),
};

const defaultIcon = (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Gear() {
  const [gearList, setGearList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/gear")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(item => ({
            ...item,
            icon: icons[item.icon] || defaultIcon,
          }));
          setGearList(mapped);
        } else {
          setGearList([]);
        }
      })
      .catch(() => setGearList([]));
  }, []);

  if (gearList.length === 0) return null;

  return (
    <section id="gear" className={styles.section}>
      {/* Label */}
      <div className={styles.labelRow}>
        <span className={styles.labelLine} />
        <span className={styles.labelText}>Shooting Arsenal</span>
        <span className={styles.labelLine} />
      </div>

      {/* Heading */}
      <h2 className={styles.heading}>My Gear</h2>

      {/* Cards */}
      <motion.div
        className={styles.grid}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {gearList.map((item, i) => (
          <motion.div
            key={item.id}
            className={styles.card}
            variants={cardVariants}
            custom={i}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
          >
            <div className={styles.iconWrap}>{item.icon}</div>
            <div className={styles.cardBody}>
              <span className={styles.subtitle}>{item.subtitle}</span>
              <h3 className={styles.name}>{item.name}</h3>
              <p className={styles.desc}>{item.description}</p>
              <div className={styles.tags}>
                {(item.tags || []).map((tag: string) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className={styles.cardAccent} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
