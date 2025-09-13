// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Text Style Options
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

// Default text style
export const defaultTextStyle: TextStyle = {
  fontFamily: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  fontSize: 32,
  fontColor: '#FFFFFF',
  backgroundColor: '#000000',
  backgroundOpacity: 0.5,
  padding: 10,
  borderWidth: 2,
  borderColor: '#000000'
};

// Text Overlay Types
export interface TextOverlay {
  text: string;
  position: {
    x: number;
    y: number;
  };
  timestamp: number;
  style: TextStyle;
}

// Video Upload Types
export interface UploadedVideo {
  fileName: string;
}

export type UploadVideoResponse = ApiResponse<UploadedVideo>;

// Video Edit Types
export interface EditVideoRequest {
  videoId: string;
  textOverlays: TextOverlay[];
}

export interface EditedVideo {
  outputPath: string;
}

export type EditVideoResponse = ApiResponse<EditedVideo>;

// API Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
