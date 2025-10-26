import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const ActivityRings = ({ data, onFilterChange, selectedFilter, colors: customColors }) => {
  const [animate, setAnimate] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setAnimate(true), 300);
  }, []);

  const defaultColors = [
    { color: '#30D158', gradient: 'from-green-500 to-emerald-500' }, // Completed
    { color: '#007AFF', gradient: 'from-blue-500 to-cyan-500' },     // Active Development
    { color: '#FF9500', gradient: 'from-orange-500 to-yellow-500' },
    { color: '#FF3B30', gradient: 'from-red-500 to-pink-500' },
  ];

  const colors = customColors || defaultColors;

  const rings = data.map((item, index) => ({
    ...colors[index],
    ...item,
  }));

  const totalItems = rings.reduce((sum, ring) => sum + ring.count, 0);

  const handleClick = (index, label) => {
    if (onFilterChange) {
      // If clicking the same filter, clear it; otherwise set new filter
      onFilterChange(selectedFilter === label ? null : label);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
      {/* Activity Rings */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center flex-shrink-0">
        {/* Rings Container */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {rings.map((ring, index) => {
            const radius = 82 - index * 16;
            const circumference = 2 * Math.PI * radius;
            const percentage = totalItems > 0 ? (ring.count / totalItems) * 100 : 0;
            const offset = circumference - (percentage / 100) * circumference;
            const isHovered = hoveredIndex === index;
            const isSelected = selectedFilter === ring.label;
            const isDimmed = hoveredIndex !== null && hoveredIndex !== index;
            const strokeWidth = isHovered || isSelected ? 9 : 7;

            return (
              <g
                key={index}
                style={{
                  cursor: onFilterChange ? 'pointer' : 'default',
                  pointerEvents: 'all'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onFilterChange && handleClick(index, ring.label)}
              >
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  style={{ pointerEvents: 'stroke' }}
                />

                {/* Animated progress circle */}
                <motion.circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{
                    strokeDashoffset: animate ? offset : circumference,
                    opacity: isDimmed ? 0.3 : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.2,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  style={{
                    filter: isHovered || isSelected
                      ? 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.6))'
                      : 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
                    pointerEvents: 'stroke'
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Center count */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
              className="text-3xl font-bold text-white leading-none"
            >
              {totalItems}
            </motion.span>
            <span className="text-xs text-gray-400">Total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 min-w-[220px]">
        {rings.map((ring, index) => {
          const isHovered = hoveredIndex === index;
          const isSelected = selectedFilter === ring.label;
          const isDimmed = (hoveredIndex !== null && hoveredIndex !== index) || (selectedFilter && selectedFilter !== ring.label);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: isDimmed ? 0.4 : 1,
                x: 0,
                scale: isHovered || isSelected ? 1.03 : 1,
              }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
              className={`flex items-center justify-between gap-4 p-2 rounded-lg transition-all ${
                onFilterChange ? 'cursor-pointer hover:bg-white/5' : ''
              } ${isSelected ? 'bg-white/10 ring-2 ring-white/20' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleClick(index, ring.label)}
            >
              <motion.div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: ring.color }}
                animate={{
                  scale: isHovered || isSelected ? 1.3 : 1,
                  boxShadow: isHovered || isSelected
                    ? `0 0 12px ${ring.color}`
                    : `0 0 4px ${ring.color}`,
                }}
              />
              <div className="flex items-center justify-between flex-1 gap-4">
                <span className="text-xs font-semibold text-white">
                  {ring.label}
                </span>
                <span className="text-sm font-semibold text-white whitespace-nowrap">
                  {ring.count ?? 0} {ring.count === 1 ? 'item' : 'items'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityRings;
