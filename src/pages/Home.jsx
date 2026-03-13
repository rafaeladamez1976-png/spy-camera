import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, Wifi, Camera, Magnet, BookOpen, Search } from 'lucide-react';
import ScanToolCard from '../components/home/ScanToolCard';
import SystemStats from '../components/home/SystemStats';
import AdBanner from '../components/shared/AdBanner';
import DisclaimerBanner from '../components/shared/DisclaimerBanner';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Header */}
      <div className="text-center pt-6 pb-4">
        <div className="w-20 h-20 rounded-3xl gradient-accent mx-auto flex items-center justify-center mb-5 shadow-xl shadow-[#00D4AA]/15">
          <Shield className="w-10 h-10 text-[#0F1419]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight leading-tight">
          Spy Camera Finder
        </h1>
        <p className="text-sm text-[#8B9BB4] mt-5 leading-relaxed max-w-[280px] mx-auto font-medium">
          Scan your room for hidden cameras in under 30 seconds
        </p>
      </div>

      {/* System Stats */}
      <SystemStats />

      {/* Main CTA */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(createPageUrl('WifiScan'))}
        className="w-full relative overflow-hidden py-5 rounded-3xl gradient-accent text-[#0F1419] font-bold text-lg shadow-xl shadow-[#00D4AA]/20 hover:shadow-[#00D4AA]/30 transition-all"
      >
        <span className="flex items-center justify-center gap-3">
          <Search className="w-6 h-6" />
          Start Room Scan
        </span>
      </motion.button>

      {/* Scan Tools */}
      <div className="space-y-4 pt-2">
        <h2 className="text-xs font-semibold text-[#5A6A80] uppercase tracking-wider px-1">
          Detection Methods
        </h2>
        <div className="space-y-3">
          <ScanToolCard
            icon={Wifi}
            title="WiFi Device Scan"
            description="Detect suspicious devices on your network"
            page="WifiScan"
            color="#00D4AA"
          />
          <ScanToolCard
            icon={Camera}
            title="Lens Scanner"
            description="Use your camera to find lens reflections"
            page="LensScanner"
            color="#00BFFF"
          />
          <ScanToolCard
            icon={Magnet}
            title="Magnetic Detector"
            description="Detect magnetic fields from electronic devices"
            page="MagneticDetector"
            color="#FF6B35"
          />
          <ScanToolCard
            icon={BookOpen}
            title="Privacy Guide"
            description="Expert tips to protect your privacy"
            page="PrivacyGuide"
            color="#A78BFA"
          />
        </div>
      </div>

      {/* Trust Badge */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Shield className="w-4 h-4 text-[#00D4AA]" />
        <p className="text-xs text-[#5A6A80]">Trusted by 50,000+ travelers</p>
      </div>

      {/* Disclaimer */}
      <div className="pt-2">
        <DisclaimerBanner compact />
      </div>
    </div>
  );
}