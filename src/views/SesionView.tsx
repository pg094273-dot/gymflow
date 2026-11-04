import React, { useState, useEffect } from 'react';
import { useStore, todayISO, uid } from '../context/StoreContext';
import { EXERCISES_BY_ID, getGroupById } from '../data/exercises';
import { ExercisePhoto } from '../components/ExercisePhoto';
import { Icon } from '../components/Icons';
import { ExerciseSheet } from '../components/ExerciseSheet';
import { Exercise, SessionEntry } from '../types';

interface SesionViewProps {
  routineId: string;
  dayId: string;
  onFinish: () => void;
  onStartRest: (seconds: number) => void;
  onShowToast: (msg: string) => void;
}

export const SesionView: React.FC<SesionViewProps> = ({
  routineId,
  dayId,
  onFinish,
  onStartRest,
  onShowToast
}) => {
  const { getRoutine, settings, logFor, lastLogForExercise, addLog, updateLog } = useStore();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const routine = getRoutine(routineId);
  const day = routine?.days.find((d) => d.id === dayId) || routine?.days[0];

  // Initialize session state
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [entries, setEntries] = useState<SessionEntry[]>(() => {
    if (!routine || !day) return [];
    const existing = logFor(todayISO(), routine.id, day.id);
    if (existing) {
      if (existing.notes) setNotes(existing.notes);
      return existing.entries.map((ee) => ({
        exId: ee.exId,
        uni: ee.uni,
        reps: ee.reps,
        rest: ee.rest,
        sets: ee.sets.map((s) => ({
          w: s.w ?? '',
          r: s.r ?? '',
          done: !!s.done
        }))
      }));
    }

    return day.exercises.map((e) => {
      const ex = EXERCISES_BY_ID[e.exId];
      const last = lastLogForExercise(e.exId);
      const sets = [];
      for (let i = 0; i < e.sets; i++) {
        let lw = '';
        let lr = '';
        if (last && last.entry.sets && last.entry.sets[i]) {
          lw = last.entry.sets[i].w ?? '';
          lr = last.entry.sets[i].r ?? '';
        }
        sets.push({ w: lw, r: lr, done: false });
      }
      return {
        exId: e.exId,
        uni: !!ex?.u,
        reps: e.reps,
        rest: e.rest,
        sets
      };
    });
  });

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  if (!routine || !day) {
    return (
      <div className="empty">
        <h3>Rutina no encontrada</h3>
        <button className="btn sm" onClick={onFinish} style={{ marginTop: '10px' }}>
          Volver
        </button>
      </div>
    );
  }

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const clockFormatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const doneCount = entries.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.done).length,
    0
  );
  const totalCount = entries.reduce((acc, e) => acc + e.sets.length, 0);

  const handleToggleSet = (entryIdx: number, setIdx: number) => {
    setEntries((prev) => {
      const copy = [...prev];
      const set = { ...copy[entryIdx].sets[setIdx] };
      const nextDone = !set.done;
      set.done = nextDone;

      // Auto-fill from input if not set
      if (nextDone) {
        if (!set.w && copy[entryIdx].sets[0]?.w) {
          set.w = copy[entryIdx].sets[0].w;
        }
        if (!set.r && copy[entryIdx].reps) {
          const defaultRep = copy[entryIdx].reps.includes('-')
            ? copy[entryIdx].reps.split('-')[1]
            : copy[entryIdx].reps;
          set.r = defaultRep;
        }
      }

      copy[entryIdx].sets[setIdx] = set;
      return copy;
    });

    const isNowDone = !entries[entryIdx].sets[setIdx].done;
    if (isNowDone) {
      onStartRest(entries[entryIdx].rest || 90);
    }
  };

  const handleSetChange = (
    entryIdx: number,
    setIdx: number,
    field: 'w' | 'r',
    value: string
  ) => {
    setEntries((prev) => {
      const copy = [...prev];
      copy[entryIdx].sets[setIdx] = {
        ...copy[entryIdx].sets[setIdx],
        [field]: value
      };
      return copy;
    });
  };

  const handleFinishSession = () => {
    const formattedEntries = entries.map((en) => ({
      exId: en.exId,
      uni: en.uni,
      reps: en.reps,
      rest: en.rest,
      sets: en.sets.map((s) => ({
        w: s.w === '' ? '' : Number(s.w),
        r: s.r === '' ? '' : Number(s.r),
        done: !!s.done
      }))
    }));

    const anyDone = formattedEntries.some((e) =>
      e.sets.some((s) => s.done || s.w || s.r)
    );

    if (!anyDone && !confirm('No has marcado ninguna serie. ¿Guardar de todas formas?')) {
      return;
    }

    const existing = logFor(todayISO(), routine.id, day.id);
    const logData = {
      id: existing ? existing.id : uid('log'),
      date: todayISO(),
      routineId: routine.id,
      routineName: routine.name,
      dayId: day.id,
      dayName: day.name,
      entries: formattedEntries,
      notes: notes,
      duration: Math.round((Date.now() - sessionStartTime) / 60000)
    };

    if (existing) {
      updateLog(logData);
    } else {
      addLog(logData);
    }

    onShowToast('Entreno guardado 💪');
    onFinish();
  };

  return (
    <div>
      {/* Session Header Card */}
      <div className="card tight">
        <div className="row-between">
          <div>
            <div className="tiny muted">{routine.name}</div>
            <div style={{ fontSize: '19px', fontWeight: 750 }}>{day.name}</div>
          </div>
          <div className="mono" id="session-clock" style={{ fontWeight: 700 }}>
            {clockFormatted}
          </div>
        </div>
        <div className="small muted" style={{ marginTop: '4px' }}>
          {doneCount} / {totalCount} series completadas
        </div>
      </div>

      {/* Exercises Cards */}
      {entries.map((en, i) => {
        const ex = EXERCISES_BY_ID[en.exId];
        if (!ex) return null;
        const g = getGroupById(ex.g);
        const prev = lastLogForExercise(ex.id);

        return (
          <div key={i} className="card tight" style={{ marginTop: '12px' }}>
            <div className="row" style={{ gap: '12px' }}>
              <div
                className="ex-thumb"
                onClick={() => setSelectedExercise(ex)}
                style={{ cursor: 'pointer' }}
              >
                <ExercisePhoto exerciseId={ex.id} patternId={ex.p} className="ex-img" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.25 }}>
                  {ex.n}
                </div>
                <div className="tiny muted" style={{ marginTop: '2px' }}>
                  {en.sets.length} × {en.reps} ·{' '}
                  <span style={{ color: g?.color }}>{g?.short}</span>
                  {prev && prev.entry?.sets?.[0]?.w
                    ? ` · última: ${prev.entry.sets[0].w} ${settings.units}`
                    : ''}
                </div>
              </div>
            </div>

            <div className="set-head">
              <div>Serie</div>
              <div>Peso ({settings.units})</div>
              <div>Reps</div>
              <div />
            </div>

            {en.sets.map((s, j) => (
              <div key={j} className="session-set">
                <div className="idx">{j + 1}</div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={s.w ?? ''}
                  placeholder="—"
                  onChange={(e) => handleSetChange(i, j, 'w', e.target.value)}
                />
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  value={s.r ?? ''}
                  placeholder="—"
                  onChange={(e) => handleSetChange(i, j, 'r', e.target.value)}
                />
                <button
                  type="button"
                  className={`ok ${s.done ? 'on' : ''}`}
                  onClick={() => handleToggleSet(i, j)}
                >
                  <Icon name="check" size={18} />
                </button>
              </div>
            ))}

            {en.uni && (
              <div className="tiny muted" style={{ marginTop: '8px' }}>
                Unilateral: cuenta las dos piernas/brazos.
              </div>
            )}
          </div>
        );
      })}

      {/* Session Notes */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div
          className="lbl"
          style={{
            fontSize: '12.5px',
            fontWeight: 600,
            color: 'var(--muted)',
            textTransform: 'uppercase'
          }}
        >
          Notas del entreno
        </div>
        <textarea
          id="session-notes"
          className="input"
          placeholder="Sensaciones, molestias, cambios de peso..."
          style={{ marginTop: '6px' }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Sticky CTA */}
      <div className="sticky-cta" style={{ marginTop: '14px' }}>
        <button className="btn primary block" onClick={handleFinishSession}>
          Terminar entrenamiento
        </button>
      </div>

      {/* Exercise Sheet Modal */}
      <ExerciseSheet
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
};
