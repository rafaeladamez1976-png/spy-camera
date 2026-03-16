import React from 'react';

export default function Sparkline({ data, width = 100, height = 30, color = "#00D4AA" }) {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data, 100);
    const min = Math.min(...data, 0);
    const range = max - min;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
            {/* Gradient area */}
            <path
                d={`M 0,${height} ${points} L ${width},${height} Z`}
                fill={`url(#gradient-${color.replace('#', '')})`}
                fillOpacity="0.1"
            />
            <defs>
                <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    );
}
