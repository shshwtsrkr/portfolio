import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const NAV_ITEMS = [
  { name: 'Profile', path: '/' },
  { name: 'Publications', path: '/publications' },
  { name: 'Projects', path: '/projects' },
  { name: 'Blogs', path: '/blogs' },
];

const MotionLink = motion.create(Link);

const Navigation = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const itemRefs = useRef([]);
  const containerRef = useRef(null);

  itemRefs.current = itemRefs.current.slice(0, NAV_ITEMS.length);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateIndicator = () => {
      const container = containerRef.current;
      if (!container) {
        setIndicatorStyle({ left: 0, width: 0 });
        return;
      }

      const currentIndex = NAV_ITEMS.findIndex(item => item.path === location.pathname);
      const currentItem = itemRefs.current[currentIndex];

      if (!currentItem) {
        setIndicatorStyle({ left: 0, width: 0 });
        return;
      }

      const itemRect = currentItem.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setIndicatorStyle({
        left: itemRect.left - containerRect.left,
        width: itemRect.width,
      });
    };

    if (typeof window === 'undefined') {
      return;
    }

    updateIndicator();
    const frame = window.requestAnimationFrame?.(updateIndicator) ?? null;
    window.addEventListener('resize', updateIndicator);

    return () => {
      if (frame !== null && window.cancelAnimationFrame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname]);

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[100] py-4 sm:py-6 lg:py-8 px-2 sm:px-4 pointer-events-none"
    >
      <div className="flex justify-center items-center">
        <div
          className="relative inline-flex rounded-full p-1.5 sm:p-1.5 lg:p-2 shadow-xl border border-white/20 dark:border-white/10 overflow-hidden w-full max-w-2xl pointer-events-auto"
          style={{
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)'
          }}
        >
          <div ref={containerRef} className="relative flex w-full gap-1 sm:gap-2">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: isDark
                  ? 'radial-gradient(ellipse at 30% 30%, #ffffff 0%, #f8f8f8 40%, #e8e8e8 100%)'
                  : 'radial-gradient(ellipse at 30% 30%, #ffffff 0%, #fafafa 40%, #f0f0f0 100%)',
                boxShadow: isDark
                  ? '6px 6px 16px rgba(0, 0, 0, 0.5), -3px -3px 10px rgba(255, 255, 255, 0.1), inset -3px -3px 6px rgba(0, 0, 0, 0.15), inset 2px 2px 6px rgba(255, 255, 255, 0.7)'
                  : '6px 6px 16px rgba(0, 0, 0, 0.2), -3px -3px 10px rgba(255, 255, 255, 0.9), inset -3px -3px 6px rgba(0, 0, 0, 0.08), inset 2px 2px 6px rgba(255, 255, 255, 1)',
                pointerEvents: 'none',
              }}
              initial={false}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                opacity: indicatorStyle.width ? 1 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
            {NAV_ITEMS.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <MotionLink
                  key={item.path}
                  to={item.path}
                  ref={el => {
                    itemRefs.current[index] = el ?? null;
                  }}
                  className={`relative z-10 flex-1 rounded-full text-sm sm:text-base lg:text-xl font-semibold transition-colors duration-300 whitespace-nowrap flex items-center justify-center px-3 py-2.5 sm:px-5 sm:py-3 lg:px-9 lg:py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400 cursor-pointer ${
                    isActive
                      ? 'text-black dark:text-black'
                      : 'text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative">{item.name}</span>
                </MotionLink>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
