import { TextOverlay } from "@tiny-video-editor/common";

export interface TimelineTrack {
  id: string;
  type: 'overlay' | 'effect' | 'transition';  // Extensible for future features
  startTime: number;
  endTime: number;
  data: TextOverlay | any;  // Union type for future track types
}

export interface TimelineProps {
  duration: number;  // Video duration in seconds
  currentTime: number;
  tracks: TimelineTrack[];
  onTimeUpdate: (time: number) => void;
  onTrackUpdate: (track: TimelineTrack) => void;
  onTrackAdd: (track: TimelineTrack) => void;
  onTrackDelete: (trackId: string) => void;
}

export interface TimelineState {
  isDragging: boolean;
  selectedTrackId: string | null;
  zoom: number;
}
