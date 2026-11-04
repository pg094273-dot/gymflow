import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { EXERCISES_BY_ID, getGroupById } from '../data/exercises';
import { balanceReport } from '../services/generator';
import { ExercisePhoto } from '../components/ExercisePhoto';
import { Icon } from '../components/Icons';
import { ExerciseSheet } from '../components/ExerciseSheet';
import { Exercise } from '../types';

interface RoutineDetailViewProps {
  routineId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
  onStartSession: (routineId: string, dayId: string) => void;
  onExportPDF: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const RoutineDetailView: React.FC<RoutineDetailViewProps> = ({
  routineId,
  onBack,
  onEdit,
  onStartSession,
  onExportPDF,
  onShowToast
}) => {
  const { getRoutine, activeRoutine, setActive, duplicateRoutine, deleteRoutine } = useStore();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const routine = getRoutine(routineId);

  if (!routine) {
    return (
      <div className="empty">
        <h3>Rutina no encontrada</h3>
        <button className="btn sm" onClick={onBack} style={{ marginTop: '10px' }}>
          Volver
        </button>
      </div>
    );
  }

  const isActive = activeRoutine && activeRoutine.id === routine.id;
  const totalEx = routine.days.reduce((a, d) => a + d.exercises.length, 0);

  const fmtRest = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleActivate = () => {
    setActive(routine.id);
    onShowToast('Rutina activada');
  };

  const handleDuplicate = () => {
    const d = duplicateRoutine(routine.id);
    if (d) {
      onShowToast('Rutina duplicada');
    }
  };

  const handleDelete = () => {
    if (confirm(`¿Eliminar «${routine.name}»? No se puede deshacer.`)) {
      deleteRoutine(routine.id);
      onShowToast('Rutina eliminada');
      onBack();
    }
  };

  const balance = balanceReport(routine);
  const maxSets = Math.max(...balance.map((b) => b.sets), 12);

  return (
    <div>
      {/* Routine Overview Card */}
      <div className="card">
        <div className="row-between">
          <div>
            <div className="tiny muted" style={{ letterSpacing: '.1em', textTransform: 'uppercase' }}>
              {routine.generated ? 'Generada automáticamente' : 'Personalizada'}
            </div>
            <h2 style={{ fontSize: '22px', marginTop: '2px' }}>{routine.name}</h2>
          </div>
          <div className={`badge ${isActive ? '' : 'grey'}`}>
            {isActive ? 'Activa' : 'Inactiva'}
          </div>
        </div>

        <div className="kv">
          <div className="k">
            <b>{routine.days.length}</b> días
          </div>
          <div className="k">
            <b>{totalEx}</b> ejercicios
          </div>
          {routine.meta?.split && <div className="k">{routine.meta.split}</div>}
          {routine.meta?.duration && (
            <div className="k">
              <b>{routine.meta.duration}</b> min/día
            </div>
          )}
          {routine.meta?.emphasis && routine.meta.emphasis.length > 0 && (
            <div className="k">
              ★ Incide en:{' '}
              {routine.meta.emphasis
                .map((g) => getGroupById(g)?.short || g)
                .join(', ')}
            </div>
          )}
        </div>

        <div className="btn-row" style={{ marginTop: '14px' }}>
          {!isActive && (
            <button className="btn primary" onClick={handleActivate}>
              Activar
            </button>
          )}
          <button className="btn" onClick={() => onExportPDF(routine.id)}>
            <Icon name="pdf" size={16} />
            PDF A4
          </button>
          <button className="btn ghost" onClick={() => onEdit(routine.id)}>
            Editar
          </button>
        </div>

        <div className="btn-row" style={{ marginTop: '10px' }}>
          <button className="btn ghost sm" onClick={handleDuplicate}>
            Duplicar
          </button>
          <button className="btn danger sm" onClick={handleDelete}>
            Eliminar
          </button>
        </div>
      </div>

      {/* Weekly Volume Balance */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="h-row">
          <h3>Volumen semanal</h3>
          <span className="tiny muted">series por grupo</span>
        </div>
        <p className="tiny muted" style={{ marginTop: '4px' }}>
          Objetivo orientativo: 10-20 series por grupo a la semana. En verde, dentro de un rango razonable.
        </p>
        <div style={{ marginTop: '8px' }}>
          {balance.map((b) => {
            const pct = Math.round((b.sets / maxSets) * 100);
            const col = b.status === 'ok' ? '#c6f24e' : b.status === 'bajo' ? '#f5c26b' : '#ff8f6b';
            const label = `${b.group.short}${b.emphasized ? ' ★' : ''}`;
            return (
              <div key={b.group.id} className="vol-row">
                <div className="g">{label}</div>
                <div className="track">
                  <div className="fill" style={{ width: `${pct}%`, background: col }} />
                </div>
                <div className="n">{b.sets} ser.</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Routine Days */}
      <div style={{ marginTop: '14px', display: 'grid', gap: '10px' }}>
        {routine.days.map((d, i) => {
          const mins = d.estimated || 45;
          return (
            <div key={d.id} className="card tight">
              <div className="row-between">
                <div>
                  <div className="tiny muted">DÍA {i + 1}</div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>{d.name}</div>
                </div>
                <div className="tiny muted">
                  {d.exercises.length} ej · ~{mins} min
                </div>
              </div>

              <div style={{ marginTop: '6px' }}>
                {d.exercises.map((e, idx) => {
                  const ex = EXERCISES_BY_ID[e.exId];
                  if (!ex) return null;
                  const g = getGroupById(ex.g);
                  return (
                    <div
                      key={idx}
                      className="ex-row"
                      onClick={() => setSelectedExercise(ex)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="ex-thumb">
                        <ExercisePhoto exerciseId={ex.id} patternId={ex.p} className="ex-img" />
                      </div>
                      <div className="ex-name">
                        <div className="n">{ex.n}</div>
                        <div className="m">
                          <span style={{ color: g?.color }}>{g?.short}</span>
                          {e.note ? ` · ${e.note}` : ''}
                        </div>
                      </div>
                      <div className="ex-sets">
                        <b>
                          {e.sets}×{e.reps}
                        </b>
                        <br />
                        <span className="tiny">{fmtRest(e.rest)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className="btn sm block ghost"
                style={{ marginTop: '10px' }}
                onClick={() => onStartSession(routine.id, d.id)}
              >
                Entrenar este día
              </button>
            </div>
          );
        })}
      </div>

      {/* Exercise Detail Sheet */}
      <ExerciseSheet
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
};
