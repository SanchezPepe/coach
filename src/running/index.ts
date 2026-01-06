/**
 * Running Module
 * Core module - Training plans for 21K and 42K races
 */

import type { RaceGoal } from '../types';

export type { RaceGoal };

export interface TrainingPhase {
  name: 'base' | 'build' | 'peak' | 'taper';
  weeks: number;
  focus: string;
}

// Placeholder for future implementation
export function getTrainingPlan(goal: RaceGoal): TrainingPhase[] {
  console.log(`Generating training plan for ${goal.distance}...`);
  return [];
}
