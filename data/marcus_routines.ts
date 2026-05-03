/**
 * marcus_routines.ts
 *
 * Treinos do Marcus Cattem — Consultoria Corpo.Ciência
 * Prof. Dr. Leonardo Carvalho
 * Planejamento: 16/03/2026 – 16/05/2026
 * Objetivos: hipertrofia e emagrecimento
 *
 * Estrutura:
 * - exercises: array de ExerciseSlot (principal + alternativo opcional)
 * - isAlternative: true → exercício em cor cinza (substituto do anterior)
 * - technique: técnica prescrita
 * - repsRange: faixas de repetição por série (série 1-2, 3, 4-5)
 * - bisetGroup: número do bi-set (undefined = sem bi-set)
 */

export type Technique =
  | 'Tradicional'
  | 'Cluster-Set'
  | 'Isometria'
  | 'Rest-Pause'
  | 'Repetições parciais'
  | 'Bi-Set'
  | 'Circuito';

export interface ExerciseSlot {
  /** ID único do exercício */
  id: string;
  /** Nome do exercício */
  name: string;
  /** Músculo principal */
  muscle: string;
  /** Sinergistas */
  synergists: string[];
  /** Número de séries */
  sets: number;
  /** Faixas de reps: [série1-2, série3, série4-5] ou string única */
  repsRange: string;
  /** Técnica prescrita */
  technique: Technique;
  /** É exercício alternativo (cinza)? */
  isAlternative?: boolean;
  /** Índice do exercício principal ao qual este é alternativo (0-based) */
  alternativeFor?: number;
  /** Grupo de bi-set (undefined = sem bi-set) */
  bisetGroup?: number;
  /** Notas adicionais */
  notes?: string;
}

export interface MarcusRoutine {
  id: string;
  name: string;
  weekday: string;
  warmup: string;
  exercises: ExerciseSlot[];
}

// ─── TREINO A — Segunda-feira ─────────────────────────────────────────────────

const treinoA: MarcusRoutine = {
  id: 'marcus_A',
  name: 'Treino A',
  weekday: 'Segunda-feira',
  warmup:
    'Mobilidade/alongamento 2×15s; 1 série de 30 reps de manguito rotador; 1 série de 30 reps no 1º exercício.',
  exercises: [
    {
      id: 'a_levterra',
      name: 'Levantamento terra',
      muscle: 'Quadríceps',
      synergists: ['Costas', 'Post. Coxa'],
      sets: 5,
      repsRange: '4-6',
      technique: 'Cluster-Set',
    },
    {
      id: 'a_cadflexora',
      name: 'Cadeira flexora com tronco à frente',
      muscle: 'Post. Coxa',
      synergists: ['Panturrilha'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Isometria',
      isAlternative: true,
      alternativeFor: 0,
    },
    {
      id: 'a_mesaflex',
      name: 'Mesa flexora',
      muscle: 'Post. Coxa',
      synergists: ['Panturrilha'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Isometria',
    },
    {
      id: 'a_remserrote',
      name: 'Remada serrote com halter',
      muscle: 'Costas',
      synergists: ['Bíceps'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'a_remunilat',
      name: 'Remada unilateral ajoelhado na polia',
      muscle: 'Costas',
      synergists: ['Bíceps'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 3,
    },
    {
      id: 'a_supbarra',
      name: 'Supino reto com barra',
      muscle: 'Peitoral',
      synergists: ['Tríceps', 'Ombro'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'a_suparticulado',
      name: 'Supino reto articulado',
      muscle: 'Peitoral',
      synergists: ['Tríceps', 'Ombro'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 5,
    },
    {
      id: 'a_scottplate',
      name: 'Rosca scott - plate loaded',
      muscle: 'Bíceps',
      synergists: ['Antebraço'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Repetições parciais',
      bisetGroup: 1,
    },
    {
      id: 'a_roscaalt',
      name: 'Rosca alternada com halter',
      muscle: 'Bíceps',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
      bisetGroup: 1,
    },
    {
      id: 'a_triccoice',
      name: 'Tríceps coice na polia',
      muscle: 'Tríceps',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
    },
    {
      id: 'a_tricmaq',
      name: 'Tríceps na máquina',
      muscle: 'Tríceps',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
      isAlternative: true,
      alternativeFor: 9,
    },
  ],
};

// ─── TREINO B — Terça-feira ───────────────────────────────────────────────────

const treinoB: MarcusRoutine = {
  id: 'marcus_B',
  name: 'Treino B',
  weekday: 'Terça-feira',
  warmup:
    'Mobilidade/alongamento 2×15s; 1 série de 20 reps de supino unilateral com kettlebell; 1 série de 30 reps no 1º exercício.',
  exercises: [
    {
      id: 'b_remcavalinho',
      name: 'Remada cavalinho no aparelho',
      muscle: 'Costas',
      synergists: ['Bíceps'],
      sets: 5,
      repsRange: '4-6',
      technique: 'Cluster-Set',
    },
    {
      id: 'b_remcurvada',
      name: 'Remada curvada pronada com barra',
      muscle: 'Costas',
      synergists: ['Bíceps', 'Lombar'],
      sets: 5,
      repsRange: '4-6',
      technique: 'Cluster-Set',
      isAlternative: true,
      alternativeFor: 0,
    },
    {
      id: 'b_crucmaq',
      name: 'Crucifixo na máquina',
      muscle: 'Peitoral',
      synergists: ['Ombro'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Repetições parciais',
      bisetGroup: 1,
    },
    {
      id: 'b_elevfrontal',
      name: 'Elevação frontal supinada com barra w',
      muscle: 'Ombro',
      synergists: ['Peitoral'],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Tradicional',
      bisetGroup: 1,
    },
    {
      id: 'b_roscabarraw',
      name: 'Rosca direta com barra w',
      muscle: 'Bíceps',
      synergists: ['Antebraço'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
    },
    {
      id: 'b_bicepsmaq',
      name: 'Bíceps na máquina',
      muscle: 'Bíceps',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
      isAlternative: true,
      alternativeFor: 4,
    },
    {
      id: 'b_pendulum',
      name: 'Pendulum squat',
      muscle: 'Quadríceps',
      synergists: ['Glúteo', 'Abdômen'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'b_reversevs',
      name: 'Reverse v-squat',
      muscle: 'Quadríceps',
      synergists: ['Glúteo'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 6,
    },
    {
      id: 'b_cadabdutora',
      name: 'Cadeira abdutora articulada',
      muscle: 'Glúteo',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Isometria',
    },
    {
      id: 'b_abdrevbola',
      name: 'Abdominal reverso na bola',
      muscle: 'Abdômen',
      synergists: [],
      sets: 5,
      repsRange: 'Máximo',
      technique: 'Tradicional',
    },
    {
      id: 'b_abdmaq',
      name: 'Abdominal na máquina',
      muscle: 'Abdômen',
      synergists: [],
      sets: 5,
      repsRange: '8-12',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 9,
    },
  ],
};

// ─── TREINO C — Quarta-feira ──────────────────────────────────────────────────

const treinoC: MarcusRoutine = {
  id: 'marcus_C',
  name: 'Treino C',
  weekday: 'Quarta-feira',
  warmup:
    'Mobilidade/alongamento 2×15s; 1 série de 30 reps de manguito rotador; 1 série de 30 reps no 1º exercício.',
  exercises: [
    {
      id: 'c_cadext',
      name: 'Cadeira extensora (plate-loaded)',
      muscle: 'Quadríceps',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'c_panthack',
      name: 'Panturrilha no hack com pés neutros',
      muscle: 'Panturrilha',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Tradicional',
    },
    {
      id: 'c_pantlegpress',
      name: 'Panturrilha no leg-press 45° com pés neutros',
      muscle: 'Panturrilha',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 1,
    },
    {
      id: 'c_bancromano',
      name: 'Banco romano',
      muscle: 'Lombar',
      synergists: ['Post. Coxa', 'Glúteo'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Isometria',
    },
    {
      id: 'c_bomdia',
      name: 'Bom dia com barra',
      muscle: 'Post. Coxa',
      synergists: ['Lombar', 'Glúteo'],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Isometria',
      isAlternative: true,
      alternativeFor: 3,
    },
    {
      id: 'c_supmaqdeit',
      name: 'Supino reto na máquina deitado',
      muscle: 'Peitoral',
      synergists: ['Tríceps', 'Ombro'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'c_tricparal',
      name: 'Tríceps paralelas na máquina',
      muscle: 'Tríceps',
      synergists: ['Peitoral', 'Ombro'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
    },
    {
      id: 'c_crucfinvpolia',
      name: 'Crucifixo inverso na polia alta',
      muscle: 'Ombro',
      synergists: ['Trapézio'],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Repetições parciais',
    },
    {
      id: 'c_crucfinvmaq',
      name: 'Crucifixo inverso na máquina',
      muscle: 'Ombro',
      synergists: ['Trapézio'],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Repetições parciais',
      isAlternative: true,
      alternativeFor: 7,
    },
    {
      id: 'c_rotantebraco',
      name: 'Rotação de antebraço com kettlebell',
      muscle: 'Antebraço',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'c_roscapunho',
      name: 'Rosca punho na polia',
      muscle: 'Antebraço',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 9,
    },
  ],
};

// ─── TREINO D — Quinta-feira ──────────────────────────────────────────────────

const treinoD: MarcusRoutine = {
  id: 'marcus_D',
  name: 'Treino D',
  weekday: 'Quinta-feira',
  warmup:
    'Mobilidade/alongamento 2×15s; 1 série de 20 reps de supino unilateral com kettlebell; 1 série de 30 reps no 1º exercício.',
  exercises: [
    {
      id: 'd_devbarra',
      name: 'Desenvolvimento com barra em pé',
      muscle: 'Ombro',
      synergists: ['Tríceps', 'Trapézio'],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Tradicional',
    },
    {
      id: 'd_devarnold',
      name: 'Desenvolvimento Arnold sentado',
      muscle: 'Ombro',
      synergists: ['Tríceps', 'Trapézio'],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 0,
    },
    {
      id: 'd_pulleyapoio',
      name: 'Pulley articulado com apoio de tronco',
      muscle: 'Costas',
      synergists: ['Bíceps'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Isometria',
    },
    {
      id: 'd_barrafixa',
      name: 'Barra fixa pronada',
      muscle: 'Costas',
      synergists: ['Bíceps'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Isometria',
      isAlternative: true,
      alternativeFor: 2,
    },
    {
      id: 'd_rosca45',
      name: 'Rosca com halter no banco 45°',
      muscle: 'Bíceps',
      synergists: ['Antebraço'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Repetições parciais',
    },
    {
      id: 'd_trictesta',
      name: 'Tríceps testa com barra w',
      muscle: 'Tríceps',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'd_legpress',
      name: 'Leg-Press 45°',
      muscle: 'Quadríceps',
      synergists: ['Glúteo'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'd_beltsquat',
      name: 'Belt squat',
      muscle: 'Quadríceps',
      synergists: ['Glúteo'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 6,
    },
    {
      id: 'd_flexpe',
      name: 'Flexora em pé',
      muscle: 'Post. Coxa',
      synergists: ['Panturrilha'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
    },
    {
      id: 'd_abdgiro',
      name: 'Abdominal giro russo no landmine',
      muscle: 'Abdômen',
      synergists: [],
      sets: 5,
      repsRange: '8-12',
      technique: 'Tradicional',
    },
    {
      id: 'd_woodchopper',
      name: 'Cable woodchopper',
      muscle: 'Abdômen',
      synergists: [],
      sets: 5,
      repsRange: '8-12',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 9,
    },
  ],
};

// ─── TREINO E — Sexta-feira ───────────────────────────────────────────────────

const treinoE: MarcusRoutine = {
  id: 'marcus_E',
  name: 'Treino E',
  weekday: 'Sexta-feira',
  warmup:
    'Mobilidade/alongamento 2×15s; 1 série de 30 reps de manguito rotador; 1 série de 30 reps no 1º exercício.',
  exercises: [
    {
      id: 'e_stiff',
      name: 'Stiff com barra',
      muscle: 'Post. Coxa',
      synergists: ['Glúteo', 'Lombar'],
      sets: 5,
      repsRange: '4-6',
      technique: 'Cluster-Set',
    },
    {
      id: 'e_nordica',
      name: 'Flexão nórdica',
      muscle: 'Post. Coxa',
      synergists: ['Panturrilha'],
      sets: 5,
      repsRange: '4-6',
      technique: 'Cluster-Set',
      isAlternative: true,
      alternativeFor: 0,
    },
    {
      id: 'e_solear',
      name: 'Cadeira solear',
      muscle: 'Panturrilha',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Repetições parciais',
    },
    {
      id: 'e_crucincl',
      name: 'Crucifixo inclinado no aparelho',
      muscle: 'Peitoral',
      synergists: ['Ombro'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'e_crossover',
      name: 'Cross over polia baixa',
      muscle: 'Peitoral',
      synergists: ['Ombro'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 3,
    },
    {
      id: 'e_remarticulada',
      name: 'Remada articulada com pegada neutra',
      muscle: 'Costas',
      synergists: ['Bíceps'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
    },
    {
      id: 'e_rembaixa',
      name: 'Remada baixa com triângulo',
      muscle: 'Costas',
      synergists: ['Bíceps'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
      isAlternative: true,
      alternativeFor: 5,
    },
    {
      id: 'e_scottunilat',
      name: 'Rosca Scott unilateral com halter',
      muscle: 'Bíceps',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Isometria',
    },
    {
      id: 'e_roscapoliaalt',
      name: 'Rosca na polia alta unilateral',
      muscle: 'Bíceps',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Isometria',
      isAlternative: true,
      alternativeFor: 7,
    },
    {
      id: 'e_elevlatmaq',
      name: 'Elevação lateral na máquina em pé',
      muscle: 'Ombro',
      synergists: ['Trapézio'],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Tradicional',
      bisetGroup: 1,
    },
    {
      id: 'e_remadaalta',
      name: 'Remada alta com barra',
      muscle: 'Ombro',
      synergists: ['Trapézio'],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Tradicional',
      bisetGroup: 1,
    },
  ],
};

// ─── TREINO F — Sábado ────────────────────────────────────────────────────────

const treinoF: MarcusRoutine = {
  id: 'marcus_F',
  name: 'Treino F',
  weekday: 'Sábado',
  warmup:
    'Mobilidade/alongamento 2×15s; 1 série de 20 reps de supino unilateral com kettlebell; 1 série de 30 reps no 1º exercício.',
  exercises: [
    {
      id: 'f_pulleytri',
      name: 'Pulley frente triângulo',
      muscle: 'Costas',
      synergists: ['Bíceps'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'f_supincl',
      name: 'Supino inclinado com barra (banco 30°)',
      muscle: 'Peitoral',
      synergists: ['Tríceps', 'Ombro'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'f_supinclmaq',
      name: 'Supino inclinado máquina guiada',
      muscle: 'Peitoral',
      synergists: ['Tríceps', 'Ombro'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 1,
    },
    {
      id: 'f_tricfrances',
      name: 'Tríceps francês na polia média com corda',
      muscle: 'Tríceps',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
    },
    {
      id: 'f_tricfrancesw',
      name: 'Tríceps francês com barra W',
      muscle: 'Tríceps',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
      isAlternative: true,
      alternativeFor: 3,
    },
    {
      id: 'f_afundosmith',
      name: 'Afundo com recuo no smith',
      muscle: 'Glúteo',
      synergists: ['Quadríceps'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'f_agachbulg',
      name: 'Agachamento búlgaro no aparelho',
      muscle: 'Quadríceps',
      synergists: ['Glúteo', 'Abdômen'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'f_elevpelv',
      name: 'Elevação pélvica na máquina',
      muscle: 'Glúteo',
      synergists: ['Quadríceps'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Repetições parciais',
    },
    {
      id: 'f_gripper',
      name: 'Gripper machine',
      muscle: 'Antebraço',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Isometria',
    },
    {
      id: 'f_skincat',
      name: 'Skin the cat',
      muscle: 'Abdômen',
      synergists: [],
      sets: 5,
      repsRange: 'Máximo',
      technique: 'Tradicional',
    },
    {
      id: 'f_frontlever',
      name: 'Progressões front lever',
      muscle: 'Abdômen',
      synergists: ['Costas'],
      sets: 5,
      repsRange: 'Máximo',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 9,
    },
  ],
};

// ─── TREINO G — Domingo ───────────────────────────────────────────────────────

const treinoG: MarcusRoutine = {
  id: 'marcus_G',
  name: 'Treino G',
  weekday: 'Domingo',
  warmup:
    'Mobilidade/alongamento 2×15s; 1 série de 30 reps de manguito rotador; 1 série de 30 reps no 1º exercício.',
  exercises: [
    {
      id: 'g_sumobeltsquat',
      name: 'Sumo belt squat',
      muscle: 'Quadríceps',
      synergists: ['Glúteo', 'Abdômen'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'g_agachsumo',
      name: 'Agachamento sumô no smith',
      muscle: 'Quadríceps',
      synergists: ['Glúteo', 'Abdômen'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 0,
    },
    {
      id: 'g_cadadutor',
      name: 'Cadeira adutora',
      muscle: 'Outros',
      synergists: [],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Repetições parciais',
    },
    {
      id: 'g_pullover',
      name: 'Pull over máquina',
      muscle: 'Peitoral',
      synergists: ['Costas'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
    },
    {
      id: 'g_pulloverpolia',
      name: 'Pull over na polia',
      muscle: 'Costas',
      synergists: ['Peitoral'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Rest-Pause',
      isAlternative: true,
      alternativeFor: 3,
    },
    {
      id: 'g_tricparalelas',
      name: 'Tríceps nas paralelas',
      muscle: 'Tríceps',
      synergists: ['Peitoral', 'Ombro'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Tradicional',
    },
    {
      id: 'g_flexdiamante',
      name: 'Flexão de braços diamante',
      muscle: 'Peitoral',
      synergists: ['Tríceps', 'Ombro'],
      sets: 5,
      repsRange: 'Máximo',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 5,
    },
    {
      id: 'g_elevcomb',
      name: 'Elevação combinada',
      muscle: 'Ombro',
      synergists: ['Trapézio'],
      sets: 5,
      repsRange: '8-12 / 6-8',
      technique: 'Tradicional',
      bisetGroup: 1,
    },
    {
      id: 'g_roscamartelo',
      name: 'Rosca martelo com halter',
      muscle: 'Bíceps',
      synergists: ['Antebraço'],
      sets: 5,
      repsRange: '8-12 / 6-8 / 4-6',
      technique: 'Isometria',
      bisetGroup: 1,
    },
    {
      id: 'g_abdrodinha',
      name: 'Abdominal com rodinha',
      muscle: 'Abdômen',
      synergists: ['Lombar'],
      sets: 5,
      repsRange: '8-12',
      technique: 'Tradicional',
    },
    {
      id: 'g_abdcanivete',
      name: 'Abdominal canivete com anilha',
      muscle: 'Abdômen',
      synergists: [],
      sets: 5,
      repsRange: '8-12',
      technique: 'Tradicional',
      isAlternative: true,
      alternativeFor: 9,
    },
  ],
};

// ─── TREINO DE PLIOMETRIA ─────────────────────────────────────────────────────

const treinoPlio: MarcusRoutine = {
  id: 'marcus_plio',
  name: 'Pliometria',
  weekday: 'Opcional',
  warmup: 'Mobilidade/alongamento 2×15s.',
  exercises: [
    {
      id: 'plio_saltounilat',
      name: 'Salto unilateral no caixote',
      muscle: 'Quadríceps',
      synergists: ['Glúteo', 'Panturrilha'],
      sets: 3,
      repsRange: '6-8',
      technique: 'Tradicional',
    },
    {
      id: 'plio_flexsuperman',
      name: 'Flexão de braços superman',
      muscle: 'Peitoral',
      synergists: ['Tríceps', 'Ombro'],
      sets: 3,
      repsRange: '6-8',
      technique: 'Tradicional',
    },
    {
      id: 'plio_stepup',
      name: 'Plyometric step up',
      muscle: 'Glúteo',
      synergists: ['Quadríceps', 'Panturrilha'],
      sets: 3,
      repsRange: '6-8',
      technique: 'Tradicional',
    },
    {
      id: 'plio_dropjump',
      name: 'Drop jump',
      muscle: 'Quadríceps',
      synergists: ['Panturrilha', 'Glúteo'],
      sets: 3,
      repsRange: '6-8',
      technique: 'Tradicional',
    },
    {
      id: 'plio_afundosalto',
      name: 'Afundo com salto',
      muscle: 'Quadríceps',
      synergists: ['Glúteo', 'Abdômen'],
      sets: 3,
      repsRange: '6-8',
      technique: 'Tradicional',
    },
  ],
};

// ─── TREINO DE ARGOLAS ────────────────────────────────────────────────────────

const treinoArgolas: MarcusRoutine = {
  id: 'marcus_argolas',
  name: 'Argolas',
  weekday: 'Opcional',
  warmup: 'Mobilidade/alongamento 2×15s.',
  exercises: [
    {
      id: 'arg_muscleup',
      name: 'Muscle up',
      muscle: 'Costas',
      synergists: ['Bíceps', 'Tríceps'],
      sets: 3,
      repsRange: 'Máximo',
      technique: 'Tradicional',
    },
    {
      id: 'arg_rolema',
      name: 'Rolemã argolas',
      muscle: 'Abdômen',
      synergists: ['Costas'],
      sets: 3,
      repsRange: 'Máximo',
      technique: 'Tradicional',
    },
    {
      id: 'arg_skincat',
      name: 'Skin the cat',
      muscle: 'Abdômen',
      synergists: [],
      sets: 3,
      repsRange: 'Máximo',
      technique: 'Tradicional',
    },
    {
      id: 'arg_ringdips',
      name: 'Ring dips',
      muscle: 'Tríceps',
      synergists: ['Peitoral', 'Ombro'],
      sets: 3,
      repsRange: 'Máximo',
      technique: 'Tradicional',
    },
    {
      id: 'arg_abdinfra',
      name: 'Abdominal infra nas argolas',
      muscle: 'Abdômen',
      synergists: [],
      sets: 3,
      repsRange: 'Máximo',
      technique: 'Tradicional',
    },
  ],
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const MARCUS_ROUTINES: MarcusRoutine[] = [
  treinoA,
  treinoB,
  treinoC,
  treinoD,
  treinoE,
  treinoF,
  treinoG,
  treinoPlio,
  treinoArgolas,
];

export const MARCUS_WEEKDAY_MAP: Record<string, string> = {
  Segunda: 'marcus_A',
  Terça: 'marcus_B',
  Quarta: 'marcus_C',
  Quinta: 'marcus_D',
  Sexta: 'marcus_E',
  Sábado: 'marcus_F',
  Domingo: 'marcus_G',
};
