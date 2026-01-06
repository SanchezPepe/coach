/**
 * Strength Module
 * Complementary strength training for runners
 */

import type { TrainingPhase } from '../running';

export interface StrengthRoutine {
  name: string;
  phase: TrainingPhase['name'];
  exercises: Exercise[];
  durationMinutes: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number | string; // string for "30s" type durations
  muscleGroup: 'core' | 'glutes' | 'legs' | 'upper';
}

// Placeholder for future implementation
export function getRoutineForPhase(phase: TrainingPhase['name']): StrengthRoutine | null {
  console.log(`Getting strength routine for ${phase} phase...`);
  return null;
}
