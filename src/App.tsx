/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Shield, Zap, Sparkles, Cpu, Thermometer, Battery, Layout, Target, Sliders } from 'lucide-react';
import { DeviceModel, GfxSettings, AimSettings, MacroSettings } from './types';
import DeviceScanner from './components/DeviceScanner';
import PerformanceBooster from './components/PerformanceBooster';
import AimStabilizer from './components/AimStabilizer';
import MacroHelper from './components/MacroHelper';
import ActiveGameOverlay from './components/ActiveGameOverlay';

export default function App() {
  // Navigation & Init Stages
  const [scanCompleted, setScanCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'booster' | 'aim' | 'macro'>('booster');
  const [gameLaunched, setGameLaunched] = useState(false);

  // Core configuration states
  const [selectedDevice, setSelectedDevice] = useState<DeviceModel>('Vivo T2x 5G');
  const [isFlagshipMode, setIsFlagshipMode] = useState(false);

  const [gfxSettings, setGfxSettings] = useState<GfxSettings>({
    resolution: 'Smooth (720p)',
    fps: '90 FPS (Ultra)',
    style: 'Colorful',
    shadows: true,
    hdrEnabled: false
  });

  const [aimSettings, setAimSettings] = useState<AimSettings>({
    preset: 'medium',
    general: 95,
    redDot: 92,
    scope2x: 88,
    scope4x: 85,
    sniperAwm: 55,
    freeLook: 65,
    recoilReducer: true,
    dpiValue: 480,
    aimImproverEnabled: false,
    dragForceFactor: 5
  });

  const [macroSettings, setMacroSettings] = useState<MacroSettings>({
    medkitActive: true,
    medkitTriggerKey: 'Volume Up Button',
    autoSprintLock: true,
    autoSprintPercent: 88,
    aimAssistDot: true,
    aimAssistColor: '#00F0FF',
    speedGlooWall: false,
    speedGlooWallDelay: 40,
    autoFindEnemies: false,
    autoFindEnemiesRange: 150
  });

  // Dynamic Dashboard Stats Simulators
  const [cpuFreq, setCpuFreq] = useState('2.20 GHz');
  const [batteryTemp, setBatteryTemp] = useState('36.2 °C');
  const [batteryLevel, setBatteryLevel] = useState(85);

  useEffect(() => {
    const clockSim = setInterval(() => {
      // Simulate CPU clock adjustments
      const baseFreq = selectedDevice === 'Vivo T2x 5G' ? 2.20 : 3.30;
      const flux = (Math.random() * 0.4) - 0.2;
      setCpuFreq(`${(baseFreq + flux).toFixed(2)} GHz`);

      // Dynamic thermals
      const normalTemp = selectedDevice === 'Vivo T2x 5G' ? 36.5 : 38.2;
      const tempFlux = (Math.random() * 0.6) - 0.3;
      setBatteryTemp(`${(normalTemp + tempFlux).toFixed(1)} °C`);

      // Micro battery state fluctuations
      setBatteryLevel((prev) => {
        if (prev <= 12) return 92; // auto charge sim
        return prev;
      });
    }, 3000);

    return () => clearInterval(clockSim);
  }, [selectedDevice]);

  const handleScanCompleted = (device: DeviceModel, flagshipVal: boolean) => {
    setSelectedDevice(device);
    setIsFlagshipMode(flagshipVal);
    // Auto calibrate DPI based on chosen device
    let initialDpi = 410;
    if (device === 'Vivo T2x 5G') initialDpi = 480;
    else if (device === 'ASUS ROG Phone 9 Pro') initialDpi = 585;
    else if (device === 'Redmagic 10 Ultra') initialDpi = 512;
    else if (device === 'iQOO 13') initialDpi = 540;

    setAimSettings((prev) => ({
      ...prev,
      dpiValue: initialDpi
    }));
    setScanCompleted(true);
  };

  const handleLaunchGame = () => {
    setGameLaunched(true);
  };

  // Render scan screen if not complete
  if (!scanCompleted) {
    return (
      <div id="scanner-layout-root" className="min-h-screen bg-[#080B10] flex items-center justify-center p-4">
        {/* Abstract gaming matrix lines behind */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>
        <DeviceScanner onScanComplete={handleScanCompleted} />
      </div>
    );
  }

  // Render game dashboard session if launched
  if (gameLaunched) {
    return (
      <ActiveGameOverlay
        device={selectedDevice}
        isFlagshipMode={isFlagshipMode}
        gfxSettings={gfxSettings}
        aimSettings={aimSettings}
        macroSettings={macroSettings}
        onExit={() => setGameLaunched(false)}
      />
    );
  }

  return (
    <div id="main-gaming-dashboard-shell" className="min-h-screen bg-[#07090d] text-slate-100 flex flex-col font-sans">
      
      {/* Top Header Panel */}
      <header className="border-b border-cyan-500/10 bg-[#090d14]/90 backdrop-blur-md sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Branding / Active device indicator */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl relative">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400/20 blur rounded-xl"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-widest text-white leading-none font-sans">FF VIVO TURBO</h1>
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-400 py-0.5 px-2 rounded-full border border-cyan-500/30 font-bold uppercase">
                  v4.2 Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans flex items-center gap-1.5">
                <Smartphone className="w-3 h-3 text-cyan-400" /> Detected Device: 
                <span className="text-cyan-300 font-bold font-mono">{selectedDevice}</span>
                {isFlagshipMode && (
                  <span className="text-[9px] font-mono bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded-full border border-red-500/30">
                    Flagship Mode
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Core Hardware simulation meters */}
          <div className="flex flex-wrap gap-4 font-mono text-[11px] text-slate-400 bg-slate-950 p-2.5 px-4 rounded-xl border border-slate-900">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CLOCK: <span className="text-slate-200 font-semibold">{cpuFreq}</span></span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-900 pl-4">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              <span>THERMAL STATE: <span className="text-slate-200 font-semibold">{batteryTemp}</span></span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-900 pl-4">
              <Battery className="w-3.5 h-3.5 text-green-400" />
              <span>POWER: <span className="text-slate-200 font-semibold">{batteryLevel}%</span></span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar Layout Navigation & Launcher Button */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-6">
          
          {/* Dashboard menu options card */}
          <div className="space-y-4 bg-slate-900/15 p-5 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Tuning Domains</h2>
              
              <div className="flex flex-col gap-2 font-sans text-xs">
                {/* Tab 1: Booster */}
                <button
                  onClick={() => setActiveTab('booster')}
                  className={`w-full p-3.5 rounded-xl text-left font-bold flex items-center gap-2.5 transition-all text-[13px] cursor-pointer ${
                    activeTab === 'booster'
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Cpu className="w-4.5 h-4.5" />
                  <span>Turbo Performance Booster</span>
                </button>

                {/* Tab 2: Aim */}
                <button
                  onClick={() => setActiveTab('aim')}
                  className={`w-full p-3.5 rounded-xl text-left font-bold flex items-center gap-2.5 transition-all text-[13px] cursor-pointer ${
                    activeTab === 'aim'
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Target className="w-4.5 h-4.5" />
                  <span>Aim Mastery & Drag DPI</span>
                </button>

                {/* Tab 3: Macro */}
                <button
                  onClick={() => setActiveTab('macro')}
                  className={`w-full p-3.5 rounded-xl text-left font-bold flex items-center gap-2.5 transition-all text-[13px] cursor-pointer ${
                    activeTab === 'macro'
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'bg-transparent text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Layout className="w-4.5 h-4.5" />
                  <span>Macro Overlay Helpers</span>
                </button>
              </div>
            </div>

            {/* Quick calibration feedback */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 mt-6 space-y-2.5 text-xs">
              <span className="text-slate-400 font-bold block font-mono text-[10px] uppercase">Active Engine Preset</span>
              <div className="flex justify-between font-mono text-[11px] text-slate-500">
                <span>FPS target:</span>
                <span className="text-green-400 font-bold">{gfxSettings.fps.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px] text-slate-500">
                <span>DPI multiplier:</span>
                <span className="text-yellow-400 font-bold">{aimSettings.dpiValue} dDPI</span>
              </div>
              <div className="flex justify-between font-mono text-[11px] text-slate-500">
                <span>Macro state:</span>
                <span className={macroSettings.medkitActive ? 'text-cyan-400 font-bold' : 'text-slate-600'}>
                  {macroSettings.medkitActive ? 'Active' : 'Standby'}
                </span>
              </div>
            </div>
          </div>

          {/* PULSING GIANT ONE-TAP LAUNCH ENGINE BUTTON */}
          <div className="bg-gradient-to-tr from-[#0b0f16]/90 to-[#0e1625]/90 p-5 rounded-2xl border border-cyan-500/20 text-center space-y-4">
            <div>
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest leading-none">High priority Launch</h3>
              <p className="text-[11px] text-slate-500 mt-1 font-sans">Boot Free Fire with fully compiled game profiles</p>
            </div>

            <button
              id="activate-game-btn"
              onClick={handleLaunchGame}
              className="w-full py-4.5 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 hover:from-red-400 hover:to-rose-500 text-white font-extrabold text-sm tracking-widest uppercase rounded-xl border-t border-red-300/30 cursor-pointer shadow-[0_5px_25px_rgba(239,68,68,0.4)] hover:shadow-[0_5px_30px_rgba(239,68,68,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all font-sans relative overflow-hidden"
            >
              {/* Spinning background effect under hover */}
              <div className="absolute inset-0 bg-white/5 pointer-events-none opacity-20 select-none animate-pulse"></div>
              <span className="relative flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300 animate-bounce fill-current" />
                LAUNCH FREE FIRE
              </span>
            </button>

            <span className="text-[10px] font-mono text-slate-500 block">
              ★ SHADER COMPILATION READY
            </span>
          </div>

        </div>

        {/* Right Dashboard Area (Active tuner modules) */}
        <div className="lg:col-span-3">
          
          {/* Main dynamic tuner block render segment */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-5 sm:p-6 backdrop-blur shadow-2xl relative overflow-hidden h-full">
            
            {/* Displaying active tab controls */}
            {activeTab === 'booster' && (
              <PerformanceBooster
                device={selectedDevice}
                isFlagshipMode={isFlagshipMode}
                gfxSettings={gfxSettings}
                onGfxChange={setGfxSettings}
              />
            )}

            {activeTab === 'aim' && (
              <AimStabilizer
                device={selectedDevice}
                settings={aimSettings}
                onSettingsChange={setAimSettings}
              />
            )}

            {activeTab === 'macro' && (
              <MacroHelper
                settings={macroSettings}
                onSettingsChange={setMacroSettings}
              />
            )}

          </div>

        </div>

      </main>

      {/* Footer System Credits */}
      <footer className="border-t border-slate-900 bg-[#06080c] py-4 text-center select-none text-[11px] font-mono text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>VIVO TURBO ASSISTANT ENGINE • DESIGNED ACCORDING TO SYSTEM LEVEL COMPILER SPECS</span>
          <span>ANTIBAN CONSOLE READY CONTROL PANEL</span>
        </div>
      </footer>

    </div>
  );
}
