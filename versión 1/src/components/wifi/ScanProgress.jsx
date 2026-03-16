import React from 'react';
import { motion } from 'framer-motion';

export default function ScanProgress({ progress }) {
  return (
    <div className="space-y-4 py-4">
      {/* Clean radar animation */}
      <div className="flex items-center justify-center py-12">
        <div className="relative w-36 h-36">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-[#00D4AA]/20"
              animate={{
                scale: [1, 1.8],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 1,
                ease: 'easeOut',
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#00D4AA]/10 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[#00D4AA]/20 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#00D4AA]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-3">
        <div className="h-2 bg-[#1A2332] rounded-full overflow-hidden border border-[#2A3A50]">
          <motion.div
            className="h-full gradient-accent rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-[#8B9BB4] text-center font-medium">
          Scanning network devices... {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}