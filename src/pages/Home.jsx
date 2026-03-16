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
    <div className="px-6 py-8 space-y-8 min-h-screen mesh-bg relative overflow-hidden">
      {/* Decorative HUD Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/5 blur-[100px] -z-10" />

      {/* Header */}
      <div className="text-center pt-8 pb-4 relative">
        <div className="w-24 h-24 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 mx-auto flex items-center justify-center mb-6 shadow-2xl relative group">
          <div className="absolute inset-0 rounded-[2rem] bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Shield className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white glow-text-cyan">
          SPECTRE <span className="font-light opacity-50">AI</span>
        </h1>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] mt-2">
          Sub-surface Intelligence Agency
        </p>
      </div>

      {/* System Stats Section */}
      <div className="relative isolate">
        <SystemStats />
      </div>

      {/* Main CTA */}
      <div className="px-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(createPageUrl('WifiScan'))}
          className="w-full relative group overflow-hidden py-6 rounded-3xl bg-cyan-500 text-black font-extrabold text-lg shadow-[0_8px_30px_rgba(0,245,255,0.25)] transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="flex items-center justify-center gap-3 tracking-tight uppercase">
            <Search className="w-6 h-6 stroke-[2.5]" />
            Initiate Sector Scan
          </span>
        </motion.button>
      </div>

      {/* Scan Tools Grid */}
      <div className="space-y-5 pt-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Detection Modules
          </h2>
          <div className="h-[1px] flex-1 bg-white/5 ml-4" />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <ScanToolCard
            icon={Wifi}
            title="Network Probe"
            description="Deep packet analysis for hidden IoT nodes"
            page="WifiScan"
            color="var(--accent)"
          />
          <ScanToolCard
            icon={Camera}
            title="Optic Sentry"
            description="Neural glint detection for pinhole lenses"
            page="LensScanner"
            color="#FF2D55"
          />
          <ScanToolCard
            icon={Magnet}
            title="Mag-Field Sensor"
            description="EMF resonance mapping for electronics"
            page="MagneticDetector"
            color="#FFB800"
          />
        </div>
      </div>

      {/* Verification Badge */}
      <div className="flex items-center justify-center gap-3 py-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
        <div className="h-[1px] w-8 bg-slate-700" />
        <Shield className="w-4 h-4 text-cyan-500" />
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">Verified Security Suite v4.2.0</p>
        <div className="h-[1px] w-8 bg-slate-700" />
      </div>

      {/* Footer Info */}
      <div className="pb-10">
        <DisclaimerBanner compact />
      </div>
    </div>
  );
}