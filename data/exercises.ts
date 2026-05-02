import { Exercise } from '@/types';

export const CLASSIC_EXERCISES: Exercise[] = [
  // ===== PEITO =====
  {
    id: 'bench_press_barbell',
    name: 'Supino Reto (Barra)',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'barbell',
    instructions: 'Deite no banco, segure a barra com pegada um pouco mais larga que os ombros. Desça a barra até o peito e empurre de volta à posição inicial.',
  },
  {
    id: 'bench_press_incline',
    name: 'Supino Inclinado (Barra)',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'barbell',
    instructions: 'Banco inclinado a 30-45°. Mesma execução do supino reto, focando na parte superior do peito.',
  },
  {
    id: 'bench_press_decline',
    name: 'Supino Declinado (Barra)',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps'],
    equipment: 'barbell',
    instructions: 'Banco declinado. Trabalha a parte inferior do peito.',
  },
  {
    id: 'bench_press_dumbbell',
    name: 'Supino Reto (Haltere)',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'dumbbell',
    instructions: 'Deite no banco com um haltere em cada mão. Desça os halteres até a linha do peito e empurre de volta.',
  },
  {
    id: 'flye_dumbbell',
    name: 'Crucifixo (Haltere)',
    muscleGroup: 'chest',
    secondaryMuscles: [],
    equipment: 'dumbbell',
    instructions: 'Deite no banco, braços estendidos com halteres. Abra os braços em arco até sentir o alongamento no peito.',
  },
  {
    id: 'cable_crossover',
    name: 'Crossover (Cabo)',
    muscleGroup: 'chest',
    secondaryMuscles: [],
    equipment: 'cable',
    instructions: 'Em pé entre as polias, puxe os cabos em direção ao centro cruzando os braços.',
  },
  {
    id: 'pushup',
    name: 'Flexão de Braço',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: 'bodyweight',
    instructions: 'Posição de prancha, desça o peito até próximo ao chão e empurre de volta.',
  },
  {
    id: 'dip_chest',
    name: 'Mergulho (Peito)',
    muscleGroup: 'chest',
    secondaryMuscles: ['triceps'],
    equipment: 'bodyweight',
    instructions: 'Nas barras paralelas, incline o tronco para frente e desça até os cotovelos formarem 90°.',
  },

  // ===== COSTAS =====
  {
    id: 'deadlift',
    name: 'Levantamento Terra',
    muscleGroup: 'back',
    secondaryMuscles: ['legs', 'glutes'],
    equipment: 'barbell',
    instructions: 'Pés na largura dos ombros, barra sobre os pés. Agache, segure a barra e levante mantendo a coluna neutra.',
  },
  {
    id: 'pullup',
    name: 'Barra Fixa (Pull-up)',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    equipment: 'bodyweight',
    instructions: 'Segure a barra com pegada pronada (palmas para frente), puxe o corpo até o queixo ultrapassar a barra.',
  },
  {
    id: 'chinup',
    name: 'Barra Fixa (Chin-up)',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    equipment: 'bodyweight',
    instructions: 'Segure a barra com pegada supinada (palmas para você), puxe o corpo até o queixo ultrapassar a barra.',
  },
  {
    id: 'lat_pulldown',
    name: 'Puxada Frontal (Máquina)',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    equipment: 'cable',
    instructions: 'Sentado na puxada, segure a barra com pegada larga e puxe até a altura do queixo.',
  },
  {
    id: 'bent_over_row_barbell',
    name: 'Remada Curvada (Barra)',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    equipment: 'barbell',
    instructions: 'Incline o tronco a 45°, segure a barra e puxe até o abdômen mantendo os cotovelos próximos ao corpo.',
  },
  {
    id: 'seated_row',
    name: 'Remada Sentada (Cabo)',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    equipment: 'cable',
    instructions: 'Sentado na máquina, puxe o cabo até o abdômen mantendo o tronco ereto.',
  },
  {
    id: 'one_arm_row',
    name: 'Remada Unilateral (Haltere)',
    muscleGroup: 'back',
    secondaryMuscles: ['biceps'],
    equipment: 'dumbbell',
    instructions: 'Apoie um joelho e mão no banco, puxe o haltere até o quadril com o outro braço.',
  },
  {
    id: 'face_pull',
    name: 'Face Pull (Cabo)',
    muscleGroup: 'back',
    secondaryMuscles: ['shoulders'],
    equipment: 'cable',
    instructions: 'Com a polia alta, puxe o cabo em direção ao rosto com os cotovelos elevados.',
  },

  // ===== PERNAS =====
  {
    id: 'squat_barbell',
    name: 'Agachamento (Barra)',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes'],
    equipment: 'barbell',
    instructions: 'Barra nas costas, pés na largura dos ombros. Desça até as coxas ficarem paralelas ao chão.',
  },
  {
    id: 'leg_press',
    name: 'Leg Press 45°',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes'],
    equipment: 'machine',
    instructions: 'Sentado na máquina, empurre a plataforma até quase estender os joelhos. Não trave os joelhos.',
  },
  {
    id: 'leg_extension',
    name: 'Cadeira Extensora',
    muscleGroup: 'legs',
    secondaryMuscles: [],
    equipment: 'machine',
    instructions: 'Sentado na cadeira, estenda os joelhos até a posição horizontal.',
  },
  {
    id: 'leg_curl',
    name: 'Mesa Flexora',
    muscleGroup: 'legs',
    secondaryMuscles: [],
    equipment: 'machine',
    instructions: 'Deitado na mesa, flexione os joelhos puxando o peso em direção aos glúteos.',
  },
  {
    id: 'romanian_deadlift',
    name: 'Stiff (Levantamento Terra Romeno)',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes', 'back'],
    equipment: 'barbell',
    instructions: 'Em pé com a barra, incline o tronco mantendo as pernas quase estendidas até sentir o alongamento nos isquiotibiais.',
  },
  {
    id: 'lunge',
    name: 'Avanço (Lunge)',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes'],
    equipment: 'dumbbell',
    instructions: 'Dê um passo à frente e desça o joelho traseiro até próximo ao chão.',
  },
  {
    id: 'hack_squat',
    name: 'Hack Squat',
    muscleGroup: 'legs',
    secondaryMuscles: ['glutes'],
    equipment: 'machine',
    instructions: 'Na máquina de hack squat, desça até as coxas ficarem paralelas à plataforma.',
  },
  {
    id: 'calf_raise',
    name: 'Panturrilha em Pé',
    muscleGroup: 'calves',
    secondaryMuscles: [],
    equipment: 'machine',
    instructions: 'Em pé na máquina, eleve os calcanhares o máximo possível.',
  },

  // ===== OMBROS =====
  {
    id: 'overhead_press_barbell',
    name: 'Desenvolvimento (Barra)',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    equipment: 'barbell',
    instructions: 'Em pé ou sentado, empurre a barra acima da cabeça até os braços estarem estendidos.',
  },
  {
    id: 'overhead_press_dumbbell',
    name: 'Desenvolvimento (Haltere)',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['triceps'],
    equipment: 'dumbbell',
    instructions: 'Sentado ou em pé, empurre os halteres acima da cabeça.',
  },
  {
    id: 'lateral_raise',
    name: 'Elevação Lateral (Haltere)',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    equipment: 'dumbbell',
    instructions: 'Em pé, eleve os halteres lateralmente até a altura dos ombros com os cotovelos levemente flexionados.',
  },
  {
    id: 'front_raise',
    name: 'Elevação Frontal (Haltere)',
    muscleGroup: 'shoulders',
    secondaryMuscles: [],
    equipment: 'dumbbell',
    instructions: 'Em pé, eleve os halteres à frente até a altura dos ombros.',
  },
  {
    id: 'reverse_flye',
    name: 'Crucifixo Invertido',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['back'],
    equipment: 'dumbbell',
    instructions: 'Inclinado para frente, abra os braços lateralmente como um pássaro voando.',
  },
  {
    id: 'upright_row',
    name: 'Remada Alta (Barra)',
    muscleGroup: 'shoulders',
    secondaryMuscles: ['biceps'],
    equipment: 'barbell',
    instructions: 'Em pé, puxe a barra até a altura do queixo mantendo os cotovelos acima dos pulsos.',
  },

  // ===== BÍCEPS =====
  {
    id: 'barbell_curl',
    name: 'Rosca Direta (Barra)',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    equipment: 'barbell',
    instructions: 'Em pé, segure a barra com pegada supinada e flexione os cotovelos até a barra chegar aos ombros.',
  },
  {
    id: 'dumbbell_curl',
    name: 'Rosca Alternada (Haltere)',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    equipment: 'dumbbell',
    instructions: 'Em pé, flexione um braço de cada vez até o haltere chegar ao ombro.',
  },
  {
    id: 'hammer_curl',
    name: 'Rosca Martelo (Haltere)',
    muscleGroup: 'biceps',
    secondaryMuscles: ['forearms'],
    equipment: 'dumbbell',
    instructions: 'Com pegada neutra (polegar para cima), flexione os cotovelos.',
  },
  {
    id: 'preacher_curl',
    name: 'Rosca Scott',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    equipment: 'barbell',
    instructions: 'Apoie os braços no banco Scott e flexione os cotovelos.',
  },
  {
    id: 'concentration_curl',
    name: 'Rosca Concentrada',
    muscleGroup: 'biceps',
    secondaryMuscles: [],
    equipment: 'dumbbell',
    instructions: 'Sentado, apoie o cotovelo na coxa e flexione o braço.',
  },

  // ===== TRÍCEPS =====
  {
    id: 'tricep_pushdown',
    name: 'Tríceps Pulley (Cabo)',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    equipment: 'cable',
    instructions: 'Em pé na polia alta, empurre o cabo para baixo até os braços estarem estendidos.',
  },
  {
    id: 'skull_crusher',
    name: 'Tríceps Francês (Barra)',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    equipment: 'barbell',
    instructions: 'Deitado no banco, segure a barra acima do peito e desça até próximo à testa.',
  },
  {
    id: 'tricep_dip',
    name: 'Mergulho (Tríceps)',
    muscleGroup: 'triceps',
    secondaryMuscles: ['chest'],
    equipment: 'bodyweight',
    instructions: 'Nas barras paralelas, mantenha o tronco ereto e desça até os cotovelos formarem 90°.',
  },
  {
    id: 'overhead_tricep_extension',
    name: 'Extensão de Tríceps Acima da Cabeça',
    muscleGroup: 'triceps',
    secondaryMuscles: [],
    equipment: 'dumbbell',
    instructions: 'Segure um haltere com as duas mãos acima da cabeça e desça atrás da cabeça.',
  },
  {
    id: 'close_grip_bench',
    name: 'Supino Fechado (Tríceps)',
    muscleGroup: 'triceps',
    secondaryMuscles: ['chest'],
    equipment: 'barbell',
    instructions: 'Supino com pegada estreita (mãos na largura dos ombros), focando nos tríceps.',
  },

  // ===== ABDÔMEN =====
  {
    id: 'crunch',
    name: 'Abdominal (Crunch)',
    muscleGroup: 'abs',
    secondaryMuscles: [],
    equipment: 'bodyweight',
    instructions: 'Deitado, eleve o tronco contraindo o abdômen. Não puxe o pescoço.',
  },
  {
    id: 'plank',
    name: 'Prancha',
    muscleGroup: 'abs',
    secondaryMuscles: ['back'],
    equipment: 'bodyweight',
    instructions: 'Posição de flexão nos antebraços, mantenha o corpo reto como uma prancha.',
  },
  {
    id: 'leg_raise',
    name: 'Elevação de Pernas',
    muscleGroup: 'abs',
    secondaryMuscles: [],
    equipment: 'bodyweight',
    instructions: 'Deitado, eleve as pernas até 90° mantendo a lombar no chão.',
  },
  {
    id: 'russian_twist',
    name: 'Rotação Russa',
    muscleGroup: 'abs',
    secondaryMuscles: [],
    equipment: 'bodyweight',
    instructions: 'Sentado com o tronco inclinado, gire de um lado para o outro.',
  },
  {
    id: 'cable_crunch',
    name: 'Abdominal no Cabo',
    muscleGroup: 'abs',
    secondaryMuscles: [],
    equipment: 'cable',
    instructions: 'Ajoelhado na polia alta, puxe o cabo contraindo o abdômen.',
  },

  // ===== GLÚTEOS =====
  {
    id: 'hip_thrust',
    name: 'Hip Thrust (Barra)',
    muscleGroup: 'glutes',
    secondaryMuscles: ['legs'],
    equipment: 'barbell',
    instructions: 'Apoie as costas no banco, barra sobre os quadris. Eleve os quadris até o corpo ficar reto.',
  },
  {
    id: 'glute_bridge',
    name: 'Ponte de Glúteo',
    muscleGroup: 'glutes',
    secondaryMuscles: [],
    equipment: 'bodyweight',
    instructions: 'Deitado, pés no chão, eleve os quadris contraindo os glúteos.',
  },
  {
    id: 'sumo_squat',
    name: 'Agachamento Sumô',
    muscleGroup: 'glutes',
    secondaryMuscles: ['legs'],
    equipment: 'dumbbell',
    instructions: 'Pés mais afastados que os ombros com os pés apontando para fora. Agache profundamente.',
  },

  // ===== CARDIO =====
  {
    id: 'running',
    name: 'Corrida',
    muscleGroup: 'cardio',
    secondaryMuscles: [],
    equipment: 'other',
    instructions: 'Corrida em ritmo moderado a intenso.',
  },
  {
    id: 'cycling',
    name: 'Bicicleta',
    muscleGroup: 'cardio',
    secondaryMuscles: [],
    equipment: 'machine',
    instructions: 'Pedalada em bicicleta ergométrica ou ao ar livre.',
  },
  {
    id: 'jump_rope',
    name: 'Pular Corda',
    muscleGroup: 'cardio',
    secondaryMuscles: ['calves'],
    equipment: 'other',
    instructions: 'Pule a corda mantendo um ritmo constante.',
  },
  {
    id: 'rowing',
    name: 'Remo (Máquina)',
    muscleGroup: 'cardio',
    secondaryMuscles: ['back'],
    equipment: 'machine',
    instructions: 'Na máquina de remo, puxe com as costas e pernas em movimento coordenado.',
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return CLASSIC_EXERCISES.find((e) => e.id === id);
}

export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
  return CLASSIC_EXERCISES.filter((e) => e.muscleGroup === muscleGroup);
}

export function searchExercises(query: string): Exercise[] {
  const lower = query.toLowerCase();
  return CLASSIC_EXERCISES.filter(
    (e) =>
      e.name.toLowerCase().includes(lower) ||
      e.muscleGroup.toLowerCase().includes(lower)
  );
}
