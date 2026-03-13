import React from 'react';
import { Drawer } from 'vaul';
import { Check } from 'lucide-react';

const languages = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'de', label: 'German', native: 'Deutsch' },
  { value: 'fr', label: 'French', native: 'Français' },
  { value: 'es', label: 'Spanish', native: 'Español' },
  { value: 'ja', label: 'Japanese', native: '日本語' },
];

export default function LanguageDrawer({ open, onOpenChange, value, onSelect }) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100]" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] bg-[#1A2332] rounded-t-3xl outline-none">
          <div className="max-w-lg mx-auto">
            {/* Handle */}
            <div className="flex items-center justify-center py-4">
              <div className="w-12 h-1 rounded-full bg-[#2A3A50]" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4">
              <h2 className="text-xl font-bold text-center">Select Language</h2>
            </div>

            {/* Options */}
            <div className="px-4 pb-8" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
              <div className="space-y-1">
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => {
                      onSelect(lang.value);
                      onOpenChange(false);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#243044] hover:bg-[#2A3A50] transition-colors"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="text-left">
                      <p className="font-semibold text-base">{lang.native}</p>
                      <p className="text-xs text-[#5A6A80] mt-0.5">{lang.label}</p>
                    </div>
                    {value === lang.value && (
                      <Check className="w-5 h-5 text-[#00D4AA]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}