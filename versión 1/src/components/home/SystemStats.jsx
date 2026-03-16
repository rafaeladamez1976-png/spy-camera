import React, { useState, useEffect } from 'react';
import { Cpu, Battery, Globe, Zap } from 'lucide-react';

export default function SystemStats() {
    const [stats, setStats] = useState({
        battery: '...',
        charging: false,
        platform: navigator.platform,
        connection: '...',
        secure: window.isSecureContext,
        gpu: '...',
        fps: 0
    });

    useEffect(() => {
        // Battery Info
        // @ts-ignore
        if (navigator.getBattery) {
            // @ts-ignore
            navigator.getBattery().then(batt => {
                const update = () => setStats(s => ({
                    ...s,
                    battery: `${Math.round(batt.level * 100)}%`,
                    charging: batt.charging
                }));
                update();
                batt.addEventListener('levelchange', update);
                batt.addEventListener('chargingchange', update);
            });
        }

        // Network Info
        // @ts-ignore
        if (navigator.connection) {
            // @ts-ignore
            const updateConn = () => setStats(s => ({
                ...s,
                // @ts-ignore
                connection: `${(navigator.connection.effectiveType || 'unknown').toUpperCase()} (${navigator.connection.downlink || '?'} Mbps)`
            }));
            updateConn();
            // @ts-ignore
            navigator.connection.addEventListener('change', updateConn);
        }

        // GPU Info
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                // @ts-ignore
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    // @ts-ignore
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    setStats(s => ({ ...s, gpu: renderer.split(' ').pop().replace(/[()]/g, '') }));
                }
            }
        } catch (e) { }

        // Screen Refresh Rate
        let frames = 0;
        let start = performance.now();
        const checkFPS = () => {
            frames++;
            const now = performance.now();
            if (now - start >= 1000) {
                setStats(s => ({ ...s, fps: Math.round((frames * 1000) / (now - start)) }));
                return;
            }
            requestAnimationFrame(checkFPS);
        };
        requestAnimationFrame(checkFPS);

    }, []);

    return (
        <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 rounded-2xl bg-[#1A2332] border border-[#2A3A50] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Battery className={`w-4 h-4 ${stats.charging ? 'text-yellow-400 animate-pulse' : 'text-emerald-400'}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] text-[#5A6A80] font-bold uppercase tracking-tighter">Power / Level</p>
                    <p className="text-xs font-mono font-bold text-[#E8ECF0] truncate">{stats.battery} {stats.charging && '⚡'}</p>
                </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1A2332] border border-[#2A3A50] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] text-[#5A6A80] font-bold uppercase tracking-tighter">Network / Speed</p>
                    <p className="text-xs font-mono font-bold text-[#E8ECF0] truncate">{stats.connection}</p>
                </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1A2332] border border-[#2A3A50] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Cpu className="w-4 h-4 text-purple-400" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] text-[#5A6A80] font-bold uppercase tracking-tighter">GPU / Display</p>
                    <p className="text-xs font-mono font-bold text-[#E8ECF0] truncate">{stats.gpu || 'Generic'}</p>
                </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#1A2332] border border-[#2A3A50] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-red-400" />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] text-[#5A6A80] font-bold uppercase tracking-tighter">Perf / Refresh</p>
                    <p className="text-xs font-mono font-bold text-[#E8ECF0] truncate">{stats.fps} Hz</p>
                </div>
            </div>
        </div>
    );
}
