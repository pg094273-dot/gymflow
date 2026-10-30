import React, { useState } from 'react';
import { Exercise, MuscleGroup } from '../types';
import { Figure } from './Figure';
import { getPostureGuideForExercise } from '../data/postureGuides';

interface ExerciseMotionViewerProps {
  exercise: Exercise;
  group?: MuscleGroup;
}

export const ExerciseMotionViewer: React.FC<ExerciseMotionViewerProps> = ({
  exercise,
  group
}) => {
  const [viewMode, setViewMode] = useState<'animated' | 'sideBySide' | 'phase0' | 'phase1'>('animated');
  const guide = getPostureGuideForExercise(exercise.p, group?.name);
  const accentColor = group?.color || '#c6f24e';

  return (
    <div className="motion-viewer" style={{ marginTop: '12px' }}>
      {/* Mode Selector Tabs */}
      <div className="seg" style={{ marginBottom: '10px' }}>
        <button
          type="button"
          className={viewMode === 'animated' ? 'on' : ''}
          onClick={() => setViewMode('animated')}
          style={{ fontSize: '13px' }}
        >
          🎬 Animación
        </button>
        <button
          type="button"
          className={viewMode === 'sideBySide' ? 'on' : ''}
          onClick={() => setViewMode('sideBySide')}
          style={{ fontSize: '13px' }}
        >
          ↔️ Inicio vs Fin
        </button>
        <button
          type="button"
          className={viewMode === 'phase0' ? 'on' : ''}
          onClick={() => setViewMode('phase0')}
          style={{ fontSize: '13px' }}
        >
          1️⃣ Inicio
        </button>
        <button
          type="button"
          className={viewMode === 'phase1' ? 'on' : ''}
          onClick={() => setViewMode('phase1')}
          style={{ fontSize: '13px' }}
        >
          2️⃣ Contracción
        </button>
      </div>

      {/* Main Display Area */}
      <div
        className="fig-hero"
        style={{
          position: 'relative',
          padding: '14px',
          background: 'radial-gradient(120% 110% at 50% 0%, rgba(198,242,78,.14), rgba(15,21,29,1) 75%)',
          borderRadius: '20px',
          border: '1px solid var(--line)',
          minHeight: '190px'
        }}
      >
        {viewMode === 'animated' && (
          <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto', textAlign: 'center' }}>
            <Figure patternId={exercise.p} mode="animated" accentColor={accentColor} />
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
              <span className="tiny" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                ● Repetición en bucle
              </span>
              <span className="tiny muted">{guide.tempo}</span>
            </div>
          </div>
        )}

        {viewMode === 'sideBySide' && (
          <div style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
            <Figure patternId={exercise.p} mode="sideBySide" accentColor={accentColor} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginTop: '10px'
              }}
            >
              <div
                style={{
                  background: 'rgba(20,27,36,.85)',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '6px 8px',
                  textAlign: 'center'
                }}
              >
                <div className="tiny" style={{ color: 'var(--muted)', fontWeight: 700 }}>
                  1. POSICIÓN INICIAL
                </div>
                <div className="tiny" style={{ color: '#cfdae8', marginTop: '2px' }}>
                  Colocación y estiramiento
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(198,242,78,.12)',
                  border: '1px solid rgba(198,242,78,.35)',
                  borderRadius: '10px',
                  padding: '6px 8px',
                  textAlign: 'center'
                }}
              >
                <div className="tiny" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  2. MÁXIMA CONTRACCIÓN
                </div>
                <div className="tiny" style={{ color: '#cfdae8', marginTop: '2px' }}>
                  Pico de tensión muscular
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'phase0' && (
          <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                background: '#1a2330',
                border: '1px solid var(--line)',
                padding: '3px 10px',
                borderRadius: '99px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                marginBottom: '8px'
              }}
            >
              FASE 1: POSICIÓN DE PARTIDA / POSTURA
            </div>
            <Figure patternId={exercise.p} frame={0} accentColor={accentColor} />
          </div>
        )}

        {viewMode === 'phase1' && (
          <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(198,242,78,.16)',
                border: '1px solid rgba(198,242,78,.4)',
                padding: '3px 10px',
                borderRadius: '99px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent)',
                marginBottom: '8px'
              }}
            >
              FASE 2: CONTRACCIÓN MÁXIMA & BLOQUEO
            </div>
            <Figure patternId={exercise.p} frame={1} accentColor={accentColor} />
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
