import { Routine } from '@/types';

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'ppl_push',
    name: 'Push (Empurrar)',
    description: 'Peito, Ombros e Tríceps',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 're1',
        exerciseId: 'bench_press_barbell',
        order: 0,
        sets: [
          { id: 's1', reps: 8, setType: 'normal' },
          { id: 's2', reps: 8, setType: 'normal' },
          { id: 's3', reps: 8, setType: 'normal' },
          { id: 's4', reps: 8, setType: 'normal' },
        ],
      },
      {
        id: 're2',
        exerciseId: 'overhead_press_dumbbell',
        order: 1,
        sets: [
          { id: 's5', reps: 10, setType: 'normal' },
          { id: 's6', reps: 10, setType: 'normal' },
          { id: 's7', reps: 10, setType: 'normal' },
        ],
      },
      {
        id: 're3',
        exerciseId: 'lateral_raise',
        order: 2,
        sets: [
          { id: 's8', reps: 12, setType: 'normal' },
          { id: 's9', reps: 12, setType: 'normal' },
          { id: 's10', reps: 12, setType: 'normal' },
        ],
      },
      {
        id: 're4',
        exerciseId: 'tricep_pushdown',
        order: 3,
        sets: [
          { id: 's11', reps: 12, setType: 'normal' },
          { id: 's12', reps: 12, setType: 'normal' },
          { id: 's13', reps: 12, setType: 'normal' },
        ],
      },
      {
        id: 're5',
        exerciseId: 'skull_crusher',
        order: 4,
        sets: [
          { id: 's14', reps: 10, setType: 'normal' },
          { id: 's15', reps: 10, setType: 'normal' },
          { id: 's16', reps: 10, setType: 'normal' },
        ],
      },
    ],
  },
  {
    id: 'ppl_pull',
    name: 'Pull (Puxar)',
    description: 'Costas e Bíceps',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 're6',
        exerciseId: 'deadlift',
        order: 0,
        sets: [
          { id: 's17', reps: 5, setType: 'normal' },
          { id: 's18', reps: 5, setType: 'normal' },
          { id: 's19', reps: 5, setType: 'normal' },
        ],
      },
      {
        id: 're7',
        exerciseId: 'pullup',
        order: 1,
        sets: [
          { id: 's20', reps: 8, setType: 'normal' },
          { id: 's21', reps: 8, setType: 'normal' },
          { id: 's22', reps: 8, setType: 'normal' },
        ],
      },
      {
        id: 're8',
        exerciseId: 'bent_over_row_barbell',
        order: 2,
        sets: [
          { id: 's23', reps: 8, setType: 'normal' },
          { id: 's24', reps: 8, setType: 'normal' },
          { id: 's25', reps: 8, setType: 'normal' },
        ],
      },
      {
        id: 're9',
        exerciseId: 'barbell_curl',
        order: 3,
        sets: [
          { id: 's26', reps: 10, setType: 'normal' },
          { id: 's27', reps: 10, setType: 'normal' },
          { id: 's28', reps: 10, setType: 'normal' },
        ],
      },
      {
        id: 're10',
        exerciseId: 'hammer_curl',
        order: 4,
        sets: [
          { id: 's29', reps: 12, setType: 'normal' },
          { id: 's30', reps: 12, setType: 'normal' },
          { id: 's31', reps: 12, setType: 'normal' },
        ],
      },
    ],
  },
  {
    id: 'ppl_legs',
    name: 'Legs (Pernas)',
    description: 'Quadríceps, Isquiotibiais e Glúteos',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 're11',
        exerciseId: 'squat_barbell',
        order: 0,
        sets: [
          { id: 's32', reps: 5, setType: 'normal' },
          { id: 's33', reps: 5, setType: 'normal' },
          { id: 's34', reps: 5, setType: 'normal' },
          { id: 's35', reps: 5, setType: 'normal' },
        ],
      },
      {
        id: 're12',
        exerciseId: 'leg_press',
        order: 1,
        sets: [
          { id: 's36', reps: 10, setType: 'normal' },
          { id: 's37', reps: 10, setType: 'normal' },
          { id: 's38', reps: 10, setType: 'normal' },
        ],
      },
      {
        id: 're13',
        exerciseId: 'romanian_deadlift',
        order: 2,
        sets: [
          { id: 's39', reps: 10, setType: 'normal' },
          { id: 's40', reps: 10, setType: 'normal' },
          { id: 's41', reps: 10, setType: 'normal' },
        ],
      },
      {
        id: 're14',
        exerciseId: 'leg_extension',
        order: 3,
        sets: [
          { id: 's42', reps: 12, setType: 'normal' },
          { id: 's43', reps: 12, setType: 'normal' },
          { id: 's44', reps: 12, setType: 'normal' },
        ],
      },
      {
        id: 're15',
        exerciseId: 'calf_raise',
        order: 4,
        sets: [
          { id: 's45', reps: 15, setType: 'normal' },
          { id: 's46', reps: 15, setType: 'normal' },
          { id: 's47', reps: 15, setType: 'normal' },
        ],
      },
    ],
  },
  {
    id: 'upper_lower_upper',
    name: 'Upper Body (Superior)',
    description: 'Treino de corpo superior completo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 're16',
        exerciseId: 'bench_press_barbell',
        order: 0,
        sets: [
          { id: 's48', reps: 5, setType: 'normal' },
          { id: 's49', reps: 5, setType: 'normal' },
          { id: 's50', reps: 5, setType: 'normal' },
        ],
      },
      {
        id: 're17',
        exerciseId: 'bent_over_row_barbell',
        order: 1,
        sets: [
          { id: 's51', reps: 5, setType: 'normal' },
          { id: 's52', reps: 5, setType: 'normal' },
          { id: 's53', reps: 5, setType: 'normal' },
        ],
      },
      {
        id: 're18',
        exerciseId: 'overhead_press_barbell',
        order: 2,
        sets: [
          { id: 's54', reps: 8, setType: 'normal' },
          { id: 's55', reps: 8, setType: 'normal' },
          { id: 's56', reps: 8, setType: 'normal' },
        ],
      },
      {
        id: 're19',
        exerciseId: 'lat_pulldown',
        order: 3,
        sets: [
          { id: 's57', reps: 10, setType: 'normal' },
          { id: 's58', reps: 10, setType: 'normal' },
          { id: 's59', reps: 10, setType: 'normal' },
        ],
      },
    ],
  },
  {
    id: 'full_body',
    name: 'Full Body',
    description: 'Treino de corpo inteiro para iniciantes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    exercises: [
      {
        id: 're20',
        exerciseId: 'squat_barbell',
        order: 0,
        sets: [
          { id: 's60', reps: 8, setType: 'normal' },
          { id: 's61', reps: 8, setType: 'normal' },
          { id: 's62', reps: 8, setType: 'normal' },
        ],
      },
      {
        id: 're21',
        exerciseId: 'bench_press_barbell',
        order: 1,
        sets: [
          { id: 's63', reps: 8, setType: 'normal' },
          { id: 's64', reps: 8, setType: 'normal' },
          { id: 's65', reps: 8, setType: 'normal' },
        ],
      },
      {
        id: 're22',
        exerciseId: 'bent_over_row_barbell',
        order: 2,
        sets: [
          { id: 's66', reps: 8, setType: 'normal' },
          { id: 's67', reps: 8, setType: 'normal' },
          { id: 's68', reps: 8, setType: 'normal' },
        ],
      },
      {
        id: 're23',
        exerciseId: 'overhead_press_dumbbell',
        order: 3,
        sets: [
          { id: 's69', reps: 10, setType: 'normal' },
          { id: 's70', reps: 10, setType: 'normal' },
          { id: 's71', reps: 10, setType: 'normal' },
        ],
      },
    ],
  },
];
