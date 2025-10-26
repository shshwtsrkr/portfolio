import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SwipeHint = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile with a slight delay to ensure proper detection
    const checkAndShow = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Only show on mobile and if user hasn't seen it before
      const hasSeenHint = sessionStorage.getItem('hasSeenSwipeHint');

      if (mobile && !hasSeenHint) {
        // Show hint after a short delay
        const showTimer = setTimeout(() => {
          setIsVisible(true);
        }, 800);

        // Hide hint after 4 seconds
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem('hasSeenSwipeHint', 'true');
        }, 4800);

        return () => {
          clearTimeout(showTimer);
          clearTimeout(hideTimer);
        };
      }
    };

    // Small delay to ensure DOM is ready
    const initTimer = setTimeout(checkAndShow, 100);

    return () => clearTimeout(initTimer);
  }, []);

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
        >
          <div
            className="px-4 py-2 rounded-full border border-white/20 dark:border-white/10 shadow-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)'
            }}
          >
            <p className="text-xs font-medium text-white/90 dark:text-white/80">
              Swipe to navigate
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwipeHint;
