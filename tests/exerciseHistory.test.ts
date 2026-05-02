import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

// Mock data modules
vi.mock('@/data/routines', () => ({ DEFAULT_ROUTINES: [] }));
vi.mock('@/data/exercises', () => ({ CLASSIC_EXERCISES: [] }));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculate1RM, getExerciseHistory } from '../store/workoutStore';
import type { Workout } from '../types';

const mockWorkouts: Workout[] = [
  {
    id: 'w1',
    name: 'Treino A',
    date: '2024-01-10T10:00:00.000Z',
    duration: 3600,
    exercises: [
      {
        id: 'we1',
        exerciseId: 'bench_press_barbell',
        order: 0,
        sets: [
          { id: 's1', exerciseId: 'bench_press_barbell', setNumber: 1, weight: 80, reps: 8, setType: 'normal', completed: true },
          { id: 's2', exerciseId: 'bench_press_barbell', setNumber: 2, weight: 85, reps: 6, setType: 'normal', completed: true },
          { id: 's3', exerciseId: 'bench_press_barbell', setNumber: 3, weight: 90, reps: 4, setType: 'normal', completed: true },
        ],
      },
    ],
  },
  {
    id: 'w2',
    name: 'Treino B',
    date: '2024-01-17T10:00:00.000Z',
    duration: 3200,
    exercises: [
      {
        id: 'we2',
        exerciseId: 'bench_press_barbell',
        order: 0,
        sets: [
          { id: 's4', exerciseId: 'bench_press_barbell', setNumber: 1, weight: 90, reps: 8, setType: 'normal', completed: true },
          { id: 's5', exerciseId: 'bench_press_barbell', setNumber: 2, weight: 95, reps: 5, setType: 'normal', completed: true },
        ],
      },
    ],
  },
  {
    id: 'w3',
    name: 'Treino C',
    date: '2024-01-24T10:00:00.000Z',
    duration: 2800,
    exercises: [
      {
        id: 'we3',
        exerciseId: 'squat_barbell', // different exercise
        order: 0,
        sets: [
          { id: 's6', exerciseId: 'squat_barbell', setNumber: 1, weight: 100, reps: 5, setType: 'normal', completed: true },
        ],
      },
    ],
  },
];

describe('calculate1RM', () => {
  it('returns weight directly for 1 rep', () => {
    expect(calculate1RM(100, 1)).toBe(100);
  });

  it('calculates Epley formula correctly for multiple reps', () => {
    // Epley: weight * (1 + reps/30)
    expect(calculate1RM(100, 10)).toBe(Math.round(100 * (1 + 10 / 30)));
    expect(calculate1RM(80, 8)).toBe(Math.round(80 * (1 + 8 / 30)));
  });

  it('returns higher value for more reps at same weight', () => {
    expect(calculate1RM(100, 5)).toBeLessThan(calculate1RM(100, 10));
  });

  it('handles zero reps gracefully', () => {
    // 0 reps: weight * (1 + 0/30) = weight
    expect(calculate1RM(100, 0)).toBe(100);
  });
});

describe('getExerciseHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no workouts exist', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    const history = await getExerciseHistory('bench_press_barbell');
    expect(history).toEqual([]);
  });

  it('returns only sessions containing the specified exercise', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockWorkouts));
    const history = await getExerciseHistory('bench_press_barbell');
    expect(history).toHaveLength(2);
    expect(history.every((h) => h.workoutId !== 'w3')).toBe(true);
  });

  it('calculates maxWeight correctly per session', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockWorkouts));
    const history = await getExerciseHistory('bench_press_barbell');
    expect(history[0].maxWeight).toBe(90); // max of 80, 85, 90
    expect(history[1].maxWeight).toBe(95); // max of 90, 95
  });

  it('calculates totalVolume correctly', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockWorkouts));
    const history = await getExerciseHistory('bench_press_barbell');
    // w1: 80*8 + 85*6 + 90*4 = 640 + 510 + 360 = 1510
    expect(history[0].totalVolume).toBe(1510);
    // w2: 90*8 + 95*5 = 720 + 475 = 1195
    expect(history[1].totalVolume).toBe(1195);
  });

  it('sorts history ascending by date', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockWorkouts));
    const history = await getExerciseHistory('bench_press_barbell');
    expect(new Date(history[0].date).getTime()).toBeLessThan(
      new Date(history[1].date).getTime()
    );
  });

  it('calculates estimated1RM using Epley formula', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockWorkouts));
    const history = await getExerciseHistory('bench_press_barbell');
    // w1 best set for 1RM: max of calculate1RM(80,8), calculate1RM(85,6), calculate1RM(90,4)
    const expected1RM = Math.max(
      calculate1RM(80, 8),
      calculate1RM(85, 6),
      calculate1RM(90, 4)
    );
    expect(history[0].estimated1RM).toBe(expected1RM);
  });

  it('excludes incomplete sets from calculations', async () => {
    const workoutsWithIncomplete: Workout[] = [
      {
        id: 'w_inc',
        name: 'Treino Incompleto',
        date: '2024-02-01T10:00:00.000Z',
        duration: 1000,
        exercises: [
          {
            id: 'we_inc',
            exerciseId: 'bench_press_barbell',
            order: 0,
            sets: [
              { id: 'si1', exerciseId: 'bench_press_barbell', setNumber: 1, weight: 200, reps: 10, setType: 'normal', completed: false }, // NOT completed
              { id: 'si2', exerciseId: 'bench_press_barbell', setNumber: 2, weight: 60, reps: 5, setType: 'normal', completed: true },
            ],
          },
        ],
      },
    ];
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(workoutsWithIncomplete));
    const history = await getExerciseHistory('bench_press_barbell');
    expect(history[0].maxWeight).toBe(60); // should NOT include the 200kg incomplete set
  });

  it('returns empty array when exercise has no sessions', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockWorkouts));
    const history = await getExerciseHistory('nonexistent_exercise');
    expect(history).toHaveLength(0);
  });

  it('includes workout name in history points', async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(mockWorkouts));
    const history = await getExerciseHistory('bench_press_barbell');
    expect(history[0].workoutName).toBe('Treino A');
    expect(history[1].workoutName).toBe('Treino B');
  });
});
