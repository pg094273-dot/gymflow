import React, { useState, useEffect, useCallback } from 'react';
import { RouteState, TabName, Routine } from './types';
import { useStore } from './context/StoreContext';
import { Topbar } from './components/Topbar';
import { Tabbar } from './components/Tabbar';
import { Toast } from './components/Toast';
import { RestBar } from './components/RestBar';
import { PrintArea } from './components/PrintArea';
import { GeneratorModal } from './components/GeneratorModal';
import { HoyView } from './views/HoyView';
import { RutinasView } from './views/RutinasView';
import { RoutineDetailView } from './views/RoutineDetailView';
import { EjerciciosView } from './views/EjerciciosView';
import { ProgresoView } from './views/ProgresoView';
import { AjustesView } from './views/AjustesView';
import { SesionView } from './views/SesionView';
import { EditorView } from './views/EditorView';

function parseHash(hash: string): RouteState {
  const h = hash.replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  if (!parts.length) return { name: 'hoy' };
  if (parts[0] === 'rutinas' && parts[1]) return { name: 'rutina', id: parts[1] };
  if (parts[0] === 'sesion' && parts[1]) {
    return { name: 'sesion', rid: parts[1], dayId: parts[2] || 'd1' };
  }
  if (parts[0] === 'editar') {
    return { name: 'editar', rid: parts[1] };
  }
  if (['hoy', 'rutinas', 'ejercicios', 'progreso', 'ajustes'].includes(parts[0])) {
    return { name: parts[0] as any };
  }
  return { name: 'hoy' };
}

export const App: React.FC = () => {
  const { settings, getRoutine, activeRoutine } = useStore();

  const [route, setRoute] = useState<RouteState>(() => parseHash(window.location.hash));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimeout, setToastTimeout] = useState<any>(null);

  // Generator modal
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  // Rest timer
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);

  // Printable routine state for PDF export
  const [printRoutine, setPrintRoutine] = useState<Routine | null>(null);

  // Hash router sync
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((hash: string) => {
    window.location.hash = hash;
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeout) clearTimeout(toastTimeout);
    const t = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
    setToastTimeout(t);
  }, [toastTimeout]);

  // Greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    const name = settings.name ? `, ${settings.name}` : '';
    if (h < 6) return `Buenas noches${name}`;
    if (h < 13) return `Buenos días${name}`;
    if (h < 20) return `Buenas tardes${name}`;
    return `Buenas noches${name}`;
  };

  // Rest timer countdown
  useEffect(() => {
    if (restSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setRestSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [restSecondsLeft]);

  const handleStartRest = (seconds: number) => {
    if (!settings.autoRest) return;
    setRestSecondsLeft(seconds);
  };

  const handleExportPDF = (id: string) => {
    const target = getRoutine(id) || activeRoutine;
    if (!target) {
      showToast('Crea una rutina primero');
      return;
    }
    setPrintRoutine(target);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Current tab
  const getCurrentTab = (): TabName => {
    if (route.name === 'rutina' || route.name === 'editar') return 'rutinas';
    if (route.name === 'sesion') return 'hoy';
    return route.name as TabName;
  };

  // Render topbar based on route
  const renderTopbar = () => {
    switch (route.name) {
      case 'hoy':
        return (
          <Topbar
            greeting={getGreeting()}
            actionIcon="ajustes"
            actionLabel="Ajustes"
            onAction={() => navigate('#/ajustes')}
          />
        );
      case 'rutinas':
        return (
          <Topbar
            title="Rutinas"
            actionIcon="plus"
            actionLabel="Generar rutina"
            onAction={() => setIsGeneratorOpen(true)}
          />
        );
      case 'rutina': {
        const r = getRoutine(route.id);
        return (
          <Topbar
            title={r?.name || 'Rutina'}
            isBack
            onBack={() => {
              if (window.history.length > 1) window.history.back();
              else navigate('#/rutinas');
            }}
          />
        );
      }
      case 'ejercicios':
        return <Topbar title="Ejercicios" />;
      case 'progreso':
        return <Topbar title="Progreso" />;
      case 'ajustes':
        return <Topbar title="Ajustes" />;
      case 'sesion':
        return (
          <Topbar
            title="Entrenamiento"
            isBack
            onBack={() => {
              if (window.history.length > 1) window.history.back();
              else navigate('#/hoy');
            }}
          />
        );
      case 'editar':
        return (
          <Topbar
            title={route.rid ? 'Editar rutina' : 'Nueva rutina'}
            isBack
            onBack={() => {
              if (window.history.length > 1) window.history.back();
              else navigate('#/rutinas');
            }}
          />
        );
      default:
        return <Topbar greeting={getGreeting()} />;
    }
  };

  // Render current view
  const renderView = () => {
    switch (route.name) {
      case 'hoy':
        return (
          <HoyView
            onStartSession={(rid, did) => navigate(`#/sesion/${rid}/${did}`)}
            onGoRoutine={(rid) => navigate(`#/rutinas/${rid}`)}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onNewRoutineManual={() => navigate('#/editar')}
            onGoProgreso={() => navigate('#/progreso')}
            onShowToast={showToast}
          />
        );
      case 'rutinas':
        return (
          <RutinasView
            onGoRoutine={(id) => navigate(`#/rutinas/${id}`)}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onNewRoutineManual={() => navigate('#/editar')}
            onExportPDF={handleExportPDF}
            onShowToast={showToast}
          />
        );
      case 'rutina':
        return (
          <RoutineDetailView
            routineId={route.id}
            onBack={() => navigate('#/rutinas')}
            onEdit={(id) => navigate(`#/editar/${id}`)}
            onStartSession={(rid, did) => navigate(`#/sesion/${rid}/${did}`)}
            onExportPDF={handleExportPDF}
            onShowToast={showToast}
          />
        );
      case 'ejercicios':
        return <EjerciciosView />;
      case 'progreso':
        return <ProgresoView onShowToast={showToast} />;
      case 'ajustes':
        return (
          <AjustesView
            onShowToast={showToast}
            onReset={() => navigate('#/hoy')}
          />
        );
      case 'sesion':
        return (
          <SesionView
            routineId={route.rid}
            dayId={route.dayId}
            onFinish={() => navigate('#/hoy')}
            onStartRest={handleStartRest}
            onShowToast={showToast}
          />
        );
      case 'editar':
        return (
          <EditorView
            routineId={route.rid}
            onSaved={(id) => navigate(`#/rutinas/${id}`)}
            onShowToast={showToast}
          />
        );
      default:
        return (
          <HoyView
            onStartSession={(rid, did) => navigate(`#/sesion/${rid}/${did}`)}
            onGoRoutine={(rid) => navigate(`#/rutinas/${rid}`)}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onNewRoutineManual={() => navigate('#/editar')}
            onGoProgreso={() => navigate('#/progreso')}
            onShowToast={showToast}
          />
        );
    }
  };

  return (
    <div className="app">
      {renderTopbar()}
      <main className="view">{renderView()}</main>
      <Tabbar
        currentTab={getCurrentTab()}
        onSelectTab={(tab) => navigate(`#/${tab}`)}
      />

      {/* Rest timer bar */}
      <RestBar
        secondsLeft={restSecondsLeft}
        onSkip={() => setRestSecondsLeft(0)}
        onAdd30={() => setRestSecondsLeft((s) => s + 30)}
        onExpire={() => setRestSecondsLeft(0)}
      />

      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* Generator Modal */}
      <GeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onGenerated={(rid) => navigate(`#/rutinas/${rid}`)}
      />

      {/* Print Area for PDF A4 */}
      <PrintArea routine={printRoutine} />
    </div>
  );
};
