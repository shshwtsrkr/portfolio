import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 origin-left z-[101] pointer-events-none"
      style={{ scaleX }}
    >
      {/* Glowing effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 blur-sm opacity-50" />
    </motion.div>
  );
};

export default ScrollProgress;
