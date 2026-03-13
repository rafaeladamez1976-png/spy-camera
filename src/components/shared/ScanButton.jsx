import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function ScanButton({ onClick, isScanning, label = "Start Scan", icon: Icon }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isScanning}
      className={`relative w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-300 ${
        isScanning
          ? 'bg-[#243044] text-[#8B9BB4] cursor-not-allowed'
          : 'gradient-accent text-[#0F1419] shadow-lg shadow-[#00D4AA]/20 hover:shadow-[#00D4AA]/30'
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        {isScanning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            {Icon && <Icon className="w-5 h-5" />}
            {label}
          </>
        )}
      </span>
      {isScanning && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-[#00D4AA]/40"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}