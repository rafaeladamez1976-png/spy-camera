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
    <div className={`p-5 rounded-2xl border transition-all ${
      device.label === 'possible_camera'
        ? 'bg-red-500/8 border-red-500/30'
        : 'bg-[#1A2332] border-[#2A3A50]'
    }`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            device.label === 'possible_camera' ? 'bg-red-500/15' : 'bg-[#243044]'
          }`}>
            <Icon className={`w-6 h-6 ${
              device.label === 'possible_camera' ? 'text-red-400' : 'text-[#5A6A80]'
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base truncate mb-1.5">{device.name}</p>
            <p className="text-xs text-[#5A6A80] font-mono mb-1">{device.ip}</p>
            {device.manufacturer && (
              <p className="text-xs text-[#8B9BB4] mb-0.5">{device.manufacturer}</p>
            )}
          </div>
        </div>
        <StatusBadge status={labelMap[device.label]} customLabel={
          device.label === 'possible_camera' ? 'Suspicious' :
          device.label === 'unknown_device' ? 'Unknown' : 'Safe'
        } />
      </div>
      <p className="text-xs text-[#5A6A80] pl-16">{device.type}</p>
    </div>
  );
}