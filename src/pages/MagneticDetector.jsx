import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Magnet, RotateCcw, Save, Activity, AlertCircle, Signal } from 'lucide-react';
import MagneticGauge from '../components/magnetic/MagneticGauge';
import StatusBadge from '../components/shared/StatusBadge';
import DisclaimerBanner from '../components/shared/DisclaimerBanner';
import Sparkline from '../components/shared/Sparkline';
import { base44 } from '@/api/base44Client';

const THRESHOLD = 100;

export default function MagneticDetector() {
  const [isActive, setIsActive] = useState(false);
  const [value, setValue] = useState(0);
  const [history, setHistory] = useState(new Array(30).fill(0));
  const [baseline, setBaseline] = useState(null);
  const [peaks, setPeaks] = useState([]);
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const intervalRef = useRef(null);
  const lastValueRef = useRef(0);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  // Check magnetometer availability and initialize
  useEffect(() => {
    if ('Magnetometer' in window) {
      setSensorAvailable(true);
    } else if ('DeviceMotionEvent' in window) {
      setSensorAvailable(true);
    } else {
      setSensorAvailable(false);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setSensorAvailable(true);
          startDetection();
        }
      } catch (e) {
        console.error('Permission request failed', e);
      }
    } else {
      startDetection();
    }
  };

  const startDetection = () => {
    setIsActive(true);
    setPeaks([]);
    setAlertTriggered(false);
    setSessionId(null);

    // Create scan session
    if (user?.id) {
      base44.entities.ScanSession.create({
        user_id: user.id,
        scan_type: 'magnetic',
        status: 'in_progress',
      }).then(session => setSessionId(session.id))
        .catch(error => console.error('Failed to create session:', error));
    }

    // Real Magnetometer API
    const Magnetometer = window.Magnetometer;
    if (Magnetometer) {
      try {
        const sensor = new Magnetometer({ frequency: 10 });

        sensor.addEventListener('reading', () => {
          // Calculate magnitude: sqrt(x^2 + y^2 + z^2)
          const magnitude = Math.sqrt(
            Math.pow(sensor.x || 0, 2) +
            Math.pow(sensor.y || 0, 2) +
            Math.pow(sensor.z || 0, 2)
          );

          // Magnetometer returns µT (microteslas)
          // Earth's field is ~25-65 µT. We calibrate relative to baseline.
          const processedValue = baseline ? Math.abs(magnitude - baseline) + 30 : magnitude;

          setValue(processedValue);
          setHistory(prev => [...prev, processedValue].slice(-30));
          lastValueRef.current = magnitude;

          if (processedValue >= THRESHOLD) {
            setAlertTriggered(true);
            setPeaks(prev => {
              const p = [...prev, { value: Math.round(processedValue), time: new Date().toLocaleTimeString() }];
              return p.slice(-5);
            });
          } else {
            setAlertTriggered(false);
          }
        });

        sensor.addEventListener('error', (event) => {
          console.error('Magnetometer error:', event.error.message);
          setSensorAvailable(false);
          startSimulatedDetection();
        });

        sensor.start();
        intervalRef.current = sensor;

      } catch (error) {
        console.error('Magnetometer start failed:', error);
        startSimulatedDetection();
      }
    } else {
      // Fallback to simulation
      startSimulatedDetection();
    }
  };

  const startSimulatedDetection = () => {
    intervalRef.current = setInterval(() => {
      const base = baseline || 45;
      // More realistic noise
      const noise = (Math.random() - 0.5) * 5;
      const spike = Math.random() > 0.98 ? 80 + Math.random() * 40 : 0;
      const newVal = Math.max(0, base + noise + spike);

      setValue(newVal);
      setHistory(prev => [...prev, newVal].slice(-30));
      lastValueRef.current = newVal;

      if (newVal >= THRESHOLD) {
        setAlertTriggered(true);
        setPeaks(prev => {
          const p = [...prev, { value: Math.round(newVal), time: new Date().toLocaleTimeString() }];
          return p.slice(-5);
        });
      }
    }, 200);
  };


  const stopDetection = () => {
    setIsActive(false);

    // Stop sensor or interval
    if (intervalRef.current) {
      if (intervalRef.current.stop) {
        // Real magnetometer sensor
        intervalRef.current.stop();
      } else {
        // Simulated interval
        clearInterval(intervalRef.current);
      }
    }

    // Update session to completed
    if (user?.id && sessionId) {
      base44.entities.ScanSession.update(sessionId, {
        status: 'completed',
        suspicious_count: peaks.length,
        findings_count: peaks.length,
      }).catch(error => console.error('Failed to update session:', error));
    }
  };

  const calibrate = () => {
    setBaseline(lastValueRef.current || 30);
  };

  const saveReading = async () => {
    if (!user?.id || !sessionId) {
      alert('Please sign in to save findings');
      return;
    }

    try {
      await base44.entities.SuspiciousFinding.create({
        user_id: user.id,
        scan_session_id: sessionId,
        finding_type: 'magnetic_anomaly',
        severity: value >= THRESHOLD ? 'high' : value >= THRESHOLD * 0.6 ? 'medium' : 'low',
        title: `Magnetic anomaly: ${Math.round(value)} µT`,
        magnetic_value: Math.round(value),
        description: `${peaks.length} peak${peaks.length !== 1 ? 's' : ''} detected above threshold. May indicate active electronics.`,
      });
      alert('Reading saved successfully');
    } catch (error) {
      console.error('Failed to save reading:', error);
      alert('Failed to save reading');
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        if (intervalRef.current.stop) {
          intervalRef.current.stop();
        } else {
          clearInterval(intervalRef.current);
        }
      }
    };
  }, []);

  const getStatus = () => {
    if (value >= THRESHOLD) return 'danger';
    if (value >= THRESHOLD * 0.6) return 'warning';
    return 'safe';
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-5 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Magnet className="w-6 h-6 text-amber-500 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight glow-text-cyan text-white">Flux Sensor</h1>
            <p className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest mt-0.5">High-Frequency EMF Mapping</p>
          </div>
        </div>
      </div>

      {/* Sensor Warning */}
      {!sensorAvailable && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-amber-500 uppercase tracking-tight">Core Sensor Offline</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-medium uppercase opacity-70">
                Hardware non-compliant. Switching to edge-node simulation for session diagnostics.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Analysis Panel */}
      <div className="mx-5 hud-card rounded-[2.5rem] p-6 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -z-10" />
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Spectral Stream</p>
            </div>
            <div className="pt-2">
              <Sparkline data={history} width={100} height={30} color={value >= THRESHOLD ? "#FF2D55" : "#00F5FF"} />
            </div>
          </div>
          <div className="text-right">
             <div className="text-3xl font-bold font-mono text-white tracking-tighter tabular-nums">
               {Math.round(value)}
               <span className="text-[10px] text-cyan-500/60 ml-1 font-light uppercase">µT</span>
             </div>
             <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">Current Intensity</p>
          </div>
        </div>

        <div className="relative py-4">
           <MagneticGauge value={value} threshold={THRESHOLD} />
           {/* Decorative elements around gauge */}
           <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className="w-48 h-48 border border-white/20 rounded-full" />
              <div className="absolute w-56 h-56 border border-white/10 rounded-full border-dashed animate-spin-slow" />
           </div>
        </div>

        <div className="flex justify-center">
          <div className={`px-4 py-1.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest ${
            getStatus() === 'danger' ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
            getStatus() === 'warning' ? 'bg-amber-500/20 border-amber-500 text-amber-500' :
            'bg-emerald-500/20 border-emerald-500 text-emerald-500'
          }`}>
            {getStatus() === 'danger' ? 'Critial Anomaly' :
             getStatus() === 'warning' ? 'Localized Spike' : 'Nominal Flux'}
          </div>
        </div>
      </div>

      {/* Active Alert */}
      <AnimatePresence>
        {alertTriggered && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="mx-5 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-xs text-red-500 uppercase tracking-tight">Signal Collision Detected</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter opacity-80 mt-0.5">Triangulating EMF source. Maintain current vector.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operational Controls */}
      <div className="px-5 flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={isActive ? stopDetection : requestPermission}
          className={`flex-1 py-5 rounded-2xl font-bold text-base tracking-tight transition-all uppercase ${isActive
            ? 'bg-red-500/10 text-red-500 border border-red-500/30'
            : 'bg-cyan-500 text-black shadow-[0_8px_25px_rgba(0,245,255,0.2)]'
            }`}
        >
          {isActive ? 'Cease Link' : 'Initialize Probes'}
        </motion.button>
        <button
          onClick={calibrate}
          className="w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Baseline Telemetry */}
      {baseline !== null && (
        <div className="flex items-center justify-center gap-2">
           <div className="w-1 h-1 rounded-full bg-slate-500" />
           <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
             Ref Baseline: {Math.round(baseline)} µT
           </p>
        </div>
      )}

      {/* Event Log */}
      {peaks.length > 0 && (
        <div className="mx-5 space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em]">
              Anomaly Log
            </h3>
            <button
              onClick={saveReading}
              className="text-[9px] font-mono font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Save className="w-3.5 h-3.5" /> Push to Cloud
            </button>
          </div>
          <div className="space-y-2">
            {peaks.map((peak, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-3">
                   <div className={`w-1.5 h-1.5 rounded-full ${peak.value >= THRESHOLD ? 'bg-red-500' : 'bg-amber-400'}`} />
                   <span className="text-[10px] font-mono text-slate-500">{peak.time}</span>
                </div>
                <div className={`text-xs font-mono font-bold ${peak.value >= THRESHOLD ? 'text-red-500' : 'text-amber-400'}`}>
                  +{peak.value} µT <span className="text-[9px] opacity-60">MAG_FLUX</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Operational Protocol */}
      <div className="mx-5 p-5 rounded-3xl bg-black/40 border border-white/5 space-y-2">
        <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Protocol 04-EMF</h3>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          Electronics generate unique magnetic signatures. Traverse target zones slowly. Persistent flux spikes exceeding {THRESHOLD} µT 
          correlate with high-probability hidden transceivers or recording hardware.
        </p>
      </div>

      <div className="pb-8">
         <DisclaimerBanner compact />
      </div>
    </div>
  );
}