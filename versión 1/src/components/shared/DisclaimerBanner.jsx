import React from 'react';
import { Info } from 'lucide-react';

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <p className="text-[11px] text-[#5A6A80] text-center leading-relaxed px-4">
        This app assists your inspection but cannot guarantee detection of all hidden cameras. Always verify findings visually.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#243044]/60 border border-[#2A3A50]">
      <Info className="w-5 h-5 text-[#5A6A80] mt-0.5 shrink-0" />
      <p className="text-xs text-[#8B9BB4] leading-relaxed">
        This app helps identify potential surveillance devices but cannot guarantee detection of all hidden cameras. Always verify suspicious findings with physical inspection.
      </p>
    </div>
  );
}