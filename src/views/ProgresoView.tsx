import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { GROUPS, EXERCISES, EXERCISES_BY_ID, getGroupById } from '../data/exercises';
import { LogDetailModal } from '../components/LogDetailModal';
import { WorkoutLog } from '../types';

interface ProgresoViewProps {
  onShowToast: (msg: string) => void;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export const ProgresoView: React.FC<ProgresoViewProps> = ({ onShowToast }) => {
  const {
    settings,
    logs,
    logsSorted,
    weeklyVolume,
    weeklySets,
    bestForExercise,
    weights,
    addWeight
  } = useStore();

  const [bwInput, setBwInput] = useState('');
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);

  const u = settings.units;
  const weekVol = weeklyVolume(8);
  const maxV = Math.max(...weekVol.map((w) => w.volume), 1);
  const totalVol = weekVol.reduce((a, b) => a + b.volume, 0);

  let totalSets = 0;
  logs.forEach((l) => {
    (l.entries || []).forEach((e) => {
      totalSets += (e.sets || []).filter((s) => s.done !== false).length;
    });
  });

  const sets7 = weeklySets();

  // Personal records
  const prs: { ex: any; w: number; r: number }[] = [];
  EXERCISES.forEach((ex) => {
    const b = bestForExercise(ex.id);
    if (b) prs.push({ ex, w: b.w, r: b.r });
  });
  prs.sort((a, b) => b.w - a.w);

  const recentWeights = weights.slice(-6);

  const handleAddWeight = () => {
    const v = parseFloat(bwInput);
    if (!v || v <= 0) {
      onShowToast('Introduce un peso válido');
      return;
    }
    addWeight(v);
    setBwInput('');
    onShowToast('Peso guardado');
  };

  return (
    <div>
      {/* Stat Grid */}
      <div className="stat-grid">
        <div className="stat">
          <div className="v">{logs.length}</div>
          <div className="l">Entrenos totales</div>
        </div>
        <div className="stat">
          <div className="v">{totalSets}</div>
          <div className="l">Series registradas</div>
        </div>
        <div className="stat">
          <div className="v">
            {totalVol >= 1000 ? `${(totalVol / 1000).toFixed(1)}` : totalVol}
            <small>{totalVol >= 1000 ? 't' : u}</small>
          </div>
          <div className="l">Volumen (8 sem.)</div>
        </div>
        <div className="stat">
          <div className="v">{logsSorted[0] ? fmtDate(logsSorted[0].date) : '—'}</div>
          <div className="l">Último entreno</div>
        </div>
      </div>

      {/* Weekly Volume Chart */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="h-row">
          <h3>Volumen por semana</h3>
          <span className="tiny muted">{u} levantados</span>
        </div>
        {weekVol.length ? (
          <>
            <div className="bars">
              {weekVol.map((w, idx) => {
                const h = Math.max(4, Math.round((w.volume / maxV) * 100));
                const isHi = idx === weekVol.length - 1;
                return (
                  <div
                    key={w.week}
                    className={`b ${isHi ? 'hi' : ''}`}
                    style={{ height: `${h}%` }}
                    title={`${w.volume} ${u}`}
                  />
                );
              })}
            </div>
            <div className="bars-x">
              {weekVol.map((w) => (
                <div key={w.week}>{fmtDate(w.week).split(' ')[0]}</div>
              ))}
            </div>
          </>
        ) : (
          <p className="small muted" style={{ marginTop: '8px' }}>
            Aún no hay datos. Registra tu primer entrenamiento.
          </p>
        )}
      </div>

      {/* Weekly Sets by Muscle */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="h-row">
          <h3>Series últimos 7 días</h3>
          <span className="tiny muted">real / objetivo</span>
        </div>
        <div style={{ marginTop: '8px' }}>
          {GROUPS.map((g) => {
            const n = Math.round(sets7[g.id] || 0);
            const target = 10;
            const pct = Math.min(100, Math.round((n / (target * 1.6)) * 100));
            const col =
              n === 0 ? '#38465a' : n < target * 0.6 ? '#f5c26b' : n > target * 1.8 ? '#ff8f6b' : '#c6f24e';

            return (
              <div key={g.id} className="vol-row">
                <div className="g">{g.short}</div>
                <div className="track">
                  <div className="fill" style={{ width: `${pct}%`, background: col }} />
                </div>
                <div className="n">
                  {n}/{target}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Records */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="h-row">
          <h3>Récords personales</h3>
        </div>
        {prs.length ? (
          prs.slice(0, 8).map((p) => {
            const grp = getGroupById(p.ex.g);
            return (
              <div
                key={p.ex.id}
                className="row-between"
                style={{ padding: '10px 0', borderTop: '1px solid var(--line)' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.ex.n}</div>
                  <div className="tiny muted">{grp?.short} · mejor serie</div>
                </div>
                <div className="mono" style={{ fontWeight: 700 }}>
                  {p.w} {u} <span className="tiny muted">× {p.r}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="small muted" style={{ marginTop: '8px' }}>
            Tus récords aparecerán al registrar pesos.
          </p>
        )}
      </div>

      {/* Body Weight */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="h-row">
          <h3>Peso corporal</h3>
          <span className="tiny muted">{u}</span>
        </div>
        <div className="row" style={{ marginTop: '10px' }}>
          <input
            id="bw-input"
            className="input sm"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="Peso de hoy"
            style={{ flex: 1 }}
            value={bwInput}
            onChange={(e) => setBwInput(e.target.value)}
          />
          <button className="btn sm" onClick={handleAddWeight}>
            Añadir
          </button>
        </div>
        <div style={{ marginTop: '8px' }}>
          {recentWeights.length ? (
            recentWeights.map((w, idx) => (
              <div
                key={idx}
                className="row-between"
                style={{ padding: '8px 0', borderTop: '1px solid var(--line)' }}
              >
                <span className="small muted">{fmtDate(w.date)}</span>
                <b className="mono">
                  {w.kg} {u}
                </b>
              </div>
            ))
          ) : (
            <p className="small muted" style={{ marginTop: '8px' }}>
              Sin registros de peso corporal.
            </p>
          )}
        </div>
      </div>

      {/* History */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="h-row">
          <h3>Historial</h3>
          <span className="tiny muted">{logs.length} sesiones</span>
        </div>
        <div style={{ marginTop: '4px' }}>
          {logsSorted.length ? (
            logsSorted.slice(0, 20).map((l) => {
              const setsCount = (l.entries || []).reduce(
                (a, e) => a + (e.sets || []).length,
                0
              );
              return (
                <div
                  key={l.id}
                  className="row-between"
                  style={{
                    padding: '10px 0',
                    borderTop: '1px solid var(--line)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedLog(l)}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{l.dayName}</div>
                    <div className="tiny muted">
                      {fmtDate(l.date)} · {setsCount} series
                      {l.routineName ? ` · ${l.routineName}` : ''}
                    </div>
                  </div>
                  <span className="tiny muted">›</span>
                </div>
              );
            })
          ) : (
            <p className="small muted" style={{ marginTop: '8px' }}>
              Todavía no hay entrenos registrados.
            </p>
          )}
        </div>
      </div>

      {/* Log detail modal */}
      <LogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onDeleted={() => {
          setSelectedLog(null);
          onShowToast('Registro borrado');
        }}
      />
    </div>
  );
};
