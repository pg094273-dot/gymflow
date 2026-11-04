import React, { useState } from 'react';
import { Exercise, MuscleGroup } from '../types';
import { ExercisePhoto } from './ExercisePhoto';
import { getPostureGuideForExercise } from '../data/postureGuides';

interface ExerciseMotionViewerProps {
  exercise: Exercise;
  group?: MuscleGroup;
}

type ViewMode = 'animated' | 'sideBySide' | 'phase0' | 'phase1';

export const ExerciseMotionViewer: React.FC<ExerciseMotionViewerProps> = ({
  exercise,
  group
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('sideBySide');
  const guide = getPostureGuideForExercise(exercise.p, group?.name);
  const accentColor = group?.color || '#c6f24e';

  const modeButton = (mode: ViewMode, label: string) => (
    <button
      type="button"
      className={viewMode === mode ? 'on' : ''}
      onClick={() => setViewMode(mode)}
      style={{ fontSize: '12.5px' }}
    >
      {label}
    </button>
  );

  return (
    <div className="motion-viewer" style={{ marginTop: '12px' }}>
      {/* Mode Selector Tabs */}
      <div className="seg" style={{ marginBottom: '10px' }}>
        {modeButton('sideBySide', '↔️ Inicio / fin')}
        {modeButton('animated', '🎬 Movimiento')}
        {modeButton('phase0', '1️⃣ Inicio')}
        {modeButton('phase1', '2️⃣ Fin')}
      </div>

      {/* Main Display Area */}
      <div className="ex-stage">
        {viewMode === 'animated' && (
          <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
            <div className="ex-motion playing">
              <ExercisePhoto
                exerciseId={exercise.id}
                patternId={exercise.p}
                frame={0}
                alt={`${exercise.n}: posición inicial`}
                className="ex-frame0"
                eager
              />
              <ExercisePhoto
                exerciseId={exercise.id}
                patternId={exercise.p}
                frame={1}
                alt={`${exercise.n}: posición final`}
                className="ex-frame1"
                eager
              />
              <span className="tag">Movimiento en bucle</span>
            </div>
            <div
              className="row-between"
              style={{
                marginTop: '10px',
                padding: '6px 12px',
                borderRadius: '10px',
                background: 'rgba(20, 27, 36, 0.85)',
                border: '1px solid var(--line)'
              }}
            >
              <span className="tiny" style={{ color: accentColor, fontWeight: 700 }}>
                ● Repetición en bucle
              </span>
              <span className="tiny muted">{guide.tempo}</span>
            </div>
          </div>
        )}

        {viewMode === 'sideBySide' && (
          <div style={{ width: '100%', maxWidth: '460px', margin: '0 auto' }}>
            <div className="ex-pair">
              <figure>
                <ExercisePhoto
                  exerciseId={exercise.id}
                  patternId={exercise.p}
                  frame={0}
                  alt={`${exercise.n}: posición inicial`}
                  eager
                />
                <figcaption>
                  <b>1 · Inicio</b>
                  <span>Colocación y estiramiento</span>
                </figcaption>
              </figure>
              <figure>
                <ExercisePhoto
                  exerciseId={exercise.id}
                  patternId={exercise.p}
                  frame={1}
                  alt={`${exercise.n}: posición final`}
                  eager
                />
                <figcaption className="end">
                  <b>2 · Fin</b>
                  <span>Máxima contracción</span>
                </figcaption>
              </figure>
            </div>
            <div className="tiny muted" style={{ textAlign: 'center', marginTop: '8px' }}>
              Compara las dos posiciones: fíjate en la trayectoria y en la postura de la espalda.
            </div>
          </div>
        )}

        {viewMode === 'phase0' && (
          <div className="ex-phase" style={{ maxWidth: '420px', margin: '0 auto' }}>
            <div className="ex-phase-tag">FASE 1: POSICIÓN DE PARTIDA / POSTURA</div>
            <ExercisePhoto
              exerciseId={exercise.id}
              patternId={exercise.p}
              frame={0}
              alt={`${exercise.n}: posición de partida`}
              eager
            />
          </div>
        )}

        {viewMode === 'phase1' && (
          <div className="ex-phase" style={{ maxWidth: '420px', margin: '0 auto' }}>
            <div className="ex-phase-tag end">FASE 2: CONTRACCIÓN MÁXIMA & BLOQUEO</div>
            <ExercisePhoto
              exerciseId={exercise.id}
              patternId={exercise.p}
              frame={1}
              alt={`${exercise.n}: máxima contracción`}
              eager
            />
          </div>
        )}
      </div>

      {/* Breathing & Cadence Guide */}
      <div
        className="card flat"
        style={{
          marginTop: '12px',
          background: 'rgba(15, 21, 29, 0.95)',
          border: '1px solid var(--line)',
          padding: '12px 14px'
        }}
      >
        <div className="row-between" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="tiny" style={{ letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>
              🫁 Patrón de respiración
            </div>
            <div className="small" style={{ marginTop: '4px', color: '#e2edfa', lineHeight: 1.4 }}>
              <b>Inhalar:</b> {guide.breathing.inhale}
              <br />
              <b>Exhalar:</b> {guide.breathing.exhale}
            </div>
          </div>
        </div>
      </div>

      {/* Posture & Alignment Checklist */}
      <div className="card" style={{ marginTop: '12px' }}>
        <h3 style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🛡️</span> Postura y alineación corporal
        </h3>
        <ul className="steps" style={{ marginTop: '10px' }}>
          {guide.postureInitial.map((item, idx) => (
            <li key={idx} style={{ color: '#d8e4f2', fontSize: '13.5px' }}>
              {item}
            </li>
          ))}
        </ul>

        <h3 style={{ fontSize: '14px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🔄</span> Mecánica del movimiento
        </h3>
        <ul className="steps" style={{ marginTop: '10px' }}>
          {guide.movementPhase.map((item, idx) => (
            <li key={idx} style={{ color: '#d8e4f2', fontSize: '13.5px' }}>
              {item}
            </li>
          ))}
        </ul>

        {/* Pro Tip Box */}
        <div
          style={{
            marginTop: '14px',
            background: 'rgba(78, 200, 255, 0.08)',
            borderLeft: '3px solid var(--accent-2, #4ec8ff)',
            borderRadius: '0 10px 10px 0',
            padding: '10px 12px'
          }}
        >
          <div className="tiny" style={{ color: 'var(--accent-2, #4ec8ff)', fontWeight: 700, textTransform: 'uppercase' }}>
            💡 Consejo biomecánico
          </div>
          <div className="small" style={{ color: '#eef5fc', marginTop: '3px' }}>
            {guide.proTip}
          </div>
        </div>
      </div>
    </div>
  );
};
