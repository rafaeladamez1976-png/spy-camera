import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ArticleCard from '../components/guide/ArticleCard';
import ArticleView from '../components/guide/ArticleView';

const ARTICLES = [
  {
    id: '1',
    title: 'Where Hidden Cameras Are Commonly Placed',
    category: 'camera_placement',
    summary: 'Learn the most common locations where surveillance cameras are hidden in hotels, rentals, and public spaces.',
    read_time_minutes: 4,
    content: `## Common Camera Hiding Spots

Hidden cameras can be concealed in many everyday objects. Here are the most common locations to inspect:

### In Bedrooms & Living Areas
- **Smoke detectors** — One of the most common hiding spots. Look for small lenses or unusual wiring.
- **Wall clocks** — Check for tiny holes or unusual lens-like surfaces.
- **Picture frames** — Cameras can be hidden behind or within frames.
- **Electrical outlets** — Modified outlets may contain pinhole cameras.
- **Books or decorations** — Any object facing the bed or living area.

### In Bathrooms
- **Air fresheners** — Wall-mounted units with unusual features.
- **Towel hooks** — Some are designed to conceal cameras.
- **Showerhead housings** — Check for extra components.

### General Tips
- Look for objects that seem **out of place** or **newly installed**.
- Check for **small holes** in walls, ceilings, or objects.
- **Red or green indicator lights** may be visible in darkness.
- Objects positioned to face **beds, showers, or changing areas** deserve extra scrutiny.

> Always trust your instincts. If something feels wrong, investigate further or contact authorities.`,
  },
  {
    id: '2',
    title: 'How to Inspect a Hotel Room',
    category: 'hotel_safety',
    summary: 'A step-by-step guide to performing a thorough privacy check when you arrive at a hotel.',
    read_time_minutes: 5,
    content: `## Hotel Room Inspection Guide

Follow this systematic approach when checking into any hotel room:

### Step 1: Initial Visual Sweep (30 seconds)
Scan the room for anything unusual. Look for objects that seem out of place, especially those facing the bed or bathroom.

### Step 2: Check Common Hiding Spots
- Inspect **smoke detectors** — are there multiple or do they look different from standard models?
- Check **TV area** — look behind and around the television.
- Examine **alarm clocks** — especially those facing the bed.
- Look at **mirrors** — perform the fingertip test (if your fingertip touches its reflection directly, it may be a two-way mirror).

### Step 3: Use Your Phone
- **Turn off the lights** and use your phone camera to scan for infrared LEDs (some cameras use IR for night vision).
- **Run a WiFi scan** to detect unknown network devices.

### Step 4: Physical Check
- Feel along **air vents** and **electrical fixtures** for unusual warmth or vibrations.
- Check **behind furniture** that faces sleeping or changing areas.

### Step 5: Document & Report
If you find anything suspicious, **take photos**, **contact hotel management**, and **report to authorities** if necessary.

> This guide is for awareness purposes. Professional security audits may be needed for high-risk situations.`,
  },
  {
    id: '3',
    title: 'How to Detect Cameras Manually',
    category: 'manual_detection',
    summary: 'Practical techniques for finding hidden cameras without specialized equipment.',
    read_time_minutes: 4,
    content: `## Manual Camera Detection Techniques

You don't always need specialized equipment. Here are effective manual methods:

### 1. The Darkness Method
Turn off all lights and close curtains. Look for:
- Tiny **LED indicator lights** (red, green, or blue)
- Faint **glowing spots** from active cameras

### 2. Phone Camera IR Detection
Most phone cameras can detect infrared light invisible to the naked eye:
1. Open your phone's camera app
2. Point a known IR source at it (like a TV remote) to confirm detection
3. Scan the room in darkness for purple/white spots

### 3. The Flashlight Method
Shine a bright flashlight across surfaces:
- Camera lenses will **reflect light distinctly** compared to surrounding surfaces
- Look for small, circular reflections

### 4. WiFi Network Analysis
- Check connected devices on the local network
- Unknown devices, especially with camera-related manufacturer names, warrant investigation

### 5. Physical Inspection
- Run your hand along **edges of mirrors, frames, and fixtures**
- Check for **unusual wires** or components
- Look for **freshly drilled holes** in walls or ceilings

### 6. RF Detection
Use an RF detector or your phone's magnetometer to detect electromagnetic emissions from active wireless cameras.

> Remember: no single method is foolproof. Combine multiple techniques for the best results.`,
  },
  {
    id: '4',
    title: 'Airbnb Privacy Tips',
    category: 'airbnb_tips',
    summary: 'Essential privacy and security advice for Airbnb guests to protect themselves during their stay.',
    read_time_minutes: 4,
    content: `## Airbnb Privacy & Security Guide

### Know Your Rights
Airbnb's policy requires hosts to **disclose all cameras** in their listing. Cameras are **prohibited in bedrooms, bathrooms**, and sleeping areas — even if disclosed.

### Before Booking
- **Read reviews** carefully for any mentions of privacy concerns
- **Check the listing** for disclosed cameras
- **Message the host** to ask about surveillance devices

### Upon Arrival
1. **Perform a quick sweep** of bedrooms and bathrooms
2. **Check the WiFi** for unknown devices
3. **Inspect common hiding spots**: smoke detectors, clocks, mirrors, power strips
4. **Use the lens scanner** feature of this app

### What to Do If You Find a Camera
1. **Document everything** — photos, screenshots, location
2. **Contact Airbnb Support** immediately through the app
3. **File a police report** if the camera was in a private area
4. **Leave the property** if you feel unsafe
5. **Request a full refund** from Airbnb

### General Tips
- Use **privacy covers** for any provided smart speakers
- Keep your **personal devices secure**
- Be aware of **smart home devices** (TVs, speakers) that may have cameras

> Your privacy is a right, not a privilege. Don't hesitate to report violations.`,
  },
  {
    id: '5',
    title: 'Understanding WiFi-Based Detection',
    category: 'tech_guide',
    summary: 'How WiFi scanning helps identify potential surveillance devices on local networks.',
    read_time_minutes: 3,
    content: `## WiFi-Based Camera Detection

### How It Works
Many modern hidden cameras connect to WiFi to stream or store footage. By scanning the local network, you can identify these devices.

### What We Look For
- **Device names** containing camera-related keywords
- **Manufacturer information** matching known camera brands (Hikvision, Dahua, etc.)
- **Unknown or unidentified** devices that don't match the expected network profile

### Limitations
- **Offline cameras** that record to SD cards won't appear on network scans
- **Cameras on separate networks** or using cellular connections are not detectable
- **MAC address spoofing** can disguise a camera as another device type

### Interpreting Results
- **"Possible Camera"** — Device matches known camera signatures. Investigate further.
- **"Unknown Device"** — Can't be identified. May warrant inspection.
- **"Trusted Device"** — Matches common consumer electronics. Generally safe.

> WiFi scanning is one layer of a multi-method approach. Always combine with physical inspection for the most thorough results.`,
  },
  {
    id: '6',
    title: 'Privacy Best Practices for Travelers',
    category: 'general_privacy',
    summary: 'General privacy tips for staying safe and secure while traveling.',
    read_time_minutes: 3,
    content: `## Traveler Privacy Checklist

### Digital Security
- Use a **VPN** on public WiFi networks
- **Disable auto-connect** to WiFi on your devices
- Keep your **devices updated** with latest security patches
- Use **strong, unique passwords** for travel accounts

### Physical Security
- **Inspect your room** upon arrival
- Use **door locks and security latches**
- Keep **valuables in the hotel safe**
- Be aware of your **surroundings** in unfamiliar places

### Communication Security
- **Avoid discussing sensitive information** in hotel rooms if you suspect surveillance
- Use **encrypted messaging** apps for sensitive communications
- Be cautious with **hotel phones and business centers**

### After Your Trip
- **Change passwords** for any accounts accessed during travel
- **Check for unauthorized access** on your accounts
- **Review your devices** for any unfamiliar apps or settings

> Preparation is key. A few minutes of security awareness can prevent serious privacy breaches.`,
  },
];

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'camera_placement', label: 'Camera Spots' },
  { value: 'hotel_safety', label: 'Hotels' },
  { value: 'manual_detection', label: 'Detection' },
  { value: 'airbnb_tips', label: 'Airbnb' },
  { value: 'general_privacy', label: 'Privacy' },
  { value: 'tech_guide', label: 'Tech' },
];

export default function PrivacyGuide() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [bookmarked, setBookmarked] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = ARTICLES.filter(article => {
    const matchesSearch = !search ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (id) => {
    setBookmarked(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  if (selectedArticle) {
    return (
      <ArticleView
        article={selectedArticle}
        isBookmarked={bookmarked.includes(selectedArticle.id)}
        onToggleBookmark={() => toggleBookmark(selectedArticle.id)}
        onBack={() => setSelectedArticle(null)}
      />
    );
  }

  return (
    <div className="px-5 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-[#A78BFA]" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Privacy Guide</h1>
          <p className="text-xs text-[#5A6A80]">Expert tips to protect your privacy</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6A80]" />
        <Input
          placeholder="Search guides..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#1A2332] border-[#2A3A50] text-[#E8ECF0] placeholder:text-[#5A6A80] rounded-xl h-11"
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.value
                ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30'
                : 'bg-[#1A2332] text-[#5A6A80] border border-[#2A3A50]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ArticleCard
                article={article}
                isBookmarked={bookmarked.includes(article.id)}
                onToggleBookmark={() => toggleBookmark(article.id)}
                onClick={() => setSelectedArticle(article)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 text-[#5A6A80] mx-auto mb-3" />
            <p className="text-sm text-[#5A6A80]">No articles found</p>
          </div>
        )}
      </div>
    </div>
  );
}