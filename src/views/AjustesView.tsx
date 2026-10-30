import React, { useRef, useState } from 'react';
import { useStore, todayISO } from '../context/StoreContext';
import { PROFILES } from '../data/exercises';
import { InfoGenModal } from '../components/InfoGenModal';

interface AjustesViewProps {
  onShowToast: (msg: string) => void;
  onReset: () => void;
}

const DOW = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const AjustesView: React.FC<AjustesViewProps> = ({ onShowToast, onReset }) => {
  const { settings, updateSettings, exportJSON, importJSON, reset } = useStore();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ name: e.target.value });
  };

  const handleUnitsChange = (units: 'kg' | 'lb') => {
    updateSettings({ units });
  };

  const handleLevelChange = (level: 1 | 2 | 3) => {
    updateSettings({ level });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ profile: e.target.value });
  };

  const handleDaysChange = (delta: number) => {
    const n = Math.max(1, Math.min(5, settings.days + delta));
    const wd = [...settings.weekdays];
    while (wd.length < n) {
      for (let d = 1; d <= 7 && wd.length < n; d++) {
        if (!wd.includes(d)) wd.push(d);
      }
    }
    wd.sort();
    updateSettings({ days: n, weekdays: wd.slice(0, n) });
  };

  const handleToggleDay = (d: number) => {
    let wd = [...settings.weekdays];
    const idx = wd.indexOf(d);
    if (idx >= 0) {
      if (wd.length > 1) wd.splice(idx, 1);
    } else {
      wd.push(d);
      wd.sort();
      if (wd.length > settings.days) {
        wd = wd.slice(0, settings.days);
      }
    }
    updateSettings({ weekdays: wd });
  };

  const handleBackup = () => {
    const txt = exportJSON();
    const blob = new Blob([txt], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gymflow-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Copia exportada');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJSON(reader.result as string);
        onShowToast('Copia restaurada');
        onReset();
      } catch (err) {
        onShowToast('Archivo no válido');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('¿Borrar TODOS los datos (rutinas, registros y ajustes)?')) {
      reset();
      onShowToast('Datos borrados');
      onReset();
    }
  };

  return (
    <div>
      {/* Settings Card */}
      <div className="card">
        <div className="field" style={{ marginTop: 0 }}>
          <div className="lbl">Tu nombre</div>
          <input
            id="set-name"
            className="input"
            placeholder="Opcional"
            value={settings.name || ''}
            onChange={handleNameChange}
          />
        </div>

        <div className="field">
          <div className="lbl">Unidades</div>
          <div className="seg">
            <button
              type="button"
              className={settings.units === 'kg' ? 'on' : ''}
              onClick={() => handleUnitsChange('kg')}
            >
              kg
            </button>
            <button
              type="button"
              className={settings.units === 'lb' ? 'on' : ''}
              onClick={() => handleUnitsChange('lb')}
            >
              lb
            </button>
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
                className={settings.level === lvl.val ? 'on' : ''}
                onClick={() => handleLevelChange(lvl.val)}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <div className="lbl">Equipamiento disponible</div>
          <select
            id="set-profile"
            className="select"
            value={settings.profile}
            onChange={handleProfileChange}
          >
            {PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.desc}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <div className="lbl">Días por semana</div>
          <div className="stepper">
            <button type="button" onClick={() => handleDaysChange(-1)}>
              −
            </button>
            <div className="val">{settings.days}</div>
            <button type="button" onClick={() => handleDaysChange(1)}>
              +
            </button>
          </div>
        </div>

        <div className="field">
          <div className="lbl">Días de entrenamiento</div>
          <div className="row" style={{ gap: '6px' }}>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => {
              const on = settings.weekdays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  className={`chip ${on ? 'on' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => handleToggleDay(d)}
                >
                  {DOW[d]}
                </button>
              );
            })}
          </div>
          <p className="tiny muted" style={{ marginTop: '6px' }}>
            Elige {settings.days} días: los que marques se usarán en orden.
          </p>
        </div>

        <div className="field">
          <div className="lbl">Tiempo por sesión</div>
          <div className="seg">
            {[30, 45, 60, 90].map((m) => (
              <button
                key={m}
                type="button"
                className={settings.duration === m ? 'on' : ''}
                onClick={() => updateSettings({ duration: m })}
              >
                {m}'
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences & Info */}
      <div className="card" style={{ marginTop: '14px' }}>
        <div className="set-row" style={{ paddingTop: 0 }}>
          <div>
            <div className="t">Temporizador de descanso</div>
            <div className="s">Avisa al terminar cada serie</div>
          </div>
          <div
            className={`switch ${settings.autoRest ? 'on' : ''}`}
            onClick={() => updateSettings({ autoRest: !settings.autoRest })}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <div className="set-row">
          <div>
            <div className="t">Recomendaciones</div>
            <div className="s">Cómo se generan las rutinas</div>
          </div>
          <button className="btn sm ghost" onClick={() => setIsInfoOpen(true)}>
            Ver
          </button>
        </div>
      </div>

      {/* Data card */}
      <div className="card" style={{ marginTop: '14px' }}>
        <h3>Datos</h3>
        <p className="small muted" style={{ marginTop: '6px' }}>
          Tus datos se guardan solo en este dispositivo.
        </p>
        <div className="btn-row" style={{ marginTop: '12px' }}>
          <button className="btn sm" onClick={handleBackup}>
            Exportar copia
          </button>
          <button
            className="btn sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Importar copia
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={handleRestoreFile}
        />
        <button
          className="btn sm danger block"
          style={{ marginTop: '10px' }}
          onClick={handleResetData}
        >
          Borrar todos los datos
        </button>
      </div>

      {/* Install Card */}
      <div className="card" style={{ marginTop: '14px' }}>
        <h3>Instalar en el móvil</h3>
        <p className="small muted" style={{ marginTop: '6px' }}>
          <b>iPhone:</b> abre esta página en Safari → Compartir → «Añadir a pantalla de inicio».
          <br />
          <br />
          <b>Android:</b> abre en Chrome → menú ⋮ → «Instalar aplicación».
        </p>
        <p className="tiny muted" style={{ marginTop: '10px' }}>
          GYMFLOW · v1.0 · funciona sin conexión
        </p>
      </div>

      <InfoGenModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
};
