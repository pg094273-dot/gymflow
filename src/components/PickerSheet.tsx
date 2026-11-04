import React, { useState } from 'react';
import { Exercise } from '../types';
import { GROUPS, EXERCISES_BY_GROUP } from '../data/exercises';
import { ExercisePhoto } from './ExercisePhoto';

interface PickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export const PickerSheet: React.FC<PickerSheetProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

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
        <h2 style={{ fontSize: '20px' }}>Añadir ejercicio</h2>
        <input
          className="input"
          placeholder="Buscar..."
          style={{ marginTop: '10px' }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="chips" style={{ marginTop: '10px' }}>
          <button
            type="button"
            className={`chip ${selectedGroup === null ? 'on' : ''}`}
            onClick={() => setSelectedGroup(null)}
          >
            Todos
          </button>
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`chip ${selectedGroup === g.id ? 'on' : ''}`}
              onClick={() => setSelectedGroup(selectedGroup === g.id ? null : g.id)}
            >
              <span className="dot" style={{ color: g.color }} />
              {g.short}
            </button>
          ))}
        </div>

        <div id="pick-list" style={{ marginTop: '8px' }}>
          {GROUPS.map((g) => {
            if (selectedGroup && selectedGroup !== g.id) return null;
            const list = (EXERCISES_BY_GROUP[g.id] || []).filter((ex) => {
              if (!q) return true;
              return (ex.n + ' ' + ex.s).toLowerCase().includes(q);
            });
            if (!list.length) return null;

            return (
              <div key={g.id}>
                <div className="group-head">
                  <span className="gname">{g.name}</span>
                  <span className="bar" />
                </div>
                {list.map((ex) => (
                  <div
                    key={ex.id}
                    className="ex-row"
                    onClick={() => {
                      onSelect(ex);
                      onClose();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="ex-thumb" style={{ width: '44px', height: '44px' }}>
                      <ExercisePhoto exerciseId={ex.id} patternId={ex.p} className="ex-img" />
                    </div>
                    <div className="ex-name">
                      <div className="n" style={{ fontSize: '13.5px' }}>
                        {ex.n}
                      </div>
                      <div className="m">{ex.s}</div>
                    </div>
                    <span className="muted">+</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
