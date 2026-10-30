import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Routine, WorkoutLog, WeightRecord, Settings } from '../types';
import { EXERCISES_BY_ID } from '../data/exercises';

const STORAGE_KEY = 'gymflow.v1';

export function todayISO(d?: Date | string | number): string {
  const t = d ? new Date(d) : new Date();
  const year = t.getFullYear();
  const month = String(t.getMonth() + 1).padStart(2, '0');
  const day = String(t.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const DEFAULT_STATE: AppState = {
  v: 1,
  settings: {
    units: 'kg',
    level: 2,
    profile: 'completo',
    days: 3,
    weekdays: [1, 3, 5],
    duration: 45,
    autoRest: true,
    name: ''
  },
  routines: [],
  activeRoutineId: null,
  logs: [],
  weights: [],
  ui: { lastTab: 'hoy', seenIntro: false }
};

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const s = JSON.parse(raw);
    const base = clone(DEFAULT_STATE);
    return {
      v: s.v || 1,
      settings: { ...base.settings, ...(s.settings || {}) },
      ui: { ...base.ui, ...(s.ui || {}) },
      routines: Array.isArray(s.routines) ? s.routines : [],
      activeRoutineId: s.activeRoutineId || null,
      logs: Array.isArray(s.logs) ? s.logs : [],
      weights: Array.isArray(s.weights) ? s.weights : []
    };
  } catch (e) {
    return clone(DEFAULT_STATE);
  }
}

interface StoreContextType {
  state: AppState;
  settings: Settings;
  routines: Routine[];
  activeRoutine: Routine | null;
  logs: WorkoutLog[];
  logsSorted: WorkoutLog[];
  weights: WeightRecord[];
  updateSettings: (patch: Partial<Settings>) => void;
  setActive: (id: string | null) => void;
  addRoutine: (routine: Routine) => Routine;
  updateRoutine: (routine: Routine) => Routine;
  deleteRoutine: (id: string) => void;
  duplicateRoutine: (id: string) => Routine | null;
  getRoutine: (id: string) => Routine | null;
  addLog: (log: WorkoutLog) => WorkoutLog;
  updateLog: (log: WorkoutLog) => void;
  deleteLog: (id: string) => void;
  logFor: (date: string, routineId?: string, dayId?: string) => WorkoutLog | null;
  lastLogForExercise: (exId: string, beforeDate?: string) => { date: string; entry: any } | null;
  bestForExercise: (exId: string) => { w: number; r: number } | null;
  weeklyVolume: (weeks?: number) => { week: string; volume: number }[];
  weeklySets: (sinceDate?: string) => Record<string, number>;
  addWeight: (kg: number, date?: string) => void;
  exportJSON: () => string;
  importJSON: (jsonText: string) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [state]);

  const updateSettings = (patch: Partial<Settings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch }
    }));
  };

  const getRoutine = (id: string): Routine | null => {
    return state.routines.find((r) => r.id === id) || null;
  };

  const activeRoutine = (): Routine | null => {
    if (state.activeRoutineId) {
      const found = state.routines.find((r) => r.id === state.activeRoutineId);
      if (found) return found;
    }
    return state.routines[0] || null;
  };

  const setActive = (id: string | null) => {
    setState((prev) => ({ ...prev, activeRoutineId: id }));
  };

  const addRoutine = (r: Routine): Routine => {
    const routine: Routine = {
      ...r,
      id: r.id || uid('rt'),
      createdAt: r.createdAt || Date.now()
    };
    setState((prev) => ({
      ...prev,
      routines: [routine, ...prev.routines],
      activeRoutineId: prev.activeRoutineId || routine.id
    }));
    return routine;
  };

  const updateRoutine = (r: Routine): Routine => {
    setState((prev) => ({
      ...prev,
      routines: prev.routines.map((item) => (item.id === r.id ? r : item))
    }));
    return r;
  };

  const deleteRoutine = (id: string) => {
    setState((prev) => {
      const nextRoutines = prev.routines.filter((r) => r.id !== id);
      let nextActive = prev.activeRoutineId;
      if (prev.activeRoutineId === id) {
        nextActive = nextRoutines[0] ? nextRoutines[0].id : null;
      }
      return {
        ...prev,
        routines: nextRoutines,
        activeRoutineId: nextActive
      };
    });
  };

  const duplicateRoutine = (id: string): Routine | null => {
    const r = getRoutine(id);
    if (!r) return null;
    const c = clone(r);
    c.id = uid('rt');
    c.name = `${r.name} (copia)`;
    c.createdAt = Date.now();
    setState((prev) => ({
      ...prev,
      routines: [c, ...prev.routines]
    }));
    return c;
  };

  const addLog = (log: WorkoutLog): WorkoutLog => {
    const fullLog: WorkoutLog = {
      ...log,
      id: log.id || uid('log')
    };
    setState((prev) => ({
      ...prev,
      logs: [fullLog, ...prev.logs]
    }));
    return fullLog;
  };

  const updateLog = (log: WorkoutLog) => {
    setState((prev) => ({
      ...prev,
      logs: prev.logs.map((item) => (item.id === log.id ? log : item))
    }));
  };

  const deleteLog = (id: string) => {
    setState((prev) => ({
      ...prev,
      logs: prev.logs.filter((l) => l.id !== id)
    }));
  };

  const logFor = (date: string, routineId?: string, dayId?: string): WorkoutLog | null => {
    return (
      state.logs.find(
        (l) => l.date === date && (!dayId || l.dayId === dayId) && (!routineId || l.routineId === routineId)
      ) || null
    );
  };

  const lastLogForExercise = (exId: string, beforeDate?: string): { date: string; entry: any } | null => {
    let best: { date: string; entry: any } | null = null;
    state.logs.forEach((l) => {
      if (beforeDate && l.date >= beforeDate) return;
      (l.entries || []).forEach((en) => {
        if (en.exId !== exId) return;
        if (!best || l.date > best.date) {
          best = { date: l.date, entry: en };
        }
      });
    });
    return best;
  };

  const bestForExercise = (exId: string): { w: number; r: number } | null => {
    let max = 0;
    let repsAtMax = 0;
    state.logs.forEach((l) => {
      (l.entries || []).forEach((en) => {
        if (en.exId !== exId) return;
        (en.sets || []).forEach((s) => {
          const w = Number(s.w) || 0;
          if (w > max) {
            max = w;
            repsAtMax = Number(s.r) || 0;
          }
        });
      });
    });
    return max > 0 ? { w: max, r: repsAtMax } : null;
  };

  const weeklyVolume = (weeks?: number): { week: string; volume: number }[] => {
    const out: Record<string, number> = {};
    state.logs.forEach((l) => {
      let v = 0;
      (l.entries || []).forEach((en) => {
        const mult = en.uni ? 2 : 1;
        (en.sets || []).forEach((s) => {
          if (s.done === false) return;
          v += (Number(s.w) || 0) * (Number(s.r) || 0) * mult;
        });
      });
      const d = new Date(l.date + 'T00:00:00');
      const monday = new Date(d);
      const dow = (d.getDay() + 6) % 7;
      monday.setDate(d.getDate() - dow);
      const k = todayISO(monday);
      out[k] = (out[k] || 0) + v;
    });

    let keys = Object.keys(out).sort();
    if (weeks) keys = keys.slice(-weeks);
    return keys.map((k) => ({ week: k, volume: Math.round(out[k]) }));
  };

  const weeklySets = (sinceDate?: string): Record<string, number> => {
    const sets: Record<string, number> = {};
    const since = sinceDate || todayISO(new Date(Date.now() - 7 * 864e5));
    state.logs.forEach((l) => {
      if (l.date < since) return;
      (l.entries || []).forEach((en) => {
        const ex = EXERCISES_BY_ID[en.exId];
        if (!ex) return;
        const n = (en.sets || []).filter((s) => s.done !== false).length;
        sets[ex.g] = (sets[ex.g] || 0) + n;
        (ex.sec || []).forEach((g) => {
          sets[g] = (sets[g] || 0) + n * 0.5;
        });
      });
    });
    return sets;
  };

  const addWeight = (kg: number, date?: string) => {
    const d = date || todayISO();
    setState((prev) => {
      const nextWeights = prev.weights.filter((w) => w.date !== d);
      nextWeights.push({ date: d, kg: Number(kg) });
      nextWeights.sort((a, b) => (a.date < b.date ? -1 : 1));
      return {
        ...prev,
        weights: nextWeights
      };
    });
  };

  const exportJSON = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importJSON = (jsonText: string) => {
    const s = JSON.parse(jsonText);
    if (!s || !s.settings) throw new Error('Archivo no válido');
    setState(s);
  };

  const reset = () => {
    const clean = clone(DEFAULT_STATE);
    setState(clean);
  };

  const logsSorted = [...state.logs].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <StoreContext.Provider
      value={{
        state,
        settings: state.settings,
        routines: state.routines,
        activeRoutine: activeRoutine(),
        logs: state.logs,
        logsSorted,
        weights: state.weights,
        updateSettings,
        setActive,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        duplicateRoutine,
        getRoutine,
        addLog,
        updateLog,
        deleteLog,
        logFor,
        lastLogForExercise,
        bestForExercise,
        weeklyVolume,
        weeklySets,
        addWeight,
        exportJSON,
        importJSON,
        reset
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
