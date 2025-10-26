import { motion } from 'framer-motion';

// Spinner with white bouncing dots
export const LoadingSpinner = ({ size = 'md', message = '' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* White bouncing dots */}
      <DotsLoader />

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400 font-medium"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

// Skeleton loader with shimmer effect
export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const shimmer = {
    hidden: { x: '-100%' },
    visible: {
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
  };

  const CardSkeleton = () => (
    <div className="card-glass overflow-hidden">
      <div className="relative">
        {/* Shimmer overlay */}
        <motion.div
          variants={shimmer}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"
        />

        <div className="space-y-4">
          {/* Image placeholder */}
          <div className="w-full h-48 bg-gray-300/30 dark:bg-gray-700/30 rounded-lg" />

          {/* Title placeholder */}
          <div className="h-6 bg-gray-300/30 dark:bg-gray-700/30 rounded w-3/4" />

          {/* Text lines */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-300/30 dark:bg-gray-700/30 rounded" />
            <div className="h-4 bg-gray-300/30 dark:bg-gray-700/30 rounded w-5/6" />
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-300/30 dark:bg-gray-700/30 rounded-full" />
            <div className="h-8 w-24 bg-gray-300/30 dark:bg-gray-700/30 rounded-full" />
            <div className="h-8 w-16 bg-gray-300/30 dark:bg-gray-700/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  const TextSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="h-4 bg-gray-300/30 dark:bg-gray-700/30 rounded"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );

  const skeletonTypes = {
    card: <CardSkeleton />,
    text: <TextSkeleton />,
  };

  return (
    <div className="space-y-6">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {skeletonTypes[type]}
        </motion.div>
      ))}
    </div>
  );
};

// Dots loader - White bouncing dots like jonhowell.com
export const DotsLoader = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 bg-white dark:bg-white rounded-full"
          animate={{
            y: [0, -12, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: [0.4, 0, 0.2, 1], // easeInOut cubic bezier
          }}
        />
      ))}
    </div>
  );
};

// Progress bar with animation
export const ProgressBar = ({ progress = 0, showLabel = true }) => {
  return (
    <div className="w-full space-y-2">
      <div className="relative h-2 bg-gray-300/30 dark:bg-gray-700/30 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>

      {showLabel && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 dark:text-gray-400 text-center font-medium"
        >
          {Math.round(progress)}%
        </motion.p>
      )}
    </div>
  );
};
