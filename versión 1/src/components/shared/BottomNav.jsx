import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Wifi, Camera, Magnet, BookOpen, Settings } from 'lucide-react';

const navItems = [
  { name: 'Home', page: 'Home', icon: Home },
  { name: 'WiFi', page: 'WifiScan', icon: Wifi },
  { name: 'Lens', page: 'LensScanner', icon: Camera },
  { name: 'Magnet', page: 'MagneticDetector', icon: Magnet },
  { name: 'Guide', page: 'PrivacyGuide', icon: BookOpen },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (page) => {
    const url = createPageUrl(page);
    return location.pathname === url;
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F1419]/95 backdrop-blur-xl border-t border-[#2A3A50]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
        {navItems.map((item) => {
          const active = isActive(item.page);
          const Icon = item.icon;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[56px] select-none ${
                active
                  ? 'text-[#00D4AA]'
                  : 'text-[#5A6A80] hover:text-[#8B9BB4]'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Icon className={`w-5 h-5 ${active ? 'drop-shadow-[0_0_6px_rgba(0,212,170,0.5)]' : ''}`} />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}