/**
 * Strava Integration for Running Module
 * Provides activity analysis and training metrics
 */

import type { HeartRateZones } from '../types';

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  suffer_score?: number;
}

export interface WeekSummary {
  weekStart: Date;
  totalDistanceKm: number;
  totalTimeMinutes: number;
  runs: number;
  avgPaceSecPerKm: number;
  avgHeartRate: number | null;
  longestRunKm: number;
}

export interface TrainingLoad {
  acute: number;    // Last 7 days
  chronic: number;  // Last 28 days
  ratio: number;    // Acute:Chronic ratio
  status: 'optimal' | 'high' | 'overreaching' | 'detraining';
}

export function analyzeActivity(activity: StravaActivity): {
  paceSecPerKm: number;
  distanceKm: number;
  durationMinutes: number;
  elevationGain: number;
  heartRateAvg: number | null;
  intensity: 'easy' | 'moderate' | 'hard' | 'race';
} {
  const distanceKm = activity.distance / 1000;
  const durationMinutes = activity.moving_time / 60;
  const paceSecPerKm = activity.moving_time / distanceKm;
  const heartRateAvg = activity.average_heartrate || null;

  // Determine intensity based on pace and HR
  let intensity: 'easy' | 'moderate' | 'hard' | 'race' = 'easy';
  if (activity.suffer_score) {
    if (activity.suffer_score > 150) intensity = 'race';
    else if (activity.suffer_score > 100) intensity = 'hard';
    else if (activity.suffer_score > 50) intensity = 'moderate';
  }

  return {
    paceSecPerKm,
    distanceKm,
    durationMinutes,
    elevationGain: activity.total_elevation_gain,
    heartRateAvg,
    intensity,
  };
}

export function calculateWeekSummary(activities: StravaActivity[]): WeekSummary {
  const runs = activities.filter(a =>
    a.type === 'Run' || a.sport_type === 'Run' ||
    a.sport_type === 'TrailRun' || a.sport_type === 'VirtualRun'
  );

  if (runs.length === 0) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    return {
      weekStart,
      totalDistanceKm: 0,
      totalTimeMinutes: 0,
      runs: 0,
      avgPaceSecPerKm: 0,
      avgHeartRate: null,
      longestRunKm: 0,
    };
  }

  const totalDistance = runs.reduce((sum, a) => sum + a.distance, 0);
  const totalTime = runs.reduce((sum, a) => sum + a.moving_time, 0);
  const longestRun = Math.max(...runs.map(a => a.distance));

  const runsWithHr = runs.filter(a => a.average_heartrate);
  const avgHr = runsWithHr.length > 0
    ? runsWithHr.reduce((sum, a) => sum + (a.average_heartrate || 0), 0) / runsWithHr.length
    : null;

  return {
    weekStart: new Date(runs[runs.length - 1].start_date_local),
    totalDistanceKm: totalDistance / 1000,
    totalTimeMinutes: totalTime / 60,
    runs: runs.length,
    avgPaceSecPerKm: totalTime / (totalDistance / 1000),
    avgHeartRate: avgHr ? Math.round(avgHr) : null,
    longestRunKm: longestRun / 1000,
  };
}

export function calculateTrainingLoad(
  recentActivities: StravaActivity[],
  maxHr: number
): TrainingLoad {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  const runs = recentActivities.filter(a =>
    a.type === 'Run' || a.sport_type === 'Run' ||
    a.sport_type === 'TrailRun' || a.sport_type === 'VirtualRun'
  );

  // Calculate TRIMP-like score for each run
  const calculateTrimp = (activity: StravaActivity): number => {
    const hr = activity.average_heartrate || maxHr * 0.65;
    const hrRatio = hr / maxHr;
    const duration = activity.moving_time / 60;
    return duration * hrRatio * (0.64 * Math.exp(1.92 * hrRatio));
  };

  const acuteRuns = runs.filter(a => new Date(a.start_date) >= sevenDaysAgo);
  const chronicRuns = runs.filter(a => new Date(a.start_date) >= twentyEightDaysAgo);

  const acute = acuteRuns.reduce((sum, a) => sum + calculateTrimp(a), 0);
  const chronic = chronicRuns.reduce((sum, a) => sum + calculateTrimp(a), 0) / 4; // Weekly average

  const ratio = chronic > 0 ? acute / chronic : 0;

  let status: TrainingLoad['status'];
  if (ratio >= 0.8 && ratio <= 1.3) status = 'optimal';
  else if (ratio > 1.3 && ratio <= 1.5) status = 'high';
  else if (ratio > 1.5) status = 'overreaching';
  else status = 'detraining';

  return { acute, chronic, ratio, status };
}

export function getHeartRateZoneTime(
  laps: Array<{ average_heartrate?: number; elapsed_time: number }>,
  zones: HeartRateZones
): Record<string, number> {
  const zoneTime: Record<string, number> = {
    z1: 0, z2: 0, z3: 0, z4: 0, z5: 0
  };

  for (const lap of laps) {
    if (!lap.average_heartrate) continue;

    const hr = lap.average_heartrate;
    if (hr <= zones.z1.max) zoneTime.z1 += lap.elapsed_time;
    else if (hr <= zones.z2.max) zoneTime.z2 += lap.elapsed_time;
    else if (hr <= zones.z3.max) zoneTime.z3 += lap.elapsed_time;
    else if (hr <= zones.z4.max) zoneTime.z4 += lap.elapsed_time;
    else zoneTime.z5 += lap.elapsed_time;
  }

  return zoneTime;
}

export function suggestWorkoutType(
  weekSummary: WeekSummary,
  trainingLoad: TrainingLoad
): string {
  if (trainingLoad.status === 'overreaching') {
    return 'Día de descanso o carrera muy suave (recuperación activa)';
  }

  if (trainingLoad.status === 'detraining') {
    return 'Carrera de base - incrementa volumen gradualmente';
  }

  // Based on recent training
  if (weekSummary.runs < 3) {
    return 'Carrera fácil para mantener consistencia';
  }

  if (weekSummary.longestRunKm < weekSummary.totalDistanceKm * 0.3) {
    return 'Tirada larga - Incrementa tu long run gradualmente';
  }

  return 'Entrenamiento de calidad (intervalos, tempo, o fartlek)';
}
