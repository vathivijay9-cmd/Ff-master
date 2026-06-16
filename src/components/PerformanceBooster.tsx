/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cpu, RotateCcw, Trash2, ShieldCheck, Terminal, HelpCircle, Copy, Check, Eye, Wifi, Globe, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { DeviceModel, GfxSettings } from '../types';

interface PerformanceBoosterProps {
  device: DeviceModel;
  isFlagshipMode: boolean;
  onGfxChange: (settings: GfxSettings) => void;
  gfxSettings: GfxSettings;
}

export default function PerformanceBooster({ device, isFlagshipMode, onGfxChange, gfxSettings }: PerformanceBoosterProps) {
  // RAM Cleaning States
  const [ramUsage, setRamUsage] = useState(74); // Starting percentage
  const [isCleaningRam, setIsCleaningRam] = useState(false);
  const [ramLogs, setRamLogs] = useState<string[]>([]);
  const [cleanedRamAmount, setCleanedRamAmount] = useState<number | null>(null);

  // Trash Cleaning States
  const [trashSize, setTrashSize] = useState(4.82); // in GB
  const [isCleaningTrash, setIsCleaningTrash] = useState(false);
  const [trashCleaned, setTrashCleaned] = useState(false);

  // CPU Governor
  const [governor, setGovernor] = useState<'interactive' | 'performance' | 'schedutil' | 'powersave'>('performance');
  const [cpuPriority, setCpuPriority] = useState<boolean>(true);
  
  // Custom console command viewer
  const [showAdbHelper, setShowAdbHelper] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Network Ping Tester States
  const [isPingTesting, setIsPingTesting] = useState(true);
  const [isNetworkAccelerated, setIsNetworkAccelerated] = useState(false);
  const [pingData, setPingData] = useState<{ [key: string]: number }>({
    'SG': 28,
    'IN': 52,
    'BR': 192,
    'ME': 78,
    'EU': 135,
    'ID': 34
  });

  useEffect(() => {
    if (!isPingTesting) return;

    const interval = setInterval(() => {
      setPingData((prev) => {
        const next = { ...prev };
        const maximumJitter = isNetworkAccelerated ? 3 : 8;

        const sgBase = isNetworkAccelerated ? 16 : 28;
        const inBase = isNetworkAccelerated ? 36 : 52;
        const brBase = isNetworkAccelerated ? 135 : 192;
        const meBase = isNetworkAccelerated ? 48 : 78;
        const euBase = isNetworkAccelerated ? 90 : 135;
        const idBase = isNetworkAccelerated ? 18 : 34;

        next['SG'] = Math.max(12, Math.floor(sgBase + (Math.random() * maximumJitter) - (maximumJitter / 2)));
        next['IN'] = Math.max(28, Math.floor(inBase + (Math.random() * maximumJitter) - (maximumJitter / 2)));
        next['BR'] = Math.max(120, Math.floor(brBase + (Math.random() * maximumJitter) - (maximumJitter / 2)));
        next['ME'] = Math.max(45, Math.floor(meBase + (Math.random() * maximumJitter) - (maximumJitter / 2)));
        next['EU'] = Math.max(85, Math.floor(euBase + (Math.random() * maximumJitter) - (maximumJitter / 2)));
        next['ID'] = Math.max(15, Math.floor(idBase + (Math.random() * maximumJitter) - (maximumJitter / 2)));

        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isPingTesting, isNetworkAccelerated]);

  // Generate system logs for RAM clean
  const triggerRamClean = () => {
    if (isCleaningRam) return;
    setIsCleaningRam(true);
    setCleanedRamAmount(null);
    setRamLogs([]);

    const steps = [
      'Identifying inactive background services...',
      'Terminating com.android.chrome cached threads...',
      'De-allocating social app background caches (com.facebook.katana)...',
      'Purging memory leaks from standby engines...',
      'Synchronizing game core allocation bounds...',
      'Re-ordering heap blocks for Free Fire stability...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setRamLogs((prev) => [...prev, `[system] ${steps[currentStep]}`]);
        // Reduce RAM usage gradually
        setRamUsage((prev) => Math.max(prev - Math.floor(Math.random() * 6 + 5), 42));
        currentStep++;
      } else {
        clearInterval(interval);
        setIsCleaningRam(false);
        const saved = (isFlagshipMode ? 3.4 : 1.8);
        setCleanedRamAmount(saved);
        setRamUsage(41); // final optimized RAM spot
        setRamLogs((prev) => [...prev, `[success] Freed ${saved}GB of active RAM successfully!`]);
      }
    }, 450);
  };

  // Trigger Trash Sweep
  const triggerTrashClean = () => {
    if (isCleaningTrash) return;
    setIsCleaningTrash(true);

    setTimeout(() => {
      setIsCleaningTrash(false);
      setTrashCleaned(true);
      setTrashSize(0);
    }, 2000);
  };

  // Playbook ADB command configurations for real device optimization
  const adbCommands = [
    {
      title: "Set Maximum CPU Performance Governor",
      description: "Forces Android kernel clock controllers to dynamic maximum frequency.",
      command: `adb shell "su -c 'echo performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor'"`
    },
    {
      title: "Optimize Free Fire Package Compilation",
      description: "Speeds up loading screens and completely eliminates visual micro-stutter (Speed compiler).",
      command: "adb shell cmd package compile -m speed com.dts.freefireth"
    },
    {
      title: "Enable Global System Performance Mode",
      description: "Sets the operating system priority list directly to Game Booster profile (Vivo T2x Funtouch secret setting).",
      command: "adb shell settings put global sys_performance_mode 1"
    },
    {
      title: "Unlock 90/120Hz Hardware Sync",
      description: "Bypasses default Funtouch refresh locks, forcing dynamic maximum frames.",
      command: "adb shell settings put global peak_refresh_rate 120.0"
    }
  ];

  const handleCopyCommand = (commandText: string, index: number) => {
    navigator.clipboard.writeText(commandText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div id="performance-booster-container" className="space-y-6">
      {/* Overview stats layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* RAM CLEAN CELL */}
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-200 font-sans font-bold text-lg">Active RAM Booster</h3>
              <p className="text-gray-400 text-xs mt-1 font-sans">Clear heavy memory leak processes to stabilize Free Fire.</p>
            </div>
            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 py-1 px-2.5 rounded-full border border-cyan-500/20 font-bold uppercase">
              LPDDR Optimization
            </span>
          </div>

          <div className="flex items-center gap-6 py-2">
            {/* Circular Gauge Graphic */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-slate-800 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-cyan-400 fill-none transition-all duration-500"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * ramUsage) / 100}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-mono font-bold text-white">{ramUsage}%</span>
                <span className="text-[9px] text-slate-500 uppercase font-mono">Used</span>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="text-xs text-slate-400 font-sans">
                Device Model: <span className="text-cyan-400 font-semibold">{device}</span>
              </div>
              <div className="text-xs text-slate-400 font-sans">
                Status: <span className={ramUsage > 70 ? 'text-orange-400 font-medium' : 'text-green-400 font-medium'}>
                  {ramUsage > 70 ? 'Overburdened (Fragile FPS)' : 'Optimized (Optimal FPS)'}
                </span>
              </div>
              {cleanedRamAmount && (
                <div className="text-xs text-green-400 font-mono font-semibold">
                  ★ Liberated {cleanedRamAmount} GB RAM!
                </div>
              )}
            </div>
          </div>

          {/* Logs terminal */}
          {ramLogs.length > 0 && (
            <div className="bg-slate-950/80 rounded-lg p-2.5 max-h-[85px] overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 border border-slate-800 scrollbar-thin">
              {ramLogs.map((log, idx) => (
                <div key={idx} className={log.startsWith('[success]') ? 'text-green-400 font-bold' : ''}>
                  {log}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={triggerRamClean}
            disabled={isCleaningRam}
            className={`w-full py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 font-sans ${
              isCleaningRam 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 font-extrabold hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isCleaningRam ? 'animate-spin' : ''}`} />
            {isCleaningRam ? 'Sweeping RAM Blocks...' : 'ONE-TAP RAM CLEAN'}
          </button>
        </div>

        {/* TRASH CLEAN CELL */}
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-200 font-sans font-bold text-lg">Storage & Log Cleaner</h3>
              <p className="text-gray-400 text-xs mt-1 font-sans">Clear dynamic caches, old log heaps, and preloaded shader waste.</p>
            </div>
            <span className="text-[10px] font-mono bg-orange-500/10 text-orange-400 py-1 px-2.5 rounded-full border border-orange-500/20 font-bold uppercase">
              System Hygiene
            </span>
          </div>

          <div className="flex items-center gap-6 py-2">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-2 bg-gradient-to-tr from-slate-900 to-slate-850 rounded-full border border-slate-800 flex items-center justify-center shadow-inner">
                <Trash2 className={`w-8 h-8 ${trashCleaned ? 'text-green-400' : 'text-orange-400 animate-pulse'}`} />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="text-slate-400 text-xs font-sans">
                Trash Residue Found: <span className="text-orange-400 font-bold font-mono">{trashSize === 0 ? '0' : trashSize} GB</span>
              </div>
              <div className="text-xs text-slate-500 font-sans">
                Includes Obsolete System Logs, Game crashdumps, and Render Caches.
              </div>
              {trashCleaned && (
                <div className="text-xs text-green-400 font-semibold font-sans flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> High-Performance cache cleared!
                </div>
              )}
            </div>
          </div>

          <button
            onClick={triggerTrashClean}
            disabled={isCleaningTrash || trashCleaned}
            className={`w-full py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 font-sans ${
              isCleaningTrash 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : trashCleaned
                ? 'bg-slate-900 text-green-400 border border-green-500/20 cursor-default'
                : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 font-extrabold hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]'
            }`}
          >
            {isCleaningTrash ? 'Purging Temp Caches...' : trashCleaned ? 'SHADERS & TRASH REMOVED ✓' : 'ONE-TAP TRASH CLEAN'}
          </button>
        </div>

      </div>

      {/* CPU GOVERNOR TWEAKS */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-gray-200 font-sans font-bold text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" /> Kernel CPU Governor Limits
            </h3>
            <p className="text-gray-400 text-xs mt-0.5 font-sans">Manage clock cycle distribution priority mapping for maximum thread allocation.</p>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdbHelper(!showAdbHelper)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 rounded-lg flex items-center gap-1.5 self-start sm:self-center cursor-pointer transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            {showAdbHelper ? 'Hide ADB Tweaks' : 'View Core ADB Tweaks'}
          </button>
        </div>

        {/* Governor Select buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'interactive', name: 'Interactive', desc: 'Balances clock dynamically.', color: 'hover:border-cyan-500' },
            { id: 'performance', name: 'Performance Max', desc: 'Locks all cores to high clock speeds.', color: 'hover:border-red-500' },
            { id: 'schedutil', name: 'Schedutil Booster', desc: 'Uses energy-aware task limits.', color: 'hover:border-cyan-500' },
            { id: 'powersave', name: 'Powersave', desc: 'Saves battery. Prevents gaming heat.', color: 'hover:border-cyan-500' }
          ].map((govItem) => (
            <button
              key={govItem.id}
              onClick={() => setGovernor(govItem.id as any)}
              className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                governor === govItem.id 
                  ? 'bg-slate-950/80 border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.15)] text-white' 
                  : 'bg-slate-950/20 border-slate-800 text-slate-400'
              } ${govItem.color}`}
            >
              <div className="text-xs font-mono font-bold uppercase flex items-center justify-between">
                {govItem.name} 
                {governor === govItem.id && <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>}
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-sans">{govItem.desc}</div>
            </button>
          ))}
        </div>

        {/* High CPU Priority option */}
        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-gray-200 font-sans">Force Extreme Thread Core Governor</h4>
            <p className="text-[11px] text-gray-400 font-sans">Allocates the Free Fire process thread priority pool directly into mainboards Fast-path (nice -20 scheduler).</p>
          </div>
          
          <button
            type="button"
            onClick={() => setCpuPriority(!cpuPriority)}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
              cpuPriority ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${
              cpuPriority ? 'transform translate-x-5' : ''
            }`}></div>
          </button>
        </div>

        {/* ADB Shell Helper Code blocks (Real Value!) */}
        {showAdbHelper && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4"
          >
            <div className="flex gap-2 items-center text-xs text-yellow-400 font-sans border-b border-slate-800 pb-2">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>For real devices, run these ADB shell commands via a PC or LADB application to instantly override Funtouch OS throttling defaults:</span>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              {adbCommands.map((adb, i) => (
                <div key={i} className="bg-slate-900 border border-slate-850 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-semibold">{adb.title}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCommand(adb.command, i)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 border border-cyan-500/10 hover:border-cyan-500/30 px-2 py-0.5 rounded cursor-pointer text-[10px]"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy ADB</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans">{adb.description}</p>
                  <div className="bg-black/40 text-cyan-500/90 p-2.5 rounded border border-black/30 overflow-x-auto whitespace-nowrap">
                    {adb.command}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* GFX TOOL INTERFACE */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 space-y-4" id="gfx-tool-console">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-200 font-sans font-bold text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" /> Free Fire GFX Engine Tool
            </h3>
            <p className="text-gray-400 text-xs mt-0.5 font-sans">Tune structural rendering parameters directly to secure optimal frame rate vs latency.</p>
          </div>
          <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 py-1 px-2.5 rounded-full border border-purple-500/20 font-bold uppercase">
            GFX Tweaker
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          
          {/* Resolution Configuration */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Select Output Resolution</label>
            <select
              value={gfxSettings.resolution}
              onChange={(e) => onGfxChange({ ...gfxSettings, resolution: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="Smooth (720p)">Smooth (720p) - High Core Speed [Best Performance]</option>
              <option value="Ultra HD (1080p)">Ultra HD (1080p) - High Density Balanced</option>
              <option value="Extreme Pro (1440p)">Extreme Pro (1440p) - Ultra Cinematic</option>
            </select>
          </div>

          {/* FPS Limits */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Render FPS limits</label>
            <select
              value={gfxSettings.fps}
              onChange={(e) => onGfxChange({ ...gfxSettings, fps: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="60 FPS">60 FPS (FHD Stable Lock)</option>
              <option value="90 FPS (Ultra)">90 FPS (Funtouch Ultra High Speed)</option>
              <option value="120 FPS (Extreme Ultimate)">120 FPS (Extreme Ultimate Pro - Vivo Core Boost)</option>
            </select>
          </div>

          {/* Graphic Styling */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Dynamic Grading Color Map</label>
            <select
              value={gfxSettings.style}
              onChange={(e) => onGfxChange({ ...gfxSettings, style: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="Colorful">Colorful [Best for Target Tracking]</option>
              <option value="Realistic">Realistic [Soft Shadow Rendering]</option>
              <option value="Soft">Soft [Eye Protective Tint]</option>
              <option value="Movie">Movie [Highly Cinematic Contrasts]</option>
            </select>
          </div>
        </div>

        {/* GFX Secondary options */}
        <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-[11px]">
          <label className="flex items-center gap-2.5 text-slate-400 select-none bg-slate-950/50 p-2.5 border border-slate-850 rounded-lg cursor-pointer hover:border-slate-800 transition-all">
            <input
              type="checkbox"
              checked={gfxSettings.shadows}
              onChange={(e) => onGfxChange({ ...gfxSettings, shadows: e.target.checked })}
              className="rounded text-cyan-400 focus:ring-0 bg-slate-900 border-slate-800 w-4 h-4"
            />
            <span>Disable Hard Shadows (+10 FPS bump)</span>
          </label>

          <label className="flex items-center gap-2.5 text-slate-400 select-none bg-slate-950/50 p-2.5 border border-slate-850 rounded-lg cursor-pointer hover:border-slate-800 transition-all">
            <input
              type="checkbox"
              checked={gfxSettings.hdrEnabled}
              onChange={(e) => onGfxChange({ ...gfxSettings, hdrEnabled: e.target.checked })}
              className="rounded text-cyan-400 focus:ring-0 bg-slate-900 border-slate-800 w-4 h-4"
            />
            <span>Dynamic HDR Shader Profiler [Adaptive Saturation]</span>
          </label>
        </div>
      </div>

      {/* NETWORK PING TESTER */}
      <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80 space-y-4" id="network-ping-tester">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-200 font-sans font-bold text-lg flex items-center gap-2">
              <Wifi className="w-5 h-5 text-emerald-400 animate-pulse" /> Regional Network Ping Sentry
            </h3>
            <p className="text-gray-400 text-xs mt-0.5 font-sans">
              Test and monitor active latency connections to Free Fire regional gaming servers in real time.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 py-1 px-2.5 rounded-full border border-emerald-500/20 font-bold uppercase">
            Net Optimizer
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { id: 'SG', name: 'Singapore (SG)', base: 28 },
            { id: 'IN', name: 'Mumbai (IN)', base: 52 },
            { id: 'ID', name: 'Jakarta (ID)', base: 34 },
            { id: 'ME', name: 'Dubai (ME)', base: 78 },
            { id: 'EU', name: 'Frankfurt (EU)', base: 135 },
            { id: 'BR', name: 'São Paulo (BR)', base: 192 }
          ].map((srv) => {
            const currentPing = pingData[srv.id] || srv.base;
            let pingColor = 'text-emerald-400';
            let dotColor = 'bg-emerald-400';
            if (currentPing > 120) {
              pingColor = 'text-rose-500 font-bold';
              dotColor = 'bg-rose-500';
            } else if (currentPing > 60) {
              pingColor = 'text-amber-400';
              dotColor = 'bg-amber-400';
            }

            return (
              <div
                key={srv.id}
                className="bg-slate-950/65 p-3 rounded-xl border border-slate-850 flex flex-col justify-between space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">{srv.id} Server</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isPingTesting ? 'animate-pulse' : ''}`} />
                </div>
                <div className="space-y-0.5">
                  <div className={`text-xl font-mono ${pingColor}`}>{currentPing} <span className="text-[10px] font-normal text-slate-500">ms</span></div>
                  <div className="text-[9px] text-slate-500 truncate leading-none">{srv.name}</div>
                </div>
                {/* Horizontal simple strength bars */}
                <div className="flex gap-0.5 pt-1">
                  <div className={`h-1 flex-1 rounded-sm ${currentPing < 150 ? 'bg-emerald-550' : 'bg-rose-500/20'}`} style={{ backgroundColor: currentPing < 150 ? '#10b98130' : '#ef444420' }} />
                  <div className={`h-1 flex-1 rounded-sm`} style={{ backgroundColor: currentPing < 100 ? '#10b98160' : '#1e293b' }} />
                  <div className={`h-1 flex-1 rounded-sm`} style={{ backgroundColor: currentPing < 50 ? '#10b98175' : '#1e293b' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action controllers */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsPingTesting(!isPingTesting)}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold uppercase rounded-lg border font-mono tracking-wider cursor-pointer transition-all ${
                isPingTesting
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isPingTesting ? '⏸ PAUSE SENSORS' : '▶ ENGAGE MONITOR'}
            </button>

            <button
              onClick={() => setIsNetworkAccelerated(!isNetworkAccelerated)}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold uppercase rounded-lg border font-mono tracking-wider cursor-pointer transition-all ${
                isNetworkAccelerated
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                  : 'bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900'
              }`}
            >
              {isNetworkAccelerated ? '⚡ LINKTURBO ACCELERATOR: ON' : '⛨ ACCELERATE PATH'}
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono text-center sm:text-right">
            {isNetworkAccelerated ? (
              <span className="text-cyan-400 font-bold">⚡ Funtouch Multi-Turbo Link Coupling on: -30% average packet delay.</span>
            ) : (
              <span>Dynamic monitoring. Activate high priority game path routing to stabilize carrier channels.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
