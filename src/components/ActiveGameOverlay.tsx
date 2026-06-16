/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Sparkles, X, Target, Zap, Cpu, Award } from 'lucide-react';
import { DeviceModel, GfxSettings, AimSettings, MacroSettings, HardwareStats } from '../types';

interface ActiveGameOverlayProps {
  device: DeviceModel;
  isFlagshipMode: boolean;
  gfxSettings: GfxSettings;
  aimSettings: AimSettings;
  macroSettings: MacroSettings;
  onExit: () => void;
}

export default function ActiveGameOverlay({
  device,
  isFlagshipMode,
  gfxSettings,
  aimSettings,
  macroSettings,
  onExit
}: ActiveGameOverlayProps) {
  const [bootStage, setBootStage] = useState(0);
  const [bootText, setBootText] = useState('Initiating fast-path allocation memory buffers...');
  
  // Gameplay states
  const [activeWeapon, setActiveWeapon] = useState<'desert_eagle' | 'm1887' | 'scar'>('m1887');
  const [bulletsFired, setBulletsFired] = useState(0);
  const [headshotsCount, setHeadshotsCount] = useState(0);
  const [totalHits, setTotalHits] = useState(0);

  // Live fluctuating stats
  const [liveStats, setLiveStats] = useState<HardwareStats>({
    cpuUsage: 88,
    ramUsage: 41,
    temp: 38.5,
    fps: 90,
    ping: 25
  });

  // Target sandbox states
  const [targetDmg, setTargetDmg] = useState<{ id: number; x: number; y: number; text: string; headshot: boolean }[]>([]);
  const [reticleOffset, setReticleOffset] = useState({ x: 0, y: 0 });
  const isFiring = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextDmgId = useRef(0);

  // Boot progress sequencing
  useEffect(() => {
    const sequence = [
      { text: 'Hooking into Android process manager (Nice priority -20)...', delay: 600 },
      { text: 'Clearing dynamic standby pools (Reclaimed 2.8GB RAM)...', delay: 500 },
      { text: `Locking display refresh pipeline to ${gfxSettings.fps.split(' ')[0]} Max...`, delay: 600 },
      { text: `Compiling layout shaders for Style: [${gfxSettings.style}] COLORMAP...`, delay: 500 },
      { text: aimSettings.recoilReducer ? 'Injecting recoil compensation script (Drag velocity locked)...' : 'Bypassing sensor overrides...', delay: 600 },
      { text: 'Optimizations deployed! Loading Free Fire Workspace...', delay: 400 },
      { text: 'SUCCESS', delay: 100 }
    ];

    let index = 0;
    const processNext = () => {
      if (index < sequence.length) {
        setBootText(sequence[index].text);
        if (sequence[index].text === 'SUCCESS') {
          setBootStage(2); // game mode launched
        } else {
          setTimeout(() => {
            index++;
            setBootStage((prev) => prev < 1 ? prev + 0.15 : 1);
            processNext();
          }, sequence[index].delay);
        }
      }
    };

    processNext();
  }, [gfxSettings, aimSettings]);

  // Fluctuating hardware stats loops
  useEffect(() => {
    if (bootStage < 2) return;

    const interval = setInterval(() => {
      setLiveStats((prev) => {
        // Base targets based on chosen graphic and flagship settings
        const baseFps = gfxSettings.fps.includes('120') ? 120 : gfxSettings.fps.includes('90') ? 90 : 60;
        const flagshipFactor = isFlagshipMode ? 1 : 1.15;
        
        // Random slight fluctuations
        const fpsFluctuation = Math.floor(Math.random() * 4) - 2;
        const targetFps = Math.max(25, Math.min(baseFps + fpsFluctuation, baseFps + (isFlagshipMode ? 2 : 0)));
        
        const tempFluctuation = (Math.random() * 0.4) - 0.2;
        const targetTemp = Math.max(34, Math.min(prev.temp + tempFluctuation, 42.5 + (baseFps > 90 ? 1.5 : 0)));

        const pingFluctuation = Math.floor(Math.random() * 6) - 3;
        const targetPing = Math.max(12, Math.min(prev.ping + pingFluctuation, 38));

        return {
          cpuUsage: Math.floor(65 + Math.random() * 15 * flagshipFactor),
          ramUsage: Math.floor(38 + Math.random() * 5 * flagshipFactor),
          temp: parseFloat(targetTemp.toFixed(1)),
          fps: targetFps,
          ping: targetPing
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [bootStage, gfxSettings, isFlagshipMode]);

  // Weapons configs
  const getWeaponSpecs = () => {
    switch (activeWeapon) {
      case 'desert_eagle':
        return { name: 'Desert Eagle Pro', dmgBody: 90, dmgHead: 495, rate: 450, soundFreq: 180 };
      case 'm1887':
        return { name: 'M1887 Double Barrel Shotgun', dmgBody: 32, dmgHead: 154, rate: 300, soundFreq: 100 };
      case 'scar':
        return { name: 'SCAR-L Cupid Edition', dmgBody: 28, dmgHead: 137, rate: 100, soundFreq: 280 };
    }
  };

  const currentWeapon = getWeaponSpecs();

  // Synthetic Audio Trigger for firearms
  const playShotAudio = (freq: number, isHead: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (isHead) {
        // High pitch crisp headshot ding 
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      } else {
        // Heavy rifle/shotgun blast
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      }
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (e) {
      // Audio context is locked, safe skip
    }
  };

  // Click Fire sequence
  const handleStageShoot = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    // Get click spot coordinates
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setBulletsFired((prev) => prev + 1);

    // Apply sensitivity coefficient: if they use Recoil Reducer, bullets stay steady
    // If deactivated, we add a drift upwards
    const recoilOffsetFactor = aimSettings.recoilReducer ? 1.5 : 8.5;
    const verticalDrift = aimSettings.recoilReducer ? -2 : -18;
    const driftY = (Math.random() * recoilOffsetFactor) + verticalDrift;
    const driftX = (Math.random() * recoilOffsetFactor * 2) - recoilOffsetFactor;

    let targetX = clickX + driftX;
    let targetY = clickY + driftY;

    if (aimSettings.aimImproverEnabled) {
      // Direct pull mechanics towards simulated target head coordinate (X:50, Y:30)
      const pullFactor = aimSettings.dragForceFactor * 0.09;
      targetX = targetX + (50 - targetX) * pullFactor;
      targetY = targetY + (30 - targetY) * pullFactor;
    }

    const modifiedY = Math.min(Math.max(targetY, 5), 95);
    const modifiedX = Math.min(Math.max(targetX, 5), 95);

    // HEAD COORDINATES BOUNDS 50%, 30%
    const distToHead = Math.sqrt(Math.pow(modifiedX - 50, 2) + Math.pow(modifiedY - 30, 2));
    const distToBody = Math.sqrt(Math.pow(modifiedX - 50, 2) + Math.pow(modifiedY - 55, 2));

    let hit = false;
    let isHead = false;
    let text = 'MISS';

    if (distToHead < 6.5) {
      hit = true;
      isHead = true;
      text = currentWeapon.dmgHead.toString();
      setHeadshotsCount((prev) => prev + 1);
      setTotalHits((prev) => prev + 1);
    } else if (distToBody < 15) {
      hit = true;
      text = currentWeapon.dmgBody.toString();
      setTotalHits((prev) => prev + 1);
    }

    if (hit) {
      playShotAudio(currentWeapon.soundFreq, isHead);
      nextDmgId.current++;
      const currentId = nextDmgId.current;

      setTargetDmg((prev) => [
        ...prev,
        {
          id: currentId,
          x: modifiedX,
          y: modifiedY,
          text,
          headshot: isHead
        }
      ]);

      // Remove damage floats
      setTimeout(() => {
        setTargetDmg((p) => p.filter((d) => d.id !== currentId));
      }, 750);
    } else {
      // Direct dry gunshot audio feedback on miss
      playShotAudio(currentWeapon.soundFreq, false);
    }

    // Trigger slight screen visual recoil shake
    setReticleOffset({ x: driftX / 2, y: driftY / 3 });
    setTimeout(() => setReticleOffset({ x: 0, y: 0 }), 100);
  };

  const getHeadshotRate = () => {
    if (totalHits === 0) return 0;
    return Math.floor((headshotsCount / totalHits) * 100);
  };

  return (
    <div id="active-game-overlay" className="fixed inset-0 bg-black z-50 flex flex-col justify-between overflow-hidden">
      
      {bootStage < 2 ? (
        /* PHASE 1: BOOT OPTIMIZATION TUNING SEQUENCE */
        <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto px-6 text-white space-y-8" id="boot-booster-screen">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/40 text-red-400 border border-red-500/30 rounded-full font-mono text-xs uppercase animate-pulse">
              <Zap className="w-3.5 h-3.5" /> High-Priority Process Active
            </div>
            <h1 className="text-3xl font-extrabold tracking-widest text-cyan-300 font-sans">FF VIVO TURBO LAUNCHER</h1>
            <p className="text-slate-500 text-xs font-mono select-none">Bypassing local Funtouch constraints secure core...</p>
          </div>

          {/* Large pulsing reactor core graphic */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Pulsing ring */}
            <div className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/20 duration-1000 ${bootStage > 0 ? 'animate-spin' : ''}`}></div>
            <div className="absolute inset-5 rounded-full border border-cyan-400/40 animate-ping"></div>
            <div className="absolute inset-8 rounded-full bg-slate-900 border-2 border-cyan-400/80 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.25)]">
              <Cpu className="w-12 h-12 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400 font-bold mt-1">CORE COMPUTE</span>
            </div>
          </div>

          {/* Horizontal custom progress pipeline */}
          <div className="w-full space-y-2.5">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="text-cyan-400 font-bold">OPTIMIZATION PROCESS PREREQS</span>
              <span className="text-slate-400">{Math.min(Math.floor(bootStage * 100), 100)}%</span>
            </div>

            <div className="w-full h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(bootStage * 100, 100)}%` }}
              ></div>
            </div>

            <div className="h-6 text-center font-mono text-[10px] text-slate-400 animate-pulse mt-1">
              🚀 {bootText}
            </div>
          </div>
        </div>
      ) : (
        /* PHASE 2: IN-GAME OVERLAY INTERACTIVE MODULAR DASHBOARD */
        <div className="h-full flex flex-col justify-between p-4 relative" id="game-session-frame">
          
          {/* Top Gaming Bar Overlay */}
          <div className="flex justify-between items-center bg-slate-900/90 border border-slate-800 p-2.5 px-4 rounded-xl backdrop-blur-md z-30 select-none">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping"></div>
              <div>
                <div className="flex items-center gap-1.5 font-sans">
                  <span className="text-xs text-white font-bold">FREE FIRE LIVE INTERACTIVE HUD</span>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-mono px-1.5 py-0.2 rounded-full border border-cyan-500/20 uppercase font-semibold">
                    {gfxSettings.style} Colormap
                  </span>
                </div>
                <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                  Performance Driver Target: <span className="text-cyan-400 font-semibold uppercase">{device}</span>
                </div>
              </div>
            </div>

            {/* Live Fluctuating Telemetry Badges */}
            <div className="flex gap-4 font-mono text-[10px] text-slate-400">
              <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-850">
                <span className="text-slate-500">FPS:</span> <span className="text-green-400 font-extrabold">{liveStats.fps} ({gfxSettings.fps.split(' ')[0]})</span>
              </div>
              <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-850 hidden sm:block">
                <span className="text-slate-500">LATENCY:</span> <span className="text-cyan-400 font-bold">{liveStats.ping}ms SECURE</span>
              </div>
              <div className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-850">
                <span className="text-slate-500">TEMP:</span> <span className="text-orange-400 font-medium">{liveStats.temp}°C STANDARD</span>
              </div>
            </div>

            {/* Exit Crosshair button to close game session */}
            <button
              onClick={onExit}
              className="p-1 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 font-sans text-xs font-bold rounded-lg border border-red-500/30 cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> EXIT SESSION
            </button>
          </div>

          {/* Main Gameplay Screen Interactive simulator stage */}
          <div 
            ref={containerRef}
            onClick={handleStageShoot}
            className="flex-1 my-4 bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center cursor-crosshair select-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #334155 1.5px, transparent 1.5px)',
              backgroundSize: '32px 32px'
            }}
          >
            {/* Screen edge grid decorations */}
            <div className="absolute inset-0 border-[6px] border-double border-cyan-500/10 pointer-events-none rounded-2xl"></div>

            {/* Center target Dummy to practice drag shot layout */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              
              {/* Target head */}
              <div className="w-16 h-16 bg-slate-900/90 border-2 border-red-500 rounded-full flex items-center justify-center relative mb-1 shadow-2xl">
                <div className="absolute w-2 h-2 bg-red-600 rounded-full"></div>
                <div className="absolute inset-1 border border-dashed border-red-500/35 rounded-full"></div>
                <span className="text-[10px] font-mono text-red-400 font-bold tracking-widest absolute bottom-1.5 uppercase">Armor Head</span>
              </div>
              
              {/* Spine neck */}
              <div className="w-6 h-4 bg-slate-800"></div>

              {/* Chest target */}
              <div className="w-28 h-36 bg-slate-900/90 border-2 border-slate-700/80 rounded-xl flex items-center justify-center relative shadow-lg">
                <div className="absolute inset-4 border border-dashed border-slate-700/40 rounded-lg"></div>
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Level 3 Chestplate</span>
              </div>
            </div>

            {/* FLOATING TEXT MARKERS */}
            {targetDmg.map((dmg) => (
              <span
                key={dmg.id}
                className="absolute pointer-events-none font-sans font-extrabold text-2xl tracking-tighter filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.9)] animate-[bounce_0.6s_ease-out_infinite]"
                style={{
                  left: `${dmg.x}%`,
                  top: `${dmg.y}%`,
                  color: dmg.headshot ? '#ff2a2a' : '#fbbf24'
                }}
              >
                💥 {dmg.headshot ? '🔴' : '🟡'} {dmg.text}
              </span>
            ))}

            {/* Floating Macro Assistants inside running preview */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-20 pointer-events-auto">
              {macroSettings.autoSprintLock && (
                <div className="bg-green-500/25 border border-green-500/30 text-green-300 font-mono text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg select-none">
                  <Zap className="w-3 h-3 text-green-300 animate-pulse" /> SPRINT ACTIVE (LOCK {macroSettings.autoSprintPercent}%)
                </div>
              )}
              {macroSettings.medkitActive && (
                <div className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 font-mono text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg select-none uppercase">
                  ✓ AUTO-MED KIT READIED ({macroSettings.medkitTriggerKey.split(' ')[0]})
                </div>
              )}
              {aimSettings.recoilReducer && (
                <div className="bg-purple-500/25 border border-purple-500/35 text-purple-300 font-mono text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg select-none">
                  <Award className="w-3 h-3 text-purple-300 animate-bounce" /> DRAG COMPENSATOR LOCKED
                </div>
              )}
              {aimSettings.aimImproverEnabled && (
                <div className="bg-rose-500/25 border border-rose-500/35 text-rose-300 font-mono text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg select-none">
                  <Target className="w-3 h-3 text-rose-400 animate-pulse" /> AUTO-HEADSHOT SNAP: {aimSettings.dragForceFactor}x FORCE
                </div>
              )}
              {macroSettings.speedGlooWall && (
                <div className="bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 font-mono text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg select-none">
                  <span>🛡 GLOO WALL AUTOMATION READY ({macroSettings.speedGlooWallDelay}ms)</span>
                </div>
              )}
              {macroSettings.autoFindEnemies && (
                <div className="bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 font-mono text-[9px] px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg select-none">
                  <span>📡 AI ENEMY SENTRY RADAR ACTIVE ({macroSettings.autoFindEnemiesRange}m)</span>
                </div>
              )}
            </div>

            {/* Visual reticle crosshair floating over cursor space */}
            <div 
              className="absolute pointer-events-none p-3 transition-transform duration-75"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${reticleOffset.x}px, ${reticleOffset.y}px)`
              }}
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute w-full h-[1.5px] bg-red-500/80"></div>
                <div className="absolute h-full w-[1.5px] bg-red-500/80"></div>
                {/* AimAssist Dot overlay overlayed directly over actual sights */}
                {macroSettings.aimAssistDot && (
                  <div 
                    className="absolute w-3.5 h-3.5 rounded-full border-2"
                    style={{ borderColor: macroSettings.aimAssistColor, boxShadow: `0 0 10px ${macroSettings.aimAssistColor}` }}
                  ></div>
                )}
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_red]"></div>
              </div>
            </div>

            {/* Instruction tooltip */}
            <div className="absolute bottom-4 right-4 bg-slate-950/80 border border-slate-800 p-2.5 px-4 rounded-xl pointer-events-none select-none text-[10px] text-slate-400 max-w-sm leading-relaxed">
              👉 <span className="text-white font-bold">TARGET TRAINING RANGE:</span> Click (or tap) repeatedly inside the grid to try different bullet spray layouts. Enable/Disable the <span className="text-cyan-400">Recoil Reducer</span> in application configs to compare the drift stabilization!
            </div>
          </div>

          {/* Bottom HUD: Weapon Picker & Shooting Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/90 border border-slate-800 p-3 px-5 rounded-2xl gap-3 backdrop-blur-md z-30 select-none">
            
            {/* Weapon Selector widgets */}
            <div className="flex gap-2.5">
              {[
                { id: 'desert_eagle', label: 'D-Eagle', desc: 'Single tap precision' },
                { id: 'm1887', label: 'M1887 Shotgun', desc: 'Close combat high burst' },
                { id: 'scar', label: 'SCAR Cupid', desc: 'Continuous medium spray' }
              ].map((wpn) => (
                <button
                  key={wpn.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveWeapon(wpn.id as any);
                  }}
                  className={`p-2 px-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    activeWeapon === wpn.id 
                      ? 'bg-gradient-to-r from-cyan-950/30 to-blue-950/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className="text-[10px] font-bold font-mono uppercase tracking-wider">{wpn.label}</div>
                  <div className="text-[8px] text-slate-500 mt-0.5 leading-snug font-sans">{wpn.desc}</div>
                </button>
              ))}
            </div>

            {/* Aim performance feedback trackers */}
            <div className="flex gap-4 font-sans text-xs">
              <div className="bg-slate-950/50 p-2 px-4 rounded-xl border border-slate-850 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Bullets Sprayed</div>
                <div className="text-slate-300 font-bold font-mono text-sm mt-0.5">{bulletsFired}</div>
              </div>
              
              <div className="bg-slate-950/50 p-2 px-4 rounded-xl border border-slate-850 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Precision Headshots</div>
                <div className="text-red-400 font-bold font-mono text-sm mt-0.5">🔴 {headshotsCount}</div>
              </div>

              <div className="bg-slate-950/50 p-2 px-4 rounded-xl border border-slate-850 text-center">
                <div className="text-[9px] text-slate-500 uppercase font-mono">Sim Headshot Rate</div>
                <div className="text-cyan-400 font-extrabold font-mono text-sm mt-0.5">{getHeadshotRate()}%</div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
