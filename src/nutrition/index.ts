/**
 * Nutrition Module
 * Food logging and diet recommendations for runners
 */

export interface FoodEntry {
  foodId: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: Date;
}

export interface DailyNutrition {
  date: Date;
  entries: FoodEntry[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export type TrainingDayType = 'long_run' | 'easy' | 'intervals' | 'rest' | 'race_week';

// Placeholder for future implementation
export function getMacroTargets(dayType: TrainingDayType, weightKg: number): { calories: number; protein: number; carbs: number; fat: number } {
  console.log(`Calculating macro targets for ${dayType} day...`);
  return { calories: 0, protein: 0, carbs: 0, fat: 0 };
}
