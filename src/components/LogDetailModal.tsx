import React from 'react';
import { WorkoutLog } from '../types';
import { EXERCISES_BY_ID } from '../data/exercises';
import { useStore } from '../context/StoreContext';

interface LogDetailModalProps {
  log: WorkoutLog | null;
  onClose: () => void;
  onDeleted: () => void;
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({
  log,
  onClose,
  onDeleted
}) => {
  const { settings, deleteLog } = useStore();

  if (!log) return null;

  const fmtDate = (iso: string) => {
    const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };

  const handleDelete = () => {
    if (confirm('¿Borrar este registro?')) {
      deleteLog(log.id);
      onDeleted();
      onClose();
    }
  };

  return (
    <div
      className="sheet open"
      id="sheet"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel">
        <div className="handle" onClick={onClose} />
        <h2 style={{ fontSize: '20px' }}>{log.dayName}</h2>
        <div className="small muted">
          {fmtDate(log.date)} · {log.routineName || ''}
          {log.duration ? ` · ${log.duration} min` : ''}
        </div>

        {(log.entries || []).map((en, i) => {
          const ex = EXERCISES_BY_ID[en.exId];
          if (!ex) return null;
          return (
            <div key={i} style={{ marginTop: '14px' }}>
              <div style={{ fontWeight: 600 }}>{ex.n}</div>
              {(en.sets || []).map((s, j) => (
                <div key={j} className="small muted mono">
                  Serie {j + 1}: {s.w || '—'} {settings.units} × {s.r || '—'}
                  {s.done === false ? ' (no hecha)' : ''}
                </div>
              ))}
            </div>
          );
        })}

        {log.notes && (
          <div className="card flat" style={{ marginTop: '14px' }}>
            <div className="tiny muted">NOTAS</div>
            <div className="small">{log.notes}</div>
          </div>
        )}

        <button
          className="btn block danger"
          style={{ marginTop: '18px' }}
          onClick={handleDelete}
        >
          Borrar registro
        </button>
        <button
          className="btn block ghost"
          style={{ marginTop: '8px' }}
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
