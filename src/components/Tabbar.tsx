import React from 'react';
import { TabName } from '../types';
import { Icon, IconName } from './Icons';

interface TabbarProps {
  currentTab: TabName;
  onSelectTab: (tab: TabName) => void;
}

const TABS: { id: TabName; label: string; icon: IconName }[] = [
  { id: 'hoy', label: 'Hoy', icon: 'hoy' },
  { id: 'rutinas', label: 'Rutinas', icon: 'rutinas' },
  { id: 'ejercicios', label: 'Ejercicios', icon: 'ejercicios' },
  { id: 'progreso', label: 'Progreso', icon: 'progreso' },
  { id: 'ajustes', label: 'Ajustes', icon: 'ajustes' }
];

export const Tabbar: React.FC<TabbarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <nav className="tabbar" aria-label="Navegación principal">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={currentTab === tab.id ? 'on' : ''}
          onClick={() => onSelectTab(tab.id)}
        >
          <Icon name={tab.icon} />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};
