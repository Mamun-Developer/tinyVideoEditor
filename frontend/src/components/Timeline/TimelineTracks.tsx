import React from 'react';
import { TimelineTrack } from './types';
import { TextStyleControls } from './TextStyleControls';
import { TextStyle, defaultTextStyle } from '../../types/api';

interface TimelineTracksProps {
  tracks: TimelineTrack[];
  currentTime: number;
  selectedTrackId: string | null;
  timeToPixels: (time: number) => number;
  onTrackSelect: (trackId: string) => void;
  onTrackDrag: (trackId: string, deltaTime: number) => void;
  onTrackResize: (trackId: string, isStart: boolean, deltaTime: number) => void;
  onTrackDelete: (trackId: string) => void;
}

export const TimelineTracks: React.FC<TimelineTracksProps> = ({
  tracks,
  currentTime,
  selectedTrackId,
  timeToPixels,
  onTrackSelect,
  onTrackDrag,
  onTrackResize,
  onTrackDelete
}) => {
  const handleMouseDown = (
    e: React.MouseEvent,
    trackId: string,
    isResizing: boolean,
    isStart?: boolean
  ) => {
    e.stopPropagation();
    const startX = e.clientX;
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaTime = deltaX / timeToPixels(1);

      if (isResizing) {
        onTrackResize(trackId, isStart || false, deltaTime);
      } else {
        onTrackDrag(trackId, deltaTime);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="timeline-tracks">
      {tracks.map(track => (
        <div
          key={track.id}
          className={`timeline-track ${selectedTrackId === track.id ? 'selected' : ''}`}
          style={{
            left: timeToPixels(track.startTime),
            width: timeToPixels(track.endTime - track.startTime)
          }}
          onClick={() => onTrackSelect(track.id)}
        >
          <div
            className="track-resize-handle left"
            onMouseDown={e => handleMouseDown(e, track.id, true, true)}
          />
          
          <div
            className="track-content"
            onMouseDown={e => handleMouseDown(e, track.id, false)}
          >
            {track.type === 'overlay' && (
              <div className="track-overlay">
                <span>{track.data.text}</span>
              </div>
            )}
          </div>

          <div
            className="track-resize-handle right"
            onMouseDown={e => handleMouseDown(e, track.id, true, false)}
          />

          <button
            className="track-delete"
            onClick={() => onTrackDelete(track.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
