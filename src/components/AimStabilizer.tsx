/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Target, AlertTriangle, ShieldCheck, HelpCircle, RefreshCw } from 'lucide-react';
import { AimSettings, SensitivityPreset, DeviceModel } from '../types';

interface AimStabilizerProps {
  device: DeviceModel;
  settings: AimSettings;
  onSettingsChange: (settings: AimSettings) => void;
}

export default function AimStabilizer({ device, settings, onSettingsChange }: AimStabilizerProps) {
  const [activeTab, setActiveTab] = useState<'sens' | 'test'>('sens');
  
  // Interactive Sandbox Shooting state
  const [damageIndicators, setDamageIndicators] = useState<{ id: number; x: number; y: number; text: string; type: 'head' | 'body' }[]>([]);
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 }); // percentage
  const [isFiring, setIsFiring] = useState(false);
  const sandboxRef = useRef<HTMLDivElement>(null);
  const damageId = useRef(0);
  const fireInterval = useRef<NodeJS.Timeout | null>(null);

  // Recommendations based on Device
  const getDeviceDpiRecommendations = () => {
    switch (device) {
      case 'Vivo T2x 5G':
        return {
          dpi: 480,
          general: 98,
          redDot: 95,
          scope2x: 92,
          scope4x: 90,
          awm: 65,
          note: 'MediaTek Dimensity digitizers benefit heavily from a mild DPI configuration to prevent target skip (skipping pixels during drag-up).'
        };
      case 'ASUS ROG Phone 9 Pro':
        return {
          dpi: 585,
          general: 100,
          redDot: 98,
          scope2x: 95,
          scope4x: 94,
          awm: 50,
          note: 'Extremely high polling rates (2000Hz touch) allow for higher DPI targets without compromising touch stability.'
        };
      case 'Redmagic 10 Ultra':
        return {
          dpi: 512,
          general: 99,
          redDot: 96,
          scope2x: 94,
          scope4x: 92,
          awm: 48,
          note: 'Direct Active-cooling minimizes processor drag, ensuring smooth pixel paths when pulling down red dot sights.'
        };
      case 'iQOO 13':
        return {
          dpi: 540,
          general: 97,
          redDot: 94,
          scope2x: 91,
          scope4x: 88,
          awm: 55,
          note: 'Optimized touch layer response. Excellent for micro-dragging headshots when set to medium speed.'
        };
      default:
        return {
          dpi: 410,
          general: 95,
          redDot: 90,
          scope2x: 85,
          scope4x: 80,
          awm: 60,
          note: 'Use moderate custom developer option configurations for safe physical screen responses.'
        };
    }
  };

  const recommended = getDeviceDpiRecommendations();

  // Apply Sensitivity Presets
  const applyPreset = (presetName: SensitivityPreset) => {
    let nextSens: Partial<AimSettings> = { preset: presetName };

    if (presetName === 'low') {
      nextSens = {
        ...nextSens,
        general: 85,
        redDot: 80,
        scope2x: 75,
        scope4x: 70,
        sniperAwm: 45,
        freeLook: 50,
        dpiValue: 390
      };
    } else if (presetName === 'medium') {
      nextSens = {
        ...nextSens,
        general: 95,
        redDot: 92,
        scope2x: 88,
        scope4x: 85,
        sniperAwm: 55,
        freeLook: 65,
        dpiValue: 460
      };
    } else if (presetName === 'hard_pro') {
      nextSens = {
        ...nextSens,
        general: 100,
        redDot: 99,
        scope2x: 98,
        scope4x: 95,
        sniperAwm: 75,
        freeLook: 80,
        dpiValue: recommended.dpi
      };
    }
    
    // Merge on custom configs
    onSettingsChange({
      ...settings,
      ...nextSens
    });
  };

  // Sensitivity Sliders
  const handleSliderChange = (key: keyof AimSettings, val: number | boolean) => {
    onSettingsChange({
      ...settings,
      [key]: val,
      preset: 'custom' // switch to custom layout
    });
  };

  // Interactive Sandbox Loop
  const handleShootStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFiring) return;
    setIsFiring(true);

    const executeShot = () => {
      setCrosshairPos((prev) => {
        let kickY = 0;
        let kickX = 0;

        if (settings.recoilReducer) {
          // Recoil Reducer simulates dragging down!
          // We apply massive vertical pull correction (stabilizes) and small random deviation
          kickY = (Math.random() * 4) - 2.8; // mostly stable or slightly pulling down towards target
          kickX = (Math.random() * 3) - 1.5;
        } else {
          // Severe unmitigated Free Fire weapon kick!
          // Bullets climb rapidly straight up, with horizontal spray scattering!
          kickY = -8 - (Math.random() * 6);
          kickX = (Math.random() * 10) - 5;
        }

        let nextY = prev.y + kickY;
        let nextX = prev.x + kickX;

        if (settings.aimImproverEnabled) {
          // Automatic magnetic head lock simulator
          // Pull relative fire coordinates directly towards target head (50, 33)
          const pullRatio = settings.dragForceFactor * 0.08; 
          nextX = nextX + (50 - nextX) * pullRatio;
          nextY = nextY + (33 - nextY) * pullRatio;
        }

        const finalY = Math.min(Math.max(nextY, 5), 95);
        const finalX = Math.min(Math.max(nextX, 5), 95);

        // Determine if target Head was hit
        // The dummy head is centered at approximately X: 50%, Y: 33% screen coordinates
        const distanceToHead = Math.sqrt(Math.pow(finalX - 50, 2) + Math.pow(finalY - 33, 2));
        const distanceToBody = Math.sqrt(Math.pow(finalX - 50, 2) + Math.pow(finalY - 55, 2));

        let damageText = 'MISS';
        let damageType: 'head' | 'body' = 'body';

        if (distanceToHead < 8) {
          damageText = (150 + Math.floor(Math.random() * 15)).toString(); // Red headshot numbers!
          damageType = 'head';
        } else if (distanceToBody < 15) {
          damageText = (32 + Math.floor(Math.random() * 6)).toString(); // Yellow normal numbers
          damageType = 'body';
        }

        // Add damage floating text
        if (damageText !== 'MISS') {
          damageId.current++;
          const curId = damageId.current;
          
          // Audio feedback
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            if (damageType === 'head') {
              // High pitch crisp headshot pop
              osc.frequency.setValueAtTime(880, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.15);
              gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            } else {
              // Deeper body thud
              osc.frequency.setValueAtTime(220, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.12);
              gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            }
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          } catch (err) {
            // Audio context blocked, ignore
          }

          setDamageIndicators((prevDmg) => [
            ...prevDmg,
            {
              id: curId,
              x: finalX + (Math.random() * 10 - 5),
              y: finalY - 10 - (Math.random() * 5),
              text: damageText,
              type: damageType
            }
          ]);

          // Cleanup damage floaters
          setTimeout(() => {
            setDamageIndicators((prevDmg) => prevDmg.filter((d) => d.id !== curId));
          }, 800);
        }

        return { x: finalX, y: finalY };
      });
    };

    // Execute first immediate shot
    executeShot();

    // Trigger continuous fire
    fireInterval.current = setInterval(executeShot, 110);
  };

  const handleShootEnd = () => {
    setIsFiring(false);
    if (fireInterval.current) {
      clearInterval(fireInterval.current);
      fireInterval.current = null;
    }
  };

  const handleResetSandbox = () => {
    setCrosshairPos({ x: 50, y: 55 });
    setDamageIndicators([]);
  };

  useEffect(() => {
    return () => {
      if (fireInterval.current) clearInterval(fireInterval.current);
    };
  }, []);

  return (
    <div id="aim-stabilizer-container" className="space-y-6">
      
      {/* Sub tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('sens')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 font-sans cursor-pointer transition-all ${
            activeTab === 'sens' 
              ? 'border-cyan-400 text-cyan-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Sensitivity Profiling
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 font-sans cursor-pointer transition-all ${
            activeTab === 'test' 
              ? 'border-cyan-400 text-cyan-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          AIM & Drag Sandbox Simulator
        </button>
      </div>

      {activeTab === 'sens' ? (
        /* SENSITIVITY CONFIGURATIONS PANEL */
        <div className="space-y-6" id="sensitivity-panel">
          
          {/* Preset Buttons */}
          <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="text-gray-200 font-sans font-bold text-lg">Sensitivity Speed Presets</h3>
            <p className="text-gray-400 text-xs font-sans">Select a pre-calibrated drag speed or tweak each slider to find your custom lock limits.</p>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'low', label: 'Medium-Low Drag', desc: 'Slower, steady micro-control.' },
                { id: 'medium', label: 'Balanced Pro', desc: 'Most stable for general scopes.' },
                { id: 'hard_pro', label: 'Funtouch Hard Pro', desc: 'Ultimate fast drag for 1-Tap headshots.' }
              ].map((btnItem) => (
                <button
                  key={btnItem.id}
                  onClick={() => applyPreset(btnItem.id as SensitivityPreset)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    settings.preset === btnItem.id
                      ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                      : 'bg-slate-950/30 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold uppercase font-mono tracking-wider">{btnItem.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-snug font-sans">{btnItem.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            
            {/* Double Column Sliders */}
            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-4">
              <h4 className="text-gray-200 font-sans font-semibold text-sm border-b border-slate-800/80 pb-2">Touch Sensitivity Levels</h4>
              
              <div className="space-y-4 font-sans text-xs">
                
                {/* General Touch */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium text-slate-300">General Touch Screen (X-Y)</span>
                    <span className="font-mono text-cyan-400 font-bold text-sm">{settings.general}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={settings.general}
                    onChange={(e) => handleSliderChange('general', parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <p className="text-[9px] text-slate-500 leading-snug">Influences camera pivot speeds when sprinting or scope dragging.</p>
                </div>

                {/* Red Dot Aim */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium text-slate-300">Red Dot Precision Sight</span>
                    <span className="font-mono text-cyan-400 font-bold text-sm">{settings.redDot}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={settings.redDot}
                    onChange={(e) => handleSliderChange('redDot', parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <p className="text-[9px] text-slate-500 leading-snug">Controls micro-drag friction when targeting without weapon scope attachments.</p>
                </div>

                {/* 2x Scope */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium text-slate-300">2x Combat Scope</span>
                    <span className="font-mono text-cyan-400 font-bold text-sm">{settings.scope2x}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={settings.scope2x}
                    onChange={(e) => handleSliderChange('scope2x', parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* 4x Scope */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium text-slate-300">4x Heavy Sniper Scope</span>
                    <span className="font-mono text-cyan-400 font-bold text-sm">{settings.scope4x}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={settings.scope4x}
                    onChange={(e) => handleSliderChange('scope4x', parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* DPI recommendations and Hardware triggers */}
            <div className="flex flex-col gap-4">
              
              {/* DPI setup panel */}
              <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-4 flex-1">
                <h4 className="text-gray-200 font-sans font-semibold text-sm border-b border-slate-800/80 pb-2">Estimated Screen DPI Resolution</h4>
                <p className="text-slate-400 text-xs font-sans">
                  Recommended DPI is configured based on detected screen touch-latencies of your <span className="text-cyan-400 font-bold font-mono">{device}</span>.
                </p>

                <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-xl space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 uppercase">Recommended DPI Target:</span>
                    <span className="text-yellow-400 font-extrabold text-lg">{recommended.dpi} DPI</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 uppercase">AWM Scope Sweetspot:</span>
                    <span className="text-slate-200 font-bold">{recommended.general}% / {recommended.awm}%</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans leading-relaxed border-t border-slate-850 pt-2 shrink-0">
                    ★ <span className="font-bold text-slate-400">Tuner Pro-Tip:</span> {recommended.note}
                  </p>
                </div>

                {/* Custom DPI Slider */}
                <div className="space-y-2 font-sans text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="font-semibold">Modify Target DPI Driver (Simulate)</span>
                    <span className="font-mono text-cyan-400 font-bold text-sm">{settings.dpiValue} DPI</span>
                  </div>
                  <input
                    type="range"
                    min="350"
                    max="800"
                    value={settings.dpiValue}
                    onChange={(e) => handleSliderChange('dpiValue', parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              {/* Recoil Reducer Activator */}
              <div className="bg-cyan-950/20 p-4 rounded-xl border border-cyan-500/20 flex items-center justify-between">
                <div className="space-y-0.5 max-w-[70%]">
                  <h4 className="text-xs font-bold text-cyan-200 font-sans flex items-center gap-1.5">
                    1-Tap Recoil Reducer Macro 
                    <span className="bg-cyan-500/15 text-[9px] text-cyan-300 font-mono px-2 py-0.2 rounded-full border border-cyan-500/20">Active drag</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Auto-calculates swipe acceleration vectors for smooth recoil pull-down simulator adjustments. Switch to Test tab to try!
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleSliderChange('recoilReducer', !settings.recoilReducer)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                    settings.recoilReducer ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${
                    settings.recoilReducer ? 'transform translate-x-5' : ''
                  }`}></div>
                </button>
              </div>

              {/* Aim Improvement Option */}
              <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/20 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[75%]">
                    <h4 className="text-xs font-bold text-rose-200 font-sans flex items-center gap-1.5">
                      Auto Headshot Aim Assist Improvement
                      <span className="bg-rose-500/15 text-[9px] text-rose-300 font-mono px-2 py-0.2 rounded-full border border-rose-500/20">Pro Mode</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed font-normal">
                      Enables target bounding box magnetism. Automatically pulls fire vectors directly towards the nearest enemy's head coordinate.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleSliderChange('aimImproverEnabled', !settings.aimImproverEnabled)}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                      settings.aimImproverEnabled ? 'bg-rose-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${
                      settings.aimImproverEnabled ? 'transform translate-x-5' : ''
                    }`}></div>
                  </button>
                </div>

                {settings.aimImproverEnabled && (
                  <div className="space-y-2 border-t border-rose-500/20 pt-2 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Pro Pull Magnetism Multiplier:</span>
                      <span className="text-rose-400 font-bold">{settings.dragForceFactor}x Force</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={settings.dragForceFactor}
                      onChange={(e) => handleSliderChange('dragForceFactor', parseInt(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-sans leading-none">
                      <span>1x - Minor Touch-Assistance</span>
                      <span>10x - Elite Headshot Lock-On</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* INTERACTIVE BULLET RECOIL DRAG SANDBOX (MIND-BLOWING) */
        <div className="space-y-4" id="aim-test-sandbox">
          <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl">
            <h3 className="text-sm font-sans font-bold text-slate-200">Interactive Aim & Drag Field Sandbox</h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Test how the digital dragging algorithm mitigates Free Fire recoil. 
              <span className="text-yellow-400 font-medium"> Tap and hold down your mouse click (or hold touch) directly on the target</span> and compare bullet spray paths!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Sandbox Sidebar parameters */}
            <div className="md:col-span-1 space-y-3 font-sans text-xs">
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">1-Tap Recoil Reducer</label>
                  <div className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="font-mono text-[10px] text-slate-400">Drag Puller Active?</span>
                    <button
                      onClick={() => handleSliderChange('recoilReducer', !settings.recoilReducer)}
                      className={`px-3 py-1 text-[10px] font-mono rounded font-bold uppercase transition-colors cursor-pointer ${
                        settings.recoilReducer 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {settings.recoilReducer ? 'ON (Optimized)' : 'OFF (Deactive)'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-[10px] text-slate-500">
                    <span>Simulated Sensitivity:</span>
                    <span className="text-cyan-400 font-bold">{settings.general}%</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-500">
                    <span>Drag Coefficient:</span>
                    <span className="text-cyan-400 font-bold">{settings.recoilReducer ? 'Auto-Tuner (0.87)' : 'None (0.00)'}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-500 border-t border-slate-850 pt-1.5">
                    <span>Target Range:</span>
                    <span className="text-slate-300">45 Meters (FF Ranked)</span>
                  </div>
                </div>

                <button
                  onClick={handleResetSandbox}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 rounded font-mono text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> CLEAN TARGET DRIFT
                </button>
              </div>

              {/* Warning box */}
              <div className="bg-yellow-500/5 p-3.5 border border-yellow-500/10 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <span>Aim-Drag Notice</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Without drag optimization, consecutive shots pull the sights strongly upward, resulting in empty body/miss values. Maximize DPI to anchor.
                </p>
              </div>
            </div>

            {/* Simulated Interactive Stage */}
            <div className="md:col-span-3">
              <div 
                ref={sandboxRef}
                onMouseDown={handleShootStart}
                onMouseUp={handleShootEnd}
                onMouseLeave={handleShootEnd}
                onTouchStart={handleShootStart}
                onTouchEnd={handleShootEnd}
                className="w-full h-[380px] bg-slate-950 rounded-2xl border border-cyan-500/20 relative overflow-hidden cursor-crosshair select-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              >
                {/* Horizontal & Vertical grid indicators */}
                <div className="absolute left-6 top-4 font-mono text-[10px] text-slate-500">
                  COORDINATES: X({crosshairPos.x.toFixed(0)}) Y({crosshairPos.y.toFixed(0)})
                </div>
                <div className="absolute right-6 top-4 font-mono text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-slate-800/80">
                  {isFiring ? <span className="text-red-400 animate-pulse font-bold">● FIRING CONTINUOUS SPRAY</span> : 'STANDBY - TAP/HOLD TO FIRE'}
                </div>

                {/* Target dummy head and body graphic */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none pointer-events-none opacity-85">
                  
                  {/* Dummy Head */}
                  <div className="w-14 h-14 bg-slate-800 border-2 border-red-500/60 rounded-full flex items-center justify-center relative mb-1 shadow-2xl">
                    <Target className="w-8 h-8 text-red-500/40" />
                    <span className="text-[9px] font-mono text-red-400 absolute bottom-1 font-bold">HEAD</span>
                    {/* Head target ring */}
                    <div className="absolute inset-2.5 rounded-full border border-dashed border-red-500/20"></div>
                  </div>

                  {/* Dummy Neck */}
                  <div className="w-6 h-4 bg-slate-700/60 border-x-2 border-slate-600/80"></div>

                  {/* Dummy Body Torso */}
                  <div className="w-24 h-28 bg-slate-800/80 border-2 border-slate-700 rounded-lg flex items-center justify-center relative shadow-lg">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Chest Armor</span>
                    {/* Core target ring */}
                    <div className="absolute inset-5 rounded-full border border-dashed border-slate-600/30"></div>
                  </div>
                </div>

                {/* Simulated Floating damage markers */}
                {damageIndicators.map((dmg) => (
                  <div
                    key={dmg.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none font-extrabold text-xl font-mono tracking-tighter filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce select-none`}
                    style={{
                      left: `${dmg.x}%`,
                      top: `${dmg.y}%`,
                      color: dmg.type === 'head' ? '#ff3232' : '#facc15'
                    }}
                  >
                    💥 {dmg.text}
                  </div>
                ))}

                {/* Tracking sight Crosshair Reticle representing touch spot */}
                <div 
                  className="absolute p-2 pointer-events-none transition-all duration-75 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${crosshairPos.x}%`,
                    top: `${crosshairPos.y}%`
                  }}
                >
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    {/* Retro gaming custom target sights */}
                    <div className="absolute w-full h-[1px] bg-cyan-400"></div>
                    <div className="absolute h-full w-[1px] bg-cyan-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/85 shadow-[0_0_8px_#ff0000]"></div>
                    {/* Small dragging correction ring visual */}
                    {settings.recoilReducer && (
                      <div className="absolute w-5 h-5 rounded-full border-2 border-green-400/50 animate-ping"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
