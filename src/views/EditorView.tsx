import React, { useState } from 'react';
import { useStore, uid } from '../context/StoreContext';
import { GROUPS, EXERCISES_BY_ID, EXERCISES_BY_GROUP, getGroupById } from '../data/exercises';
import { Figure } from '../components/Figure';
import { PickerSheet } from '../components/PickerSheet';
import { ExerciseSheet } from '../components/ExerciseSheet';
import { Routine, RoutineDay, Exercise } from '../types';

interface EditorViewProps {
  routineId?: string;
  onSaved: (routineId: string) => void;
  onShowToast: (msg: string) => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  routineId,
  onSaved,
  onShowToast
}) => {
  const { getRoutine, addRoutine, updateRoutine, setActive } = useStore();

  const [routine, setRoutine] = useState<Routine>(() => {
    if (routineId) {
      const src = getRoutine(routineId);
      if (src) return JSON.parse(JSON.stringify(src));
    }
    return {
      id: uid('rt'),
      name: 'Mi rutina',
      createdAt: Date.now(),
      generated: false,
      days: [
        {
          id: 'd1',
          name: 'Día 1',
          exercises: [],
          estimated: 45
        }
      ]
    };
  });

  const [pickerDayIndex, setPickerDayIndex] = useState<number | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const handleDayNameChange = (dayIdx: number, name: string) => {
    setRoutine((prev) => {
      const copy = { ...prev };
      copy.days[dayIdx] = { ...copy.days[dayIdx], name };
      return copy;
    });
  };

  const handleAddDay = () => {
    if (routine.days.length >= 5) return;
    const newIdx = routine.days.length + 1;
    setRoutine((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        {
          id: `d${newIdx}`,
          name: `Día ${newIdx}`,
          exercises: [],
          estimated: 45
        }
      ]
    }));
  };

  const handleDeleteDay = (dayIdx: number) => {
    if (routine.days.length <= 1) return;
    if (confirm('¿Quitar este día?')) {
      setRoutine((prev) => ({
        ...prev,
        days: prev.days.filter((_, idx) => idx !== dayIdx)
      }));
    }
  };

  const handleExerciseChange = (
    dayIdx: number,
    exIdx: number,
    field: 'sets' | 'reps',
    val: string
  ) => {
    setRoutine((prev) => {
      const copy = { ...prev };
      const day = { ...copy.days[dayIdx] };
      const exList = [...day.exercises];
      exList[exIdx] = {
        ...exList[exIdx],
        [field]: field === 'sets' ? Math.max(1, Number(val) || 1) : val
      };
      day.exercises = exList;
      copy.days[dayIdx] = day;
      return copy;
    });
  };

  const handleMoveExercise = (dayIdx: number, exIdx: number, direction: 'up' | 'down') => {
    setRoutine((prev) => {
      const copy = { ...prev };
      const day = { ...copy.days[dayIdx] };
      const exList = [...day.exercises];
      const targetIdx = direction === 'up' ? exIdx - 1 : exIdx + 1;
      if (targetIdx < 0 || targetIdx >= exList.length) return prev;

      const temp = exList[exIdx];
      exList[exIdx] = exList[targetIdx];
      exList[targetIdx] = temp;
      day.exercises = exList;
      copy.days[dayIdx] = day;
      return copy;
    });
  };

  const handleDeleteExercise = (dayIdx: number, exIdx: number) => {
    setRoutine((prev) => {
      const copy = { ...prev };
      const day = { ...copy.days[dayIdx] };
      day.exercises = day.exercises.filter((_, idx) => idx !== exIdx);
      copy.days[dayIdx] = day;
      return copy;
    });
  };

  const handleSuggestExercise = (dayIdx: number, grpId: string) => {
    const day = routine.days[dayIdx];
    const used: Record<string, boolean> = {};
    day.exercises.forEach((e) => {
      used[e.exId] = true;
    });

    const cands = (EXERCISES_BY_GROUP[grpId] || []).filter((ex) => !used[ex.id]);
    const hasCompound = day.exercises.some((e) => {
      const x = EXERCISES_BY_ID[e.exId];
      return x && x.g === grpId && x.t === 'c';
    });
    let pool = hasCompound ? cands.filter((x) => x.t !== 'c') : cands.filter((x) => x.t === 'c');
    if (!pool.length) pool = cands;

    if (!pool.length) {
      onShowToast(`Ya tienes todos los ejercicios de ${getGroupById(grpId)?.short || grpId}`);
      return;
    }

    const best = pool[Math.floor(Math.random() * pool.length)];
    setRoutine((prev) => {
      const copy = { ...prev };
      const d = { ...copy.days[dayIdx] };
      d.exercises = [
        ...d.exercises,
        {
          exId: best.id,
          sets: 3,
          reps: best.r,
          rest: best.rest,
          note: ''
        }
      ];
      copy.days[dayIdx] = d;
      return copy;
    });
    onShowToast(`${best.n} añadido`);
  };

  const handleSelectPickedExercise = (ex: Exercise) => {
    if (pickerDayIndex === null) return;
    setRoutine((prev) => {
      const copy = { ...prev };
      const d = { ...copy.days[pickerDayIndex] };
      d.exercises = [
        ...d.exercises,
        {
          exId: ex.id,
          sets: 3,
          reps: ex.r,
          rest: ex.rest,
          note: ''
        }
      ];
      copy.days[pickerDayIndex] = d;
      return copy;
    });
    onShowToast('Ejercicio añadido');
  };

  const handleSave = () => {
    const empty = routine.days.every((d) => !d.exercises.length);
    if (empty) {
      onShowToast('Añade al menos un ejercicio');
      return;
    }

    const finalRoutine: Routine = {
      ...routine,
      name: routine.name.trim() || 'Mi rutina',
      days: routine.days.map((d, i) => {
        const exercises = d.exercises.filter((e) => EXERCISES_BY_ID[e.exId]);
        const mins =
          5 +
          exercises.reduce((a, e) => {
            const ex = EXERCISES_BY_ID[e.exId];
            return a + (e.sets || 3) * (40 + (ex.rest || 90));
          }, 0) /
            60;
        return {
          ...d,
          id: d.id || `d${i + 1}`,
          exercises,
          estimated: Math.round(mins)
        };
      })
    };

    if (routineId) {
      updateRoutine(finalRoutine);
      onShowToast('Rutina actualizada');
      onSaved(finalRoutine.id);
    } else {
      const added = addRoutine(finalRoutine);
      setActive(added.id);
      onShowToast('Rutina creada');
      onSaved(added.id);
    }
  };

  return (
    <div>
      {/* Routine Name */}
      <div className="card">
        <div className="field" style={{ marginTop: 0 }}>
          <div className="lbl">Nombre de la rutina</div>
          <input
            id="ed-name"
            className="input"
            value={routine.name}
            onChange={(e) => setRoutine((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
      </div>

      {/* Days List */}
      <div style={{ marginTop: '14px', display: 'grid', gap: '12px' }}>
        {routine.days.map((d, di) => (
          <div key={d.id} className="card">
            <div className="row-between">
              <input
                className="input sm"
                style={{ flex: 1, fontWeight: 700 }}
                value={d.name}
                onChange={(e) => handleDayNameChange(di, e.target.value)}
              />
              {routine.days.length > 1 && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => handleDeleteDay(di)}
                  aria-label="Eliminar día"
                  style={{ marginLeft: '8px' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ marginTop: '8px' }}>
              {d.exercises.length ? (
                d.exercises.map((e, ei) => {
                  const ex = EXERCISES_BY_ID[e.exId];
                  if (!ex) return null;
                  const g = getGroupById(ex.g);
                  return (
                    <div key={ei} className="ex-row" style={{ gap: '8px' }}>
                      <div
                        className="ex-thumb"
                        style={{ width: '46px', height: '46px', cursor: 'pointer' }}
                        onClick={() => setSelectedExercise(ex)}
                      >
                        <Figure patternId={ex.p} />
                      </div>
                      <div className="ex-name">
                        <div className="n" style={{ fontSize: '13.5px' }}>
                          {ex.n}
                        </div>
                        <div className="m" style={{ color: g?.color }}>
                          {g?.short}
                        </div>
                      </div>
                      <div className="row" style={{ gap: '4px' }}>
                        <input
                          className="input sm"
                          style={{ width: '44px', padding: '0 4px', textAlign: 'center' }}
                          type="number"
                          inputMode="numeric"
                          value={e.sets}
                          onChange={(ev) => handleExerciseChange(di, ei, 'sets', ev.target.value)}
                        />
                        <span className="tiny muted">×</span>
                        <input
                          className="input sm"
                          style={{ width: '56px', padding: '0 4px', textAlign: 'center' }}
                          value={e.reps}
                          onChange={(ev) => handleExerciseChange(di, ei, 'reps', ev.target.value)}
                        />
                      </div>
                      <div style={{ display: 'grid', gap: '2px' }}>
                        <button
                          type="button"
                          className="tiny muted"
                          onClick={() => handleMoveExercise(di, ei, 'up')}
                          aria-label="Subir"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="tiny muted"
                          onClick={() => handleMoveExercise(di, ei, 'down')}
                          aria-label="Bajar"
                        >
                          ▼
                        </button>
                      </div>
                      <button
                        type="button"
                        className="tiny"
                        style={{ color: 'var(--danger)', padding: '4px' }}
                        onClick={() => handleDeleteExercise(di, ei)}
                        aria-label="Quitar"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="tiny muted" style={{ padding: '10px 0' }}>
                  Sin ejercicios todavía.
                </p>
              )}
            </div>

            <div className="tiny muted" style={{ marginTop: '10px', marginBottom: '4px' }}>
              Sugerir por grupo:
            </div>
            <div className="chips" style={{ marginBottom: '8px' }}>
              {GROUPS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="chip"
                  onClick={() => handleSuggestExercise(di, g.id)}
                  style={{ fontSize: '12px', height: '30px' }}
                >
                  <span className="dot" style={{ color: g.color }} />
                  {g.short}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn sm block ghost"
              onClick={() => setPickerDayIndex(di)}
            >
              + Añadir ejercicio
            </button>
          </div>
        ))}
      </div>

      {routine.days.length < 5 && (
        <button
          type="button"
          className="btn block"
          style={{ marginTop: '12px' }}
          onClick={handleAddDay}
        >
          + Añadir día
        </button>
      )}

      {/* Sticky Save CTA */}
      <div className="sticky-cta" style={{ marginTop: '16px' }}>
        <button type="button" className="btn primary block" onClick={handleSave}>
          Guardar rutina
        </button>
      </div>

      {/* Picker Sheet */}
      <PickerSheet
        isOpen={pickerDayIndex !== null}
        onClose={() => setPickerDayIndex(null)}
        onSelect={handleSelectPickedExercise}
      />

      {/* Exercise Detail Sheet */}
      <ExerciseSheet
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
};
