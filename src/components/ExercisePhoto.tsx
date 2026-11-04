import React, { useState } from 'react';
import { Figure } from './Figure';

/**
 * Fotografías reales de ejecución.
 * Cada ejercicio tiene dos fotogramas en public/img/ex/<id>/0.webp (inicio)
 * y 1.webp (final o máxima contracción). Si la imagen no existe se dibuja
 * el pictograma vectorial de Figure como respaldo.
 */
export const exercisePhotoSrc = (exerciseId: string, frame: 0 | 1): string =>
  `${import.meta.env.BASE_URL}img/ex/${exerciseId}/${frame}.webp`;

/**
 * Precarga las fotos de una rutina antes de abrir el diálogo de impresión.
 * Si alguna imagen falla o tarda demasiado, continúa igualmente.
 */
export const preloadExercisePhotos = (exerciseIds: string[]): Promise<void> => {
  const unique = Array.from(new Set(exerciseIds.filter(Boolean)));
  if (!unique.length) return Promise.resolve();

  const pending = unique.map(
    (id) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = exercisePhotoSrc(id, 0);
      })
  );

  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 3000));
  return Promise.race([Promise.all(pending).then(() => undefined), timeout]);
};

interface ExercisePhotoProps {
  exerciseId: string;
  patternId: string;
  frame?: 0 | 1;
  alt?: string;
  className?: string;
  eager?: boolean;
}

export const ExercisePhoto: React.FC<ExercisePhotoProps> = ({
  exerciseId,
  patternId,
  frame = 0,
  alt = '',
  className,
  eager = false
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <Figure
        patternId={patternId}
        frame={frame}
        mode="static"
        className={className}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  return (
    <img
      className={className}
      src={exercisePhotoSrc(exerciseId, frame)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding={eager ? 'sync' : 'async'}
      onError={() => setFailed(true)}
    />
  );
};
