import React, { useState } from 'react';
import { GROUPS, EXERCISES, EXERCISES_BY_GROUP, EQUIP } from '../data/exercises';
import { Figure } from '../components/Figure';
import { Icon } from '../components/Icons';
import { ExerciseSheet } from '../components/ExerciseSheet';
import { Exercise } from '../types';

export const EjerciciosView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sheetExercise, setSheetExercise] = useState<Exercise | null>(null);

  const q = query.toLowerCase().trim();

  return (
    <div>
      {/* Search Input */}
      <div className="row" style={{ gap: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            id="ex-search"
            className="input"
            placeholder="Buscar ejercicio o músculo"
            autoComplete="off"
            style={{ paddingLeft: '40px' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '13px',
              width: '20px',
              height: '20px',
              color: 'var(--muted)'
            }}
          >
            <Icon name="search" size={20} />
          </span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="chips" style={{ marginTop: '10px' }}>
        <button
          type="button"
          className={`chip ${selectedGroup === 'all' ? 'on' : ''}`}
          onClick={() => setSelectedGroup('all')}
        >
          Todos
        </button>
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`chip ${selectedGroup === g.id ? 'on' : ''}`}
            onClick={() => setSelectedGroup(g.id)}
          >
            <span className="dot" style={{ color: g.color }} />
            {g.short}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div id="ex-list" style={{ marginTop: '10px' }}>
        {GROUPS.map((g) => {
          if (selectedGroup !== 'all' && selectedGroup !== g.id) return null;
          const list = (EXERCISES_BY_GROUP[g.id] || []).filter((ex) => {
            if (!q) return true;
            return (ex.n + ' ' + ex.s + ' ' + g.name + ' ' + (ex.d || '')).toLowerCase().includes(q);
          });
          if (!list.length) return null;

          return (
            <div key={g.id}>
              <div className="group-head">
                <span className="gname">{g.name}</span>
                <span className="bar" />
                <span className="count">{list.length}</span>
              </div>
              {list.map((ex) => (
                <div
                  key={ex.id}
                  className="ex-row"
                  onClick={() => setSheetExercise(ex)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="ex-thumb">
                    <Figure patternId={ex.p} />
                  </div>
                  <div className="ex-name">
                    <div className="n">{ex.n}</div>
                    <div className="m">
                      {ex.s} · {ex.e.map((eq) => EQUIP[eq] || eq).join(', ')}
                    </div>
                  </div>
                  <div className="ex-sets">{ex.r}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="tiny muted center" style={{ marginTop: '16px' }}>
        {EXERCISES.length} ejercicios · toca uno para ver la técnica
      </div>

      <ExerciseSheet
        exercise={sheetExercise}
        onClose={() => setSheetExercise(null)}
      />
    </div>
  );
};
