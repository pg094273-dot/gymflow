import React from 'react';
import { Routine } from '../types';
import { EXERCISES_BY_ID, getGroupById } from '../data/exercises';
import { balanceReport } from '../services/generator';
import { Figure } from './Figure';
import { useStore } from '../context/StoreContext';

interface PrintAreaProps {
  routine: Routine | null;
}

export const PrintArea: React.FC<PrintAreaProps> = ({ routine }) => {
  const { settings } = useStore();

  if (!routine) return <div id="print-area" aria-hidden="true" />;

  const totalEx = routine.days.reduce((a, d) => a + d.exercises.length, 0);
  const dateStr = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const fmtRest = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const balance = balanceReport(routine);

  return (
    <div id="print-area" aria-hidden="true">
      {/* Cover Page */}
      <section className="pdf-page">
        <div className="pdf-head">
          <div>
            <div className="pdf-brand">GYMFLOW · Plan de entrenamiento</div>
            <div className="pdf-title">{routine.name}</div>
            <div className="pdf-sub">
              {routine.days.length} días/semana · {totalEx} ejercicios
              {routine.meta?.split ? ` · ${routine.meta.split}` : ''}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="pdf-brand">{dateStr}</div>
            <div className="pdf-sub">{settings.name || ''}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6mm', flexWrap: 'wrap', marginBottom: '5mm' }}>
          {routine.days.map((d, i) => (
            <div
              key={d.id}
              style={{
                flex: '1 1 45%',
                border: '1px solid #e2e2e2',
                borderRadius: '3mm',
                padding: '3mm 4mm'
              }}
            >
              <div style={{ fontSize: '7.5pt', textTransform: 'uppercase', letterSpacing: '.08em', color: '#888' }}>
                Día {i + 1}
              </div>
              <div style={{ fontWeight: 800, fontSize: '11pt' }}>{d.name}</div>
              <div style={{ fontSize: '8pt', color: '#666' }}>
                {d.exercises.length} ejercicios · ~{d.estimated || 45} min
              </div>
            </div>
          ))}
        </div>

        <div className="pdf-tip">
          <b>Cómo usar esta hoja:</b> respeta el orden de los ejercicios (compuestos primero), descansa lo indicado entre series y anota el peso que uses. Si completas todas las repeticiones del rango con buena técnica en las 2 últimas series, sube el peso en la próxima sesión.
        </div>

        <table className="pdf-table" style={{ marginTop: '6mm' }}>
          <thead>
            <tr>
              <th style={{ width: '22mm' }}>Grupo</th>
              <th>Series semanales</th>
            </tr>
          </thead>
          <tbody>
            {balance.map((b) => (
              <tr key={b.group.id}>
                <td style={{ fontWeight: 700 }}>{b.group.short}</td>
                <td>{b.sets} series</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pdf-foot">
          {routine.name} · generado con GYMFLOW · {dateStr}
        </div>
      </section>

      {/* Routine Daily Pages */}
      {routine.days.map((d, di) => (
        <section key={d.id} className="pdf-page">
          <div className="pdf-head" style={{ paddingBottom: '3mm', marginBottom: '4mm' }}>
            <div>
              <div className="pdf-brand">{routine.name}</div>
              <div className="pdf-day">
                Día {di + 1} · {d.name}
              </div>
              <div className="pdf-day-meta">
                {d.exercises.length} ejercicios · descanso estimado {d.estimated || 45} min · {settings.duration || 45} min disponibles
              </div>
            </div>
            <div className="pdf-brand" style={{ textAlign: 'right' }}>
              {dateStr}
            </div>
          </div>

          <table className="pdf-table">
            <thead>
              <tr>
                <th style={{ width: '8mm' }} />
                <th>Ejercicio</th>
                <th>Series × reps</th>
                <th>Descanso</th>
                <th style={{ width: '34mm' }}>Peso × reps</th>
              </tr>
            </thead>
            <tbody>
              {d.exercises.map((e, i) => {
                const ex = EXERCISES_BY_ID[e.exId];
                if (!ex) return null;
                const g = getGroupById(ex.g);
                return (
                  <tr key={i}>
                    <td style={{ width: '8mm', fontWeight: 800, color: '#999' }}>{i + 1}</td>
                    <td>
                      <div className="pdf-ex">
                        <div style={{ width: '22mm', height: '22mm' }}>
                          <Figure patternId={ex.p} />
                        </div>
                        <div>
                          <div className="n">{ex.n}</div>
                          <div className="m">
                            {g?.short} · {ex.s}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="pdf-sets">
                      {e.sets} × {e.reps}
                    </td>
                    <td className="pdf-rest">{fmtRest(e.rest)}</td>
                    <td className="pdf-log">___ × ___</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pdf-legend">
            Calentamiento: 5-8 min de movilidad y 2 series de aproximación con cargas ligeras en el primer ejercicio.
          </div>
          <div className="pdf-foot">Hoja de registro · apunta el peso y las repeticiones de cada serie</div>
        </section>
      ))}
    </div>
  );
};
