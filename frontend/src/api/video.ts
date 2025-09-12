import axios from "axios";
const API_URL = "http://localhost:3000"; // backend URL

// Upload a video to backend
export const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(API_URL+"/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Apply text overlays
export const editVideo = async (videoId: string, overlays: any) => {
  const response = await axios.post(API_URL+"/edit", { videoId, overlays });
  return response.data;
};

export const getFullUrl = (videoUrl: string) => {
  return API_URL+ videoUrl
}