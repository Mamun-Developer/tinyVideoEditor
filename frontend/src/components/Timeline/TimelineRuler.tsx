import React from 'react';

interface TimelineRulerProps {
  duration: number;
  zoom: number;
  timeToPixels: (time: number) => number;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  duration,
  zoom,
  timeToPixels
}) => {
  const markers = [];
  const step = zoom >= 1 ? 1 : 5; // Show markers every second or every 5 seconds

  for (let time = 0; time <= duration; time += step) {
    markers.push(
      <div
        key={time}
        className="timeline-marker"
        style={{ left: timeToPixels(time) }}
      >
        <div className="timeline-marker-line" />
        <div className="timeline-marker-text">
          {formatTime(time)}
        </div>
      </div>
    );
  }

  return <div className="timeline-ruler">{markers}</div>;
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
