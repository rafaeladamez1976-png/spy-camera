import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScanToolCard({ icon: Icon, title, description, page, color = '#00D4AA' }) {
  return (
    <motion.div whileTap={{ scale: 0.99 }}>
      <Link
        to={createPageUrl(page)}
        className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A2332] border border-[#2A3A50] hover:border-[#2A3A50]/80 hover:bg-[#1F2A3C] transition-all duration-200"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}12` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-[#E8ECF0] mb-1">{title}</h3>
          <p className="text-xs text-[#5A6A80] leading-relaxed">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-[#5A6A80]/50 shrink-0" />
      </Link>
    </motion.div>
  );
}