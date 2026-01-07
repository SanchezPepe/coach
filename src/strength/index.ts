/**
 * Strength Module
 * Flexible strength training for multiple goals
 * - Standalone strength/hypertrophy programs
 * - Complementary training for endurance athletes
 * - Injury prevention and functional fitness
 */

import type { StrengthGoal, StrengthFocus, Goal } from '../types';
import { isEnduranceGoal, isStrengthGoal, isBodyCompGoal } from '../types';
import type { TrainingPhase } from '../running';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string;
  restSeconds: number;
  muscleGroup: MuscleGroup;
  notes?: string;
}

export type MuscleGroup = 'core' | 'glutes' | 'legs' | 'upper' | 'back' | 'chest' | 'shoulders' | 'arms' | 'full_body';

export interface StrengthRoutine {
  id: string;
  name: string;
  focus: StrengthFocus | TrainingPhase['name'];
  description: string;
  exercises: Exercise[];
  durationMinutes: number;
}

export interface StrengthWeek {
  focus: StrengthFocus | TrainingPhase['name'];
  sessions: number;
  routines: StrengthRoutine[];
  notes: string;
}

export interface StrengthProgram {
  name: string;
  goal: StrengthGoal;
  weeksTotal: number;
  sessionsPerWeek: number;
  routines: StrengthRoutine[];
  description: string;
}

// ============================================
// EXERCISE DATABASE
// ============================================

const EXERCISES: Record<string, Omit<Exercise, 'sets' | 'reps' | 'restSeconds'>> = {
  // Core
  plank: { id: 'plank', name: 'Plancha', muscleGroup: 'core' },
  dead_bug: { id: 'dead_bug', name: 'Dead Bug', muscleGroup: 'core' },
  bird_dog: { id: 'bird_dog', name: 'Bird Dog', muscleGroup: 'core' },
  pallof_press: { id: 'pallof_press', name: 'Pallof Press', muscleGroup: 'core' },
  russian_twist: { id: 'russian_twist', name: 'Giro Ruso', muscleGroup: 'core' },
  hanging_leg_raise: { id: 'hanging_leg_raise', name: 'Elevación de Piernas Colgado', muscleGroup: 'core' },
  ab_wheel: { id: 'ab_wheel', name: 'Rueda Abdominal', muscleGroup: 'core' },

  // Glutes
  hip_thrust: { id: 'hip_thrust', name: 'Hip Thrust', muscleGroup: 'glutes' },
  glute_bridge: { id: 'glute_bridge', name: 'Puente de Glúteos', muscleGroup: 'glutes' },
  clamshell: { id: 'clamshell', name: 'Clamshell', muscleGroup: 'glutes' },
  single_leg_glute_bridge: { id: 'single_leg_glute_bridge', name: 'Puente Unilateral', muscleGroup: 'glutes' },
  cable_kickback: { id: 'cable_kickback', name: 'Patada en Polea', muscleGroup: 'glutes' },

  // Legs
  squat: { id: 'squat', name: 'Sentadilla', muscleGroup: 'legs' },
  front_squat: { id: 'front_squat', name: 'Sentadilla Frontal', muscleGroup: 'legs' },
  goblet_squat: { id: 'goblet_squat', name: 'Goblet Squat', muscleGroup: 'legs' },
  bulgarian_split: { id: 'bulgarian_split', name: 'Sentadilla Búlgara', muscleGroup: 'legs' },
  romanian_deadlift: { id: 'romanian_deadlift', name: 'Peso Muerto Rumano', muscleGroup: 'legs' },
  deadlift: { id: 'deadlift', name: 'Peso Muerto', muscleGroup: 'legs' },
  lunges: { id: 'lunges', name: 'Zancadas', muscleGroup: 'legs' },
  step_ups: { id: 'step_ups', name: 'Step Ups', muscleGroup: 'legs' },
  leg_press: { id: 'leg_press', name: 'Prensa de Piernas', muscleGroup: 'legs' },
  leg_curl: { id: 'leg_curl', name: 'Curl de Piernas', muscleGroup: 'legs' },
  leg_extension: { id: 'leg_extension', name: 'Extensión de Piernas', muscleGroup: 'legs' },
  calf_raises: { id: 'calf_raises', name: 'Elevación de Talones', muscleGroup: 'legs' },
  single_leg_deadlift: { id: 'single_leg_deadlift', name: 'Peso Muerto Unilateral', muscleGroup: 'legs' },

  // Back
  pull_ups: { id: 'pull_ups', name: 'Dominadas', muscleGroup: 'back' },
  lat_pulldown: { id: 'lat_pulldown', name: 'Jalón al Pecho', muscleGroup: 'back' },
  rows: { id: 'rows', name: 'Remo', muscleGroup: 'back' },
  barbell_row: { id: 'barbell_row', name: 'Remo con Barra', muscleGroup: 'back' },
  cable_row: { id: 'cable_row', name: 'Remo en Polea', muscleGroup: 'back' },
  face_pulls: { id: 'face_pulls', name: 'Face Pulls', muscleGroup: 'back' },

  // Chest
  bench_press: { id: 'bench_press', name: 'Press de Banca', muscleGroup: 'chest' },
  incline_press: { id: 'incline_press', name: 'Press Inclinado', muscleGroup: 'chest' },
  push_ups: { id: 'push_ups', name: 'Flexiones', muscleGroup: 'chest' },
  dumbbell_fly: { id: 'dumbbell_fly', name: 'Aperturas con Mancuernas', muscleGroup: 'chest' },
  cable_crossover: { id: 'cable_crossover', name: 'Cruce de Poleas', muscleGroup: 'chest' },

  // Shoulders
  shoulder_press: { id: 'shoulder_press', name: 'Press de Hombros', muscleGroup: 'shoulders' },
  lateral_raise: { id: 'lateral_raise', name: 'Elevaciones Laterales', muscleGroup: 'shoulders' },
  front_raise: { id: 'front_raise', name: 'Elevaciones Frontales', muscleGroup: 'shoulders' },
  reverse_fly: { id: 'reverse_fly', name: 'Pájaros', muscleGroup: 'shoulders' },

  // Arms
  bicep_curl: { id: 'bicep_curl', name: 'Curl de Bíceps', muscleGroup: 'arms' },
  hammer_curl: { id: 'hammer_curl', name: 'Curl Martillo', muscleGroup: 'arms' },
  tricep_pushdown: { id: 'tricep_pushdown', name: 'Extensión de Tríceps', muscleGroup: 'arms' },
  tricep_dips: { id: 'tricep_dips', name: 'Fondos de Tríceps', muscleGroup: 'arms' },
  skull_crushers: { id: 'skull_crushers', name: 'Press Francés', muscleGroup: 'arms' },
};

function createExercise(
  id: string,
  sets: number,
  reps: number | string,
  restSeconds: number = 60,
  notes?: string
): Exercise {
  const template = EXERCISES[id];
  if (!template) {
    throw new Error(`Exercise ${id} not found`);
  }
  return { ...template, sets, reps, restSeconds, notes };
}

// ============================================
// ROUTINES FOR ENDURANCE ATHLETES (by phase)
// ============================================

const ENDURANCE_ROUTINES: Record<TrainingPhase['name'], StrengthRoutine[]> = {
  base: [
    {
      id: 'base_strength_a',
      name: 'Fuerza Base A - Tren Inferior',
      focus: 'base',
      description: 'Fuerza máxima + estabilidad',
      durationMinutes: 45,
      exercises: [
        createExercise('goblet_squat', 4, 8, 90, 'Peso moderado-alto'),
        createExercise('romanian_deadlift', 4, 8, 90, 'Control excéntrico'),
        createExercise('hip_thrust', 3, 10, 60),
        createExercise('step_ups', 3, 10, 60, 'Por pierna'),
        createExercise('calf_raises', 3, 15, 45),
        createExercise('plank', 3, '45s', 30),
      ],
    },
    {
      id: 'base_strength_b',
      name: 'Fuerza Base B - Full Body',
      focus: 'base',
      description: 'Equilibrio muscular',
      durationMinutes: 45,
      exercises: [
        createExercise('lunges', 3, 10, 60, 'Por pierna'),
        createExercise('single_leg_glute_bridge', 3, 12, 45, 'Por pierna'),
        createExercise('rows', 3, 10, 60),
        createExercise('push_ups', 3, 12, 60),
        createExercise('dead_bug', 3, 10, 30, 'Por lado'),
        createExercise('bird_dog', 3, 10, 30, 'Por lado'),
      ],
    },
  ],
  build: [
    {
      id: 'build_strength_a',
      name: 'Fuerza-Resistencia A',
      focus: 'build',
      description: 'Resistencia muscular para endurance',
      durationMinutes: 50,
      exercises: [
        createExercise('squat', 4, 10, 75, 'Peso moderado'),
        createExercise('romanian_deadlift', 4, 10, 75),
        createExercise('hip_thrust', 3, 12, 60),
        createExercise('single_leg_deadlift', 3, 8, 60, 'Por pierna'),
        createExercise('pallof_press', 3, 12, 45, 'Por lado'),
        createExercise('calf_raises', 4, 20, 30, 'Alto volumen'),
      ],
    },
    {
      id: 'build_strength_b',
      name: 'Fuerza-Resistencia B',
      focus: 'build',
      description: 'Prevención de lesiones',
      durationMinutes: 45,
      exercises: [
        createExercise('step_ups', 3, 12, 60, 'Por pierna, peso moderado'),
        createExercise('clamshell', 3, 15, 30, 'Con banda'),
        createExercise('glute_bridge', 3, 15, 45),
        createExercise('rows', 3, 12, 60),
        createExercise('russian_twist', 3, 20, 45),
        createExercise('plank', 3, '60s', 30),
      ],
    },
  ],
  peak: [
    {
      id: 'peak_maintenance',
      name: 'Mantenimiento Peak',
      focus: 'peak',
      description: 'Bajo volumen, mantener fuerza',
      durationMinutes: 30,
      exercises: [
        createExercise('goblet_squat', 2, 6, 90, 'Peso alto, pocas reps'),
        createExercise('hip_thrust', 2, 8, 60),
        createExercise('single_leg_glute_bridge', 2, 8, 45),
        createExercise('plank', 2, '45s', 30),
        createExercise('calf_raises', 2, 15, 30),
      ],
    },
  ],
  taper: [
    {
      id: 'taper_activation',
      name: 'Activación Neuromuscular',
      focus: 'taper',
      description: 'Activación sin fatiga',
      durationMinutes: 20,
      exercises: [
        createExercise('glute_bridge', 2, 10, 30, 'Sin peso'),
        createExercise('clamshell', 2, 10, 30),
        createExercise('dead_bug', 2, 8, 30),
        createExercise('calf_raises', 2, 12, 30, 'Peso corporal'),
      ],
    },
  ],
};

// ============================================
// ROUTINES FOR STRENGTH-FOCUSED GOALS
// ============================================

const STRENGTH_FOCUS_ROUTINES: Record<StrengthFocus, StrengthRoutine[]> = {
  hypertrophy: [
    {
      id: 'hyper_push',
      name: 'Hipertrofia - Push',
      focus: 'hypertrophy',
      description: 'Pecho, hombros, tríceps - volumen moderado-alto',
      durationMinutes: 60,
      exercises: [
        createExercise('bench_press', 4, 10, 90),
        createExercise('incline_press', 3, 12, 75),
        createExercise('shoulder_press', 3, 10, 75),
        createExercise('lateral_raise', 3, 15, 45),
        createExercise('tricep_pushdown', 3, 12, 45),
        createExercise('cable_crossover', 3, 15, 45),
      ],
    },
    {
      id: 'hyper_pull',
      name: 'Hipertrofia - Pull',
      focus: 'hypertrophy',
      description: 'Espalda, bíceps - volumen moderado-alto',
      durationMinutes: 60,
      exercises: [
        createExercise('pull_ups', 4, 8, 90, 'Lastre si es necesario'),
        createExercise('barbell_row', 4, 10, 90),
        createExercise('lat_pulldown', 3, 12, 60),
        createExercise('cable_row', 3, 12, 60),
        createExercise('face_pulls', 3, 15, 45),
        createExercise('bicep_curl', 3, 12, 45),
      ],
    },
    {
      id: 'hyper_legs',
      name: 'Hipertrofia - Piernas',
      focus: 'hypertrophy',
      description: 'Cuádriceps, isquios, glúteos',
      durationMinutes: 65,
      exercises: [
        createExercise('squat', 4, 10, 120),
        createExercise('romanian_deadlift', 4, 10, 90),
        createExercise('leg_press', 3, 12, 90),
        createExercise('leg_curl', 3, 12, 60),
        createExercise('hip_thrust', 3, 12, 60),
        createExercise('calf_raises', 4, 15, 45),
      ],
    },
  ],

  strength: [
    {
      id: 'strength_upper',
      name: 'Fuerza Máxima - Superior',
      focus: 'strength',
      description: 'Press y jalones pesados',
      durationMinutes: 55,
      exercises: [
        createExercise('bench_press', 5, 5, 180, 'RPE 8-9'),
        createExercise('barbell_row', 5, 5, 180),
        createExercise('shoulder_press', 4, 6, 120),
        createExercise('pull_ups', 4, 6, 120, 'Lastre'),
      ],
    },
    {
      id: 'strength_lower',
      name: 'Fuerza Máxima - Inferior',
      focus: 'strength',
      description: 'Sentadilla y peso muerto pesados',
      durationMinutes: 60,
      exercises: [
        createExercise('squat', 5, 5, 180, 'RPE 8-9'),
        createExercise('deadlift', 5, 5, 180),
        createExercise('front_squat', 3, 6, 120),
        createExercise('romanian_deadlift', 3, 8, 90),
      ],
    },
  ],

  power: [
    {
      id: 'power_full',
      name: 'Potencia Explosiva',
      focus: 'power',
      description: 'Movimientos explosivos',
      durationMinutes: 45,
      exercises: [
        createExercise('squat', 5, 3, 180, 'Explosivo en concéntrico'),
        createExercise('bench_press', 5, 3, 180, 'Explosivo'),
        createExercise('step_ups', 4, 6, 90, 'Explosivo, por pierna'),
        createExercise('push_ups', 3, 8, 60, 'Pliométricos'),
      ],
    },
  ],

  endurance: [
    {
      id: 'muscular_endurance',
      name: 'Resistencia Muscular',
      focus: 'endurance',
      description: 'Alto volumen, bajo descanso',
      durationMinutes: 50,
      exercises: [
        createExercise('goblet_squat', 3, 20, 45),
        createExercise('push_ups', 3, 20, 45),
        createExercise('lunges', 3, 15, 45, 'Por pierna'),
        createExercise('rows', 3, 20, 45),
        createExercise('plank', 3, '60s', 30),
        createExercise('russian_twist', 3, 30, 30),
      ],
    },
  ],

  functional: [
    {
      id: 'functional_full',
      name: 'Funcional Full Body',
      focus: 'functional',
      description: 'Movimientos compuestos multiarticulares',
      durationMinutes: 45,
      exercises: [
        createExercise('goblet_squat', 3, 12, 60),
        createExercise('deadlift', 3, 10, 75),
        createExercise('push_ups', 3, 15, 45),
        createExercise('rows', 3, 12, 60),
        createExercise('lunges', 3, 10, 45, 'Por pierna'),
        createExercise('plank', 3, '45s', 30),
      ],
    },
  ],

  maintenance: [
    {
      id: 'maintenance_full',
      name: 'Mantenimiento',
      focus: 'maintenance',
      description: 'Mantener fuerza con mínimo volumen',
      durationMinutes: 35,
      exercises: [
        createExercise('squat', 2, 8, 90),
        createExercise('bench_press', 2, 8, 90),
        createExercise('rows', 2, 10, 60),
        createExercise('hip_thrust', 2, 10, 60),
        createExercise('plank', 2, '45s', 30),
      ],
    },
  ],
};

// ============================================
// PUBLIC API
// ============================================

export function getRoutinesForPhase(phase: TrainingPhase['name']): StrengthRoutine[] {
  return ENDURANCE_ROUTINES[phase] || [];
}

export function getRoutinesForFocus(focus: StrengthFocus): StrengthRoutine[] {
  return STRENGTH_FOCUS_ROUTINES[focus] || [];
}

export function getRoutineById(routineId: string): StrengthRoutine | null {
  // Search in endurance routines
  for (const routines of Object.values(ENDURANCE_ROUTINES)) {
    const found = routines.find(r => r.id === routineId);
    if (found) return found;
  }

  // Search in strength focus routines
  for (const routines of Object.values(STRENGTH_FOCUS_ROUTINES)) {
    const found = routines.find(r => r.id === routineId);
    if (found) return found;
  }

  return null;
}

export function getStrengthWeek(phase: TrainingPhase['name']): StrengthWeek {
  const routines = getRoutinesForPhase(phase);

  let sessions: number;
  let notes: string;

  switch (phase) {
    case 'base':
      sessions = 2;
      notes = 'Enfócate en técnica y progresión gradual de peso';
      break;
    case 'build':
      sessions = 2;
      notes = 'Mantén la consistencia, no busques PRs';
      break;
    case 'peak':
      sessions = 1;
      notes = 'Solo mantenimiento, prioriza el cardio';
      break;
    case 'taper':
      sessions = 1;
      notes = 'Activación suave, evita cualquier soreness';
      break;
  }

  return { focus: phase, sessions, routines, notes };
}

export function getStrengthProgram(goal: StrengthGoal): StrengthProgram {
  const routines = getRoutinesForFocus(goal.focus);

  let sessionsPerWeek: number;
  let weeksTotal: number;
  let description: string;

  switch (goal.focus) {
    case 'hypertrophy':
      sessionsPerWeek = 4;
      weeksTotal = 12;
      description = 'Programa de hipertrofia: Push/Pull/Legs + día extra';
      break;
    case 'strength':
      sessionsPerWeek = 4;
      weeksTotal = 8;
      description = 'Programa de fuerza máxima: Upper/Lower split';
      break;
    case 'power':
      sessionsPerWeek = 3;
      weeksTotal = 6;
      description = 'Programa de potencia: Movimientos explosivos';
      break;
    case 'endurance':
      sessionsPerWeek = 3;
      weeksTotal = 8;
      description = 'Resistencia muscular: Circuitos de alto volumen';
      break;
    case 'functional':
      sessionsPerWeek = 3;
      weeksTotal = 8;
      description = 'Fitness funcional: Full body 3x/semana';
      break;
    case 'maintenance':
      sessionsPerWeek = 2;
      weeksTotal = 0; // Ongoing
      description = 'Mantenimiento: Mínimo volumen efectivo';
      break;
  }

  return {
    name: `Programa ${goal.focus}`,
    goal,
    sessionsPerWeek,
    weeksTotal,
    routines,
    description,
  };
}

// Get recommended strength approach based on any goal type
export function getStrengthRecommendation(goal: Goal): {
  focus: StrengthFocus;
  sessionsPerWeek: number;
  notes: string;
} {
  if (isEnduranceGoal(goal)) {
    return {
      focus: 'maintenance',
      sessionsPerWeek: 2,
      notes: 'Mantén la fuerza sin interferir con el cardio. Enfócate en core, glúteos y prevención de lesiones.',
    };
  }

  if (isStrengthGoal(goal)) {
    return {
      focus: goal.focus,
      sessionsPerWeek: goal.focus === 'hypertrophy' ? 4 : 3,
      notes: `Programa dedicado a ${goal.focus}. Prioriza progresión y recuperación.`,
    };
  }

  if (isBodyCompGoal(goal)) {
    switch (goal.focus) {
      case 'fat_loss':
        return {
          focus: 'functional',
          sessionsPerWeek: 3,
          notes: 'Mantén masa muscular durante déficit. Prioriza compuestos pesados.',
        };
      case 'muscle_gain':
        return {
          focus: 'hypertrophy',
          sessionsPerWeek: 4,
          notes: 'Volumen moderado-alto con superávit calórico controlado.',
        };
      case 'recomposition':
        return {
          focus: 'strength',
          sessionsPerWeek: 3,
          notes: 'Fuerza + déficit moderado. Prioriza proteína.',
        };
      default:
        return {
          focus: 'maintenance',
          sessionsPerWeek: 2,
          notes: 'Mantén tu nivel actual.',
        };
    }
  }

  // Default
  return {
    focus: 'functional',
    sessionsPerWeek: 3,
    notes: 'Programa general de fitness.',
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function calculateVolume(routine: StrengthRoutine): {
  totalSets: number;
  muscleGroupVolume: Record<MuscleGroup, number>;
} {
  const muscleGroupVolume: Record<MuscleGroup, number> = {
    core: 0,
    glutes: 0,
    legs: 0,
    upper: 0,
    back: 0,
    chest: 0,
    shoulders: 0,
    arms: 0,
    full_body: 0,
  };

  let totalSets = 0;

  for (const exercise of routine.exercises) {
    totalSets += exercise.sets;
    muscleGroupVolume[exercise.muscleGroup] += exercise.sets;
  }

  return { totalSets, muscleGroupVolume };
}

export function formatRoutine(routine: StrengthRoutine): string {
  const lines: string[] = [
    `${routine.name}`,
    `Enfoque: ${routine.focus} | Duración: ~${routine.durationMinutes} min`,
    `${routine.description}`,
    '',
    'Ejercicios:',
  ];

  for (const ex of routine.exercises) {
    const repsStr = typeof ex.reps === 'number' ? `${ex.reps} reps` : ex.reps;
    let line = `  - ${ex.name}: ${ex.sets}x${repsStr}`;
    if (ex.notes) line += ` (${ex.notes})`;
    lines.push(line);
  }

  return lines.join('\n');
}

// Map exercises to Hevy exercise template IDs
export const HEVY_EXERCISE_MAP: Record<string, string> = {
  goblet_squat: 'goblet_squat',
  squat: 'barbell_squat',
  front_squat: 'front_squat',
  romanian_deadlift: 'romanian_deadlift',
  deadlift: 'barbell_deadlift',
  hip_thrust: 'hip_thrust',
  lunges: 'walking_lunge',
  step_ups: 'step_up',
  leg_press: 'leg_press',
  leg_curl: 'lying_leg_curl',
  leg_extension: 'leg_extension',
  calf_raises: 'standing_calf_raise',
  plank: 'plank',
  dead_bug: 'dead_bug',
  bird_dog: 'bird_dog',
  glute_bridge: 'glute_bridge',
  clamshell: 'clamshell',
  push_ups: 'push_up',
  bench_press: 'barbell_bench_press',
  incline_press: 'incline_dumbbell_press',
  rows: 'dumbbell_row',
  barbell_row: 'barbell_row',
  pull_ups: 'pull_up',
  lat_pulldown: 'lat_pulldown',
  shoulder_press: 'overhead_press',
  lateral_raise: 'dumbbell_lateral_raise',
  bicep_curl: 'dumbbell_curl',
  tricep_pushdown: 'tricep_pushdown',
  russian_twist: 'russian_twist',
  pallof_press: 'pallof_press',
  single_leg_deadlift: 'single_leg_deadlift',
  single_leg_glute_bridge: 'single_leg_glute_bridge',
  bulgarian_split: 'bulgarian_split_squat',
  face_pulls: 'face_pull',
  cable_row: 'cable_row',
  cable_crossover: 'cable_crossover',
  hanging_leg_raise: 'hanging_leg_raise',
  ab_wheel: 'ab_wheel_rollout',
  tricep_dips: 'tricep_dips',
  skull_crushers: 'skull_crusher',
  hammer_curl: 'hammer_curl',
  front_raise: 'front_raise',
  reverse_fly: 'reverse_fly',
  dumbbell_fly: 'dumbbell_fly',
  cable_kickback: 'cable_kickback',
};
