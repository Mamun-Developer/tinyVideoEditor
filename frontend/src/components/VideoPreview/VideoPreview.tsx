import React, { useRef, useEffect, useState } from 'react';
import { TextOverlay } from '../../types/api';
import './VideoPreview.css';

interface VideoPreviewProps {
  videoUrl: string;
  currentTime: number;
  overlays: TextOverlay[];
  onOverlayUpdate: (overlay: TextOverlay) => void;
  onTimeUpdate: (time: number) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  videoUrl,
  currentTime,
  overlays,
  onOverlayUpdate,
  onTimeUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Throttle time updates to prevent excessive rendering
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Only update time if change is from timeline and not from video playback
    if (!isUserSeeking && Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime, isUserSeeking]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = (e: Event) => {
      if (!isUserSeeking) {
        const time = (e.target as HTMLVideoElement).currentTime;
        // Only update if change is significant
        if (Math.abs(time - currentTime) > 0.1) {
          onTimeUpdate(time);
        }
      }
    };

    const handleSeeking = () => setIsUserSeeking(true);
    const handleSeeked = () => setIsUserSeeking(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [currentTime, isUserSeeking, onTimeUpdate]);

  const handleOverlayMouseDown = (
    e: React.MouseEvent,
    overlay: TextOverlay
  ) => {
    e.preventDefault();
    const video = videoRef.current;
    const container = e.currentTarget.parentElement;
    if (!video || !container) return;

    const videoRect = container.getBoundingClientRect();
    setSelectedOverlay(overlay.text);
    setIsDragging(true);

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position relative to video container
      const x = e.clientX - videoRect.left;
      const y = e.clientY - videoRect.top;

      // Convert to percentages
      const newX = Math.max(0, Math.min(100, (x / videoRect.width) * 100));
      const newY = Math.max(0, Math.min(100, (y / videoRect.height) * 100));

      onOverlayUpdate({
        ...overlay,
        position: { x: newX, y: newY }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getVisibleOverlays = () => {
    return overlays.filter(overlay => 
      Math.abs(overlay.timestamp - currentTime) < 5 // Show overlays within 5 seconds
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 640, height: 360 });
  const [scale, setScale] = useState(1);

  const handleResize = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setSize({ width, height });
      updateScale(width);
    }
  };

  const updateScale = (containerWidth: number) => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.videoWidth > 0) {
        setScale(containerWidth / video.videoWidth);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        updateScale(size.width);
      };
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    }
  }, [size.width]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="video-preview-container"
      style={{ 
        width: size.width,
        height: 'auto'
      }}
    >
      <div className="video-preview">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        />
        {/* Render text overlays */}
      <div className="overlays">
        {getVisibleOverlays().map((overlay) => (
          <div
            key={overlay.text}
            className={`overlay ${selectedOverlay === overlay.text ? 'selected' : ''}`}
            style={{
              left: `${overlay.position.x}%`,
              top: `${overlay.position.y}%`,
              color: overlay.style.fontColor,
              fontSize: `${overlay.style.fontSize * scale}px`,
              backgroundColor: `${overlay.style.backgroundColor}${Math.round(overlay.style.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
              padding: `${overlay.style.padding}px`,
              border: `${overlay.style.borderWidth}px solid ${overlay.style.borderColor}`,
            }}
            onMouseDown={(e) => handleOverlayMouseDown(e, overlay)}
          >
            {overlay.text}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};
