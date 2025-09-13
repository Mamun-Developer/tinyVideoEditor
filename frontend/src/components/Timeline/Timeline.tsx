import React, { useState, useRef, useEffect } from 'react';
import { TimelineProps, TimelineTrack } from './types';
import { TimelineRuler } from './TimelineRuler';
import { TimelineTracks } from './TimelineTracks';
import { TimelineControls } from './TimelineControls';
import './Timeline.css';

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  tracks,
  onTimeUpdate,
  onTrackUpdate,
  onTrackAdd,
  onTrackDelete
}) => {
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Convert time to pixels based on zoom level
  const timeToPixels = (time: number) => {
    return time * (100 * zoom); // 100px per second at zoom level 1
  };

  // Convert pixels to time based on zoom level
  const pixelsToTime = (pixels: number) => {
    return pixels / (100 * zoom);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = Math.max(0, Math.min(duration, pixelsToTime(x)));
    onTimeUpdate(newTime);
  };

  const handleTrackDrag = (trackId: string, deltaTime: number) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const newTrack: TimelineTrack = {
      ...track,
      startTime: Math.max(0, track.startTime + deltaTime),
      endTime: Math.min(duration, track.endTime + deltaTime)
    };

    onTrackUpdate(newTrack);
  };

  const handleTrackResize = (trackId: string, isStart: boolean, deltaTime: number) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const newTrack: TimelineTrack = {
      ...track,
      startTime: isStart ? Math.max(0, track.startTime + deltaTime) : track.startTime,
      endTime: !isStart ? Math.min(duration, track.endTime + deltaTime) : track.endTime
    };

    onTrackUpdate(newTrack);
  };

  return (
    <div className="timeline-container">
      <TimelineControls 
        zoom={zoom}
        onZoomIn={() => setZoom(z => Math.min(z * 1.2, 5))}
        onZoomOut={() => setZoom(z => Math.max(z / 1.2, 0.2))}
      />
      
      <div 
        ref={timelineRef}
        className="timeline"
        style={{ width: timeToPixels(duration) }}
        onClick={handleTimelineClick}
      >
        <TimelineRuler 
          duration={duration}
          zoom={zoom}
          timeToPixels={timeToPixels}
        />
        
        <TimelineTracks
          tracks={tracks}
          currentTime={currentTime}
          selectedTrackId={selectedTrackId}
          timeToPixels={timeToPixels}
          onTrackSelect={setSelectedTrackId}
          onTrackDrag={handleTrackDrag}
          onTrackResize={handleTrackResize}
          onTrackDelete={onTrackDelete}
        />

        <div 
          className="timeline-playhead"
          style={{ left: timeToPixels(currentTime) }}
        />
      </div>
    </div>
  );
};
