import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Wifi, Camera, ChevronRight, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import DisclaimerBanner from '../components/shared/DisclaimerBanner';

const slides = [
  {
    icon: Shield,
    title: 'Protect Your Privacy',
    subtitle: 'Scan hotel rooms, Airbnbs, and rental spaces for hidden cameras in under 30 seconds.',
    color: '#00D4AA',
  },
  {
    icon: Wifi,
    title: 'Three Detection Methods',
    subtitle: 'WiFi network scanning, camera lens detection, and magnetic field analysis work together for thorough inspection.',
    color: '#00D4AA',
  },
  {
    icon: Fingerprint,
    title: 'Required Permissions',
    subtitle: 'Camera access enables lens scanning. WiFi access detects suspicious devices. Magnetometer detects electronics. All data stays on your device.',
    color: '#00D4AA',
  },
  {
    icon: Camera,
    title: 'Important Disclaimer',
    subtitle: '',
    color: '#FF6B35',
    isDisclaimer: true,
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate(createPageUrl('Home'));
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Skip */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate(createPageUrl('Home'))}
          className="text-[#5A6A80] text-sm font-medium px-3 py-1"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon area */}
            <div
              className="w-28 h-28 rounded-3xl flex items-center justify-center mb-10"
              style={{ backgroundColor: `${slide.color}10` }}
            >
              <Icon className="w-14 h-14" style={{ color: slide.color }} />
            </div>

            <h1 className="text-3xl font-bold mb-5 leading-tight px-4">{slide.title}</h1>

            {slide.isDisclaimer ? (
              <div className="max-w-sm px-4">
                <DisclaimerBanner />
                <p className="text-sm text-[#8B9BB4] mt-6 leading-relaxed">
                  This app assists your visual inspection. No technology guarantees 100% detection. Trust your instincts and report suspicious findings to authorities.
                </p>
              </div>
            ) : (
              <p className="text-[#8B9BB4] leading-relaxed max-w-sm px-4">
                {slide.subtitle}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + Button */}
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8 bg-[#00D4AA]' : 'w-1.5 bg-[#2A3A50]'
              }`}
            />
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className="w-full py-4 rounded-2xl gradient-accent text-[#0F1419] font-semibold text-base flex items-center justify-center gap-2"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}