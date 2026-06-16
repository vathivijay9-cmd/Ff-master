/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Layout, Sliders, Smartphone, CheckCircle, Flame, Star, ShieldAlert } from 'lucide-react';
import { MacroSettings } from '../types';

interface MacroHelperProps {
  settings: MacroSettings;
  onSettingsChange: (settings: MacroSettings) => void;
}

export default function MacroHelper({ settings, onSettingsChange }: MacroHelperProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'floating-test'>('config');

  // Trigger floating assistant view inside the page
  const [showFloatingPreview, setShowFloatingPreview] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 80, y: 35 }); // percentages
  const [macroOverlayOpen, setMacroOverlayOpen] = useState(false);

  const [glooWallPlaced, setGlooWallPlaced] = useState(false);
  const [glooWallFeedbackText, setGlooWallFeedbackText] = useState("");

  const triggerGlooWallPlacement = () => {
    if (glooWallPlaced) return;
    setGlooWallPlaced(true);
    setGlooWallFeedbackText(`[Macro] Gloo Wall set in ${settings.speedGlooWallDelay}ms (Crouch Lock)`);

    // Dynamic placement beep
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.14);
    } catch (_) {}

    setTimeout(() => {
      setGlooWallPlaced(false);
      setGlooWallFeedbackText("");
    }, 1500);
  };

  const handleToggle = (key: keyof MacroSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleChange = (key: keyof MacroSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div id="macro-helper-container" className="space-y-6">
      
      {/* Sub tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 font-sans cursor-pointer transition-all ${
            activeTab === 'config' 
              ? 'border-cyan-400 text-cyan-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Macro Overlay Config
        </button>
        <button
          onClick={() => setActiveTab('floating-test')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 font-sans cursor-pointer transition-all ${
            activeTab === 'floating-test' 
              ? 'border-cyan-400 text-cyan-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Floating HUD Overlay Simulator
        </button>
      </div>

      {activeTab === 'config' ? (
        /* CORE SETTINGS LAYOUT */
        <div className="space-y-6" id="macro-config-panel">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Auto Medkit Macro Settings */}
            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-200 font-sans font-bold text-base flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 animate-pulse" /> 1-Tap Auto-Medkit Handler
                  </h3>
                  <p className="text-gray-405 text-xs text-slate-400 mt-1 font-sans">Trigger instantaneous healing recovery without interrupting cover navigation.</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleToggle('medkitActive')}
                  className="cursor-pointer"
                >
                  {settings.medkitActive ? (
                    <ToggleRight className="w-12 h-8 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="w-12 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Medkit Configuration Sliders */}
              <div className={`space-y-3 font-sans text-xs transition-opacity duration-300 ${
                settings.medkitActive ? 'opacity-100' : 'opacity-40 pointer-events-none'
              }`}>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium">Physical Key Trigger Binding</label>
                  <select
                    value={settings.medkitTriggerKey}
                    onChange={(e) => handleChange('medkitTriggerKey', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-slate-200 focus:outline-none"
                  >
                    <option value="Volume Up Button">Physical Volume Up (+ Button)</option>
                    <option value="Volume Down Button">Physical Volume Down (- Button)</option>
                    <option value="Double Tap Screen Left">Double Tap Left Margin</option>
                  </select>
                  <p className="text-[10px] text-slate-500">Maps physical key press triggers directly to the in-game Medkit button coordinate.</p>
                </div>

                <div className="bg-slate-950/65 p-3.5 border border-slate-850 rounded-xl space-y-1 text-slate-400 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span>Mapped Touch Target Coordinate:</span>
                    <span className="text-cyan-400 font-bold">X: 792 / Y: 1450 (Standard HUD)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Simulated Hold Speed:</span>
                    <span className="text-slate-300">Continuous 3.4 Seconds (FF Standard)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto Sprint Lock Settings */}
            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-200 font-sans font-bold text-base flex items-center gap-2">
                    <Flame className="w-5 h-5 text-cyan-400" /> Auto-Sprint Lock Engine
                  </h3>
                  <p className="text-gray-405 text-xs text-slate-400 mt-1 font-sans">Lock your dpad joystick forward continuously to prevent sliding deceleration.</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleToggle('autoSprintLock')}
                  className="cursor-pointer"
                >
                  {settings.autoSprintLock ? (
                    <ToggleRight className="w-12 h-8 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="w-12 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Sprint configuration sliders */}
              <div className={`space-y-3 font-sans text-xs transition-opacity duration-300 ${
                settings.autoSprintLock ? 'opacity-100' : 'opacity-40 pointer-events-none'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Forward-lock Dpad Drag Pitch</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.autoSprintPercent}% Drag</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={settings.autoSprintPercent}
                    onChange={(e) => handleChange('autoSprintPercent', parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <p className="text-[10px] text-slate-500">Determines the physical joystick touch-drag radius percentage offset.</p>
                </div>

                <div className="bg-slate-950/65 p-3.5 border border-slate-850 rounded-xl space-y-1 text-slate-400 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span>Continuous Joystick Lock:</span>
                    <span className="text-green-400 font-bold">Enabled (Zero-delay drag)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Throttling Safeguard protection:</span>
                    <span className="text-slate-300">Active (Anti-Kick protection)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Speed Gloo Wall Macro Settings */}
            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-200 font-sans font-bold text-base flex items-center gap-2">
                    <Flame className="w-5 h-5 text-indigo-400" /> Speed Gloo-Wall Dropper
                  </h3>
                  <p className="text-gray-405 text-xs text-slate-400 mt-1 font-sans">
                    Execute crouch + place wall sequence within milliseconds of clicking the Gloo-Wall tactical item.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleToggle('speedGlooWall')}
                  className="cursor-pointer"
                >
                  {settings.speedGlooWall ? (
                    <ToggleRight className="w-12 h-8 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="w-12 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Gloo Wall speed controls */}
              <div className={`space-y-3 font-sans text-xs transition-opacity duration-300 ${
                settings.speedGlooWall ? 'opacity-100' : 'opacity-40 pointer-events-none'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Macro Deployment Speed</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.speedGlooWallDelay} ms Delay</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={settings.speedGlooWallDelay}
                    onChange={(e) => handleChange('speedGlooWallDelay', parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <p className="text-[10px] text-slate-500">Delay between crouch simulation and trigger deployment coordinate activation.</p>
                </div>

                <div className="bg-slate-950/65 p-3.5 border border-slate-850 rounded-xl space-y-1 text-slate-400 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span>Crouch Trigger State:</span>
                    <span className="text-green-400 font-bold">Enabled (Auto-Duck)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wall Spot Anchoring:</span>
                    <span className="text-slate-300">Absolute Centered Base (Optimal Cover)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto Find Enemies Settings */}
            <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-200 font-sans font-bold text-base flex items-center gap-2">
                    <Layout className="w-5 h-5 text-emerald-400" /> AI Auto-Find Enemy Radar
                  </h3>
                  <p className="text-gray-405 text-xs text-slate-400 mt-1 font-sans">
                    Enable high-frequency audio-spatial parsing. Projects an on-screen mini combat radar showing nearby opponents.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleToggle('autoFindEnemies')}
                  className="cursor-pointer"
                >
                  {settings.autoFindEnemies ? (
                    <ToggleRight className="w-12 h-8 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="w-12 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Auto Find range controls */}
              <div className={`space-y-3 font-sans text-xs transition-opacity duration-300 ${
                settings.autoFindEnemies ? 'opacity-100' : 'opacity-40 pointer-events-none'
              }`}>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Sentry Detection Radius</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.autoFindEnemiesRange} Meters Range</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={settings.autoFindEnemiesRange}
                    onChange={(e) => handleChange('autoFindEnemiesRange', parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <p className="text-[10px] text-slate-500">Scan boundary distance. Higher range requires stable processor thermal states.</p>
                </div>

                <div className="bg-slate-950/65 p-3.5 border border-slate-850 rounded-xl space-y-1 text-slate-400 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span>Acoustic Wave Scanner:</span>
                    <span className="text-green-400 font-bold">Active (3D HRTF parsing)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Visual Overlay Alerts:</span>
                    <span className="text-slate-300">On HUD and Mini-Phone Simulation</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Aim Assist Dot configuration */}
          <div className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-gray-200 font-sans font-bold text-sm flex items-center gap-1.5">
                  <Layout className="w-4.5 h-4.5 text-cyan-400" /> Screen Center Crosshair Overlay (DTS Dot)
                </h3>
                <p className="text-gray-400 text-xs mt-0.5 font-sans">Draws a persistent screen hardware crosshair over Free Fire to assist blank close-range shotgun aim.</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('aimAssistDot')}
                className={`px-4 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer ${
                  settings.aimAssistDot 
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                    : 'bg-slate-950 text-slate-500 border-slate-850'
                }`}
              >
                {settings.aimAssistDot ? 'HUD DOT OVERLAY: ON' : 'HUD DOT OVERLAY: OFF'}
              </button>
            </div>

            {settings.aimAssistDot && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-400">Tactical Dot Color Palette</label>
                  <div className="flex gap-2">
                    {[
                      { hex: '#ff0055', label: 'Crimson Surge' },
                      { hex: '#00F0FF', label: 'Terminal Cyan' },
                      { hex: '#22c55e', label: 'Acid Green' },
                      { hex: '#eab308', label: 'Focus Yellow' }
                    ].map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => handleChange('aimAssistColor', col.hex)}
                        className={`w-8 h-8 rounded-full border-2 transition-all relative cursor-pointer ${
                          settings.aimAssistColor === col.hex ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-4 border border-slate-850 rounded-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded flex items-center justify-center">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: settings.aimAssistColor, boxShadow: `0 0 8px ${settings.aimAssistColor}` }}
                    />
                  </div>
                  <div className="space-y-0.5 text-[11px]">
                    <div className="text-slate-200 font-semibold uppercase">Active Overlay Preview</div>
                    <div className="text-slate-500 font-mono">Precision anchor centered automatically (Absolute 50% relative layout).</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* HIGH INTERACTIVE FLOATING HUD OVERLAY DEMO */
        <div className="space-y-4" id="floating-hud-panel">
          <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
            <h3 className="text-sm font-sans font-bold text-slate-200">Interactive Floating Assist HUD Sandbox</h3>
            <p className="text-xs text-slate-405 text-slate-400 font-sans leading-relaxed">
              This simulator mimics exactly how the "FF Vivo Turbo" application operates in real-time as an overlay. 
              Toggle <span className="text-cyan-400 font-bold">"Activate Virtual Overlay Phone"</span>, then hover or tap the small neon floating logo widget inside the phone screen to unveil the rapid-action gaming controls!
            </p>
            
            <button
              onClick={() => setShowFloatingPreview(!showFloatingPreview)}
              className={`py-2 px-6 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all cursor-pointer ${
                showFloatingPreview
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
              }`}
            >
              {showFloatingPreview ? 'Disable Virtual Game Screen' : 'Activate Virtual Overlay Phone'}
            </button>
          </div>

          {showFloatingPreview && (
            <div className="flex justify-center" id="virtual-phone-overlay-container">
              {/* Mock smartphone wrap */}
              <div className="w-[640px] h-[340px] bg-slate-950 rounded-[30px] border-8 border-slate-800 relative overflow-hidden flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                
                {/* Speaker Grill & Camera dot */}
                <div className="absolute top-[13px] left-1/2 transform -translate-x-1/2 w-28 h-4.5 bg-slate-800 rounded-b-xl border-x border-b border-slate-900 z-30 flex items-center justify-center gap-3">
                  <div className="w-10 h-1 bg-black rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-[#030712] rounded-full border border-slate-700"></div>
                </div>

                {/* Simulated Game Wallpaper backdrop representation */}
                <div className="absolute inset-0 bg-slate-900 flex flex-col justify-between p-6 z-10 select-none overflow-hidden"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(11, 14, 20, 0.70), rgba(11, 14, 20, 0.82)), url("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Top HUD bar of Free fire visual */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono bg-black/30 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                    <span className="text-yellow-400 font-sans font-bold">🏆 Garena Ranked Match</span>
                    <span className="text-green-400">PING: 24ms</span>
                    <span>FPS: 90 LIMIT</span>
                  </div>

                  {/* Aim Dot overlay widget */}
                  {settings.aimAssistDot && (
                    <div 
                      className="absolute left-1/2 top-11/12 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center z-25 p-1"
                      style={{ 
                        borderColor: settings.aimAssistColor, 
                        boxShadow: `0 0 10px ${settings.aimAssistColor}`
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: settings.aimAssistColor }} />
                    </div>
                  )}

                  {/* AI ESP Target Radar visual */}
                  {settings.autoFindEnemies && (
                    <div className="absolute right-6 top-12 border border-dashed border-red-500 bg-red-500/10 p-2.5 rounded-xl flex flex-col gap-1 opacity-95 animate-pulse text-[9px] font-mono font-bold text-red-200 z-20 select-none">
                      <div className="flex items-center gap-1.5 uppercase">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                        <span>📡 AI Target Radar Connected</span>
                      </div>
                      <div className="text-[8px] text-slate-400 font-normal leading-tight">
                        Locked opponent [Distance: {Math.floor(settings.autoFindEnemiesRange * 0.43)}m]
                      </div>
                    </div>
                  )}

                  {/* Gloo Wall Block placement visual */}
                  {glooWallPlaced && (
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-[220px] bg-sky-500/30 border-2 border-sky-300 rounded-2xl backdrop-blur-sm z-20 p-2 text-center text-white select-none animate-bounce shadow-[0_0_20px_rgba(56,189,248,0.5)]">
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-sky-250 block">✓ GLOO WALL ERECTED</span>
                      <span className="text-[8px] font-mono text-sky-300 leading-none">Instant speed: {settings.speedGlooWallDelay}ms</span>
                    </div>
                  )}

                  {/* Interactive Gameplay Preview placeholder text */}
                  <div className="text-center space-y-1.5 my-auto pointer-events-none">
                    <div className="bg-cyan-500/20 text-cyan-400 inline-block px-3 py-0.5 rounded-full border border-cyan-500/30 text-[10px] font-mono tracking-widest uppercase font-bold animate-pulse">
                      Simulated Gameplay Screen
                    </div>
                    {glooWallFeedbackText ? (
                      <p className="text-indigo-400 font-mono text-[10px] mt-1 font-bold animate-pulse">
                        {glooWallFeedbackText}
                      </p>
                    ) : (
                      <p className="text-slate-300 font-sans text-xs font-semibold max-w-sm mx-auto">
                        {settings.speedGlooWall ? "Tap the GLOO item button below to deploy swift defense!" : "Floating assistant launcher ball overlay is initialized below."}
                      </p>
                    )}
                  </div>

                  {/* Simulated Action HUD layout controls */}
                  <div className="flex justify-between items-end">
                    <div className="flex gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                        <span className="text-[10px] font-bold text-slate-300 font-mono">DPAD</span>
                      </div>
                      {settings.autoSprintLock && (
                        <div className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[9px] font-mono font-bold text-green-300 h-fit">
                          SPRINT LOCKED
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2.5">
                      {settings.medkitActive && (
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/40 font-mono text-[9px] flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-500/30">
                          <span className="text-cyan-300 font-bold">MED</span>
                          <span className="text-[7px] text-cyan-400 uppercase font-semibold">{settings.medkitTriggerKey.split(' ')[0]}</span>
                        </div>
                      )}

                      {settings.speedGlooWall && (
                        <button 
                          onClick={triggerGlooWallPlacement}
                          className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/40 font-mono text-[9px] flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-500/30 text-indigo-300 font-bold active:scale-95 transition-transform"
                        >
                          <span>GLOO</span>
                          <span className="text-[7px] text-indigo-450 uppercase font-semibold">{settings.speedGlooWallDelay}ms</span>
                        </button>
                      )}
                      
                      <div className="w-11 h-11 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                        FIRE
                      </div>
                    </div>
                  </div>

                  {/* FLOATING GAME ASSIST TURBO WIDGET IN THE SCREEN */}
                  <div 
                    className="absolute z-40"
                    style={{ left: `${buttonPosition.x}%`, top: `${buttonPosition.y}%` }}
                  >
                    <button
                      onClick={() => setMacroOverlayOpen(!macroOverlayOpen)}
                      className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 border border-cyan-200 shadow-[0_0_12px_#00F0FF] flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110"
                      title="Tap to Open FF Vivo Turbo menu"
                    >
                      <span className="text-[10px] font-mono font-extrabold text-white tracking-tighter">VIVO</span>
                    </button>

                    {/* Draggable notice pointer */}
                    {!macroOverlayOpen && (
                      <div className="absolute top-11 bg-cyan-400 text-black text-[8px] font-mono font-bold tracking-wider py-0.5 px-1.5 rounded border border-white left-1/2 transform -translate-x-1/2 select-none uppercase animate-bounce whitespace-nowrap">
                        TAP OVERLAY
                      </div>
                    )}
                  </div>

                  {/* ACTIVE HUD SLIDE-OVER DASHBOARD (WHEN FLOATING WIDGET TAPPED) */}
                  {macroOverlayOpen && (
                    <div className="absolute top-0 bottom-0 right-0 w-[240px] bg-slate-950/95 border-l border-cyan-500/30 z-50 p-4 shadow-2xl flex flex-col justify-between font-sans text-xs">
                      
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                          <span className="font-bold text-cyan-400 font-mono tracking-wider uppercase text-[10px]">Vivo Turbo HUD v4.2</span>
                          <button
                            onClick={() => setMacroOverlayOpen(false)}
                            className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                          >
                            ×
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <div className="text-slate-500 text-[9px] uppercase font-mono">Core Accelerator</div>
                            <div className="flex items-center gap-1.5 text-green-400 font-bold text-[10px] uppercase font-mono mt-0.5">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                              Turbo Governor Active
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-slate-400 block text-[10px]">Macro Locks State</span>
                            <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-slate-850">
                              <span className="text-slate-300 font-mono text-[9px]">Auto Medkit:</span>
                              <span className={`text-[9px] font-bold font-mono ${settings.medkitActive ? 'text-green-400' : 'text-slate-500'}`}>
                                {settings.medkitActive ? 'OK' : 'OFF'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-slate-850">
                              <span className="text-slate-300 font-mono text-[9px]">Joystick Lock:</span>
                              <span className={`text-[9px] font-bold font-mono ${settings.autoSprintLock ? 'text-green-400' : 'text-slate-500'}`}>
                                {settings.autoSprintLock ? `${settings.autoSprintPercent}%` : 'OFF'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 bg-slate-900 p-2 rounded border border-slate-800 text-[10px] leading-relaxed text-slate-400">
                        <div className="text-white font-semibold font-mono text-[9px] uppercase">Overlay Control</div>
                        <p>Configure sensitivity under the main application settings profile.</p>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
            <div className="space-y-0.5 text-xs text-slate-400 font-sans">
              <div className="text-yellow-400 font-bold">Important Safe-Play Note</div>
              <p className="leading-snug">
                The floating system assistant simulation matches standard overlay structures. Since Funtouch OS 13/14 secure frame protocols are strict, make sure you configure your macro bindings safely prior to match entry to bypass auto-kick checks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
