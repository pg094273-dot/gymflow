import React, { useState } from 'react';
import { useStore, todayISO } from '../context/StoreContext';
import { EXERCISES_BY_ID, getGroupById } from '../data/exercises';
import { Icon } from '../components/Icons';
import { DayPickerModal } from '../components/DayPickerModal';
import { LogDetailModal } from '../components/LogDetailModal';
import { WorkoutLog } from '../types';

interface HoyViewProps {
  onStartSession: (routineId: string, dayId: string) => void;
  onGoRoutine: (routineId: string) => void;
  onOpenGenerator: () => void;
  onNewRoutineManual: () => void;
  onGoProgreso: () => void;
  onShowToast: (msg: string) => void;
}

const DOW = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DOW_LONG = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function getTodayDOW(): number {
  return ((new Date().getDay() + 6) % 7) + 1;
}

function isoOfWeekday(dow: number): string {
  const d = new Date();
  const cur = getTodayDOW();
  d.setDate(d.getDate() + (dow - cur));
  return todayISO(d);
}

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export const HoyView: React.FC<HoyViewProps> = ({
  onStartSession,
  onGoRoutine,
  onOpenGenerator,
  onNewRoutineManual,
  onGoProgreso,
  onShowToast
}) => {
  const { settings, activeRoutine, logs, logsSorted, logFor } = useStore();
  const [isDayPickerOpen, setIsDayPickerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);

  const plannedDays = settings.weekdays.slice(0, settings.days);
  const today = getTodayDOW();

  if (!activeRoutine) {
    return (
      <div>
        <div
          className="card"
          style={{
            background: 'linear-gradient(160deg, rgba(198,242,78,.14), rgba(20,27,36,1) 60%)',
            borderColor: 'rgba(198,242,78,.3)'
          }}
        >
          <div className="tiny" style={{ letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>
            Bienvenido
          </div>
          <h2 style={{ fontSize: '25px', marginTop: '6px', lineHeight: 1.15 }}>
            Tu entrenamiento,
            <br />
            organizado y equilibrado
          </h2>
          <p className="small muted" style={{ marginTop: '10px' }}>
            Elige cuántos días entrenas y la app crea una rutina equilibrada para 45 minutos, con ejercicios de gimnasio clasificados por músculo. Puedes indicar grupos musculares en los que quieres incidir más.
          </p>
          <button className="btn primary block" style={{ marginTop: '16px' }} onClick={onOpenGenerator}>
            Generar mi rutina
          </button>
          <button className="btn block ghost" style={{ marginTop: '10px' }} onClick={onNewRoutineManual}>
            Crear rutina manualmente
          </button>
        </div>

        <div className="card">
          <h3>Qué incluye</h3>
          <div className="small muted" style={{ marginTop: '8px', display: 'grid', gap: '8px' }}>
            <div>🏋️ 80+ ejercicios con dibujo de ejecución</div>
            <div>🎯 Reparto de volumen equilibrado por grupo muscular</div>
            <div>⏱️ Rutinas ajustadas a 30, 45, 60 o 90 minutos</div>
            <div>📝 Registro de pesos, series y progreso</div>
            <div>📄 Exportación a PDF A4 lista para imprimir</div>
          </div>
        </div>
      </div>
    );
  }

  const dayIndex = plannedDays.indexOf(today);
  const day = dayIndex >= 0 ? activeRoutine.days[dayIndex] : null;
  const doneToday = day ? logFor(todayISO(), activeRoutine.id, day.id) : null;

  // Next training day calculation
  let nextIdx: { dow: number; i: number } | null = null;
  for (let k = 1; k <= 7; k++) {
    const dow = ((today - 1 + k) % 7) + 1;
    const i = plannedDays.indexOf(dow);
    if (i >= 0 && i < activeRoutine.days.length) {
      nextIdx = { dow, i };
      break;
    }
  }

  // Weekly stats
  const weekStartISO = isoOfWeekday(1);
  const weekLogs = logs.filter((l) => l.date >= weekStartISO);
  let totalVolume = 0;
  weekLogs.forEach((l) => {
    (l.entries || []).forEach((en) => {
      (en.sets || []).forEach((s) => {
        if (s.done !== false) {
          totalVolume += (Number(s.w) || 0) * (Number(s.r) || 0);
        }
      });
    });
  });

  const recent = logsSorted.slice(0, 3);

  return (
    <div>
      {/* Hero: Today's training or Rest Day */}
      {day ? (
        <div
          className="card"
          style={{
            background: 'linear-gradient(160deg, rgba(198,242,78,.12), rgba(20,27,36,1) 55%)',
            borderColor: 'rgba(198,242,78,.28)'
          }}
        >
          <div className="row-between">
            <div>
              <div
                className="tiny"
                style={{
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  fontWeight: 700
                }}
              >
                {doneToday ? 'Entrenamiento hecho' : 'Hoy toca'}
              </div>
              <h2 style={{ fontSize: '26px', marginTop: '4px' }}>{day.name}</h2>
            </div>
            <div className="badge grey">Día {dayIndex + 1}</div>
          </div>

          <div className="small muted" style={{ marginTop: '6px' }}>
            {day.exercises.length} ejercicios · ~{day.estimated || 45} min · {activeRoutine.name}
          </div>

          <div style={{ marginTop: '14px', display: 'grid', gap: '6px' }}>
            {day.exercises.slice(0, 4).map((e, idx) => {
              const ex = EXERCISES_BY_ID[e.exId];
              if (!ex) return null;
              const g = getGroupById(ex.g);
              return (
                <div key={idx} className="row small" style={{ gap: '8px', color: '#c3d0df' }}>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: g?.color || 'var(--accent)'
                    }}
                  />
                  {ex.n}
                  <span className="muted tiny" style={{ marginLeft: 'auto' }}>
                    {e.sets}×{e.reps}
                  </span>
                </div>
              );
            })}
            {day.exercises.length > 4 && (
              <div className="tiny muted">+ {day.exercises.length - 4} más</div>
            )}
          </div>

          <div className="btn-row" style={{ marginTop: '16px' }}>
            <button
              className="btn primary"
              onClick={() => onStartSession(activeRoutine.id, day.id)}
            >
              <Icon name="play" size={16} />
              {doneToday ? 'Repetir o editar' : 'Empezar'}
            </button>
            <button className="btn" onClick={() => onGoRoutine(activeRoutine.id)}>
              Ver rutina
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div
            className="tiny"
            style={{
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontWeight: 700
            }}
          >
            Hoy
          </div>
          <h2 style={{ fontSize: '24px', marginTop: '4px' }}>Día de descanso</h2>
          <p className="small muted" style={{ marginTop: '6px' }}>
            Descansa, come bien y duerme. El músculo crece cuando no entrenas.
          </p>
          {nextIdx && (
            <div style={{ marginTop: '14px' }} className="row-between">
              <div className="small">
                Siguiente: <b>{activeRoutine.days[nextIdx.i].name}</b> · {DOW_LONG[nextIdx.dow]}
              </div>
              <button
                className="btn sm"
                onClick={() =>
                  onStartSession(activeRoutine.id, activeRoutine.days[nextIdx!.i].id)
                }
              >
                Adelantar
              </button>
            </div>
          )}
          <div className="btn-row" style={{ marginTop: '14px' }}>
            <button className="btn" onClick={() => setIsDayPickerOpen(true)}>
              Entrenar otro día
            </button>
          </div>
        </div>
      )}

      {/* Week overview */}
      <div className="card tight" style={{ marginTop: '14px' }}>
        <div className="week">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const i = plannedDays.indexOf(d);
            const isTrain = i >= 0 && i < activeRoutine.days.length;
            const dISO = isoOfWeekday(d);
            const done = isTrain && logs.some((l) => l.date === dISO);
            return (
              <div
                key={d}
                className={`d ${isTrain ? 'train ' : ''} ${d === today ? 'today ' : ''} ${done ? 'done' : ''}`}
              >
                {DOW[d]}
                <b>{new Date(dISO + 'T00:00:00').getDate()}</b>
              </div>
            );
          })}
        </div>
        <div className="tiny muted center" style={{ marginTop: '10px' }}>
          {plannedDays.length} días/semana · {activeRoutine.name}
        </div>
      </div>

      {/* Stats summary */}
      <div className="stat-grid" style={{ marginTop: '14px' }}>
        <div className="stat">
          <div className="v">
            {weekLogs.length}
            <small>/{plannedDays.length}</small>
          </div>
          <div className="l">Entrenos esta semana</div>
        </div>
        <div className="stat">
          <div className="v">
            {totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)}`
              : `${Math.round(totalVolume)}`}
            <small>{totalVolume >= 1000 ? 't' : settings.units}</small>
          </div>
          <div className="l">Volumen semanal</div>
        </div>
      </div>

      {/* Recent workouts */}
      {recent.length > 0 && (
        <div className="card" style={{ marginTop: '14px' }}>
          <div className="h-row">
            <h3>Últimos entrenos</h3>
            <button className="btn sm ghost" onClick={onGoProgreso}>
              Ver todo
            </button>
          </div>
          {recent.map((l) => {
            const setsCount = (l.entries || []).reduce(
              (acc, e) => acc + (e.sets || []).filter((s) => s.done !== false).length,
              0
            );
            return (
              <div
                key={l.id}
                className="row-between"
                style={{ padding: '10px 0', borderTop: '1px solid var(--line)', marginTop: '4px' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{l.dayName || 'Entreno'}</div>
                  <div className="tiny muted">
                    {fmtDate(l.date)} · {setsCount} series
                    {l.routineName ? ` · ${l.routineName}` : ''}
                  </div>
                </div>
                <button
                  className="btn sm ghost"
                  onClick={() => setSelectedLog(l)}
                >
                  Ver
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Day Picker Modal */}
      <DayPickerModal
        routine={activeRoutine}
        isOpen={isDayPickerOpen}
        onClose={() => setIsDayPickerOpen(false)}
        onSelectDay={(rid, did) => {
          setIsDayPickerOpen(false);
          onStartSession(rid, did);
        }}
      />

      {/* Log Detail Modal */}
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
