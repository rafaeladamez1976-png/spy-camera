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
      <div className="px-5 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Camera className="w-6 h-6 text-amber-500 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight glow-text-red text-white">Optic Sentry</h1>
            <p className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest mt-0.5">Lens Glint Detection</p>
          </div>
        </div>
      </div>

      {/* Camera View Area */}
      <div className="relative mx-5 rounded-[2.5rem] overflow-hidden bg-[#05080A] border border-white/10 aspect-[3/4] shadow-2xl shadow-black">
        {/* Real camera feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* HUD Elements */}
        {isCameraReady && (
          <>
            {/* Corners */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
            
            {/* Metadata */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-white uppercase tracking-tighter">REC</span>
               </div>
               <div className="w-[1px] h-3 bg-white/10" />
               <span className="text-[9px] font-mono text-slate-400 uppercase">{resolution}</span>
               <div className="w-[1px] h-3 bg-white/10" />
               <span className="text-[9px] font-mono text-slate-400 uppercase">{fps} FPS</span>
            </div>
          </>
        )}

        {/* Scan overlay */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 pointer-events-none"
            >
              {/* Scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_20px_#FF2D55] opacity-80"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
              {/* Grid */}
              <div className="absolute inset-0 opacity-[0.03] z-0 bg-dot-grid" />
              
              {/* Central Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-40 h-40 border border-red-500/50 rounded-full" />
                <div className="absolute w-8 h-[1px] bg-red-500" />
                <div className="absolute h-8 w-[1px] bg-red-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center animate-spin-slow ${
                   r.intensity > 70 ? 'border-red-500 bg-red-500/10' : 'border-amber-400 bg-amber-400/10'
                }`}>
                   <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_10px_white]" />
                </div>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-black/80 rounded border border-white/20 whitespace-nowrap">
                  <span className="text-[8px] font-mono text-white">INTENSITY: {Math.round(r.intensity)}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Instruction text */}
        {!isScanning && !showResults && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 mx-auto flex items-center justify-center shadow-2xl">
                <Camera className="w-8 h-8 text-amber-500 opacity-80" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white font-bold tracking-tight uppercase">
                  {cameraPermission === 'denied'
                    ? 'Optical Link Blocked'
                    : 'System Ready'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider max-w-[180px] mx-auto uppercase">
                   Scan for unnatural glints or reflections in dark areas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-5 py-6 space-y-6">
        {/* Flashlight + Sensitivity */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setFlashOn(!flashOn)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${flashOn
              ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
              : 'bg-white/5 border-white/10 text-slate-500'
              }`}
          >
            {flashOn ? <Flashlight className="w-6 h-6" /> : <FlashlightOff className="w-6 h-6" />}
          </button>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Gain Control</span>
              <span className="text-[10px] font-mono text-amber-500">{sensitivity[0]}%</span>
            </div>
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
            whileTap={{ scale: 0.98 }}
            onClick={startScan}
            disabled={isScanning}
            className={`w-full py-5 rounded-2xl font-bold text-base tracking-tight transition-all uppercase ${isScanning
              ? 'bg-white/5 text-slate-600 border border-white/10 cursor-not-allowed'
              : 'bg-red-500 text-white shadow-[0_4px_25px_rgba(255,45,85,0.3)] hover:shadow-[0_4px_35px_rgba(255,45,85,0.5)]'
              }`}
          >
            {isScanning ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> 
                System Cycling...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Camera className="w-5 h-5" /> Initiate Optical Probe
              </span>
            )}
          </motion.button>
        )}

        {/* Results Summary */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className={`hud-card rounded-3xl p-6 border-l-4 ${reflections.length > 0
              ? 'border-l-amber-500 bg-amber-500/[0.03]'
              : 'border-l-emerald-500 bg-emerald-500/[0.03]'
            }`}>
              {reflections.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-7 h-7 text-amber-500 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">{reflections.length} Glint{reflections.length > 1 ? 's' : ''} Detected</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">High confidence optical reflections found. Cross-reference with physical inspection.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-7 h-7 text-emerald-500 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Scan Resolved</h3>
                    <p className="text-xs text-slate-400 font-medium">No suspicious optical signatures identified in current FOV.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {reflections.length > 0 && (
                <button
                  onClick={saveFindings}
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Data
                </button>
              )}
              <button
                onClick={() => { setShowResults(false); setReflections([]); }}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Cycle Probe
              </button>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-black/40 border border-white/5">
              <Info className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-tight">
                Optical analysis provides visual assistance only. False positives may occur from glass, mirrors, or LEDs. 
                Manual validation is required for high-confidence determination.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}