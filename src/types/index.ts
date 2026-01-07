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
  sex: 'male' | 'female';
  restingHeartRate?: number;
  maxHeartRate?: number;
  goals: AthleteGoals;
  preferences?: AthletePreferences;
}

export interface AthletePreferences {
  availableDays: number; // days per week for training
  hasGym: boolean;
  primaryFocus: 'endurance' | 'strength' | 'hybrid';
}

// ============================================
// GOAL SYSTEM - Flexible multi-objective goals
// ============================================

export interface AthleteGoals {
  primary: Goal;
  secondary?: Goal;
}

export type Goal = EnduranceGoal | StrengthGoal | BodyCompGoal;

export type GoalType = 'endurance' | 'strength' | 'body_composition';

// Endurance Goals (Running, Cycling, etc.)
export interface EnduranceGoal {
  type: 'endurance';
  sport: EnduranceSport;
  distance: EnduranceDistance;
  targetDate?: Date;
  targetTime?: string; // e.g., "1:45:00"
  currentLevel?: FitnessLevel;
}

export type EnduranceSport = 'running' | 'cycling' | 'swimming' | 'triathlon';

export type EnduranceDistance =
  | '5K' | '10K' | '21K' | '42K' | 'ultra'  // Running
  | '50K' | '100K' | '100M'                   // Ultra distances
  | 'sprint_tri' | 'olympic_tri' | 'half_ironman' | 'ironman' // Triathlon
  | { custom: number; unit: 'km' | 'miles' }; // Custom distance

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

// Strength Goals
export interface StrengthGoal {
  type: 'strength';
  focus: StrengthFocus;
  targetDate?: Date;
  specificTargets?: StrengthTargets;
}

export type StrengthFocus =
  | 'hypertrophy'      // Build muscle mass
  | 'strength'         // Increase max strength
  | 'power'            // Explosive power
  | 'endurance'        // Muscular endurance
  | 'functional'       // General fitness
  | 'maintenance';     // Maintain during cardio focus

export interface StrengthTargets {
  squat?: number;      // kg
  deadlift?: number;
  bench?: number;
  overhead?: number;
}

// Body Composition Goals
export interface BodyCompGoal {
  type: 'body_composition';
  focus: BodyCompFocus;
  targetDate?: Date;
  targetWeight?: number;
  targetBodyFat?: number;
}

export type BodyCompFocus =
  | 'fat_loss'         // Lose fat, preserve muscle
  | 'muscle_gain'      // Gain muscle (lean bulk)
  | 'recomposition'    // Lose fat + gain muscle
  | 'maintenance'      // Maintain current
  | 'performance';     // Optimize for sport performance

// ============================================
// LEGACY SUPPORT - Keep RaceGoal for compatibility
// ============================================

/** @deprecated Use EnduranceGoal instead */
export interface RaceGoal {
  distance: '21K' | '42K';
  targetDate: Date;
  targetTime?: string;
}

// Convert legacy RaceGoal to new EnduranceGoal
export function convertLegacyGoal(legacy: RaceGoal): EnduranceGoal {
  return {
    type: 'endurance',
    sport: 'running',
    distance: legacy.distance,
    targetDate: legacy.targetDate,
    targetTime: legacy.targetTime,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getDistanceKm(distance: EnduranceDistance): number {
  if (typeof distance === 'object' && 'custom' in distance) {
    return distance.unit === 'miles' ? distance.custom * 1.60934 : distance.custom;
  }

  const distances: Record<string, number> = {
    '5K': 5,
    '10K': 10,
    '21K': 21.0975,
    '42K': 42.195,
    '50K': 50,
    '100K': 100,
    '100M': 160.934,
    'ultra': 50, // Default ultra
    'sprint_tri': 25.75,    // 750m swim + 20km bike + 5km run
    'olympic_tri': 51.5,    // 1.5km swim + 40km bike + 10km run
    'half_ironman': 113,    // 1.9km swim + 90km bike + 21.1km run
    'ironman': 226,         // 3.8km swim + 180km bike + 42.2km run
  };

  return distances[distance] || 10;
}

export function getDistanceLabel(distance: EnduranceDistance): string {
  if (typeof distance === 'object' && 'custom' in distance) {
    return `${distance.custom} ${distance.unit}`;
  }

  const labels: Record<string, string> = {
    '5K': '5K',
    '10K': '10K',
    '21K': 'Media Maratón (21K)',
    '42K': 'Maratón (42K)',
    '50K': 'Ultra 50K',
    '100K': 'Ultra 100K',
    '100M': 'Ultra 100 Millas',
    'ultra': 'Ultramaratón',
    'sprint_tri': 'Triatlón Sprint',
    'olympic_tri': 'Triatlón Olímpico',
    'half_ironman': 'Half Ironman (70.3)',
    'ironman': 'Ironman',
  };

  return labels[distance] || String(distance);
}

export function isEnduranceGoal(goal: Goal): goal is EnduranceGoal {
  return goal.type === 'endurance';
}

export function isStrengthGoal(goal: Goal): goal is StrengthGoal {
  return goal.type === 'strength';
}

export function isBodyCompGoal(goal: Goal): goal is BodyCompGoal {
  return goal.type === 'body_composition';
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
