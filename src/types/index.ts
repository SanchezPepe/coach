/**
 * Shared types across modules
 */

export interface Athlete {
  id: string;
  name: string;
  weightKg: number;
  bodyFatPercentage?: number;
  heightCm: number;
  age: number;
  restingHeartRate?: number;
  maxHeartRate?: number;
  goal?: RaceGoal;
}

export interface RaceGoal {
  distance: '21K' | '42K';
  targetDate: Date;
  targetTime?: string; // e.g., "1:45:00" for 21K
}

export interface BodyComposition {
  weightKg: number;
  bodyFatPercentage: number;
  leanMassKg: number;
  fatMassKg: number;
  date: Date;
}

export function calculateBodyComposition(weightKg: number, bodyFatPercentage: number): Omit<BodyComposition, 'date'> {
  const fatMassKg = weightKg * (bodyFatPercentage / 100);
  const leanMassKg = weightKg - fatMassKg;
  return { weightKg, bodyFatPercentage, leanMassKg, fatMassKg };
}

export function calculateProteinTarget(weightKg: number, intensity: 'low' | 'moderate' | 'high' = 'moderate'): number {
  const multipliers = { low: 1.6, moderate: 1.8, high: 2.2 };
  return Math.round(weightKg * multipliers[intensity]);
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
