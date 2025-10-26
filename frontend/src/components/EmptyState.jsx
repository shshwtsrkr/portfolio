import { motion } from 'framer-motion';

const EmptyState = ({ sectionName = 'items' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="col-span-full flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Animated circles */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-500/30 dark:border-purple-400/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-500/30 dark:border-blue-400/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-400/20 dark:to-blue-400/20 backdrop-blur-sm"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-center space-y-3"
      >
        <h3 className="text-xl font-semibold text-black dark:text-white">
          No {sectionName} yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Check back later for more
        </p>
      </motion.div>

      {/* Floating dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-purple-500/20 dark:bg-purple-400/20"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default EmptyState;
