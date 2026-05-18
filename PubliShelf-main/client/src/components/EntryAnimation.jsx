import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirstVisit } from '../context/FirstVisitContext.jsx';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';

const brandBg = '#1f1633';
const brandGold = '#d97706';
const brandPaper = '#faf5ff';

const containerVariants = {
  initial: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 1, ease: 'easeOut' } },
};

const portalVariants = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { duration: 1.0, ease: [0.34, 1.56, 0.64, 1] },
  },
};

const shelfVariants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: (i) => ({
    scaleX: 1,
    opacity: 1,
    transition: { delay: 0.9 + i * 0.18, duration: 0.7, ease: 'easeOut' },
  }),
};

const bookVariants = {
  initial: { scaleY: 0, opacity: 0 },
  animate: (i) => ({
    scaleY: 1,
    opacity: 1,
    transition: { delay: 1.4 + i * 0.09, duration: 0.5, ease: 'easeOut' },
  }),
};

const particleVariants = {
  initial: { y: 100, opacity: 0 },
  animate: (i) => ({
    y: -150,
    opacity: [0, 0.6, 0],
    transition: {
      delay: 0.5 + i * 0.2,
      duration: 3,
      ease: 'linear',
      repeat: Infinity,
      repeatDelay: 1,
    },
  }),
};

export default function EntryAnimation() {
  const { isFirstVisit, markVisited } = useFirstVisit();
  const location = useLocation();
  const { theme } = useTheme();

  const isLanding = location.pathname === '/';

  const brandAccent = theme === 'ocean' ? '#4f8ca8' : '#7c3aed';
  const brandSecondary = theme === 'ocean' ? '#385460' : '#6366f1';

  useEffect(() => {
    if (!isFirstVisit || !isLanding) return;
    const timeout = setTimeout(() => markVisited(), 5000);
    return () => clearTimeout(timeout);
  }, [isFirstVisit, isLanding, markVisited]);

  const books = [
    { color: '#dc2626', width: 16, height: 80 },
    { color: brandAccent, width: 22, height: 85 },
    { color: '#059669', width: 18, height: 75 },
    { color: brandSecondary, width: 20, height: 82 },
    { color: '#ea580c', width: 24, height: 78 },
    { color: '#0891b2', width: 17, height: 88 },
    { color: brandAccent, width: 21, height: 76 },
  ];

  return (
    <AnimatePresence>
      {isFirstVisit && isLanding && (
        <motion.div
          initial="initial"
          exit="exit"
          variants={containerVariants}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            background: `linear-gradient(to bottom, #f3e8ff, #faf5ff)`,
            overflow: 'hidden',
          }}
        >
          {/* Floating dust particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={particleVariants}
              initial="initial"
              animate="animate"
              style={{
                position: 'absolute',
                left: `${15 + i * 7}%`,
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: brandGold,
                filter: 'blur(1px)',
              }}
            />
          ))}

          <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            {/* Ornate portal frame */}
            <motion.div
              variants={portalVariants}
              initial="initial"
              animate="animate"
              style={{
                width: 320,
                height: 380,
                position: 'relative',
                borderRadius: 20,
                background: `linear-gradient(135deg, ${brandAccent}20, transparent)`,
                border: `2px solid ${brandGold}40`,
                boxShadow: `0 0 60px ${brandAccent}40, inset 0 0 40px ${brandAccent}15`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {/* Corner ornaments */}
              {[0, 90, 180, 270].map((rotation, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.7 }}
                  transition={{ delay: 0.7 + idx * 0.12, duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    width: 30,
                    height: 30,
                    ...(rotation === 0 && { top: -2, left: -2 }),
                    ...(rotation === 90 && { top: -2, right: -2 }),
                    ...(rotation === 180 && { bottom: -2, right: -2 }),
                    ...(rotation === 270 && { bottom: -2, left: -2 }),
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  <svg viewBox="0 0 30 30" fill="none">
                    <path
                      d="M2 2 L15 2 L15 8 M2 2 L2 15 L8 15"
                      stroke={brandGold}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="15" cy="15" r="2" fill={brandGold} opacity="0.6" />
                  </svg>
                </motion.div>
              ))}

              {/* Library shelves with books */}
              <div style={{ position: 'relative', width: 240 }}>
                {[0, 1, 2].map((shelfIdx) => (
                  <div
                    key={shelfIdx}
                    style={{
                      position: 'relative',
                      marginBottom: 35,
                      height: 90,
                    }}
                  >
                    {/* Shelf */}
                    <motion.div
                      custom={shelfIdx}
                      variants={shelfVariants}
                      initial="initial"
                      animate="animate"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 8,
                        background: `linear-gradient(180deg, ${brandGold}, #92400e)`,
                        borderRadius: 2,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        transformOrigin: 'center',
                      }}
                    />

                    {/* Books on shelf */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 3,
                        alignItems: 'flex-end',
                      }}
                    >
                      {books.map((book, bookIdx) => (
                        <motion.div
                          key={bookIdx}
                          custom={bookIdx + shelfIdx * 7}
                          variants={bookVariants}
                          initial="initial"
                          animate="animate"
                          style={{
                            width: book.width,
                            height: book.height,
                            background: `linear-gradient(180deg, ${book.color}, ${book.color}dd)`,
                            borderRadius: '2px 2px 0 0',
                            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)',
                            transformOrigin: 'bottom',
                            position: 'relative',
                          }}
                        >
                          {/* Book spine detail */}
                          <div
                            style={{
                              position: 'absolute',
                              top: 8,
                              left: 0,
                              right: 0,
                              height: 2,
                              background: 'rgba(255,255,255,0.15)',
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Title with enhanced letter reveal */}
            <div style={{ display: 'flex', gap: 3, marginTop: 42, position: 'relative' }}>
              {/* Expanding underline */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.4 }}
                transition={{ delay: 2.8, duration: 0.85, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  bottom: -6,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${brandGold}, transparent)`,
                  borderRadius: 2,
                  transformOrigin: 'center',
                }}
              />
              
              {Array.from('PubliShelf').map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: -30, scale: 0.5, rotateZ: -15 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1, 
                    rotateZ: 0,
                  }}
                  transition={{ 
                    delay: 2.0 + i * 0.1, 
                    duration: 0.65, 
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  style={{
                    color: '#1f2937',
                    fontSize: 38,
                    fontWeight: 800,
                    letterSpacing: 2,
                    textShadow: `0 2px 4px rgba(124, 58, 237, 0.3), 0 0 20px rgba(124, 58, 237, 0.2)`,
                    transformStyle: 'preserve-3d',
                    position: 'relative',
                    display: 'inline-block',
                  }}
                >
                  {ch}
                  {/* Sparkle effect */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                    transition={{ delay: 2.0 + i * 0.1 + 0.35, duration: 0.65 }}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -4,
                      width: 8,
                      height: 8,
                      background: brandGold,
                      borderRadius: '50%',
                      boxShadow: `0 0 12px ${brandGold}`,
                    }}
                  />
                </motion.span>
              ))}
            </div>

            {/* Enhanced Tagline with typewriter effect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.2, duration: 0.7 }}
              style={{
                marginTop: 20,
                padding: '10px 28px',
                background: `linear-gradient(90deg, transparent, ${brandAccent}25, transparent)`,
                borderRadius: 24,
                border: `1px solid ${brandGold}40`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Shimmer effect across tagline */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ delay: 3.5, duration: 1.2, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '50%',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, ${brandGold}30, transparent)`,
                  pointerEvents: 'none',
                }}
              />
              
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                {Array.from('Where Rare Pages Meet Modern Shelves').map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.2 + i * 0.03, duration: 0.12 }}
                    style={{
                      color: brandAccent,
                      fontSize: 13,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    {ch === ' ' ? '\u00A0' : ch}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Magical glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1.2 }}
              transition={{ delay: 1.0, duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
              style={{
                position: 'absolute',
                width: 280,
                height: 280,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${brandAccent}30, transparent 70%)`,
                filter: 'blur(40px)',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
