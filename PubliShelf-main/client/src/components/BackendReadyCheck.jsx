import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { checkBackendHealth } from '../store/slices/backendSlice';
import { useTheme } from '../context/ThemeContext';

const brandBg = '#1f1633';
const brandGold = '#d97706'; 

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const shelfVariants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

const bookSlideVariants = {
  animate: (i) => ({
    x: [0, -5, 0],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
      delay: i * 0.2,
    },
  }),
};

const dotVariants = {
  animate: (i) => ({
    y: [0, -10, 0],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.2,
      ease: 'easeInOut',
      repeat: Infinity,
      delay: i * 0.2,
    },
  }),
};

export default function BackendReadyCheck() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isReady } = useSelector((state) => state.backend);
  const { theme } = useTheme();
  const [statusMessage, setStatusMessage] = useState('Waking up the bookshelf...');
  const [showLoader, setShowLoader] = useState(false);

  const brandAccent = theme === 'ocean' ? '#4f8ca8' : '#7c3aed';
  const brandSecondary = theme === 'ocean' ? '#385460' : '#6366f1';

  const routesNeedingBackend = [
    '/',
    '/login',
    '/register',
    '/buyer/dashboard',
    '/buyer/checkout',
    '/buyer/profile',
    '/buyer/cart',
    '/publisher/',
    '/manager/',
    '/admin/'
  ];

  const needsBackend = routesNeedingBackend.some(route => 
    location.pathname.startsWith(route)
  );

  useEffect(() => {
    if (!needsBackend) return;
    const timer = setTimeout(() => setShowLoader(true), 1000);
    return () => clearTimeout(timer);
  }, [needsBackend]);

  useEffect(() => {
    if (isReady) return;

    let attempts = 0;
    let timeoutId;

    const poll = async () => {
      if (isReady) return;

      attempts += 1;
      dispatch(checkBackendHealth());

      if (attempts > 25)
        setStatusMessage('Almost there... Dusting off the pages...');
      else if (attempts > 15)
        setStatusMessage('Still setting up... Arranging the books...');
      else if (attempts > 8)
        setStatusMessage('Taking a bit longer... Opening the shelves...');

      const delay = Math.min(
        5000 * Math.pow(2, Math.floor(attempts / 3)),
        30000
      );

      timeoutId = setTimeout(poll, delay);
    };

    timeoutId = setTimeout(poll, 5000);
    return () => clearTimeout(timeoutId);
  }, [dispatch, isReady]);

  if (!needsBackend) {
    return null;
  }

  if (!showLoader) {
    return null;
  } 

  return (
    <AnimatePresence>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={containerVariants}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(to bottom, #f3e8ff, #faf5ff)`,
          overflow: 'hidden',
        }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            initial={{ y: 100, opacity: 0 }}
            animate={{
              y: -150,
              opacity: [0, 0.3, 0],
            }}
            transition={{
              delay: i * 0.5,
              duration: 4,
              ease: 'linear',
              repeat: Infinity,
            }}
            style={{
              position: 'absolute',
              left: `${10 + i * 12}%`,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: brandAccent,
            }}
          />
        ))}

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.div
            variants={shelfVariants}
            animate="animate"
            style={{
              width: 180,
              marginBottom: 40,
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: 4,
                marginBottom: 8,
              }}
            >
              {[
                { color: brandAccent, height: 85, width: 28 },
                { color: brandGold, height: 75, width: 24 },
                { color: brandSecondary, height: 90, width: 26 },
                { color: '#10b981', height: 80, width: 30 },
                { color: '#f59e0b', height: 88, width: 25 },
              ].map((book, i) => (
                <motion.div
                  key={`book-${i}`}
                  custom={i}
                  variants={bookSlideVariants}
                  animate="animate"
                  style={{
                    width: book.width,
                    height: book.height,
                    background: `linear-gradient(180deg, ${book.color}, ${book.color}dd)`,
                    borderRadius: '3px 3px 0 0',
                    border: `2px solid ${book.color}`,
                    borderBottom: 'none',
                    boxShadow: `0 4px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '10%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60%',
                      height: 1,
                      background: 'rgba(255,255,255,0.3)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '15%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '50%',
                      height: 1,
                      background: 'rgba(255,255,255,0.3)',
                    }}
                  />
                </motion.div>
              ))}
            </div>
            
            <div
              style={{
                width: '100%',
                height: 8,
                background: `linear-gradient(180deg, ${brandGold}, #b45309)`,
                borderRadius: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              marginBottom: 16,
              textAlign: 'center',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              color: brandBg,
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.15rem',
              maxWidth: '600px',
            }}
          >
            {statusMessage.split('').map((char, index) => (
              <motion.span
                key={`char-${index}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 1],
                  scale: [0, 1.2, 1, 1],
                }}
                transition={{
                  duration: 5,
                  ease: 'easeOut',
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: index * 0.075,
                  times: [0, 0.2, 0.4, 1],
                }}
                style={{
                  display: 'inline-block',
                  whiteSpace: char === ' ' ? 'pre' : 'normal',
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 24,
              justifyContent: 'center',
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`dot-${i}`}
                custom={i}
                variants={dotVariants}
                animate="animate"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: brandAccent,
                }}
              />
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: '0.95rem',
              color: brandBg,
              textAlign: 'center',
              maxWidth: 400,
              padding: '0 20px',
            }}
          >
            This may take up to 90 seconds on first load
          </motion.p>
        </div>

        <svg
          style={{
            position: 'absolute',
            bottom: 40,
            width: 200,
            height: 60,
            opacity: 0.15,
          }}
          viewBox="0 0 200 60"
        >
          <path
            d="M 10 30 Q 50 10, 100 30 T 190 30"
            stroke={brandAccent}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="10" cy="30" r="5" fill={brandGold} />
          <circle cx="190" cy="30" r="5" fill={brandGold} />
        </svg>
      </motion.div>
    </AnimatePresence>
  );
}
