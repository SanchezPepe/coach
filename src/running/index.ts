/**
 * Running Module
 * Core module - Training plans for 21K and 42K races
 */

export interface RaceGoal {
  distance: '21K' | '42K';
  targetDate: Date;
  targetTime?: string; // e.g., "1:45:00" for 21K
}

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
