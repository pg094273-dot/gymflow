import React from 'react';
import { Exercise } from '../types';
import { EQUIP, getGroupById } from '../data/exercises';
import { ExerciseMotionViewer } from './ExerciseMotionViewer';
import { useStore } from '../context/StoreContext';

interface ExerciseSheetProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseSheet: React.FC<ExerciseSheetProps> = ({ exercise, onClose }) => {
  const { settings, bestForExercise, lastLogForExercise } = useStore();

  if (!exercise) return null;

  const group = getGroupById(exercise.g);
  const best = bestForExercise(exercise.id);
  const last = lastLogForExercise(exercise.id);
  const u = settings.units;

  const fmtRest = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const levelLabel = ['', 'principiante', 'intermedio', 'avanzado'][exercise.l] || '';

  return (
    <div
      className="sheet open"
      id="sheet"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel" role="dialog">
        <div className="handle" onClick={onClose} />

        <div className="row-between" style={{ marginTop: '4px' }}>
          <h2 style={{ fontSize: '22px', lineHeight: 1.2, flex: 1 }}>{exercise.n}</h2>
        </div>
        <div className="small" style={{ color: group?.color || '#c6f24e', fontWeight: 600, marginTop: '2px' }}>
          {group?.name} · {exercise.s}
        </div>

        <div className="kv">
          <div className="k">
            <b>{exercise.r}</b> reps
          </div>
          <div className="k">
            <b>{fmtRest(exercise.rest)}</b> descanso
          </div>
          <div className="k">{exercise.t === 'c' ? 'Compuesto' : exercise.t === 'a' ? 'Aislado' : 'Core'}</div>
          <div className="k">{exercise.u ? 'Unilateral' : 'Bilateral'}</div>
          {exercise.e.map((eq) => (
            <div className="k" key={eq}>
              {EQUIP[eq] || eq}
            </div>
          ))}
          <div className="k">Nivel {levelLabel}</div>
        </div>

        {/* Interactive Motion & Posture Visualizer */}
        <ExerciseMotionViewer exercise={exercise} group={group} />

        {/* Description */}
        <p className="small" style={{ marginTop: '14px', color: '#cfdae8' }}>
          {exercise.d}
        </p>

        {/* Execution Keys */}
        {exercise.k && exercise.k.length > 0 && (
          <div className="card" style={{ marginTop: '12px' }}>
            <h3 style={{ fontSize: '14px' }}>Puntos clave de ejecución</h3>
            <ul className="steps" style={{ marginTop: '8px' }}>
              {exercise.k.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Mistakes */}
        {exercise.m && exercise.m.length > 0 && (
          <div className="card" style={{ marginTop: '12px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--danger)' }}>Errores comunes a evitar</h3>
            <ul className="steps mistakes" style={{ marginTop: '8px' }}>
              {exercise.m.map((mistake, idx) => (
                <li key={idx}>{mistake}</li>
              ))}
            </ul>
          </div>
        )}

        {/* PR & Last Log */}
        {(best || last) && (
          <div className="card flat" style={{ marginTop: '14px' }}>
            <div className="row-between">
              <span className="small muted">Tu mejor marca</span>
              <b className="mono">{best ? `${best.w} ${u} × ${best.r}` : '—'}</b>
            </div>
            {last && (
              <div className="row-between" style={{ marginTop: '6px' }}>
                <span className="small muted">Última vez</span>
                <span className="small mono">
                  {last.date} ·{' '}
                  {(last.entry.sets || [])
                    .map((s: any) => `${s.w}×${s.r}`)
                    .filter((s: string) => s !== '×')
                    .join('  ')}
                </span>
              </div>
            )}
          </div>
        )}

        <button className="btn block" style={{ marginTop: '18px' }} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};
