import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const configs = {
  safe: {
    icon: CheckCircle,
    label: 'Normal',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Elevated',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  danger: {
    icon: AlertCircle,
    label: 'Strong signal nearby',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  possible_camera: {
    icon: AlertCircle,
    label: 'Possible Camera',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  unknown: {
    icon: AlertTriangle,
    label: 'Unknown Device',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  trusted: {
    icon: CheckCircle,
    label: 'Trusted Device',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
};

export default function StatusBadge({ status, customLabel }) {
  const config = configs[status] || configs.safe;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      {customLabel || config.label}
    </span>
  );
}