import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScanToolCard({ icon: Icon, title, description, page, color = '#00F5FF' }) {
  return (
    <motion.div 
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={createPageUrl(page)}
        className="hud-card flex items-center gap-5 p-5 rounded-[2rem] transition-all group"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
          style={{ backgroundColor: `${color}10` }}
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Icon className="w-7 h-7 relative z-10" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-white mb-1 group-hover:text-cyan-400 transition-colors">{title}</h3>
          <p className="text-[11px] text-slate-500 font-medium leading-normal uppercase tracking-wide opacity-70 italic">{description}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}