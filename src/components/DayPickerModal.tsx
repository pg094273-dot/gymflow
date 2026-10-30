import React from 'react';
import { Routine } from '../types';

interface DayPickerModalProps {
  routine: Routine | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectDay: (routineId: string, dayId: string) => void;
}

export const DayPickerModal: React.FC<DayPickerModalProps> = ({
  routine,
  isOpen,
  onClose,
  onSelectDay
}) => {
  if (!isOpen || !routine) return null;

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
        <h2 style={{ fontSize: '20px' }}>¿Qué día entrenas?</h2>
        {routine.days.map((d) => (
          <button
            key={d.id}
            className="btn block"
            style={{ marginTop: '10px', justifyContent: 'space-between' }}
            onClick={() => {
              onSelectDay(routine.id, d.id);
              onClose();
            }}
          >
            <span>{d.name}</span>
            <span className="tiny muted">{d.exercises.length} ej</span>
          </button>
        ))}
        <button
          className="btn block ghost"
          style={{ marginTop: '14px' }}
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
