import React from 'react';

interface InfoGenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoGenModal: React.FC<InfoGenModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="sheet open"
      id="sheet"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel">
        <div className="handle" onClick={onClose} />
        <h2 style={{ fontSize: '20px' }}>Cómo se generan las rutinas</h2>
        <div className="small" style={{ marginTop: '12px', color: '#cfdae8', lineHeight: 1.55 }}>
          <p>
            <b>1. Reparto de grupos.</b> Según los días elegidos se usa un split eficiente: cuerpo completo (1-2 días), empuje/tirón/pierna (3), torso/pierna doble (4) y PPL + torso/pierna (5).
          </p>
          <p style={{ marginTop: '10px' }}>
            <b>2. Volumen equilibrado.</b> Se busca un reparto de 10-20 series semanales por grupo muscular, priorizando los grupos grandes y sin abandonar ninguno.
          </p>
          <p style={{ marginTop: '10px' }}>
            <b>3. Compuestos primero.</b> En cada sesión el primer ejercicio de cada grupo es un movimiento compuesto (más estímulo y menos tiempo).
          </p>
          <p style={{ marginTop: '10px' }}>
            <b>4. Tiempo real.</b> Cada serie se estima con su descanso (2-3 min en básicos, 1-1,5 min en aislados) + 5 min de calentamiento. Si no cabe, se recortan series antes que ejercicios.
          </p>
          <p style={{ marginTop: '10px' }}>
            <b>5. Variedad.</b> Se evitan repetir ejercicios dentro de la semana y se sortean alternativas equivalentes cada vez que generas.
          </p>
          <p style={{ marginTop: '10px' }}>
            <b>6. Progresión.</b> Cuando completes el rango alto de repeticiones en todas las series con buena técnica, sube un 2,5-5 % el peso.
          </p>
        </div>
        <button className="btn block" style={{ marginTop: '18px' }} onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
};
