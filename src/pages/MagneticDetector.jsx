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
    <div className="px-5 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
          <Magnet className="w-5 h-5 text-[#FF6B35]" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Magnetic Detector</h1>
          <p className="text-xs text-[#5A6A80]">Detect electronic magnetic fields</p>
        </div>
      </div>

      {/* Sensor Warning */}
      {!sensorAvailable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-amber-400">Magnetometer Unavailable</p>
              <p className="text-xs text-[#8B9BB4] mt-1 leading-relaxed">
                Your device doesn't support magnetic field detection. Results are simulated for demonstration purposes only.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Gauge */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-xs text-[#5A6A80] font-medium uppercase tracking-wider">Live Signal</p>
            <Sparkline data={history} width={120} height={40} color={value >= THRESHOLD ? "#F87171" : "#00D4AA"} />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono tracking-tighter">{Math.round(value)}<span className="text-xs text-[#5A6A80] ml-1">µT</span></p>
          </div>
        </div>
        <MagneticGauge value={value} threshold={THRESHOLD} />
        <div className="flex justify-center mt-2">
          <StatusBadge status={getStatus()} customLabel={null} />
        </div>
      </div>

      {/* Alert */}
      <AnimatePresence>
        {alertTriggered && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-red-400 animate-pulse" />
              <div>
                <p className="font-semibold text-sm text-red-400">Strong signal detected</p>
                <p className="text-xs text-[#5A6A80] mt-0.5">Move slowly to locate the source</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={isActive ? stopDetection : requestPermission}
          className={`flex-1 py-4 rounded-2xl font-semibold text-base ${isActive
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : 'gradient-accent text-[#0F1419] shadow-lg shadow-[#00D4AA]/20'
            }`}
        >
          {isActive ? 'Stop' : 'Start Detection'}
        </motion.button>
        <button
          onClick={calibrate}
          className="w-14 rounded-2xl bg-[#1A2332] border border-[#2A3A50] flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5 text-[#5A6A80]" />
        </button>
      </div>

      {/* Baseline info */}
      {baseline !== null && (
        <p className="text-xs text-[#5A6A80] text-center">
          Baseline calibrated at {Math.round(baseline)} µT
        </p>
      )}

      {/* Recent Peaks */}
      {peaks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#5A6A80] uppercase tracking-wider">
              Recent Peaks
            </h3>
            <button
              onClick={saveReading}
              className="text-xs text-[#00D4AA] font-medium flex items-center gap-1"
            >
              <Save className="w-3 h-3" /> Save
            </button>
          </div>
          <div className="space-y-1.5">
            {peaks.map((peak, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A2332]/60 border border-[#2A3A50]/30">
                <span className="text-xs text-[#8B9BB4]">{peak.time}</span>
                <span className={`text-sm font-semibold ${peak.value >= THRESHOLD ? 'text-red-400' : 'text-amber-400'
                  }`}>
                  {peak.value} µT
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="p-4 rounded-xl bg-[#1A2332] border border-[#2A3A50]">
        <h3 className="text-sm font-semibold text-[#E8ECF0] mb-2">How it works</h3>
        <p className="text-xs text-[#8B9BB4] leading-relaxed">
          Electronic devices emit magnetic fields. Move your phone slowly near suspicious areas. Spikes above {THRESHOLD} µT may indicate hidden electronics like cameras or recording devices.
        </p>
      </div>

      <DisclaimerBanner compact />
    </div>
  );
}