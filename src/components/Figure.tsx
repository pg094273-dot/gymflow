import React from 'react';
import { FIG } from '../data/figures';

interface FigureProps {
  patternId: string;
  mode?: 'animated' | 'sideBySide' | 'static';
  frame?: 0 | 1;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Figure: React.FC<FigureProps> = ({
  patternId,
  mode = 'animated',
  frame,
  accentColor,
  className,
  style
}) => {
  const svgHtml = FIG.render(patternId, {
    mode,
    frame,
    accentColor,
    animated: mode === 'animated' && frame === undefined
  });

  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
};
