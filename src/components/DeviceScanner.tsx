/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cpu, Server, Smartphone, Zap, CheckCircle, Shield, Sliders } from 'lucide-react';
import { motion } from 'motion/react';
import { DeviceModel } from '../types';

interface DeviceScannerProps {
  onScanComplete: (device: DeviceModel, isFlagshipMode: boolean) => void;
}

export default function DeviceScanner({ onScanComplete }: DeviceScannerProps) {
  const [detectedModel, setDetectedModel] = useState<DeviceModel>('Vivo T2x 5G');
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing Kernels...');
  const [isFlagshipMode, setIsFlagshipMode] = useState(false);

  const steps = [
    { progress: 15, label: 'Reading Build.prop signatures...' },
    { progress: 35, label: 'Accessing Hardware Drivers & Sensors...' },
    { progress: 55, label: 'Detecting MediaTek HyperEngine / Snapdragon Core Cluster...' },
    { progress: 75, label: 'Mapping Free Fire process allocation bounds...' },
    { progress: 95, label: 'Securing Turbo Game Governor limits...' },
    { progress: 100, label: 'System Scanner Ready!' }
  ];

  useEffect(() => {
    if (!isScanning) return;
    
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        const currentTarget = Math.min(next, 100);
        
        // Update labels based on progress matching
        const step = steps.find(s => currentTarget <= s.progress);
        if (step) {
          setCurrentStep(step.label);
        }

        if (currentTarget >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return currentTarget;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isScanning]);

  const handleStartBooster = () => {
    onScanComplete(detectedModel, isFlagshipMode);
  };

  const getDeviceSpecifications = () => {
    switch (detectedModel) {
      case 'Vivo T2x 5G':
        return {
          chipset: 'MediaTek Dimensity 6020 (7nm)',
          gpu: 'Mali-G57 MC2',
          cores: '8-Core (2x2.2 GHz + 6x2.0 GHz)',
          defaultRam: '8GB LPDDR4X',
          displayRate: '120Hz Ultra Smooth Display'
        };
      case 'ASUS ROG Phone 9 Pro':
        return {
          chipset: 'Qualcomm Snapdragon 8 Elite',
          gpu: 'Adreno 830',
          cores: '8-Core Prime (2x4.32 GHz + 6x3.53 GHz)',
          defaultRam: '24GB LPDDR5X',
          displayRate: '185Hz Extreme Gaming Screen'
        };
      case 'Redmagic 10 Ultra':
        return {
          chipset: 'Snapdragon 8 Elite (Extreme Ed.)',
          gpu: 'Adreno 830 (ICE 13.5 Cooling)',
          cores: '8-Core (2x4.32 GHz + 6x3.53 GHz)',
          defaultRam: '16GB LPDDR5X',
          displayRate: '144Hz Full screen'
        };
      case 'iQOO 13':
        return {
          chipset: 'Qualcomm Snapdragon 8 Elite',
          gpu: 'Adreno 830 (Q1 Display Chip)',
          cores: '8-Core Max',
          defaultRam: '16GB RAM',
          displayRate: '144Hz 2K AMOLED'
        };
      default:
        return {
          chipset: 'High-Performance Octa-Core',
          gpu: 'DirectX/Vulkan Standard',
          cores: '8-Core Boosted',
          defaultRam: '8GB - 12GB',
          displayRate: '90Hz / 120Hz'
        };
    }
  };

  const specs = getDeviceSpecifications();

  return (
    <div id="device-scanner-wrapper" className="flex flex-col items-center justify-center min-h-[90vh] text-white px-2 sm:px-6">
      <div className="w-full max-w-xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_-10px_rgba(0,240,255,0.15)] relative overflow-hidden">
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>

        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/50 rounded-full border border-cyan-500/20 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-4 animate-pulse">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Vivo Game space v4.2
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-300 to-cyan-500 bg-clip-text text-transparent font-sans">
            FF VIVO TURBO
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-sans">Ultimate Free Fire Engine Tuner</p>
        </div>

        {isScanning ? (
          /* Scanning Phase */
          <div className="flex flex-col items-center space-y-6 py-6" id="scanning-phase-container">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Circular spinning radar */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/20 animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-2 rounded-full border border-cyan-500/40 animate-[spin_5s_linear_infinite_reverse]"></div>
              <div className="absolute inset-4 rounded-full bg-cyan-950/20 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Cpu className="w-12 h-12 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div className="w-full text-center space-y-2">
              <div className="text-cyan-400 font-mono text-sm tracking-widest font-semibold">
                SYSTEM SCANNING: {scanProgress}%
              </div>
              <div className="text-xs text-slate-400 h-5 font-mono">
                {currentStep}
              </div>
            </div>

            {/* Simulated hardware detections popping in */}
            <div className="w-full bg-slate-950/50 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-400 space-y-2.5">
              <div className="flex justify-between items-center">
                <span>DETECTING MAINBOARD...</span>
                <span className={scanProgress > 15 ? 'text-green-400 font-semibold' : 'text-cyan-600'}>
                  {scanProgress > 15 ? '✓ VIVO_T2X_PLATFORM' : 'SCANNING'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>ANALYZING CPU DRIVER...</span>
                <span className={scanProgress > 45 ? 'text-green-400 font-semibold' : 'text-cyan-600'}>
                  {scanProgress > 45 ? '✓ MTK_HYPERENGINE_ACTIVE' : 'SCANNING'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>CHECKING ROOT & SYSTEM BOUNDS...</span>
                <span className={scanProgress > 75 ? 'text-green-400 font-semibold' : 'text-cyan-600'}>
                  {scanProgress > 75 ? '✓ ADB_DEBUG_READY' : 'SCANNING'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Detection Completed Dashboard */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
            id="detection-completed-panel"
          >
            {/* Device Info Panel */}
            <div className="bg-slate-950/75 rounded-xl p-5 border border-cyan-500/30 space-y-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Detected Device</h3>
                  <div className="flex items-center gap-3">
                    <select
                      value={detectedModel}
                      onChange={(e) => setDetectedModel(e.target.value as DeviceModel)}
                      className="bg-transparent border-0 text-cyan-300 text-lg font-bold p-0 focus:outline-none cursor-pointer focus:ring-0 font-sans"
                    >
                      <option className="bg-slate-900 text-white" value="Vivo T2x 5G">Vivo T2x 5G (Default)</option>
                      <option className="bg-slate-900 text-white" value="ASUS ROG Phone 9 Pro">ASUS ROG Phone 9 Pro</option>
                      <option className="bg-slate-900 text-white" value="Redmagic 10 Ultra">Redmagic 10 Ultra</option>
                      <option className="bg-slate-900 text-white" value="iQOO 13">iQOO 13 Flagship</option>
                      <option className="bg-slate-900 text-white" value="Custom Device">Other Gaming Phone</option>
                    </select>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono py-0.5 px-2 rounded-full border border-cyan-500/30 select-none">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardware Spec Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">SOC Chipset</div>
                  <div className="text-slate-200 mt-1 font-semibold text-ellipsis overflow-hidden whitespace-nowrap">{specs.chipset}</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Gaming GPU</div>
                  <div className="text-slate-200 mt-1 font-semibold text-ellipsis overflow-hidden whitespace-nowrap">{specs.gpu}</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Core Topology</div>
                  <div className="text-slate-200 mt-1 font-semibold">{specs.cores}</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Refresh Rate</div>
                  <div className="text-cyan-400 mt-1 font-semibold">{specs.displayRate}</div>
                </div>
              </div>
            </div>

            {/* Flagship Mode Activator */}
            <div className="bg-gradient-to-r from-red-950/20 to-slate-950/80 p-4 rounded-xl border border-red-500/20 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-red-500/10 p-2.5 rounded-lg border border-red-500/30 mt-0.5">
                  <Zap className={`w-5 h-5 ${isFlagshipMode ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-100 flex items-center gap-1.5 font-sans">
                    Latest Flagship Mode
                    <span className="text-[9px] font-mono bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded-full font-normal border border-red-500/30">
                      Snapdragon 8 / Dimensity Max
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    Force Extreme Thread governor & 120Hz refresh limits for ROG 9, Redmagic 10, iQOO 13.
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setIsFlagshipMode(!isFlagshipMode);
                  if(!isFlagshipMode && detectedModel === 'Vivo T2x 5G') {
                    // Automatically switch to highest spec of phone if they choose Flagship optimization
                    setDetectedModel('ASUS ROG Phone 9 Pro');
                  } else if (isFlagshipMode && detectedModel === 'ASUS ROG Phone 9 Pro') {
                    setDetectedModel('Vivo T2x 5G');
                  }
                }}
                className={`w-14 h-7 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                  isFlagshipMode ? 'bg-red-500' : 'bg-slate-700'
                }`}
              >
                <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform duration-200 ${
                  isFlagshipMode ? 'transform translate-x-7' : ''
                }`}></div>
              </button>
            </div>

            {/* Launch Console Button */}
            <button
              id="initiate-console-btn"
              onClick={handleStartBooster}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm tracking-widest uppercase rounded-xl border-t border-cyan-200/30 transition-all shadow-[0_4px_20px_rgba(6,182,212,0.4)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.6)] cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 font-sans"
            >
              <Shield className="w-4.5 h-4.5" /> ENTER GAMING BOOSTER CONSOLE
            </button>

            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-500 tracking-wider">
                SECURE SANDBOXED TUNER • ANTIBAN COMPATIBLE
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
