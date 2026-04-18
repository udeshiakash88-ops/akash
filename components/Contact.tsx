import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Contact.module.css';

const Contact = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const contactDetails = settings ? [
    settings.contactPhone ? {
      icon: "📞",
      label: "PHONE",
      value: settings.contactPhone,
      href: `tel:${settings.contactPhone.replace(/\s/g, '')}`,
    } : null,
    settings.contactEmail ? {
      icon: "✉️",
      label: "EMAIL",
      value: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
    } : null,
    settings.contactAddress ? {
      icon: "📍",
      label: "LOCATION",
      value: settings.contactAddress,
      href: `https://maps.google.com/?q=${encodeURIComponent(settings.contactAddress)}`,
    } : null,
    settings.languages ? {
      icon: "🌐",
      label: "LANGUAGES",
      value: settings.languages,
      href: null,
    } : null,
  ].filter(Boolean) : [];

  const [formData, setFormData] = useState({
    name: '',
    work: '',
    message: '',
    budget: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = settings?.contactPhone?.replace(/\D/g, '');
    if (!phoneDigits) {
      window.alert('Contact number is not configured yet.');
      return;
    }

    const { name, work, message, budget } = formData;
    
    const whatsappMessage = `*New Inquiry from Vision of Akash Portfolio*%0A%0A` +
      `*Name:* ${name}%0A` +
      `*Work/Project:* ${work}%0A` +
      `*Budget:* ${budget}%0A` +
      `*Message:* ${message}`;
      
    const whatsappUrl = `https://wa.me/${phoneDigits}?text=${whatsappMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="contact" className={styles.contactContainer}>
      <div className={styles.content}>
        <motion.div
          className={styles.textSide}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <p className={styles.label}>GET IN TOUCH</p>
          <h2 className={styles.title}>Let&apos;s Create Something Remarkable Together</h2>
          <p className={styles.description}>
            Ready to elevate your digital presence? Whether it&apos;s a social media campaign or a
            high-end video project, I&apos;m here to bring your vision to life.
          </p>

          <div className={styles.infoList}>
            {contactDetails.map((item) => (
              <div className={styles.infoItem} key={item.label}>
                <span className={styles.infoIcon}>{item.icon}</span>
                <div className={styles.infoText}>
                  <span className={styles.infoLabel}>{item.label}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className={styles.infoValue}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className={styles.infoValue}>{item.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.formSide}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>YOUR NAME</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter your name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>WORK / PROJECT TITLE</label>
              <input 
                type="text" 
                name="work" 
                placeholder="What project are we doing?" 
                value={formData.work}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>ESTIMATED BUDGET</label>
              <input 
                type="text" 
                name="budget" 
                placeholder="Enter your budget (Optional)" 
                value={formData.budget}
                onChange={handleChange}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>YOUR MESSAGE</label>
              <textarea 
                name="message" 
                placeholder="Tell me about your project in detail" 
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={!settings?.contactPhone}>SEND MESSAGE</button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
