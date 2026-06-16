/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DeviceModel = 'Vivo T2x 5G' | 'ASUS ROG Phone 9 Pro' | 'Redmagic 10 Ultra' | 'iQOO 13' | 'Custom Device';

export interface GfxSettings {
  resolution: 'Smooth (720p)' | 'Ultra HD (1080p)' | 'Extreme Pro (1440p)';
  fps: '60 FPS' | '90 FPS (Ultra)' | '120 FPS (Extreme Ultimate)';
  style: 'Colorful' | 'Realistic' | 'Soft' | 'Movie';
  shadows: boolean;
  hdrEnabled: boolean;
}

export type SensitivityPreset = 'custom' | 'low' | 'medium' | 'hard_pro';

export interface AimSettings {
  preset: SensitivityPreset;
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniperAwm: number;
  freeLook: number;
  recoilReducer: boolean;
  dpiValue: number;
  aimImproverEnabled: boolean;
  dragForceFactor: number; // 1-10 multiplier for pull assistance
}

export interface MacroSettings {
  medkitActive: boolean;
  medkitTriggerKey: string; // e.g. "Volume Up" mapping simulation
  autoSprintLock: boolean;
  autoSprintPercent: number;
  aimAssistDot: boolean;
  aimAssistColor: string;
  speedGlooWall: boolean;
  speedGlooWallDelay: number; // in milliseconds
  autoFindEnemies: boolean;
  autoFindEnemiesRange: number; // detection range in meters
}

export interface HardwareStats {
  cpuUsage: number;
  ramUsage: number;
  temp: number;
  fps: number;
  ping: number;
}
