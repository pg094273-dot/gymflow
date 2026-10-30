import React, { useEffect } from 'react';

interface RestBarProps {
  secondsLeft: number;
  onSkip: () => void;
  onAdd30: () => void;
  onExpire: () => void;
}

export function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.12;
    o.start();
    setTimeout(() => {
      try {
        o.stop();
        ctx.close();
      } catch (err) {
        // ignore
      }
    }, 220);
  } catch (e) {
    // ignore
  }
}

export const RestBar: React.FC<RestBarProps> = ({
  secondsLeft,
  onSkip,
  onAdd30,
  onExpire
}) => {
  useEffect(() => {
    if (secondsLeft <= 0) {
      playBeep();
      onExpire();
    }
  }, [secondsLeft, onExpire]);

  if (secondsLeft <= 0) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div id="rest-bar" className="rest-bar">
      <span>Descanso</span>
      <span className="t">{timeFormatted}</span>
      <span style={{ marginLeft: 'auto' }} />
      <button type="button" onClick={onSkip}>
        Saltar
      </button>
      <button type="button" onClick={onAdd30}>
        +30s
      </button>
    </div>
  );
};
