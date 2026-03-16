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
        <div className="grid grid-cols-2 gap-4 my-6">
            <div className="hud-card p-4 rounded-3xl flex items-center gap-4 group transition-all">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Battery className={`w-5 h-5 ${stats.charging ? 'text-yellow-400 animate-pulse' : 'text-emerald-400'}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Energy_Core</p>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-bold text-white tracking-tight">{stats.battery}</p>
                        {stats.charging && (
                            <div className="px-1 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30">
                                <span className="text-[8px] text-yellow-400 font-bold">LINKED</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="hud-card p-4 rounded-3xl flex items-center gap-4 group transition-all">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Uplink_Node</p>
                    <p className="text-sm font-mono font-bold text-white truncate tracking-tight">
                        {stats.connection.split(' ')[0]} <span className="text-[10px] text-cyan-500/60">{stats.connection.split(' ')[1]}</span>
                    </p>
                </div>
            </div>

            <div className="hud-card p-4 rounded-3xl flex items-center gap-4 group transition-all">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <Cpu className="w-5 h-5 text-purple-400" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Logic_Array</p>
                    <p className="text-sm font-mono font-bold text-white truncate tracking-tight">{stats.gpu || 'CO_PROCESSOR'}</p>
                </div>
            </div>

            <div className="hud-card p-4 rounded-3xl flex items-center gap-4 group transition-all">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-red-500" />
                </div>
                <div className="min-w-0">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Sync_Status</p>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-bold text-white tracking-tight">{stats.fps} <span className="text-[9px] text-red-500/60">HZ</span></p>
                        <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
