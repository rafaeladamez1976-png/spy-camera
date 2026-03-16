import React from 'react';

export default function AdBanner({ type = 'banner' }) {
  if (type === 'interstitial') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6">
        <div className="bg-[#1A2332] rounded-2xl p-6 max-w-sm w-full border border-[#2A3A50] text-center">
          <div className="w-full h-48 bg-[#243044] rounded-xl flex items-center justify-center mb-4">
            <span className="text-[#5A6A80] text-sm">Advertisement</span>
          </div>
          <p className="text-xs text-[#5A6A80]">Ad closes automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-14 bg-[#1A2332]/60 rounded-xl border border-[#2A3A50]/50 flex items-center justify-center">
      <span className="text-[#5A6A80] text-xs">Ad Space</span>
    </div>
  );
}