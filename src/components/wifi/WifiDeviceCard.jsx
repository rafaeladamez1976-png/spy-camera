import React from 'react';
import { Wifi, AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

const labelIcons = {
  possible_camera: AlertCircle,
  unknown_device: HelpCircle,
  trusted_device: CheckCircle,
};

const labelMap = {
  possible_camera: 'possible_camera',
  unknown_device: 'unknown',
  trusted_device: 'trusted',
};

export default function WifiDeviceCard({ device }) {
  const Icon = labelIcons[device.label] || HelpCircle;

  return (
    <div className={`hud-card p-5 rounded-3xl transition-all border-l-4 ${
      device.label === 'possible_camera'
        ? 'border-l-red-500 bg-red-500/[0.03]'
        : device.label === 'unknown_device'
          ? 'border-l-amber-500 bg-amber-500/[0.03]'
          : 'border-l-emerald-500 bg-emerald-500/[0.03]'
    }`}>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            device.label === 'possible_camera' ? 'bg-red-500/10' : 'bg-white/5'
          }`}>
            <Icon className={`w-6 h-6 ${
              device.label === 'possible_camera' ? 'text-red-400' : 
              device.label === 'unknown_device' ? 'text-amber-400' : 'text-emerald-400'
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-white truncate">{device.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                {device.ip}
              </span>
              {device.signal_strength && (
                <span className="text-[10px] font-mono text-cyan-500/60">
                  RSSI: -{device.signal_strength}dBm
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={`text-[10px] font-mono px-2 py-1 rounded border ${
          device.label === 'possible_camera' ? 'text-red-400 border-red-500/30' :
          device.label === 'unknown_device' ? 'text-amber-400 border-amber-500/30' : 'text-emerald-400 border-emerald-500/30'
        }`}>
          {device.label === 'possible_camera' ? 'SUSPICIOUS' :
           device.label === 'unknown_device' ? 'UNKNOWN' : 'SAFE'}
        </div>
      </div>
      <div className="pl-16 flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
        {device.manufacturer && (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Mfg</span>
            <p className="text-[10px] text-slate-300 font-bold truncate max-w-[120px]">{device.manufacturer}</p>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Type</span>
          <p className="text-[10px] text-slate-300 font-bold">{device.type}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">Sec</span>
          <p className={`text-[10px] font-bold ${device.secure ? 'text-emerald-500' : 'text-red-500'}`}>
            {device.secure ? 'ENCRYPTED' : 'EXPOSED'}
          </p>
        </div>
        {device.signal && (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="flex gap-0.5 h-2 items-end">
              {[1, 2, 3, 4].map(bar => (
                <div 
                  key={bar} 
                  className={`w-0.5 rounded-full ${
                    bar <= (device.signal > -50 ? 4 : device.signal > -70 ? 3 : device.signal > -90 ? 2 : 1)
                    ? 'bg-cyan-500' : 'bg-white/10'
                  }`}
                  style={{ height: `${bar * 25}%` }}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-cyan-500/60 uppercase">{device.signal} dBm</span>
          </div>
        )}
      </div>
    </div>
  );
}