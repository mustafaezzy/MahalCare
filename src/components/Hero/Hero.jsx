import React, { useState } from "react";
import { useRoster } from "../../context/RosterContext.jsx";
import { CalendarDays, ShieldCheck, ZoomIn, MapPin } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { getTodayISO, formatShortDate } from "../../utils/dateUtils.js";
import ImageZoomModal from "../ImageZoomModal/ImageZoomModal.jsx";
import "./Hero.css";

export default function Hero({ onBookClick }) {
  const { entries, meta, isDemo } = useRoster();
  const [zoomPhoto, setZoomPhoto] = useState(null);

  // Find doctor(s) scheduled for today
  const todayISO = getTodayISO();
  const todayDoctors = entries ? entries.filter((item) => item.date === todayISO) : [];
  const todayDoctor = todayDoctors.length > 0 ? todayDoctors[0] : null;

  // Parallax setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) * 2 - 1);
    mouseY.set((clientY / innerHeight) * 2 - 1);
  };

  const springConfig = { damping: 30, stiffness: 120 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const cardRotateX = useTransform(springY, [-1, 1], [8, -8]);
  const cardRotateY = useTransform(springX, [-1, 1], [-8, 8]);
  const cardTranslateX = useTransform(springX, [-1, 1], [-10, 10]);
  const cardTranslateY = useTransform(springY, [-1, 1], [-10, 10]);

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <section id="home" className="hero" onMouseMove={handleMouseMove} aria-labelledby="hero-heading">
      {/* Subtle Background Pattern */}
      <div className="hero__bg-pattern" aria-hidden="true" />
      <div className="hero__bg-glow hero__bg-glow--1" aria-hidden="true" />
      <div className="hero__bg-glow hero__bg-glow--2" aria-hidden="true" />

      <div className="container hero__inner">
        {/* Left: Copy */}
        <motion.div className="hero__copy" variants={stagger} initial="hidden" animate="show">
          <motion.span className="hero__eyebrow" variants={fadeUp}>
            <ShieldCheck size={14} aria-hidden="true" /> Powered by Umoor Sehhat Indore
          </motion.span>

          <motion.h1 id="hero-heading" className="hero__title" variants={fadeUp}>
            Find the right doctor, <br />right on time.
          </motion.h1>

          <motion.p className="hero__sub" variants={fadeUp}>
            Browse tomorrow's available doctors, explore the monthly roster,
            and book appointments with confidence—all from your phone or computer.
          </motion.p>



          <motion.div className="hero__status" variants={fadeUp} role="status" aria-live="polite">
            <span className="hero__pulse" aria-hidden="true" />
            {isDemo ? (
              <span>No active roster file uploaded yet. Please upload a schedule in the Admin Panel.</span>
            ) : (
              <span>
                Schedule verified and updated {meta?.uploadedAt ? new Date(meta.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "recently"}.
              </span>
            )}
          </motion.div>
        </motion.div>

        {/* Right: Today's Doctor Card (or Empty State if none) */}
        {todayDoctor ? (
          <div className="hero__art" aria-hidden="true">
            <motion.div
              className="hero__slip"
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", delay: 0.6, duration: 1.2, bounce: 0.2 }}
              style={{ rotateX: cardRotateX, rotateY: cardRotateY, x: cardTranslateX, y: cardTranslateY, transformStyle: "preserve-3d" }}
            >
              <div className="hero__slip-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <span className="hero__slip-label">TODAY'S DOCTOR</span>
                  <strong className="hero__slip-hospital">Mahal al Shifa</strong>
                </div>
                {todayDoctor.photo ? (
                  <div
                    style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => setZoomPhoto({ src: todayDoctor.photo, name: todayDoctor.doctorName })}
                    title="Click to zoom photo"
                  >
                    <img
                      src={todayDoctor.photo}
                      alt={todayDoctor.doctorName}
                      style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                      <ZoomIn size={16} />
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d4f4f, #149191)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0 }}>
                    {todayDoctor.doctorName.replace(/^Dr\.?\s*/i, "").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hero__slip-body">
                <div className="hero__slip-row">
                  <span className="hero__slip-key">Doctor</span>
                  <span className="hero__slip-value hero__slip-value--accent">{todayDoctor.doctorName}</span>
                </div>
                <div className="hero__slip-row">
                  <span className="hero__slip-key">Specialty</span>
                  <span className="hero__slip-value">{todayDoctor.specialty}</span>
                </div>
                <div className="hero__slip-row">
                  <span className="hero__slip-key">Time</span>
                  <span className="hero__slip-value hero__slip-value--green">{todayDoctor.timing}</span>
                </div>
                <div className="hero__slip-row">
                  <span className="hero__slip-key">Date</span>
                  <span className="hero__slip-value hero__slip-value--mono">{formatShortDate(todayDoctor.date)}, {todayDoctor.date.split('-')[0]}</span>
                </div>
                <div className="hero__slip-row">
                  <span className="hero__slip-key">Location</span>
                  <span className="hero__slip-value">Indore Saifee Nagar</span>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="hero__art" aria-hidden="true">
            <motion.div
              className="hero__slip"
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", delay: 0.6, duration: 1.2, bounce: 0.2 }}
              style={{ rotateX: cardRotateX, rotateY: cardRotateY, x: cardTranslateX, y: cardTranslateY, transformStyle: "preserve-3d", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', textAlign: 'center', background: '#fafff9' }}
            >
              <div style={{ padding: '16px', background: 'rgba(15, 118, 110, 0.1)', borderRadius: '50%', color: '#0f766e', marginBottom: '20px' }}>
                <CalendarDays size={40} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: '#0a3d3d', marginBottom: '8px', fontWeight: '800', fontFamily: 'Sora, Inter, sans-serif' }}>No Doctor Today</h3>
              <p style={{ color: '#7da3a3', fontSize: '0.95rem', lineHeight: '1.5' }}>There are no doctors scheduled for today. Please check tomorrow's schedule below.</p>
            </motion.div>
          </div>
        )}
      </div>

      {zoomPhoto && (
        <ImageZoomModal
          src={zoomPhoto.src}
          alt={zoomPhoto.name}
          onClose={() => setZoomPhoto(null)}
        />
      )}
    </section>
  );
}
