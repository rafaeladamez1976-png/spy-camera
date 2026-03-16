import React from 'react';
import { Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ArticleCard({ article, isBookmarked, onToggleBookmark, onClick }) {
  const categoryColors = {
    hotel_safety: 'bg-blue-500/10 text-blue-400',
    airbnb_tips: 'bg-purple-500/10 text-purple-400',
    manual_detection: 'bg-amber-500/10 text-amber-400',
    camera_placement: 'bg-red-500/10 text-red-400',
    general_privacy: 'bg-emerald-500/10 text-emerald-400',
    tech_guide: 'bg-cyan-500/10 text-cyan-400',
  };

  const categoryLabel = (article.category || '').replace(/_/g, ' ');
  const colorClass = categoryColors[article.category] || 'bg-gray-500/10 text-gray-400';

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="p-5 rounded-2xl bg-[#1A2332] border border-[#2A3A50] hover:border-[#2A3A50]/80 hover:bg-[#1F2A3C] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-3 ${colorClass}`}>
            {categoryLabel}
          </span>
          <h3 className="font-bold text-base leading-snug mb-2">{article.title}</h3>
          <p className="text-xs text-[#8B9BB4] leading-relaxed line-clamp-2">{article.summary}</p>
          <div className="flex items-center gap-2 mt-3">
            <Clock className="w-3.5 h-3.5 text-[#5A6A80]" />
            <span className="text-xs text-[#5A6A80]">{article.read_time_minutes || 3} min</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(); }}
          className="p-2 -m-2 shrink-0"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-[#00D4AA]" />
          ) : (
            <Bookmark className="w-5 h-5 text-[#5A6A80]" />
          )}
        </button>
      </div>
    </motion.div>
  );
}