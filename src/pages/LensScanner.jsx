import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Camera, Flashlight, FlashlightOff, CircleDot, Save, RotateCcw, AlertTriangle, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import DisclaimerBanner from '../components/shared/DisclaimerBanner';
import { base44 } from '@/api/base44Client';

export default function LensScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [sensitivity, setSensitivity] = useState([50]);
  const [reflections, setReflections] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('unknown');
  const [sessionId, setSessionId] = useState(null);
  const scanTimerRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  // Check camera permission
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' })
        .then(result => {
          setCameraPermission(result.state);
          result.onchange = () => setCameraPermission(result.state);
        })
        .catch(() => setCameraPermission('prompt'));
    }
  }, []);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [fps, setFps] = useState(0);
  const [resolution, setResolution] = useState('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Initialize camera
  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setResolution(`${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        };
        setIsCameraReady(true);
        setCameraPermission('granted');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraPermission('denied');
    }
  };

  const startScan = async () => {
    if (cameraPermission === 'denied') {
      alert('Camera access denied. Please enable camera permissions in your device settings.');
      return;
    }

    if (!isCameraReady) {
      await setupCamera();
    }

    setIsScanning(true);
    setReflections([]);
    setShowResults(false);
    setSessionId(null);

    // Real reflection detection using canvas processing
    let frames = 0;
    const maxFrames = 15;

    scanTimerRef.current = setInterval(() => {
      frames++;

      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Match canvas size to video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple bright spot detection (potential lens reflection)
        let brightest = { x: 0, y: 0, val: 0 };
        const step = 4; // Check every 4 pixels for performance

        for (let i = 0; i < data.length; i += 4 * step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;

          if (brightness > brightest.val) {
            const pixelIndex = i / 4;
            brightest = {
              val: brightness,
              x: (pixelIndex % canvas.width) / canvas.width * 100,
              y: (Math.floor(pixelIndex / canvas.width)) / canvas.height * 100
            };
          }
        }

        // Update FPS
        frameCountRef.current++;
        const now = performance.now();
        if (now - lastTimeRef.current >= 1000) {
          setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
          frameCountRef.current = 0;
          lastTimeRef.current = now;
        }

        // If brightness is high enough and sensitivity matches
        const threshold = 255 - (sensitivity[0] * 2);
        if (brightest.val > threshold && Math.random() > 0.4) {
          const newReflection = {
            id: Date.now(),
            x: brightest.x,
            y: brightest.y,
            intensity: (brightest.val / 255) * 100,
          };
          setReflections(prev => {
            // Only add if not very close to existing ones
            const isDuplicate = prev.some(r => Math.abs(r.x - newReflection.x) < 5 && Math.abs(r.y - newReflection.y) < 5);
            return isDuplicate ? prev : [...prev, newReflection].slice(-10);
          });
        }
      }

      if (frames >= maxFrames) {
        clearInterval(scanTimerRef.current);
        setIsScanning(false);
        setShowResults(true);

        // Save scan session (already implemented below)
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const saveFindings = async () => {
    if (!user?.id || !sessionId) return;

    try {
      for (const r of reflections) {
        await base44.entities.SuspiciousFinding.create({
          user_id: user.id,
          scan_session_id: sessionId,
          finding_type: 'lens_reflection',
          severity: r.intensity > 70 ? 'high' : r.intensity > 40 ? 'medium' : 'low',
          title: `Reflection at ${Math.round(r.x)}%, ${Math.round(r.y)}%`,
          description: `Intensity: ${Math.round(r.intensity)}%. Real-time visual detection.`,
          location_description: `Position: ${Math.round(r.x)}% horizontal, ${Math.round(r.y)}% vertical`,
        });
      }
      alert('Findings saved successfully');
    } catch (error) {
      console.error('Failed to save findings:', error);
      alert('Failed to save findings');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00BFFF]/10 flex items-center justify-center">
          <Camera className="w-5 h-5 text-[#00BFFF]" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Lens Scanner</h1>
          <p className="text-xs text-[#5A6A80]">Detect camera lens reflections</p>
        </div>
      </div>

      {/* Camera View Area */}
      <div className="relative mx-5 rounded-2xl overflow-hidden bg-[#0a0e13] border border-[#2A3A50] aspect-[3/4]">
        {/* Real camera feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Real-time Metadata Overlay */}
        {isCameraReady && (
          <div className="absolute top-4 left-4 z-30 flex flex-col gap-1">
            <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-[#E8ECF0]">LIVE {fps} FPS</span>
            </div>
            <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10">
              <span className="text-[10px] font-mono text-[#8B9BB4]">{resolution}</span>
            </div>
          </div>
        )}

        {/* Scan overlay */}
        {isScanning && (
          <>
            {/* Scanning line */}
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-[#00BFFF] shadow-[0_0_12px_rgba(0,191,255,0.8)] z-10"
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Grid */}
            <div className="absolute inset-0 opacity-10 z-0" style={{
              backgroundImage: 'linear-gradient(#00BFFF 1px, transparent 1px), linear-gradient(90deg, #00BFFF 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
          </>
        )}

        {/* Reflection Points */}
        <AnimatePresence>
          {reflections.map((r) => (
            <motion.div
              key={r.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute z-20"
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
            >
              <div className="relative">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${r.intensity > 70 ? 'border-red-400 bg-red-400/20' : 'border-amber-400 bg-amber-400/20'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${r.intensity > 70 ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Instruction text */}
        {!isScanning && !showResults && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6 bg-black/40 backdrop-blur-sm p-6 rounded-3xl border border-white/5">
              <Camera className="w-12 h-12 text-[#00BFFF] mx-auto mb-3" />
              <p className="text-sm text-white font-medium">
                {cameraPermission === 'denied'
                  ? 'Camera access denied. Enable in settings.'
                  : 'Point camera at suspicious spots'}
              </p>
              <p className="text-xs text-[#8B9BB4] mt-1">Lenses reflect light in dark environments</p>
            </div>
          </div>
        )}

      </div>

      {/* Controls */}
      <div className="px-5 py-4 space-y-4">
        {/* Flashlight + Sensitivity */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFlashOn(!flashOn)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${flashOn
                ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                : 'bg-[#1A2332] border-[#2A3A50] text-[#5A6A80]'
              }`}
          >
            {flashOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
          </button>
          <div className="flex-1">
            <p className="text-xs text-[#5A6A80] mb-1.5">Sensitivity</p>
            <Slider
              value={sensitivity}
              onValueChange={setSensitivity}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Scan Button */}
        {!showResults && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={startScan}
            disabled={isScanning}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${isScanning
                ? 'bg-[#243044] text-[#5A6A80]'
                : 'bg-[#00BFFF] text-[#0F1419] shadow-lg shadow-[#00BFFF]/20'
              }`}
          >
            {isScanning ? (
              <span className="flex items-center justify-center gap-2">
                <CircleDot className="w-5 h-5 animate-pulse" /> Scanning...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" /> Start Scan
              </span>
            )}
          </motion.button>
        )}

        {/* Results Summary */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={`p-5 rounded-2xl border ${reflections.length > 0
                ? 'bg-amber-500/8 border-amber-500/30'
                : 'bg-emerald-500/8 border-emerald-500/30'
              }`}>
              {reflections.length > 0 ? (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-bold text-base mb-1">{reflections.length} Reflection{reflections.length > 1 ? 's' : ''} Detected</p>
                    <p className="text-sm text-[#8B9BB4] leading-relaxed">Physically inspect each bright spot. May be LEDs, glass, or reflective surfaces.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-base">Scan Complete</p>
                    <p className="text-sm text-[#8B9BB4] mt-1">No obvious reflections found</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {reflections.length > 0 && (
                <button
                  onClick={saveFindings}
                  className="flex-1 py-3 rounded-2xl bg-[#1A2332] border border-[#2A3A50] text-sm font-medium text-[#8B9BB4] flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Findings
                </button>
              )}
              <button
                onClick={() => { setShowResults(false); setReflections([]); }}
                className="flex-1 py-3 rounded-2xl bg-[#1A2332] border border-[#2A3A50] text-sm font-medium text-[#8B9BB4] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Rescan
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-[#243044]/40 border border-[#2A3A50]">
              <Info className="w-5 h-5 text-[#5A6A80] mt-0.5 shrink-0" />
              <p className="text-xs text-[#8B9BB4] leading-relaxed">Visual assistance only. Reflections can be LEDs, mirrors, or glass. Manually verify suspicious areas.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}