/**
 * Nutrition Module
 * Food logging and diet recommendations for multiple goals
 * Focus: Flexible macros based on goal type (endurance, strength, body comp)
 */

import type { Goal, BodyCompFocus } from '../types';
import { isEnduranceGoal, isStrengthGoal, isBodyCompGoal } from '../types';

export interface FoodEntry {
  foodId: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  timestamp: Date;
}

export interface DailyNutrition {
  date: Date;
  entries: FoodEntry[];
  totals: MacroTotals;
  targets: MacroTargets;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export type TrainingDayType =
  | 'long_run'      // 90+ min endurance
  | 'quality'       // Intervals, tempo
  | 'easy'          // Recovery/easy session
  | 'strength'      // Gym day
  | 'rest'          // Complete rest
  | 'race_week'     // Week of race/event
  | 'race_day'      // Day of race/event
  | 'high_volume'   // High volume strength day
  | 'deload';       // Deload/recovery week

export interface AthleteProfile {
  weightKg: number;
  bodyFatPercentage?: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
  activityLevel: 'low' | 'moderate' | 'high' | 'very_high';
  goal?: Goal;
}

// Calculate Basal Metabolic Rate (Mifflin-St Jeor)
export function calculateBMR(profile: AthleteProfile): number {
  const { weightKg, heightCm, age, sex } = profile;

  if (sex === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
}

// Calculate Total Daily Energy Expenditure
export function calculateTDEE(profile: AthleteProfile): number {
  const bmr = calculateBMR(profile);

  const multipliers = {
    low: 1.375,       // Light exercise 1-2x/week
    moderate: 1.55,   // Exercise 3-4x/week
    high: 1.725,      // Exercise 5-6x/week
    very_high: 1.9,   // Exercise 6-7x/week + active job
  };

  return Math.round(bmr * multipliers[profile.activityLevel]);
}

// ============================================
// GOAL-BASED MACRO CALCULATIONS
// ============================================

export function getMacroTargetsForGoal(profile: AthleteProfile, goal: Goal): MacroTargets {
  const { weightKg } = profile;
  const tdee = calculateTDEE(profile);

  let proteinGPerKg: number;
  let carbsGPerKg: number;
  let calorieAdjustment: number;

  if (isEnduranceGoal(goal)) {
    // Endurance-focused: moderate protein, high carbs
    proteinGPerKg = 1.6;
    carbsGPerKg = 5;
    calorieAdjustment = 0;
  } else if (isStrengthGoal(goal)) {
    // Strength-focused: high protein, moderate carbs
    switch (goal.focus) {
      case 'hypertrophy':
        proteinGPerKg = 2.0;
        carbsGPerKg = 4;
        calorieAdjustment = 300; // Slight surplus for muscle gain
        break;
      case 'strength':
        proteinGPerKg = 1.8;
        carbsGPerKg = 4;
        calorieAdjustment = 100;
        break;
      case 'power':
        proteinGPerKg = 1.8;
        carbsGPerKg = 4;
        calorieAdjustment = 100;
        break;
      default:
        proteinGPerKg = 1.8;
        carbsGPerKg = 3;
        calorieAdjustment = 0;
    }
  } else if (isBodyCompGoal(goal)) {
    // Body comp: varies significantly by focus
    switch (goal.focus) {
      case 'fat_loss':
        proteinGPerKg = 2.2; // High protein to preserve muscle
        carbsGPerKg = 2;
        calorieAdjustment = -500; // Deficit
        break;
      case 'muscle_gain':
        proteinGPerKg = 2.0;
        carbsGPerKg = 5;
        calorieAdjustment = 300; // Surplus
        break;
      case 'recomposition':
        proteinGPerKg = 2.2;
        carbsGPerKg = 3;
        calorieAdjustment = -200; // Small deficit
        break;
      case 'maintenance':
        proteinGPerKg = 1.8;
        carbsGPerKg = 3;
        calorieAdjustment = 0;
        break;
      case 'performance':
        proteinGPerKg = 1.8;
        carbsGPerKg = 4;
        calorieAdjustment = 0;
        break;
      default:
        proteinGPerKg = 1.8;
        carbsGPerKg = 3;
        calorieAdjustment = 0;
    }
  } else {
    // Default balanced approach
    proteinGPerKg = 1.8;
    carbsGPerKg = 3;
    calorieAdjustment = 0;
  }

  const protein = Math.round(weightKg * proteinGPerKg);
  const carbs = Math.round(weightKg * carbsGPerKg);
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;

  const totalCalories = tdee + calorieAdjustment;
  const fatCals = totalCalories - proteinCals - carbsCals;
  const fat = Math.round(Math.max(fatCals / 9, weightKg * 0.8));

  return {
    calories: totalCalories,
    protein,
    carbs,
    fat,
    fiber: 30,
  };
}

// Get macro targets for a specific day type
export function getMacroTargets(
  profile: AthleteProfile,
  dayType: TrainingDayType
): MacroTargets {
  const { weightKg } = profile;
  const tdee = calculateTDEE(profile);

  // Base values - adjusted per day type
  let proteinMultiplier: number;
  let carbsGPerKg: number;
  let calorieAdjustment: number;

  switch (dayType) {
    case 'long_run':
      proteinMultiplier = 1.8;
      carbsGPerKg = 7;      // High carbs for long efforts
      calorieAdjustment = 300;
      break;

    case 'quality':
      proteinMultiplier = 1.8;
      carbsGPerKg = 5;
      calorieAdjustment = 100;
      break;

    case 'easy':
      proteinMultiplier = 1.8;
      carbsGPerKg = 4;
      calorieAdjustment = 0;
      break;

    case 'strength':
      proteinMultiplier = 2.0;  // Higher protein for muscle building
      carbsGPerKg = 4;
      calorieAdjustment = 100;
      break;

    case 'high_volume':
      proteinMultiplier = 2.2;  // Maximum protein for heavy lifting
      carbsGPerKg = 5;
      calorieAdjustment = 200;
      break;

    case 'rest':
      proteinMultiplier = 1.8;
      carbsGPerKg = 3;
      calorieAdjustment = -200;
      break;

    case 'deload':
      proteinMultiplier = 1.8;
      carbsGPerKg = 3;
      calorieAdjustment = -100;
      break;

    case 'race_week':
      proteinMultiplier = 1.6;
      carbsGPerKg = 8;      // Carb loading
      calorieAdjustment = 200;
      break;

    case 'race_day':
      proteinMultiplier = 1.4;
      carbsGPerKg = 10;     // Maximum carbs
      calorieAdjustment = 500;
      break;

    default:
      proteinMultiplier = 1.8;
      carbsGPerKg = 4;
      calorieAdjustment = 0;
  }

  const protein = Math.round(weightKg * proteinMultiplier);
  const carbs = Math.round(weightKg * carbsGPerKg);
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;

  const totalCalories = tdee + calorieAdjustment;
  const fatCals = totalCalories - proteinCals - carbsCals;
  const fat = Math.round(Math.max(fatCals / 9, weightKg * 0.8));

  return {
    calories: totalCalories,
    protein,
    carbs,
    fat,
    fiber: 30,
  };
}

// Calculate remaining macros for the day
export function calculateRemaining(
  totals: MacroTotals,
  targets: MacroTargets
): MacroTotals {
  return {
    calories: targets.calories - totals.calories,
    protein: targets.protein - totals.protein,
    carbs: targets.carbs - totals.carbs,
    fat: targets.fat - totals.fat,
    fiber: (targets.fiber || 30) - (totals.fiber || 0),
  };
}

// Suggest meal based on remaining macros
export function suggestMealFocus(remaining: MacroTotals): string {
  const proteinDeficit = remaining.protein;
  const carbsDeficit = remaining.carbs;

  if (proteinDeficit > 30) {
    if (carbsDeficit > 50) {
      return 'Prioriza proteína + carbohidratos (ej: pollo con arroz, pescado con pasta)';
    }
    return 'Enfócate en proteína magra (ej: pechuga, pescado blanco, claras)';
  }

  if (carbsDeficit > 50) {
    return 'Añade carbohidratos complejos (ej: avena, arroz, patata)';
  }

  if (remaining.calories > 300) {
    return 'Comida equilibrada para completar calorías';
  }

  return 'Ya estás cerca de tus objetivos, snack ligero si tienes hambre';
}

// Pre-workout nutrition timing
export function getPreWorkoutGuidelines(workoutType: TrainingDayType): string {
  switch (workoutType) {
    case 'long_run':
      return `3-4h antes: Comida rica en carbohidratos, baja en fibra y grasa
30-60min antes: Snack simple (plátano, gel, dátiles)
Hidratación: 500ml agua 2h antes`;

    case 'quality':
      return `2-3h antes: Comida moderada en carbohidratos
30min antes: Opcional - pequeño snack
Hidratación: 400ml agua 2h antes`;

    case 'easy':
      return `Puedes entrenar en ayunas si <60min
O 1-2h después de un snack ligero
Hidratación normal`;

    case 'strength':
      return `1-2h antes: Snack con proteína y carbohidratos
Ej: Yogur griego con fruta, o tostada con huevo
Hidratación: 300ml agua 1h antes`;

    case 'high_volume':
      return `2-3h antes: Comida completa con carbohidratos y proteína
30min antes: Snack de carbohidratos simples
Hidratación: 500ml agua 2h antes, cafeína opcional`;

    case 'race_day':
      return `3-4h antes: Comida alta en carbohidratos, baja en fibra/grasa
Ej: Pan blanco con mermelada, avena con plátano
30min antes: Gel o bebida isotónica
Hidratación: 500ml agua, luego sorbos hasta salida`;

    case 'race_week':
      return `Incrementa carbohidratos gradualmente
Reduce fibra los últimos 2-3 días
Mantén hidratación elevada`;

    case 'deload':
      return `Come según hambre - sin forzar
Mantén proteína alta para recuperación
Hidratación normal`;

    case 'rest':
    default:
      return 'Día de descanso - come según hambre y objetivos';
  }
}

// Post-workout nutrition timing
export function getPostWorkoutGuidelines(workoutType: TrainingDayType): string {
  switch (workoutType) {
    case 'long_run':
      return `Inmediato (30min): Bebida recovery o snack con carbs+proteína
1-2h después: Comida completa rica en carbohidratos y proteína
Rehidratación: 1.5L por kg de peso perdido`;

    case 'quality':
      return `30-60min: Snack con proteína (20-30g)
Siguiente comida: Equilibrada con énfasis en proteína
Rehidratación adecuada`;

    case 'easy':
      return `Siguiente comida normal
Proteína moderada (20g mínimo)
No es urgente si la comida es pronto`;

    case 'strength':
      return `30min: Proteína de rápida absorción (30-40g)
Ej: Batido de whey, yogur griego
Siguiente comida: Rica en proteína para síntesis muscular`;

    case 'high_volume':
      return `Inmediato: 40-50g proteína + 50-80g carbohidratos
Ej: Batido con whey, plátano y avena
2h después: Comida completa alta en proteína
Prioriza el sueño para recuperación`;

    case 'race_day':
      return `Inmediato: Bebida de recuperación o snack
1h después: Comida completa
Celebra pero mantén la hidratación`;

    case 'deload':
    case 'rest':
    default:
      return 'Come según tu plan normal, prioriza proteína';
  }
}

// Get nutrition recommendation based on goal
export function getNutritionSummaryForGoal(goal: Goal): string {
  if (isEnduranceGoal(goal)) {
    return `Objetivo Endurance:
- Proteína: 1.6-1.8g/kg para preservar músculo
- Carbohidratos: Prioridad - 5-7g/kg según volumen
- Grasa: Mínimo 0.8g/kg, prefiere insaturadas
- Timing: Carbs antes/durante/después de sesiones largas`;
  }

  if (isStrengthGoal(goal)) {
    const focusNotes: Record<string, string> = {
      hypertrophy: `Objetivo Hipertrofia:
- Proteína: 2.0-2.2g/kg distribuida en 4-5 comidas
- Carbohidratos: 4-5g/kg para energía y recuperación
- Superávit calórico: +200-300 kcal/día
- Timing: Proteína cada 3-4h, carbs peri-entreno`,
      strength: `Objetivo Fuerza:
- Proteína: 1.8-2.0g/kg
- Carbohidratos: 3-4g/kg
- Calorías: Mantenimiento o ligero superávit
- Timing: Proteína post-entreno, carbs moderados`,
      maintenance: `Objetivo Mantenimiento:
- Proteína: 1.8g/kg mínimo
- Carbohidratos: Según actividad diaria
- Calorías: Mantenimiento
- Consistencia es clave`,
    };
    return focusNotes[goal.focus] || focusNotes.maintenance;
  }

  if (isBodyCompGoal(goal)) {
    const focusNotes: Record<string, string> = {
      fat_loss: `Objetivo Pérdida de Grasa:
- Proteína: 2.2g/kg MÍNIMO - protege tu músculo
- Carbohidratos: 2-3g/kg, timing alrededor de entrenos
- Déficit: 400-600 kcal/día (no más agresivo)
- Prioriza: Proteína > Verduras > Carbohidratos`,
      muscle_gain: `Objetivo Ganancia Muscular:
- Proteína: 2.0g/kg distribuida uniformemente
- Carbohidratos: 4-5g/kg para energía
- Superávit: +200-300 kcal/día (ganancia limpia)
- Paciencia: 0.5-1kg/mes es ideal`,
      recomposition: `Objetivo Recomposición:
- Proteína: 2.2g/kg - máxima prioridad
- Carbohidratos: Ciclados según entrenamiento
- Calorías: Déficit ligero o mantenimiento
- Proceso lento pero efectivo`,
      maintenance: `Objetivo Mantenimiento:
- Mantén hábitos consistentes
- Proteína: 1.8g/kg
- Ajusta según energía y rendimiento`,
      performance: `Objetivo Rendimiento:
- Nutrición al servicio del entrenamiento
- Carbs suficientes para rendir
- Proteína para recuperar
- No restricciones innecesarias`,
    };
    return focusNotes[goal.focus] || focusNotes.maintenance;
  }

  return `Nutrición General:
- Proteína: 1.6-1.8g/kg
- Carbohidratos: Según actividad
- Grasas: 25-35% de calorías
- Prioriza alimentos integrales`;
}

// Calculate totals from entries
export function calculateTotals(entries: FoodEntry[]): MacroTotals {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
      fiber: (acc.fiber || 0) + (entry.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

// Format macros for display
export function formatMacros(macros: MacroTotals): string {
  return `${macros.calories} kcal | P: ${macros.protein}g | C: ${macros.carbs}g | G: ${macros.fat}g`;
}

// Calculate macro percentages
export function calculateMacroPercentages(macros: MacroTotals): {
  protein: number;
  carbs: number;
  fat: number;
} {
  const totalCals = macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;

  if (totalCals === 0) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  return {
    protein: Math.round((macros.protein * 4 / totalCals) * 100),
    carbs: Math.round((macros.carbs * 4 / totalCals) * 100),
    fat: Math.round((macros.fat * 9 / totalCals) * 100),
  };
}

// Sample meal templates for runners
export const MEAL_TEMPLATES: Record<string, { description: string; approxMacros: MacroTotals }> = {
  'desayuno_pre_long': {
    description: 'Avena con plátano y miel',
    approxMacros: { calories: 450, protein: 12, carbs: 85, fat: 8 },
  },
  'desayuno_normal': {
    description: 'Tostadas con huevo y aguacate',
    approxMacros: { calories: 400, protein: 20, carbs: 35, fat: 22 },
  },
  'almuerzo_post_run': {
    description: 'Pollo con arroz y verduras',
    approxMacros: { calories: 550, protein: 40, carbs: 60, fat: 14 },
  },
  'cena_recovery': {
    description: 'Salmón con patata y ensalada',
    approxMacros: { calories: 500, protein: 35, carbs: 40, fat: 20 },
  },
  'snack_proteico': {
    description: 'Yogur griego con nueces',
    approxMacros: { calories: 250, protein: 20, carbs: 12, fat: 14 },
  },
  'snack_pre_run': {
    description: 'Plátano con mantequilla de maní',
    approxMacros: { calories: 200, protein: 5, carbs: 30, fat: 8 },
  },
};
