export type MuscleGroupId =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'antebrazo'
  | 'cuadriceps'
  | 'isquios'
  | 'gluteos'
  | 'gemelos'
  | 'core';

export interface MuscleGroup {
  id: MuscleGroupId;
  name: string;
  short: string;
  color: string;
}

export type EquipId =
  | 'barra'
  | 'barraZ'
  | 'mancuerna'
  | 'maquina'
  | 'polea'
  | 'banco'
  | 'corporal'
  | 'banda'
  | 'kb'
  | 'smith'
  | 'disco'
  | 'paralelas'
  | 'barra_fija'
  | 'fitball'
  | 'cajon';

export interface EquipmentProfile {
  id: string;
  name: string;
  desc: string;
  equip: EquipId[];
}

export interface Exercise {
  id: string;
  n: string;              // Nombre
  g: MuscleGroupId;       // Grupo muscular principal
  s: string;              // Subgrupo / zona
  e: EquipId[];           // Equipamiento requerido
  p: string;              // Patrón de dibujo para la figura
  t: 'c' | 'a' | 'x';     // c=compuesto, a=aislado, x=core
  l: 1 | 2 | 3;           // Nivel: 1=principiante, 2=intermedio, 3=avanzado
  r: string;              // Repeticiones orientativas
  rest: number;           // Descanso recomendado en segundos
  u?: boolean;            // Unilateral
  sec?: MuscleGroupId[];  // Grupos musculares secundarios
  d?: string;             // Descripción / técnica
  k?: string[];           // Claves de ejecución
  m?: string[];           // Errores habituales
}

export interface RoutineExercise {
  exId: string;
  sets: number;
  reps: string;
  rest: number;
  note?: string;
}

export interface RoutineDay {
  id: string;
  name: string;
  focus?: MuscleGroupId[];
  estimated?: number;
  exercises: RoutineExercise[];
}

export interface RoutineMeta {
  days: number;
  level: number;
  profile: string;
  duration: number;
  split?: string;
  emphasis?: MuscleGroupId[];
  emphasisLevel?: number;
  volume?: Record<string, number>;
}

export interface Routine {
  id: string;
  name: string;
  createdAt: number;
  generated?: boolean;
  meta?: RoutineMeta;
  days: RoutineDay[];
}

export interface SessionSet {
  w: string | number;
  r: string | number;
  done?: boolean;
}

export interface SessionEntry {
  exId: string;
  uni?: boolean;
  reps?: string;
  rest?: number;
  sets: SessionSet[];
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO YYYY-MM-DD
  routineId?: string;
  routineName?: string;
  dayId?: string;
  dayName: string;
  entries: SessionEntry[];
  notes?: string;
  duration?: number; // minutos
}

export interface WeightRecord {
  date: string; // ISO YYYY-MM-DD
  kg: number;
}

export interface Settings {
  units: 'kg' | 'lb';
  level: 1 | 2 | 3;
  profile: string;
  days: number;
  weekdays: number[]; // 1=lunes ... 7=domingo
  duration: number;   // minutos por sesión
  autoRest: boolean;
  name: string;
}

export interface AppState {
  v: number;
  settings: Settings;
  routines: Routine[];
  activeRoutineId: string | null;
  logs: WorkoutLog[];
  weights: WeightRecord[];
  ui: {
    lastTab?: string;
    seenIntro?: boolean;
  };
}

export type TabName = 'hoy' | 'rutinas' | 'ejercicios' | 'progreso' | 'ajustes';

export type RouteState =
  | { name: 'hoy' }
  | { name: 'rutinas' }
  | { name: 'rutina'; id: string }
  | { name: 'ejercicios' }
  | { name: 'progreso' }
  | { name: 'ajustes' }
  | { name: 'sesion'; rid: string; dayId: string }
  | { name: 'editar'; rid?: string };
