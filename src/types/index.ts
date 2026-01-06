/**
 * Shared types across modules
 */

export interface Athlete {
  id: string;
  name: string;
  weightKg: number;
  heightCm: number;
  age: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
}

export interface HeartRateZones {
  z1: { min: number; max: number }; // Recovery
  z2: { min: number; max: number }; // Aerobic
  z3: { min: number; max: number }; // Tempo
  z4: { min: number; max: number }; // Threshold
  z5: { min: number; max: number }; // VO2max
}

export function calculateHeartRateZones(maxHr: number): HeartRateZones {
  return {
    z1: { min: Math.round(maxHr * 0.5), max: Math.round(maxHr * 0.6) },
    z2: { min: Math.round(maxHr * 0.6), max: Math.round(maxHr * 0.7) },
    z3: { min: Math.round(maxHr * 0.7), max: Math.round(maxHr * 0.8) },
    z4: { min: Math.round(maxHr * 0.8), max: Math.round(maxHr * 0.9) },
    z5: { min: Math.round(maxHr * 0.9), max: maxHr },
  };
}
