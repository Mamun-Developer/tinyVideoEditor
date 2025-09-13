import axios from "axios";
import { UploadVideoResponse, EditVideoRequest, EditVideoResponse, TextOverlay } from "@tiny-video-editor/common";

const API_URL = "http://localhost:3000"; // backend URL

// Upload a video to backend
export const uploadVideo = async (file: File): Promise<UploadVideoResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    console.log('Uploading file:', file.name); // Debug log

    const response = await axios.post<UploadVideoResponse>(API_URL+"/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000, // 30 second timeout
    });

    console.log('Upload response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Upload failed: ' + (error instanceof Error ? error.message : String(error))
    };
  }
};

// Apply text overlays
export const editVideo = async (videoId: string, overlays: TextOverlay[]): Promise<EditVideoResponse> => {
  try {
    console.log('Sending to API:', { videoId, overlays }); // Debug log
    
    const request: EditVideoRequest = { 
      videoId, 
      textOverlays: overlays
    };
    
    const response = await axios.post<EditVideoResponse>(API_URL+"/edit", request, {
      timeout: 30000, // 30 second timeout
    });

    console.log('Edit response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Edit error:', error);
    return {
      success: false,
      error: 'Edit failed: ' + (error instanceof Error ? error.message : String(error))
    };
  }
};

export const getFullUrl = (videoUrl: string) => {
  return API_URL+ videoUrl
}