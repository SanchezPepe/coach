/**
 * Coach - Entrenador Integral
 * CLI Application Entry Point
 */

import { CLI } from './cli';
import * as storage from './storage';
import * as running from './running';
import * as strength from './strength';
import * as nutrition from './nutrition';
import {
  calculateHeartRateZones,
  calculateBodyComposition,
  calculateProteinTarget,
  getDistanceLabel,
  isEnduranceGoal,
} from './types';
import type { Athlete, BodyComposition, EnduranceGoal, EnduranceDistance } from './types';

class CoachApp {
  private cli: CLI;
  private athlete: Athlete | null = null;

  constructor() {
    this.cli = new CLI();
  }

  async run(): Promise<void> {
    this.cli.clear();
    this.cli.printHeader('COACH - Entrenador Integral');
    console.log('Tu entrenador de fitness personalizado');
    console.log('');

    // Load or create athlete
    this.athlete = storage.loadAthlete();

    if (!this.athlete) {
      console.log('Bienvenido! Vamos a configurar tu perfil...\n');
      await this.setupAthlete();
    } else {
      console.log(`Hola de nuevo, ${this.athlete.name}!`);
    }

    await this.mainMenu();
  }

  private async setupAthlete(): Promise<void> {
    const name = await this.cli.prompt('Tu nombre: ');
    const weight = await this.cli.promptNumber('Peso actual (kg): ');
    const height = await this.cli.promptNumber('Altura (cm): ');
    const age = await this.cli.promptNumber('Edad: ');
    const sexChoice = await this.cli.prompt('Sexo [M]asculino / [F]emenino: ');
    const sex: 'male' | 'female' = sexChoice.toLowerCase().startsWith('f') ? 'female' : 'male';
    const restHr = await this.cli.promptNumber('FC en reposo (opcional, Enter para omitir): ');
    const maxHr = await this.cli.promptNumber('FC máxima (opcional, Enter para 220-edad): ');

    if (!weight || !height || !age) {
      console.log('Datos incompletos. Por favor, reinicia la aplicación.');
      process.exit(1);
    }

    this.athlete = storage.createDefaultAthlete(
      name || 'Atleta',
      weight,
      height,
      age,
      sex,
      restHr || undefined,
      maxHr || undefined
    );

    console.log('\nPerfil creado! Ahora configura tu objetivo...');
    await this.setGoal();
  }

  private async setGoal(): Promise<void> {
    console.log('\nTipo de objetivo:');
    console.log('  [1] Carrera/Endurance');
    console.log('  [2] Fuerza/Hipertrofia');
    console.log('  [3] Composicion corporal');
    const goalType = await this.cli.prompt('Selecciona: ');

    if (goalType === '1') {
      await this.setEnduranceGoal();
    } else if (goalType === '2') {
      await this.setStrengthGoal();
    } else {
      await this.setBodyCompGoal();
    }
  }

  private async setEnduranceGoal(): Promise<void> {
    console.log('\nDistancia objetivo:');
    console.log('  [1] 5K    [2] 10K   [3] 21K (Media)');
    console.log('  [4] 42K   [5] Ultra [6] Otra');
    const distanceChoice = await this.cli.prompt('Selecciona: ');

    const distanceMap: Record<string, EnduranceDistance> = {
      '1': '5K', '2': '10K', '3': '21K',
      '4': '42K', '5': 'ultra', '6': '10K',
    };
    const distance = distanceMap[distanceChoice] || '21K';

    const targetDateStr = await this.cli.prompt('Fecha de la carrera (YYYY-MM-DD, Enter para omitir): ');
    const targetTime = await this.cli.prompt('Tiempo objetivo (opcional, ej: 1:45:00): ');

    const goal: EnduranceGoal = {
      type: 'endurance',
      sport: 'running',
      distance,
      targetDate: targetDateStr ? new Date(targetDateStr) : undefined,
      targetTime: targetTime || undefined,
    };

    if (this.athlete) {
      storage.updatePrimaryGoal(goal);
      this.athlete.goals = { ...this.athlete.goals, primary: goal };
    }

    const label = getDistanceLabel(distance);
    console.log(`\nObjetivo configurado: ${label}`);
    if (targetDateStr) {
      console.log(`Fecha: ${this.cli.formatDate(new Date(targetDateStr))}`);
    }
  }

  private async setStrengthGoal(): Promise<void> {
    console.log('\nEnfoque de fuerza:');
    console.log('  [1] Hipertrofia (ganar musculo)');
    console.log('  [2] Fuerza maxima');
    console.log('  [3] Funcional/General');
    const focusChoice = await this.cli.prompt('Selecciona: ');

    const focusMap: Record<string, 'hypertrophy' | 'strength' | 'functional'> = {
      '1': 'hypertrophy', '2': 'strength', '3': 'functional',
    };
    const focus = focusMap[focusChoice] || 'functional';

    const goal = { type: 'strength' as const, focus };

    if (this.athlete) {
      storage.updatePrimaryGoal(goal);
      this.athlete.goals = { ...this.athlete.goals, primary: goal };
    }

    console.log(`\nObjetivo configurado: ${focus}`);
  }

  private async setBodyCompGoal(): Promise<void> {
    console.log('\nObjetivo de composicion:');
    console.log('  [1] Perder grasa');
    console.log('  [2] Ganar musculo');
    console.log('  [3] Recomposicion');
    console.log('  [4] Mantenimiento');
    const focusChoice = await this.cli.prompt('Selecciona: ');

    const focusMap: Record<string, 'fat_loss' | 'muscle_gain' | 'recomposition' | 'maintenance'> = {
      '1': 'fat_loss', '2': 'muscle_gain', '3': 'recomposition', '4': 'maintenance',
    };
    const focus = focusMap[focusChoice] || 'maintenance';

    const goal = { type: 'body_composition' as const, focus };

    if (this.athlete) {
      storage.updatePrimaryGoal(goal);
      this.athlete.goals = { ...this.athlete.goals, primary: goal };
    }

    console.log(`\nObjetivo configurado: ${focus}`);
  }

  private async mainMenu(): Promise<void> {
    let running = true;

    while (running) {
      await this.cli.selectFromMenu('Menu Principal', [
        { key: '1', label: 'Running - Entrenamientos y Strava', action: () => this.runningMenu() },
        { key: '2', label: 'Fuerza - Rutinas de gym', action: () => this.strengthMenu() },
        { key: '3', label: 'Nutricion - Macros y alimentos', action: () => this.nutritionMenu() },
        { key: '4', label: 'Mi Perfil', action: () => this.profileMenu() },
        { key: '5', label: 'Dashboard - Resumen general', action: () => this.showDashboard() },
        { key: 'q', label: 'Salir', action: () => { running = false; } },
      ]);
    }

    this.cli.print('\nHasta pronto! Sigue entrenando!');
    this.cli.close();
  }

  private async runningMenu(): Promise<void> {
    let inMenu = true;

    while (inMenu) {
      await this.cli.selectFromMenu('Running', [
        { key: '1', label: 'Ver actividades recientes (Strava)', action: () => this.showRecentActivities() },
        { key: '2', label: 'Analizar ultima actividad', action: () => this.analyzeLastActivity() },
        { key: '3', label: 'Ver plan de entrenamiento', action: () => this.showTrainingPlan() },
        { key: '4', label: 'Zonas de ritmo', action: () => this.showPaceZones() },
        { key: '5', label: 'Estadisticas Strava', action: () => this.showStravaStats() },
        { key: 'b', label: 'Volver', action: () => { inMenu = false; } },
      ]);
    }
  }

  private async showRecentActivities(): Promise<void> {
    this.cli.printSection('Actividades Recientes');
    console.log('Cargando desde Strava...');
    console.log('\n(Las actividades se cargan via MCP - ejecuta con Claude para ver datos reales)');
    console.log('\nEjemplo de formato:');
    console.log('─'.repeat(60));
    console.log('1. Carrera matutina - 10.5 km en 55:30 (5:17/km)');
    console.log('2. Tirada larga - 18.2 km en 1:42:15 (5:36/km)');
    console.log('3. Intervalos - 8.0 km en 40:00 (5:00/km)');
    await this.cli.waitForEnter();
  }

  private async analyzeLastActivity(): Promise<void> {
    this.cli.printSection('Analisis de Actividad');
    console.log('(Requiere integracion con Strava MCP)\n');
    console.log('Metricas que se analizan:');
    console.log('  - Ritmo promedio y por kilometro');
    console.log('  - Frecuencia cardiaca por zonas');
    console.log('  - Elevacion acumulada');
    console.log('  - Cadencia');
    console.log('  - Comparativa con entrenamientos similares');
    await this.cli.waitForEnter();
  }

  private async showTrainingPlan(): Promise<void> {
    const primaryGoal = this.athlete?.goals?.primary;

    if (!primaryGoal || !isEnduranceGoal(primaryGoal)) {
      console.log('Necesitas un objetivo de endurance para ver el plan de entrenamiento.');
      console.log('Configura tu objetivo desde Mi Perfil > Cambiar objetivo.');
      await this.cli.waitForEnter();
      return;
    }

    const plan = running.getTrainingPlan(primaryGoal);
    const distanceLabel = getDistanceLabel(primaryGoal.distance);

    this.cli.printSection(`Plan de Entrenamiento - ${distanceLabel}`);
    console.log(`Total: ${plan.totalWeeks} semanas\n`);

    console.log('Fases:');
    for (const phase of plan.phases) {
      console.log(`  ${phase.name.toUpperCase()} (${phase.weeks} sem): ${phase.focus}`);
    }

    console.log('\nPrimeras semanas del plan:');
    this.cli.printTable(
      ['Sem', 'Fase', 'Km/sem', 'Long Run', 'Calidad'],
      plan.weeks.slice(0, 6).map(w => [
        w.weekNumber.toString(),
        w.phase,
        w.plannedDistanceKm.toString(),
        `${w.longRunKm} km`,
        w.qualitySession,
      ])
    );

    await this.cli.waitForEnter();
  }

  private async showPaceZones(): Promise<void> {
    const targetPace = await this.cli.promptNumber('Ritmo objetivo para carrera (seg/km, ej: 330 para 5:30): ');

    if (!targetPace) {
      console.log('Ritmo no valido');
      return;
    }

    const zones = running.calculatePaceZones(targetPace);

    this.cli.printSection('Zonas de Ritmo');
    console.log(`Basado en ritmo objetivo: ${this.cli.formatPace(targetPace)}\n`);

    for (const [name, zone] of Object.entries(zones)) {
      console.log(`  ${name.padEnd(12)}: ${this.cli.formatPace(zone.min)} - ${this.cli.formatPace(zone.max)}`);
    }

    await this.cli.waitForEnter();
  }

  private async showStravaStats(): Promise<void> {
    this.cli.printSection('Estadisticas de Strava');
    console.log('(Datos cargados via MCP cuando se ejecuta con Claude)\n');
    console.log('Estadisticas disponibles:');
    console.log('  - Kilometros este mes/año');
    console.log('  - Tiempo total de entrenamiento');
    console.log('  - Actividades completadas');
    console.log('  - Desnivel acumulado');
    await this.cli.waitForEnter();
  }

  private async strengthMenu(): Promise<void> {
    let inMenu = true;

    while (inMenu) {
      await this.cli.selectFromMenu('Fuerza', [
        { key: '1', label: 'Ver rutinas para fase actual', action: () => this.showStrengthRoutines() },
        { key: '2', label: 'Ver entrenamientos recientes (Hevy)', action: () => this.showHevyWorkouts() },
        { key: '3', label: 'Guia de ejercicios', action: () => this.showExerciseGuide() },
        { key: 'b', label: 'Volver', action: () => { inMenu = false; } },
      ]);
    }
  }

  private async showStrengthRoutines(): Promise<void> {
    const phase = await this.cli.prompt('Fase actual [base/build/peak/taper]: ') as 'base' | 'build' | 'peak' | 'taper';

    const validPhases = ['base', 'build', 'peak', 'taper'];
    if (!validPhases.includes(phase)) {
      console.log('Fase no valida');
      return;
    }

    const weekPlan = strength.getStrengthWeek(phase);

    this.cli.printSection(`Rutinas de Fuerza - Fase ${phase.toUpperCase()}`);
    console.log(`Sesiones recomendadas: ${weekPlan.sessions}/semana`);
    console.log(`Nota: ${weekPlan.notes}\n`);

    for (const routine of weekPlan.routines) {
      console.log(strength.formatRoutine(routine));
      console.log('');
    }

    await this.cli.waitForEnter();
  }

  private async showHevyWorkouts(): Promise<void> {
    this.cli.printSection('Entrenamientos de Hevy');
    console.log('(Datos cargados via MCP cuando se ejecuta con Claude)\n');
    console.log('Se mostraran:');
    console.log('  - Ultimos entrenamientos registrados');
    console.log('  - Ejercicios y series realizadas');
    console.log('  - Progresion de peso');
    await this.cli.waitForEnter();
  }

  private async showExerciseGuide(): Promise<void> {
    this.cli.printSection('Guia de Ejercicios para Corredores');
    console.log('\nEjercicios clave:\n');

    const exercises = [
      { name: 'Sentadilla/Goblet Squat', why: 'Fuerza de piernas, estabilidad' },
      { name: 'Peso Muerto Rumano', why: 'Isquios, gluteos, espalda baja' },
      { name: 'Hip Thrust', why: 'Gluteos - potencia en carrera' },
      { name: 'Plancha', why: 'Core - estabilidad al correr' },
      { name: 'Step Ups', why: 'Fuerza unilateral, equilibrio' },
      { name: 'Calf Raises', why: 'Prevencion lesiones, impulso' },
    ];

    for (const ex of exercises) {
      console.log(`  ${ex.name}`);
      console.log(`    Por que: ${ex.why}\n`);
    }

    await this.cli.waitForEnter();
  }

  private async nutritionMenu(): Promise<void> {
    let inMenu = true;

    while (inMenu) {
      await this.cli.selectFromMenu('Nutricion', [
        { key: '1', label: 'Ver macros del dia', action: () => this.showDailyMacros() },
        { key: '2', label: 'Buscar alimento', action: () => this.searchFood() },
        { key: '3', label: 'Registrar alimento', action: () => this.logFood() },
        { key: '4', label: 'Guia pre/post entreno', action: () => this.showNutritionGuide() },
        { key: 'b', label: 'Volver', action: () => { inMenu = false; } },
      ]);
    }
  }

  private async showDailyMacros(): Promise<void> {
    if (!this.athlete) return;

    const dayType = await this.cli.prompt('Tipo de dia [long_run/quality/easy/strength/rest]: ') as nutrition.TrainingDayType;

    const profile: nutrition.AthleteProfile = {
      weightKg: this.athlete.weightKg,
      heightCm: this.athlete.heightCm,
      age: this.athlete.age,
      sex: 'male', // TODO: add to athlete profile
      activityLevel: 'high',
    };

    const targets = nutrition.getMacroTargets(profile, dayType || 'easy');
    const todayEntries = storage.loadNutritionDay(new Date());
    const totals = nutrition.calculateTotals(todayEntries);
    const remaining = nutrition.calculateRemaining(totals, targets);

    this.cli.printSection(`Macros - ${dayType || 'easy'}`);

    console.log('\nObjetivos del dia:');
    console.log(`  ${nutrition.formatMacros(targets)}`);

    console.log('\nConsumido hoy:');
    console.log(`  ${nutrition.formatMacros(totals)}`);

    console.log('\nRestante:');
    console.log(`  ${nutrition.formatMacros(remaining)}`);

    console.log(`\nSugerencia: ${nutrition.suggestMealFocus(remaining)}`);

    await this.cli.waitForEnter();
  }

  private async searchFood(): Promise<void> {
    const query = await this.cli.prompt('Buscar alimento: ');

    this.cli.printSection('Resultados de Busqueda');
    console.log(`Buscando "${query}"...`);
    console.log('\n(Los resultados se cargan via OpenNutrition MCP)\n');
    console.log('Ejemplo de resultados:');
    console.log('  1. Pechuga de pollo - 165 kcal/100g, 31g prot');
    console.log('  2. Arroz blanco cocido - 130 kcal/100g, 2.7g prot');
    console.log('  3. Platano - 89 kcal/100g, 1.1g prot');

    await this.cli.waitForEnter();
  }

  private async logFood(): Promise<void> {
    console.log('\n(En la version completa, usarias la busqueda de OpenNutrition)');
    console.log('Por ahora, registro manual:\n');

    const name = await this.cli.prompt('Nombre del alimento: ');
    const quantity = await this.cli.promptNumber('Cantidad (g): ');
    const calories = await this.cli.promptNumber('Calorias: ');
    const protein = await this.cli.promptNumber('Proteina (g): ');
    const carbs = await this.cli.promptNumber('Carbohidratos (g): ');
    const fat = await this.cli.promptNumber('Grasa (g): ');

    if (!quantity || !calories || protein === null || carbs === null || fat === null) {
      console.log('Datos incompletos');
      return;
    }

    const entry: nutrition.FoodEntry = {
      foodId: `manual_${Date.now()}`,
      name: name || 'Alimento',
      quantity,
      unit: 'g',
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      timestamp: new Date(),
    };

    storage.saveFoodEntry(entry);
    console.log(`\nRegistrado: ${entry.name} (${entry.calories} kcal)`);

    await this.cli.waitForEnter();
  }

  private async showNutritionGuide(): Promise<void> {
    const workoutType = await this.cli.prompt('Tipo de entreno [long_run/quality/easy/strength]: ') as nutrition.TrainingDayType;

    this.cli.printSection('Guia Nutricional');

    console.log('\nPRE-ENTRENO:');
    console.log(nutrition.getPreWorkoutGuidelines(workoutType || 'easy'));

    console.log('\nPOST-ENTRENO:');
    console.log(nutrition.getPostWorkoutGuidelines(workoutType || 'easy'));

    await this.cli.waitForEnter();
  }

  private async profileMenu(): Promise<void> {
    if (!this.athlete) return;

    let inMenu = true;

    while (inMenu) {
      await this.cli.selectFromMenu('Mi Perfil', [
        { key: '1', label: 'Ver perfil completo', action: () => this.showProfile() },
        { key: '2', label: 'Actualizar peso', action: () => this.updateWeight() },
        { key: '3', label: 'Registrar composicion corporal', action: () => this.logBodyComp() },
        { key: '4', label: 'Cambiar objetivo', action: () => this.setGoal() },
        { key: '5', label: 'Ver zonas de frecuencia cardiaca', action: () => this.showHRZones() },
        { key: 'b', label: 'Volver', action: () => { inMenu = false; } },
      ]);
    }
  }

  private async showProfile(): Promise<void> {
    if (!this.athlete) return;

    this.cli.printSection('Tu Perfil');

    console.log(`  Nombre: ${this.athlete.name}`);
    console.log(`  Peso: ${this.athlete.weightKg} kg`);
    console.log(`  Altura: ${this.athlete.heightCm} cm`);
    console.log(`  Edad: ${this.athlete.age} anos`);
    console.log(`  Sexo: ${this.athlete.sex === 'male' ? 'Masculino' : 'Femenino'}`);

    if (this.athlete.restingHeartRate) {
      console.log(`  FC Reposo: ${this.athlete.restingHeartRate} bpm`);
    }
    if (this.athlete.maxHeartRate) {
      console.log(`  FC Maxima: ${this.athlete.maxHeartRate} bpm`);
    }

    const primaryGoal = this.athlete.goals?.primary;
    if (primaryGoal) {
      console.log(`\n  Objetivo principal: ${primaryGoal.type}`);
      if (isEnduranceGoal(primaryGoal)) {
        console.log(`  Distancia: ${getDistanceLabel(primaryGoal.distance)}`);
        if (primaryGoal.targetDate) {
          console.log(`  Fecha: ${this.cli.formatDate(primaryGoal.targetDate)}`);
        }
        if (primaryGoal.targetTime) {
          console.log(`  Tiempo objetivo: ${primaryGoal.targetTime}`);
        }
      } else if (primaryGoal.type === 'strength') {
        console.log(`  Enfoque: ${primaryGoal.focus}`);
      } else if (primaryGoal.type === 'body_composition') {
        console.log(`  Enfoque: ${primaryGoal.focus}`);
      }
    }

    const proteinTarget = calculateProteinTarget(this.athlete.weightKg, 'high');
    console.log(`\n  Proteina recomendada: ${proteinTarget}g/dia`);

    await this.cli.waitForEnter();
  }

  private async updateWeight(): Promise<void> {
    const newWeight = await this.cli.promptNumber('Nuevo peso (kg): ');

    if (newWeight) {
      this.athlete = storage.updateAthleteWeight(newWeight);
      console.log(`Peso actualizado a ${newWeight} kg`);
    }

    await this.cli.waitForEnter();
  }

  private async logBodyComp(): Promise<void> {
    const weight = await this.cli.promptNumber('Peso (kg): ');
    const bodyFat = await this.cli.promptNumber('Grasa corporal (%): ');

    if (!weight || !bodyFat) {
      console.log('Datos incompletos');
      return;
    }

    const comp = calculateBodyComposition(weight, bodyFat);
    const entry: BodyComposition = {
      ...comp,
      date: new Date(),
    };

    storage.saveBodyComposition(entry);

    console.log(`\nRegistrado:`);
    console.log(`  Masa magra: ${comp.leanMassKg.toFixed(1)} kg`);
    console.log(`  Masa grasa: ${comp.fatMassKg.toFixed(1)} kg`);

    await this.cli.waitForEnter();
  }

  private async showHRZones(): Promise<void> {
    if (!this.athlete?.maxHeartRate) {
      console.log('FC maxima no configurada');
      return;
    }

    const zones = calculateHeartRateZones(this.athlete.maxHeartRate);

    this.cli.printSection('Zonas de Frecuencia Cardiaca');
    console.log(`FC Maxima: ${this.athlete.maxHeartRate} bpm\n`);

    console.log(`  Z1 (Recuperacion): ${zones.z1.min}-${zones.z1.max} bpm`);
    console.log(`  Z2 (Aerobico):     ${zones.z2.min}-${zones.z2.max} bpm`);
    console.log(`  Z3 (Tempo):        ${zones.z3.min}-${zones.z3.max} bpm`);
    console.log(`  Z4 (Umbral):       ${zones.z4.min}-${zones.z4.max} bpm`);
    console.log(`  Z5 (VO2max):       ${zones.z5.min}-${zones.z5.max} bpm`);

    await this.cli.waitForEnter();
  }

  private async showDashboard(): Promise<void> {
    if (!this.athlete) return;

    this.cli.printHeader('DASHBOARD');

    // Athlete summary
    console.log(`\nAtleta: ${this.athlete.name}`);
    console.log(`Peso: ${this.athlete.weightKg} kg`);

    const primaryGoal = this.athlete.goals?.primary;
    if (primaryGoal) {
      console.log(`\n─ Objetivo: ${primaryGoal.type} ─`);

      if (isEnduranceGoal(primaryGoal) && primaryGoal.targetDate) {
        const daysToRace = Math.ceil(
          (new Date(primaryGoal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        console.log(`${getDistanceLabel(primaryGoal.distance)} en ${daysToRace} dias`);

        if (daysToRace > 0) {
          const weeksToRace = Math.ceil(daysToRace / 7);
          const plan = running.getTrainingPlan(primaryGoal);
          const currentWeek = plan.weeks.find(w => w.weekNumber === plan.totalWeeks - weeksToRace + 1);

          if (currentWeek) {
            console.log(`Semana ${currentWeek.weekNumber} - Fase ${currentWeek.phase.toUpperCase()}`);
            console.log(`  Volumen: ${currentWeek.plannedDistanceKm} km`);
            console.log(`  Long run: ${currentWeek.longRunKm} km`);
            console.log(`  Fuerza: ${currentWeek.strengthFocus}`);
          }
        }
      } else if (primaryGoal.type === 'strength') {
        console.log(`Enfoque: ${primaryGoal.focus}`);
        const recommendation = strength.getStrengthRecommendation(primaryGoal);
        console.log(`Sesiones/semana: ${recommendation.sessionsPerWeek}`);
      } else if (primaryGoal.type === 'body_composition') {
        console.log(`Enfoque: ${primaryGoal.focus}`);
      }
    }

    // Today's nutrition
    console.log('\n─ Nutricion Hoy ─');
    const todayEntries = storage.loadNutritionDay(new Date());
    const totals = nutrition.calculateTotals(todayEntries);
    console.log(`Consumido: ${nutrition.formatMacros(totals)}`);

    // Body comp
    const latestComp = storage.getLatestBodyComposition();
    if (latestComp) {
      console.log(`\n─ Composicion Corporal ─`);
      console.log(`Masa magra: ${latestComp.leanMassKg.toFixed(1)} kg | Grasa: ${latestComp.bodyFatPercentage}%`);
    }

    await this.cli.waitForEnter();
  }
}

// Run the app
const app = new CoachApp();
app.run().catch(console.error);
