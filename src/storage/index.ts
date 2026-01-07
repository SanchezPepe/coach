/**
 * Storage Module
 * Persist athlete data and training logs locally
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Athlete, AthleteGoals, Goal, BodyComposition } from '../types';
import type { FoodEntry } from '../nutrition';

const DATA_DIR = path.join(process.env.HOME || '.', '.coach');
const ATHLETE_FILE = path.join(DATA_DIR, 'athlete.json');
const NUTRITION_FILE = path.join(DATA_DIR, 'nutrition.json');
const BODY_COMP_FILE = path.join(DATA_DIR, 'body_composition.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Athlete Profile
export function loadAthlete(): Athlete | null {
  return readJson<Athlete>(ATHLETE_FILE);
}

export function saveAthlete(athlete: Athlete): void {
  writeJson(ATHLETE_FILE, athlete);
}

export function updateAthleteWeight(weightKg: number): Athlete | null {
  const athlete = loadAthlete();
  if (!athlete) return null;

  athlete.weightKg = weightKg;
  saveAthlete(athlete);
  return athlete;
}

export function updateAthleteGoals(goals: AthleteGoals): Athlete | null {
  const athlete = loadAthlete();
  if (!athlete) return null;

  athlete.goals = goals;
  saveAthlete(athlete);
  return athlete;
}

export function updatePrimaryGoal(goal: Goal): Athlete | null {
  const athlete = loadAthlete();
  if (!athlete) return null;

  athlete.goals = {
    ...athlete.goals,
    primary: goal,
  };
  saveAthlete(athlete);
  return athlete;
}

export function updateSecondaryGoal(goal: Goal | undefined): Athlete | null {
  const athlete = loadAthlete();
  if (!athlete) return null;

  athlete.goals = {
    ...athlete.goals,
    secondary: goal,
  };
  saveAthlete(athlete);
  return athlete;
}

// Body Composition History
interface BodyCompData {
  entries: BodyComposition[];
}

export function loadBodyComposition(): BodyComposition[] {
  const data = readJson<BodyCompData>(BODY_COMP_FILE);
  return data?.entries || [];
}

export function saveBodyComposition(entry: BodyComposition): void {
  const data = readJson<BodyCompData>(BODY_COMP_FILE) || { entries: [] };
  data.entries.push(entry);
  writeJson(BODY_COMP_FILE, data);
}

export function getLatestBodyComposition(): BodyComposition | null {
  const entries = loadBodyComposition();
  if (entries.length === 0) return null;
  return entries[entries.length - 1];
}

// Nutrition Logs
interface NutritionData {
  days: Record<string, FoodEntry[]>;
}

function getDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function loadNutritionDay(date: Date): FoodEntry[] {
  const data = readJson<NutritionData>(NUTRITION_FILE);
  if (!data) return [];

  const key = getDateKey(date);
  return data.days[key] || [];
}

export function saveFoodEntry(entry: FoodEntry): void {
  const data = readJson<NutritionData>(NUTRITION_FILE) || { days: {} };

  const key = getDateKey(new Date(entry.timestamp));
  if (!data.days[key]) {
    data.days[key] = [];
  }

  data.days[key].push(entry);
  writeJson(NUTRITION_FILE, data);
}

export function getNutritionHistory(days: number = 7): Record<string, FoodEntry[]> {
  const data = readJson<NutritionData>(NUTRITION_FILE);
  if (!data) return {};

  const result: Record<string, FoodEntry[]> = {};
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = getDateKey(date);

    if (data.days[key]) {
      result[key] = data.days[key];
    }
  }

  return result;
}

// Create default athlete for first-time setup
export function createDefaultAthlete(
  name: string,
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female',
  restingHeartRate?: number,
  maxHeartRate?: number
): Athlete {
  const athlete: Athlete = {
    id: `athlete_${Date.now()}`,
    name,
    weightKg,
    heightCm,
    age,
    sex,
    restingHeartRate,
    maxHeartRate: maxHeartRate || (220 - age),
    goals: {
      primary: {
        type: 'body_composition',
        focus: 'maintenance',
      },
    },
  };

  saveAthlete(athlete);
  return athlete;
}

// Check if setup is needed
export function needsSetup(): boolean {
  return loadAthlete() === null;
}

// Export/Import data
export function exportAllData(): string {
  const athlete = loadAthlete();
  const bodyComp = loadBodyComposition();
  const nutritionData = readJson<NutritionData>(NUTRITION_FILE);

  return JSON.stringify({
    athlete,
    bodyComposition: bodyComp,
    nutrition: nutritionData,
    exportDate: new Date().toISOString(),
  }, null, 2);
}

export function getDataDir(): string {
  return DATA_DIR;
}
