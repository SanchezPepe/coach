/**
 * Running/Endurance Module
 * Training plans for multiple distances and sports
 */

import type {
  EnduranceGoal,
  EnduranceDistance,
  FitnessLevel,
  RaceGoal,
} from '../types';
import { getDistanceKm, getDistanceLabel } from '../types';

// Re-export for compatibility
export type { RaceGoal, EnduranceGoal };

export interface TrainingPhase {
  name: 'base' | 'build' | 'peak' | 'taper';
  weeks: number;
  focus: string;
  weeklyDistanceRangeKm: [number, number];
  longRunRangeKm: [number, number];
  strengthSessions: number;
}

export interface TrainingWeek {
  weekNumber: number;
  phase: TrainingPhase['name'];
  plannedDistanceKm: number;
  longRunKm: number;
  qualitySession: string;
  strengthFocus: string;
}

export interface TrainingPlan {
  goal: EnduranceGoal;
  totalWeeks: number;
  phases: TrainingPhase[];
  weeks: TrainingWeek[];
}

// ============================================
// PHASE CONFIGURATIONS BY DISTANCE CATEGORY
// ============================================

type DistanceCategory = 'short' | 'medium' | 'long' | 'ultra';

function getDistanceCategory(distance: EnduranceDistance): DistanceCategory {
  const km = getDistanceKm(distance);
  if (km <= 10) return 'short';
  if (km <= 25) return 'medium';
  if (km <= 50) return 'long';
  return 'ultra';
}

const PHASE_TEMPLATES: Record<DistanceCategory, (baseKm: number) => TrainingPhase[]> = {
  short: (baseKm) => [
    {
      name: 'base',
      weeks: 3,
      focus: 'Construir base aeróbica, consistencia',
      weeklyDistanceRangeKm: [baseKm * 0.8, baseKm * 1.0],
      longRunRangeKm: [baseKm * 0.25, baseKm * 0.35],
      strengthSessions: 2,
    },
    {
      name: 'build',
      weeks: 3,
      focus: 'Incrementar volumen e intensidad',
      weeklyDistanceRangeKm: [baseKm * 1.0, baseKm * 1.3],
      longRunRangeKm: [baseKm * 0.30, baseKm * 0.40],
      strengthSessions: 2,
    },
    {
      name: 'peak',
      weeks: 2,
      focus: 'Trabajo de velocidad específica',
      weeklyDistanceRangeKm: [baseKm * 1.2, baseKm * 1.4],
      longRunRangeKm: [baseKm * 0.35, baseKm * 0.45],
      strengthSessions: 1,
    },
    {
      name: 'taper',
      weeks: 1,
      focus: 'Reducir volumen, mantener intensidad',
      weeklyDistanceRangeKm: [baseKm * 0.6, baseKm * 0.8],
      longRunRangeKm: [baseKm * 0.20, baseKm * 0.30],
      strengthSessions: 1,
    },
  ],

  medium: (baseKm) => [
    {
      name: 'base',
      weeks: 4,
      focus: 'Construir base aeróbica, consistencia',
      weeklyDistanceRangeKm: [baseKm * 0.6, baseKm * 0.8],
      longRunRangeKm: [baseKm * 0.4, baseKm * 0.55],
      strengthSessions: 2,
    },
    {
      name: 'build',
      weeks: 4,
      focus: 'Incrementar volumen, introducir calidad',
      weeklyDistanceRangeKm: [baseKm * 0.8, baseKm * 1.1],
      longRunRangeKm: [baseKm * 0.55, baseKm * 0.75],
      strengthSessions: 2,
    },
    {
      name: 'peak',
      weeks: 3,
      focus: 'Trabajo de ritmo específico, simulaciones',
      weeklyDistanceRangeKm: [baseKm * 1.0, baseKm * 1.3],
      longRunRangeKm: [baseKm * 0.7, baseKm * 0.9],
      strengthSessions: 1,
    },
    {
      name: 'taper',
      weeks: 2,
      focus: 'Reducir volumen, mantener intensidad, descanso',
      weeklyDistanceRangeKm: [baseKm * 0.5, baseKm * 0.7],
      longRunRangeKm: [baseKm * 0.35, baseKm * 0.50],
      strengthSessions: 1,
    },
  ],

  long: (baseKm) => [
    {
      name: 'base',
      weeks: 6,
      focus: 'Construir base aeróbica sólida',
      weeklyDistanceRangeKm: [baseKm * 0.5, baseKm * 0.7],
      longRunRangeKm: [baseKm * 0.3, baseKm * 0.45],
      strengthSessions: 2,
    },
    {
      name: 'build',
      weeks: 6,
      focus: 'Incrementar volumen, resistencia muscular',
      weeklyDistanceRangeKm: [baseKm * 0.7, baseKm * 1.0],
      longRunRangeKm: [baseKm * 0.45, baseKm * 0.65],
      strengthSessions: 2,
    },
    {
      name: 'peak',
      weeks: 4,
      focus: 'Trabajo específico, simulaciones de carrera',
      weeklyDistanceRangeKm: [baseKm * 0.9, baseKm * 1.2],
      longRunRangeKm: [baseKm * 0.6, baseKm * 0.8],
      strengthSessions: 1,
    },
    {
      name: 'taper',
      weeks: 3,
      focus: 'Reducir volumen progresivamente',
      weeklyDistanceRangeKm: [baseKm * 0.4, baseKm * 0.6],
      longRunRangeKm: [baseKm * 0.3, baseKm * 0.45],
      strengthSessions: 1,
    },
  ],

  ultra: (baseKm) => [
    {
      name: 'base',
      weeks: 8,
      focus: 'Base aeróbica extensa, tiempo en pies',
      weeklyDistanceRangeKm: [baseKm * 0.4, baseKm * 0.55],
      longRunRangeKm: [baseKm * 0.2, baseKm * 0.3],
      strengthSessions: 2,
    },
    {
      name: 'build',
      weeks: 8,
      focus: 'Volumen alto, back-to-back long runs',
      weeklyDistanceRangeKm: [baseKm * 0.55, baseKm * 0.8],
      longRunRangeKm: [baseKm * 0.3, baseKm * 0.45],
      strengthSessions: 2,
    },
    {
      name: 'peak',
      weeks: 4,
      focus: 'Simulaciones largas, nutrición en carrera',
      weeklyDistanceRangeKm: [baseKm * 0.7, baseKm * 0.9],
      longRunRangeKm: [baseKm * 0.4, baseKm * 0.55],
      strengthSessions: 1,
    },
    {
      name: 'taper',
      weeks: 3,
      focus: 'Recuperación, mantener activación',
      weeklyDistanceRangeKm: [baseKm * 0.3, baseKm * 0.5],
      longRunRangeKm: [baseKm * 0.15, baseKm * 0.25],
      strengthSessions: 1,
    },
  ],
};

// ============================================
// TRAINING PLAN GENERATION
// ============================================

export function getTrainingPlan(
  goal: EnduranceGoal | RaceGoal,
  currentWeeklyKm: number = 30
): TrainingPlan {
  // Convert legacy RaceGoal if needed
  const enduranceGoal: EnduranceGoal = 'type' in goal
    ? goal
    : {
        type: 'endurance',
        sport: 'running',
        distance: goal.distance,
        targetDate: goal.targetDate,
        targetTime: goal.targetTime,
      };

  const targetKm = getDistanceKm(enduranceGoal.distance);
  const category = getDistanceCategory(enduranceGoal.distance);

  // Base weekly km depends on target distance and fitness level
  const levelMultiplier = getLevelMultiplier(enduranceGoal.currentLevel);
  const baseKm = Math.max(currentWeeklyKm, targetKm * levelMultiplier);

  const phases = PHASE_TEMPLATES[category](baseKm);
  const totalWeeks = phases.reduce((sum, p) => sum + p.weeks, 0);

  const weeks: TrainingWeek[] = [];
  let weekNumber = 1;

  for (const phase of phases) {
    for (let i = 0; i < phase.weeks; i++) {
      const progress = i / phase.weeks;
      const distanceRange = phase.weeklyDistanceRangeKm;
      const longRunRange = phase.longRunRangeKm;

      const plannedDistance = Math.round(
        distanceRange[0] + (distanceRange[1] - distanceRange[0]) * progress
      );
      const longRun = Math.round(
        longRunRange[0] + (longRunRange[1] - longRunRange[0]) * progress
      );

      weeks.push({
        weekNumber,
        phase: phase.name,
        plannedDistanceKm: plannedDistance,
        longRunKm: longRun,
        qualitySession: getQualitySession(phase.name, category, i),
        strengthFocus: getStrengthFocus(phase.name),
      });

      weekNumber++;
    }
  }

  return { goal: enduranceGoal, totalWeeks, phases, weeks };
}

function getLevelMultiplier(level?: FitnessLevel): number {
  switch (level) {
    case 'beginner': return 1.2;
    case 'intermediate': return 1.5;
    case 'advanced': return 1.8;
    case 'elite': return 2.2;
    default: return 1.5;
  }
}

function getQualitySession(
  phase: TrainingPhase['name'],
  category: DistanceCategory,
  weekInPhase: number
): string {
  const sessions: Record<DistanceCategory, Record<TrainingPhase['name'], string[]>> = {
    short: {
      base: ['Fartlek suave', 'Tempo corto 15min'],
      build: ['Intervalos 400m', 'Tempo 20min', 'Repeticiones 200m'],
      peak: ['Intervalos a ritmo 5K', 'Simulación de carrera'],
      taper: ['Strides', 'Tempo corto suave'],
    },
    medium: {
      base: ['Fartlek suave', 'Tempo corto 15-20min'],
      build: ['Intervalos 1km', 'Tempo 20-30min', 'Progresivo'],
      peak: ['Simulación ritmo objetivo', 'Intervalos largos 2km'],
      taper: ['Strides + ritmo objetivo corto', 'Fartlek suave'],
    },
    long: {
      base: ['Fartlek suave', 'Tempo 20min'],
      build: ['Tempo largo 30-40min', 'Intervalos 1-2km', 'Progresivo largo'],
      peak: ['Simulación maratón 15-20km', 'Tempo a ritmo objetivo'],
      taper: ['Activación ritmo maratón', 'Strides'],
    },
    ultra: {
      base: ['Carrera en terreno variado', 'Fartlek por sensaciones'],
      build: ['Back-to-back long runs', 'Tempo en desnivel', 'Carrera nocturna'],
      peak: ['Simulación 4-6h', 'Práctica de nutrición', 'Terreno específico'],
      taper: ['Activación suave', 'Caminata rápida'],
    },
  };

  const phaseOptions = sessions[category][phase];
  return phaseOptions[weekInPhase % phaseOptions.length];
}

function getStrengthFocus(phase: TrainingPhase['name']): string {
  switch (phase) {
    case 'base': return 'Fuerza máxima + estabilidad';
    case 'build': return 'Fuerza-resistencia';
    case 'peak': return 'Mantenimiento (bajo volumen)';
    case 'taper': return 'Activación neuromuscular';
  }
}

// ============================================
// PHASE AND PROGRESS TRACKING
// ============================================

export function getCurrentPhase(plan: TrainingPlan, weeksToRace: number): TrainingPhase | null {
  const currentWeek = plan.totalWeeks - weeksToRace + 1;

  if (currentWeek < 1 || currentWeek > plan.totalWeeks) {
    return null;
  }

  const week = plan.weeks.find(w => w.weekNumber === currentWeek);
  if (!week) return null;

  return plan.phases.find(p => p.name === week.phase) || null;
}

export function getWeeksToGoal(targetDate: Date): number {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
}

// ============================================
// PACE ZONES
// ============================================

export function calculatePaceZones(targetPaceSecPerKm: number): Record<string, { min: number; max: number }> {
  return {
    recovery: {
      min: targetPaceSecPerKm * 1.25,
      max: targetPaceSecPerKm * 1.40,
    },
    easy: {
      min: targetPaceSecPerKm * 1.15,
      max: targetPaceSecPerKm * 1.25,
    },
    marathon: {
      min: targetPaceSecPerKm * 1.03,
      max: targetPaceSecPerKm * 1.08,
    },
    threshold: {
      min: targetPaceSecPerKm * 0.95,
      max: targetPaceSecPerKm * 1.00,
    },
    interval: {
      min: targetPaceSecPerKm * 0.88,
      max: targetPaceSecPerKm * 0.93,
    },
    repetition: {
      min: targetPaceSecPerKm * 0.82,
      max: targetPaceSecPerKm * 0.87,
    },
  };
}

// ============================================
// RACE TIME ESTIMATION
// ============================================

export function estimateRaceTime(
  recentDistanceKm: number,
  recentPaceSecPerKm: number,
  targetDistance: EnduranceDistance
): string {
  const targetKm = getDistanceKm(targetDistance);

  // Riegel formula with distance-adjusted exponent
  let exponent = 1.06;
  if (targetKm > 42) exponent = 1.08; // Ultra needs more conservative estimate
  if (targetKm <= 10) exponent = 1.04; // Shorter races are faster relatively

  const predictedPace = recentPaceSecPerKm * Math.pow(targetKm / recentDistanceKm, exponent - 1);
  const totalSeconds = predictedPace * targetKm;

  return formatTime(totalSeconds);
}

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// PLAN SUMMARY
// ============================================

export function getPlanSummary(plan: TrainingPlan): string {
  const distanceLabel = getDistanceLabel(plan.goal.distance);
  const lines = [
    `Plan de Entrenamiento: ${distanceLabel}`,
    `Duración: ${plan.totalWeeks} semanas`,
    '',
    'Fases:',
  ];

  for (const phase of plan.phases) {
    lines.push(`  ${phase.name.toUpperCase()} (${phase.weeks} sem): ${phase.focus}`);
  }

  return lines.join('\n');
}
