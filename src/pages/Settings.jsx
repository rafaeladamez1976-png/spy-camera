import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Crown, Globe, Shield, Mail, FileText,
  Camera, MapPin, Wifi, Magnet, ChevronRight, Info, ExternalLink
} from 'lucide-react';
import DisclaimerBanner from '../components/shared/DisclaimerBanner';
import LanguageDrawer from '../components/settings/LanguageDrawer';

const SettingRow = ({ icon: Icon, label, sublabel, action, iconColor = '#8B9BB4' }) => (
  <div className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#1A2332]/60 transition-colors">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${iconColor}12` }}>
      <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium">{label}</p>
      {sublabel && <p className="text-xs text-[#5A6A80] mt-0.5">{sublabel}</p>}
    </div>
    {action || <ChevronRight className="w-4 h-4 text-[#5A6A80] shrink-0" />}
  </div>
);

const PermissionRow = ({ icon: Icon, label, granted }) => (
  <div className="flex items-center gap-3 py-2">
    <Icon className="w-4 h-4 text-[#5A6A80]" />
    <span className="text-sm text-[#8B9BB4] flex-1">{label}</span>
    <span className={`text-xs font-medium ${granted ? 'text-emerald-400' : 'text-amber-400'}`}>
      {granted ? 'Granted' : 'Required'}
    </span>
  </div>
);

const languageLabels = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  ja: '日本語',
};

export default function Settings() {
  const [language, setLanguage] = useState('en');
  const [languageDrawerOpen, setLanguageDrawerOpen] = useState(false);
  const [isPremium] = useState(false);

  return (
    <>
      <LanguageDrawer
        open={languageDrawerOpen}
        onOpenChange={setLanguageDrawerOpen}
        value={language}
        onSelect={setLanguage}
      />
    <div className="px-5 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#8B9BB4]/10 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-[#8B9BB4]" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Settings</h1>
          <p className="text-xs text-[#5A6A80]">Manage your preferences</p>
        </div>
      </div>

      {/* Premium Card */}
      {!isPremium && (
        <motion.div
          whileTap={{ scale: 0.99 }}
          className="relative overflow-hidden p-6 rounded-3xl border border-[#00D4AA]/20 cursor-pointer bg-gradient-to-br from-[#1A2332] to-[#0F1419]"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#00D4AA]/5 rounded-full -translate-y-12 translate-x-12" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#00D4AA]" />
              </div>
              <h3 className="font-bold text-lg">Go Premium</h3>
            </div>
            <p className="text-sm text-[#8B9BB4] mb-4 leading-relaxed">
              Remove ads · Unlimited scans · Priority support · Advanced detection features
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[#00D4AA]">€3.99</p>
                <p className="text-xs text-[#5A6A80] mt-0.5">One-time payment</p>
              </div>
              <button className="px-6 py-3 rounded-2xl bg-[#00D4AA] text-[#0F1419] font-bold text-sm shadow-lg shadow-[#00D4AA]/20 hover:bg-[#00A88A] transition-all">
                Upgrade Now
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* General */}
      <div className="space-y-1">
        <h2 className="text-xs font-semibold text-[#5A6A80] uppercase tracking-wider px-1 mb-2">
          General
        </h2>
        <button
          onClick={() => setLanguageDrawerOpen(true)}
          className="w-full"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <SettingRow
            icon={Globe}
            label="Language"
            iconColor="#00BFFF"
            action={
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8B9BB4]">{languageLabels[language]}</span>
                <ChevronRight className="w-4 h-4 text-[#5A6A80]" />
              </div>
            }
          />
        </button>
      </div>

      {/* Permissions */}
      <div className="space-y-1">
        <h2 className="text-xs font-semibold text-[#5A6A80] uppercase tracking-wider px-1 mb-2">
          Permissions
        </h2>
        <div className="p-3.5 rounded-xl bg-[#1A2332]/40 border border-[#2A3A50]/30 space-y-1">
          <PermissionRow icon={Camera} label="Camera" granted={true} />
          <PermissionRow icon={MapPin} label="Location" granted={true} />
          <PermissionRow icon={Wifi} label="WiFi Access" granted={true} />
          <PermissionRow icon={Magnet} label="Magnetometer / Sensors" granted={false} />
        </div>
      </div>

      {/* Support */}
      <div className="space-y-1">
        <h2 className="text-xs font-semibold text-[#5A6A80] uppercase tracking-wider px-1 mb-2">
          Support & Legal
        </h2>
        <SettingRow icon={Shield} label="Privacy Policy" iconColor="#A78BFA" />
        <SettingRow icon={Mail} label="Contact Support" sublabel="help@spycamerafinder.app" iconColor="#00D4AA" />
        <SettingRow icon={FileText} label="Terms of Service" iconColor="#5A6A80" />
      </div>

      {/* Legal Disclaimer */}
      <DisclaimerBanner />

      {/* About */}
      <div className="text-center py-4 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-[#00D4AA]" />
          <span className="text-sm font-semibold">Spy Camera Finder</span>
        </div>
        <p className="text-xs text-[#5A6A80]">Version 1.0.0</p>
        <p className="text-[10px] text-[#5A6A80]">Hidden Camera Detector</p>
      </div>
    </div>
    </>
  );
}