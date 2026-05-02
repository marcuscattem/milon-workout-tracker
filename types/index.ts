export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'cardio'
  | 'glutes'
  | 'calves'
  | 'forearms'
  | 'full_body';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'other';

export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  instructions?: string;
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number; // 1-10
  setType: SetType;
  completed: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  date: string; // ISO string
  duration: number; // in seconds
  exercises: WorkoutExercise[];
  notes?: string;
  routineId?: string;
}

export interface RoutineSet {
  id: string;
  reps: number;
  weight?: number;
  setType: SetType;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  sets: RoutineSet[];
  notes?: string;
  order: number;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface PersonalRecord {
  exerciseId: string;
  maxWeight: number;
  maxReps: number;
  maxVolume: number; // weight * reps
  estimated1RM: number;
  date: string;
  workoutId: string;
}

export interface UserProfile {
  name: string;
  weight?: number;
  height?: number;
  unit: 'kg' | 'lb';
  theme: 'light' | 'dark' | 'system';
}

export interface WorkoutSummary {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  duration: number;
  muscleGroups: MuscleGroup[];
  prs: PersonalRecord[];
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Peito',
  back: 'Costas',
  legs: 'Pernas',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  abs: 'Abdômen',
  cardio: 'Cardio',
  glutes: 'Glúteos',
  calves: 'Panturrilha',
  forearms: 'Antebraço',
  full_body: 'Corpo Inteiro',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Haltere',
  machine: 'Máquina',
  cable: 'Cabo',
  bodyweight: 'Peso Corporal',
  kettlebell: 'Kettlebell',
  band: 'Elástico',
  other: 'Outro',
};
