import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, Routine, PersonalRecord, UserProfile, WorkoutExercise, WorkoutSet } from '@/types';
import { DEFAULT_ROUTINES } from '@/data/routines';
import { CLASSIC_EXERCISES } from '@/data/exercises';

const KEYS = {
  WORKOUTS: 'milon_workouts',
  ROUTINES: 'milon_routines',
  PERSONAL_RECORDS: 'milon_prs',
  USER_PROFILE: 'milon_profile',
  CUSTOM_EXERCISES: 'milon_custom_exercises',
};

// ===== WORKOUTS =====
export async function getWorkouts(): Promise<Workout[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WORKOUTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const workouts = await getWorkouts();
  const idx = workouts.findIndex((w) => w.id === workout.id);
  if (idx >= 0) {
    workouts[idx] = workout;
  } else {
    workouts.unshift(workout);
  }
  await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
  await updatePersonalRecords(workout);
}

export async function deleteWorkout(id: string): Promise<void> {
  const workouts = await getWorkouts();
  await AsyncStorage.setItem(
    KEYS.WORKOUTS,
    JSON.stringify(workouts.filter((w) => w.id !== id))
  );
}

export async function getLastWorkoutForRoutine(routineId: string): Promise<Workout | null> {
  const workouts = await getWorkouts();
  return workouts.find((w) => w.routineId === routineId) || null;
}

// ===== ROUTINES =====
export async function getRoutines(): Promise<Routine[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ROUTINES);
    if (!data) {
      await AsyncStorage.setItem(KEYS.ROUTINES, JSON.stringify(DEFAULT_ROUTINES));
      return DEFAULT_ROUTINES;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_ROUTINES;
  }
}

export async function saveRoutine(routine: Routine): Promise<void> {
  const routines = await getRoutines();
  const idx = routines.findIndex((r) => r.id === routine.id);
  if (idx >= 0) {
    routines[idx] = routine;
  } else {
    routines.push(routine);
  }
  await AsyncStorage.setItem(KEYS.ROUTINES, JSON.stringify(routines));
}

export async function deleteRoutine(id: string): Promise<void> {
  const routines = await getRoutines();
  await AsyncStorage.setItem(
    KEYS.ROUTINES,
    JSON.stringify(routines.filter((r) => r.id !== id))
  );
}

// ===== PERSONAL RECORDS =====
export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PERSONAL_RECORDS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function updatePersonalRecords(workout: Workout): Promise<void> {
  const prs = await getPersonalRecords();
  const newPRs: PersonalRecord[] = [];

  for (const we of workout.exercises) {
    const completedSets = we.sets.filter((s) => s.completed && s.weight > 0 && s.reps > 0);
    if (completedSets.length === 0) continue;

    const maxWeight = Math.max(...completedSets.map((s) => s.weight));
    const maxReps = Math.max(...completedSets.map((s) => s.reps));
    const maxVolume = Math.max(...completedSets.map((s) => s.weight * s.reps));
    const estimated1RM = Math.max(
      ...completedSets.map((s) => calculate1RM(s.weight, s.reps))
    );

    const existingPR = prs.find((p) => p.exerciseId === we.exerciseId);
    if (
      !existingPR ||
      maxWeight > existingPR.maxWeight ||
      maxVolume > existingPR.maxVolume ||
      estimated1RM > existingPR.estimated1RM
    ) {
      const newPR: PersonalRecord = {
        exerciseId: we.exerciseId,
        maxWeight: Math.max(maxWeight, existingPR?.maxWeight || 0),
        maxReps: Math.max(maxReps, existingPR?.maxReps || 0),
        maxVolume: Math.max(maxVolume, existingPR?.maxVolume || 0),
        estimated1RM: Math.max(estimated1RM, existingPR?.estimated1RM || 0),
        date: workout.date,
        workoutId: workout.id,
      };
      newPRs.push(newPR);
      const idx = prs.findIndex((p) => p.exerciseId === we.exerciseId);
      if (idx >= 0) {
        prs[idx] = newPR;
      } else {
        prs.push(newPR);
      }
    }
  }

  await AsyncStorage.setItem(KEYS.PERSONAL_RECORDS, JSON.stringify(prs));
}

// Epley formula for 1RM estimation
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

// ===== USER PROFILE =====
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data
      ? JSON.parse(data)
      : { name: 'Atleta', unit: 'kg', theme: 'system' };
  } catch {
    return { name: 'Atleta', unit: 'kg', theme: 'system' };
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

// ===== PREVIOUS PERFORMANCE =====
export async function getPreviousSetData(
  exerciseId: string,
  setIndex: number
): Promise<{ weight: number; reps: number } | null> {
  const workouts = await getWorkouts();
  for (const workout of workouts) {
    const we = workout.exercises.find((e) => e.exerciseId === exerciseId);
    if (we && we.sets[setIndex] && we.sets[setIndex].completed) {
      return {
        weight: we.sets[setIndex].weight,
        reps: we.sets[setIndex].reps,
      };
    }
  }
  return null;
}

// ===== WORKOUT STATS =====
export async function getWorkoutStats(): Promise<{
  totalWorkouts: number;
  totalVolume: number;
  currentStreak: number;
  thisWeekWorkouts: number;
}> {
  const workouts = await getWorkouts();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const thisWeekWorkouts = workouts.filter(
    (w) => new Date(w.date) >= weekStart
  ).length;

  const totalVolume = workouts.reduce((total, w) => {
    return (
      total +
      w.exercises.reduce((exTotal, ex) => {
        return (
          exTotal +
          ex.sets
            .filter((s) => s.completed)
            .reduce((setTotal, s) => setTotal + s.weight * s.reps, 0)
        );
      }, 0)
    );
  }, 0);

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sortedDates = workouts
    .map((w) => {
      const d = new Date(w.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => b - a);

  for (let i = 0; i < sortedDates.length; i++) {
    const expected = today.getTime() - i * 86400000;
    if (sortedDates[i] === expected) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalWorkouts: workouts.length,
    totalVolume,
    currentStreak: streak,
    thisWeekWorkouts,
  };
}
