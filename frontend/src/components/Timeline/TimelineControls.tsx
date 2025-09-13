import React from 'react';

interface TimelineControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut
}) => {
  return (
    <div className="timeline-controls">
      <button onClick={onZoomOut} disabled={zoom <= 0.2}>-</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button onClick={onZoomIn} disabled={zoom >= 5}>+</button>
    </div>
  );
};
