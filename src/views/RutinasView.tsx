import React from 'react';
import { useStore } from '../context/StoreContext';
import { Icon } from '../components/Icons';

interface RutinasViewProps {
  onGoRoutine: (id: string) => void;
  onOpenGenerator: () => void;
  onNewRoutineManual: () => void;
  onExportPDF: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const RutinasView: React.FC<RutinasViewProps> = ({
  onGoRoutine,
  onOpenGenerator,
  onNewRoutineManual,
  onExportPDF,
  onShowToast
}) => {
  const { routines, activeRoutine, setActive } = useStore();

  const handleActivate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActive(id);
    onShowToast('Rutina activada');
  };

  const handlePDF = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onExportPDF(id);
  };

  return (
    <div>
      <div className="btn-row">
        <button className="btn primary" onClick={onOpenGenerator}>
          <Icon name="plus" size={18} />
          Generar rutina
        </button>
        <button className="btn" onClick={onNewRoutineManual}>
          <Icon name="plus" size={18} />
          Crear a mano
        </button>
      </div>

      {!routines.length ? (
        <div className="empty" style={{ marginTop: '20px' }}>
          <div className="ico">🗂️</div>
          <h3>Sin rutinas todavía</h3>
          <p>Genera una automática según tus días y tu tiempo, o crea la tuya eligiendo ejercicios.</p>
        </div>
      ) : (
        <div style={{ marginTop: '14px', display: 'grid', gap: '12px' }}>
          {routines.map((r) => {
            const totalEx = r.days.reduce((a, d) => a + d.exercises.length, 0);
            const isActive = activeRoutine && activeRoutine.id === r.id;

            return (
              <div
                key={r.id}
                className="card rt-card"
                onClick={() => onGoRoutine(r.id)}
                style={{ cursor: 'pointer' }}
              >
                {isActive && <div className="badge">Activa</div>}
                <div className="name">{r.name}</div>
                <div className="meta">
                  {r.days.length} días/semana · {totalEx} ejercicios
                  {r.meta?.split ? ` · ${r.meta.split}` : ''}
                </div>
                <div className="row" style={{ marginTop: '14px', gap: '8px' }}>
                  <button
                    className="btn sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGoRoutine(r.id);
                    }}
                  >
                    Ver
                  </button>
                  <button className="btn sm" onClick={(e) => handlePDF(e, r.id)}>
                    <Icon name="pdf" size={16} />
                    PDF
                  </button>
                  {!isActive && (
                    <button
                      className="btn sm ghost"
                      onClick={(e) => handleActivate(e, r.id)}
                    >
                      Activar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
