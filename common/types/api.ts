// Common Response Type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Text Overlay Types
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: number;  // 0-1
  padding: number;           // padding around text
  borderWidth: number;       // outline width
  borderColor: string;      // outline color
}

export interface TextOverlay {
  id?: string;
  text: string;
  position: {
    x: number;
    y: number;
  };
  timestamp: number;
  style: TextStyle;
}

// Video Types
export interface UploadedVideo {
  fileName: string;
}

export interface EditedVideo {
  outputPath: string;
}

// Request/Response Types
export interface EditVideoRequest {
  videoId: string;
  textOverlays: TextOverlay[];
}

export type UploadVideoResponse = ApiResponse<UploadedVideo>;
export type EditVideoResponse = ApiResponse<EditedVideo>;

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
