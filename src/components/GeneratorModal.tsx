import React, { useState } from 'react';
import { MuscleGroupId } from '../types';
import { GROUPS, PROFILES } from '../data/exercises';
import { generateRoutine } from '../services/generator';
import { useStore } from '../context/StoreContext';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (routineId: string) => void;
}

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerated
}) => {
  const { settings, updateSettings, addRoutine, setActive } = useStore();

  const [days, setDays] = useState<number>(settings.days || 3);
  const [duration, setDuration] = useState<number>(settings.duration || 45);
  const [level, setLevel] = useState<1 | 2 | 3>(settings.level || 2);
  const [profile, setProfile] = useState<string>(settings.profile || 'completo');
  const [emphasis, setEmphasis] = useState<MuscleGroupId[]>([]);
  const [emphasisLevel, setEmphasisLevel] = useState<number>(2);

  if (!isOpen) return null;

  const toggleEmphasis = (g: MuscleGroupId) => {
    setEmphasis((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  const handleGenerate = () => {
    updateSettings({ days, duration, level, profile });
    const routine = generateRoutine({
      days,
      duration,
      level,
      profile,
      emphasis,
      emphasisLevel
    });
    addRoutine(routine);
    setActive(routine.id);
    onClose();
    onGenerated(routine.id);
  };

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
        <h2 style={{ fontSize: '22px' }}>Nueva rutina automática</h2>
        <p className="small muted" style={{ marginTop: '4px' }}>
          Se ajusta a tus días y a tu tiempo, repartiendo el volumen entre todos los grupos musculares.
        </p>

        <div className="field">
          <div className="lbl">Días por semana</div>
          <div className="seg">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={days === n ? 'on' : ''}
                onClick={() => setDays(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <div className="lbl">Tiempo por sesión</div>
          <div className="seg">
            {[30, 45, 60, 90].map((m) => (
              <button
                key={m}
                type="button"
                className={duration === m ? 'on' : ''}
                onClick={() => setDuration(m)}
              >
                {m}'
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <div className="lbl">Experiencia</div>
          <div className="seg">
            {[
              { val: 1 as const, label: 'Principiante' },
              { val: 2 as const, label: 'Intermedio' },
              { val: 3 as const, label: 'Avanzado' }
            ].map((lvl) => (
              <button
                key={lvl.val}
                type="button"
                className={level === lvl.val ? 'on' : ''}
                onClick={() => setLevel(lvl.val)}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <div className="lbl">Equipamiento</div>
          <select
            className="select"
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
          >
            {PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <div className="lbl">¿Quieres incidir en algún grupo? (varios)</div>
          <div className="chips" style={{ flexWrap: 'wrap' }}>
            {GROUPS.map((g) => {
              const on = emphasis.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`chip ${on ? 'on' : ''}`}
                  onClick={() => toggleEmphasis(g.id)}
                >
                  <span className="dot" style={{ color: g.color }} />
                  {g.short}
                </button>
              );
            })}
          </div>
          <p className="tiny muted" style={{ marginTop: '6px' }}>
            Se le dará más volumen y series sin descuidar el resto.
          </p>
        </div>

        <div className="field">
          <div className="lbl">Intensidad del énfasis</div>
          <div className="seg">
            {[
              { val: 1, label: 'Ligero' },
              { val: 2, label: 'Medio' },
              { val: 3, label: 'Fuerte' }
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                className={emphasisLevel === item.val ? 'on' : ''}
                onClick={() => setEmphasisLevel(item.val)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn primary block"
          style={{ marginTop: '20px' }}
          onClick={handleGenerate}
        >
          Generar rutina
        </button>
        <p className="tiny muted center" style={{ marginTop: '10px' }}>
          Podrás editarla después ejercicio a ejercicio.
        </p>
      </div>
    </div>
  );
};
