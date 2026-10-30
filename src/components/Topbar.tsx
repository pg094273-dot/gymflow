import React from 'react';
import { Icon, IconName } from './Icons';

interface TopbarProps {
  title?: string;
  isBack?: boolean;
  onBack?: () => void;
  actionIcon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  greeting?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  isBack,
  onBack,
  actionIcon,
  actionLabel,
  onAction,
  greeting
}) => {
  return (
    <header className="topbar">
      {isBack ? (
        <>
          <button className="icon-btn" onClick={onBack} aria-label="Atrás">
            <Icon name="back" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 id="page-title">{title || ''}</h1>
          </div>
        </>
      ) : title ? (
        <>
          <h1 id="page-title">{title}</h1>
          {actionIcon && (
            <button className="icon-btn" onClick={onAction} aria-label={actionLabel || 'Acción'}>
              <Icon name={actionIcon} />
            </button>
          )}
        </>
      ) : (
        <>
          <div style={{ flex: 1 }}>
            <div className="sub" id="greet">
              {greeting}
            </div>
            <h1 id="page-title">GYMFLOW</h1>
          </div>
          {actionIcon && (
            <button className="icon-btn" onClick={onAction} aria-label={actionLabel || 'Ajustes'}>
              <Icon name={actionIcon} />
            </button>
          )}
        </>
      )}
    </header>
  );
};
