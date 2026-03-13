import React from 'react';
import { motion } from 'framer-motion';

export default function MagneticGauge({ value, maxValue = 200, threshold = 100 }) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const angle = (percentage / 100) * 180 - 90;

  const getColor = () => {
    if (value >= threshold) return '#FF3B5C';
    if (value >= threshold * 0.6) return '#FF6B35';
    return '#00D4AA';
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      {/* Gauge */}
      <div className="relative w-56 h-28 overflow-hidden">
        {/* Background arc */}
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Track */}
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="#243044"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <motion.path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>

        {/* Needle */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1">
          <motion.div
            className="origin-bottom"
            animate={{ rotate: angle }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            style={{ transformOrigin: 'bottom center' }}
          >
            <div className="w-0.5 h-20 mx-auto rounded-full" style={{ backgroundColor: color }} />
            <div className="w-3 h-3 rounded-full mx-auto -mt-1" style={{ backgroundColor: color }} />
          </motion.div>
        </div>
      </div>

      {/* Value */}
      <div className="mt-2 text-center">
        <motion.p
          className="text-4xl font-bold tabular-nums"
          style={{ color }}
          key={Math.round(value)}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
        >
          {Math.round(value)}
        </motion.p>
        <p className="text-xs text-[#5A6A80] mt-0.5">µT (microtesla)</p>
      </div>
    </div>
  );
}