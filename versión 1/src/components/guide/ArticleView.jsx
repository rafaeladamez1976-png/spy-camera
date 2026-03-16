import React from 'react';
import { ArrowLeft, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ArticleView({ article, isBookmarked, onToggleBookmark, onBack }) {
  const categoryLabel = (article.category || '').replace(/_/g, ' ');

  return (
    <div className="px-5 py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-[#8B9BB4] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to guides
      </button>

      <div className="space-y-4">
        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider bg-[#243044] text-[#8B9BB4]">
          {categoryLabel}
        </span>

        <h1 className="text-2xl font-bold leading-tight">{article.title}</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#5A6A80]" />
            <span className="text-xs text-[#5A6A80]">{article.read_time_minutes || 3} min read</span>
          </div>
          <button
            onClick={onToggleBookmark}
            className="flex items-center gap-1.5 text-xs"
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-[#00D4AA]" />
                <span className="text-[#00D4AA]">Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 text-[#5A6A80]" />
                <span className="text-[#5A6A80]">Save</span>
              </>
            )}
          </button>
        </div>

        <div className="h-px bg-[#2A3A50]" />

        <div className="prose prose-invert prose-sm max-w-none
          prose-headings:text-[#E8ECF0] prose-headings:font-semibold
          prose-p:text-[#8B9BB4] prose-p:leading-relaxed
          prose-li:text-[#8B9BB4]
          prose-strong:text-[#E8ECF0]
          prose-a:text-[#00D4AA]
        ">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}