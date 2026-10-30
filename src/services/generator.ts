import { Exercise, MuscleGroupId, MuscleGroup, Routine, RoutineDay } from '../types';
import { GROUPS, PROFILES, EXERCISES_BY_ID, EXERCISES_BY_GROUP, VOLUME_TARGET, getGroupById } from '../data/exercises';

export const SPLITS: Record<number, { name: string; focus: MuscleGroupId[] }[]> = {
  1: [
    { name: 'Cuerpo completo', focus: ['cuadriceps', 'pecho', 'espalda', 'hombros', 'isquios', 'core'] }
  ],
  2: [
    { name: 'Cuerpo completo A', focus: ['cuadriceps', 'pecho', 'espalda', 'core'] },
    { name: 'Cuerpo completo B', focus: ['isquios', 'gluteos', 'hombros', 'espalda', 'biceps', 'triceps'] }
  ],
  3: [
    { name: 'Empuje', focus: ['pecho', 'hombros', 'triceps'] },
    { name: 'Tirón', focus: ['espalda', 'biceps', 'core'] },
    { name: 'Pierna', focus: ['cuadriceps', 'isquios', 'gluteos', 'core', 'gemelos'] }
  ],
  4: [
    { name: 'Torso A', focus: ['pecho', 'espalda', 'hombros', 'triceps', 'core'] },
    { name: 'Pierna A', focus: ['cuadriceps', 'gluteos', 'isquios', 'gemelos', 'core'] },
    { name: 'Torso B', focus: ['espalda', 'pecho', 'hombros', 'biceps', 'core'] },
    { name: 'Pierna B', focus: ['isquios', 'gluteos', 'cuadriceps', 'core', 'gemelos'] }
  ],
  5: [
    { name: 'Empuje', focus: ['pecho', 'hombros', 'triceps'] },
    { name: 'Tirón', focus: ['espalda', 'biceps', 'core'] },
    { name: 'Pierna', focus: ['cuadriceps', 'isquios', 'gluteos', 'core'] },
    { name: 'Torso', focus: ['pecho', 'espalda', 'hombros', 'biceps', 'triceps'] },
    { name: 'Pierna 2', focus: ['gluteos', 'isquios', 'cuadriceps', 'gemelos', 'core'] }
  ]
};

export const SPLIT_LABEL: Record<number, string> = {
  1: 'Full body',
  2: 'Full body A/B',
  3: 'Empuje · Tirón · Pierna',
  4: 'Torso · Pierna (x2)',
  5: 'PPL + Torso · Pierna'
};

const FAMILIES: Record<MuscleGroupId, MuscleGroupId[]> = {
  pecho: ['pecho', 'hombros', 'triceps'],
  espalda: ['espalda', 'biceps'],
  cuadriceps: ['cuadriceps', 'gluteos', 'isquios'],
  isquios: ['isquios', 'gluteos', 'cuadriceps'],
  gluteos: ['gluteos', 'isquios', 'cuadriceps'],
  hombros: ['hombros', 'pecho', 'triceps'],
  biceps: ['biceps', 'espalda'],
  triceps: ['triceps', 'pecho', 'hombros'],
  core: ['core', 'pecho', 'espalda', 'cuadriceps'],
  gemelos: ['gemelos', 'cuadriceps', 'isquios'],
  antebrazo: ['antebrazo', 'biceps']
};

const PRIORITY: MuscleGroupId[] = [
  'cuadriceps',
  'espalda',
  'pecho',
  'gluteos',
  'isquios',
  'hombros',
  'biceps',
  'triceps',
  'core',
  'gemelos',
  'antebrazo'
];

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

export function allowedEquip(profileId: string): string[] {
  const p = PROFILES.find((x) => x.id === profileId);
  return p ? p.equip : PROFILES[0].equip;
}

export function fitEquipment(ex: Exercise, allowed: string[]): boolean {
  for (let i = 0; i < ex.e.length; i++) {
    if (ex.e[i] === 'corporal') return true;
    if (allowed.includes(ex.e[i])) return true;
  }
  return false;
}

export function fitsLevel(ex: Exercise, level: number): boolean {
  return ex.l <= level + 1;
}

export function exerciseSeconds(ex: Exercise | { rest: number; r: string }, sets: number): number {
  const work = ex.r && ex.r.includes('s') ? Number(ex.r.replace(/[^0-9]/g, '')) || 40 : 40;
  return sets * (work + ex.rest);
}

export function estimateMinutes(day: { exercises: { exId: string; sets: number }[] }): number {
  let s = 5 * 60; // 5 min calentamiento
  day.exercises.forEach((e) => {
    s += exerciseSeconds(EXERCISES_BY_ID[e.exId] || { rest: 90, r: '10' }, e.sets);
  });
  return Math.round(s / 60);
}

export interface GenerateOptions {
  days?: number;
  level?: 1 | 2 | 3;
  profile?: string;
  duration?: number;
  emphasis?: MuscleGroupId[];
  emphasisLevel?: number;
  name?: string;
}

export function generateRoutine(opts: GenerateOptions = {}): Routine {
  const days = clamp(opts.days || 3, 1, 5);
  const level = clamp(opts.level || 2, 1, 3);
  const profile = opts.profile || 'completo';
  const duration = clamp(opts.duration || 45, 20, 120);
  const emphasis = (opts.emphasis || []).slice();
  const emphasisLevel = clamp(opts.emphasisLevel || 2, 1, 3);
  const emphasisSet: Record<string, boolean> = {};
  emphasis.forEach((g) => {
    emphasisSet[g] = true;
  });
  const allowed = allowedEquip(profile);

  const split = SPLITS[days] || SPLITS[3];
  const usedWeek: Record<string, boolean> = {}; // exId -> true

  const plan: { name: string; focus: MuscleGroupId[]; exercises: any[]; estimated?: number }[] = split.map((d) => ({
    name: d.name,
    focus: d.focus.slice(),
    exercises: []
  }));

  // Añade grupos enfatizados a días compatibles
  emphasis.forEach((g) => {
    if (!EXERCISES_BY_GROUP[g] || !EXERCISES_BY_GROUP[g].length) return;
    const present = plan.some((d) => d.focus.includes(g));
    if (present) return;
    const fam = FAMILIES[g] || [g];
    let best = -1;
    let bestScore = -1;
    plan.forEach((d, i) => {
      const sc = d.focus.filter((x) => fam.includes(x)).length;
      if (sc > bestScore) {
        bestScore = sc;
        best = i;
      }
    });
    if (best < 0) best = 0;
    plan[best].focus.push(g);
  });

  const maxEx = clamp(Math.round((duration - 5) / 6.2), 3, 12);

  plan.forEach((day) => {
    const focus = day.focus.filter((g) => EXERCISES_BY_GROUP[g] && EXERCISES_BY_GROUP[g].length);
    const slots: { g: MuscleGroupId; order: number }[] = [];

    // 1 ejercicio por grupo
    focus.forEach((g) => slots.push({ g, order: 0 }));

    // extras: grupos enfatizados primero
    const extraOrder: MuscleGroupId[] = [];
    emphasis.forEach((g) => {
      if (focus.includes(g) && !extraOrder.includes(g)) extraOrder.push(g);
    });
    PRIORITY.forEach((g) => {
      if (focus.includes(g) && !extraOrder.includes(g)) extraOrder.push(g);
    });

    let guard = 0;
    while (slots.length < maxEx && guard++ < 60) {
      let added = false;
      for (let i = 0; i < extraOrder.length && slots.length < maxEx; i++) {
        const g = extraOrder[i];
        const count = slots.filter((s) => s.g === g).length;
        const isEmph = !!emphasisSet[g];
        let cap: number;
        if (g === 'core' || g === 'gemelos' || g === 'antebrazo') {
          cap = isEmph ? 3 : g === 'core' ? 2 : 1;
        } else {
          cap = isEmph ? 4 : 3;
        }
        if (count > 0 && count < cap) {
          slots.push({ g, order: count });
          added = true;
          break;
        }
      }
      if (!added) break;
    }

    // orden final: compuestos/grandes primero, core al final
    slots.sort((a, b) => {
      return PRIORITY.indexOf(a.g) - PRIORITY.indexOf(b.g) || a.order - b.order;
    });

    const usedToday: Record<string, boolean> = {};
    const patterns: Record<string, boolean> = {};

    slots.forEach((slot, idx) => {
      const cands = EXERCISES_BY_GROUP[slot.g] || [];
      let best: Exercise | null = null;
      let bestScore = -1e9;

      cands.forEach((ex) => {
        if (!fitEquipment(ex, allowed)) return;
        if (!fitsLevel(ex, level)) return;
        if (usedToday[ex.id]) return;
        let score = Math.random() * 4;
        if (!usedWeek[ex.id]) score += 5;
        if (slot.order === 0) score += ex.t === 'c' ? 7 : -1;
        else score += ex.t === 'a' ? 3 : 0.5;
        if (!patterns[ex.p]) score += 2;
        if (ex.l > level) score -= 1.5;
        if (idx === 0 && ex.t === 'c') score += 3;
        if (best === null || score > bestScore) {
          best = ex;
          bestScore = score;
        }
      });

      if (!best) {
        cands.some((ex) => {
          if (fitEquipment(ex, allowed) && !usedToday[ex.id]) {
            best = ex;
            return true;
          }
          return false;
        });
      }

      if (!best) return;
      const chosen = best as Exercise;
      usedToday[chosen.id] = true;
      usedWeek[chosen.id] = true;
      patterns[chosen.p] = true;
      day.exercises.push({
        exId: chosen.id,
        sets: 3,
        reps: chosen.r,
        rest: chosen.rest,
        note: ''
      });
    });

    // Ajuste de series al tiempo objetivo
    const budget = duration * 60;
    let total =
      5 * 60 +
      day.exercises.reduce((a, e) => {
        return a + exerciseSeconds(EXERCISES_BY_ID[e.exId] || { rest: 90, r: '10' }, e.sets);
      }, 0);

    // Más volumen a compuestos de grupos enfatizados si sobra tiempo
    day.exercises.forEach((e, idx) => {
      const ex = EXERCISES_BY_ID[e.exId];
      if (!ex || ex.t !== 'c') return;
      if (!emphasisSet[ex.g]) return;
      if (idx > 1) return;
      if (e.sets >= 5) return;
      const cost = exerciseSeconds(ex, 1);
      if (total + cost <= budget - 45) {
        e.sets += 1;
        total += cost;
      }
    });

    // Primer compuesto
    const first = day.exercises[0];
    if (first && total + exerciseSeconds(EXERCISES_BY_ID[first.exId] || { rest: 120, r: '10' }, 1) <= budget - 60) {
      if ((EXERCISES_BY_ID[first.exId] || {}).t === 'c' && level >= 2) {
        first.sets += 1;
        total =
          5 * 60 +
          day.exercises.reduce((a, e) => {
            return a + exerciseSeconds(EXERCISES_BY_ID[e.exId] || { rest: 90, r: '10' }, e.sets);
          }, 0);
      }
    }

    // Si se pasa del tiempo presupuestado, recortar
    let i = day.exercises.length - 1;
    while (total > budget + 45 && i >= 0) {
      const e = day.exercises[i];
      if (e.sets > 2) {
        e.sets -= 1;
        total =
          5 * 60 +
          day.exercises.reduce((a, x) => {
            return a + exerciseSeconds(EXERCISES_BY_ID[x.exId] || { rest: 90, r: '10' }, x.sets);
          }, 0);
      } else {
        i--;
      }
    }

    if (total > budget + 45) {
      while (total > budget + 45 && day.exercises.length > 3) {
        const last = day.exercises.pop();
        if (last) usedWeek[last.exId] = false;
        total =
          5 * 60 +
          day.exercises.reduce((a, x) => {
            return a + exerciseSeconds(EXERCISES_BY_ID[x.exId] || { rest: 90, r: '10' }, x.sets);
          }, 0);
      }
    }

    day.estimated = Math.round(total / 60);
  });

  // Volumen semanal resultante
  const weekly: Record<string, number> = {};
  plan.forEach((d) => {
    d.exercises.forEach((e) => {
      const ex = EXERCISES_BY_ID[e.exId];
      if (!ex) return;
      weekly[ex.g] = (weekly[ex.g] || 0) + e.sets;
      (ex.sec || []).forEach((g) => {
        weekly[g] = (weekly[g] || 0) + e.sets * 0.5;
      });
    });
  });

  const routine: Routine = {
    id: 'rt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: opts.name || `Rutina ${days} días`,
    generated: true,
    createdAt: Date.now(),
    meta: {
      days: days,
      level: level,
      profile: profile,
      duration: duration,
      split: SPLIT_LABEL[days],
      emphasis: emphasis,
      emphasisLevel: emphasisLevel,
      volume: weekly
    },
    days: plan.map((d, idx) => ({
      id: 'd' + (idx + 1),
      name: d.name,
      focus: d.focus,
      estimated: d.estimated,
      exercises: d.exercises
    }))
  };

  return routine;
}

export interface BalanceReportItem {
  group: MuscleGroup;
  sets: number;
  target: number;
  status: 'bajo' | 'ok' | 'alto';
  emphasized: boolean;
}

export function balanceReport(routine: Routine): BalanceReportItem[] {
  const weekly: Record<string, number> = {};
  routine.days.forEach((d) => {
    d.exercises.forEach((e) => {
      const ex = EXERCISES_BY_ID[e.exId];
      if (!ex) return;
      weekly[ex.g] = (weekly[ex.g] || 0) + e.sets;
      (ex.sec || []).forEach((g) => {
        weekly[g] = (weekly[g] || 0) + e.sets * 0.5;
      });
    });
  });

  const emph = routine.meta?.emphasis || [];
  const emphSet: Record<string, boolean> = {};
  emph.forEach((g) => {
    emphSet[g] = true;
  });

  const out: BalanceReportItem[] = [];
  GROUPS.forEach((g) => {
    const n = Math.round(weekly[g.id] || 0);
    if (!n) return;
    const target = VOLUME_TARGET[g.id] || 8;
    const status = n < target * 0.6 ? 'bajo' : n > target * 1.8 ? 'alto' : 'ok';
    out.push({ group: g, sets: n, target, status, emphasized: !!emphSet[g.id] });
  });

  out.sort((a, b) => b.sets - a.sets);
  return out;
}
