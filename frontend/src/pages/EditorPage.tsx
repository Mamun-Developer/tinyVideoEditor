import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadVideo, editVideo, getFullUrl } from "../api/video";

const EditorPage = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [overlays, setOverlays] = useState<any[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "video/*": [] },
    onDrop: (acceptedFiles) => setVideoFile(acceptedFiles[0]),
  });

  const handleUpload = async () => {
    if (!videoFile) return;
    const result = await uploadVideo(videoFile);
    setVideoUrl(result.url);
    setVideoId(result.videoId)
  };

  const handleApplyText = async () => {
    if (!videoId) return;
    const result = await editVideo(videoId, overlays);
    setVideoUrl(result.url);
  };

  const addOverlay = () => {
    const newOverlay = { text: "Sample Text", position: "top" };
    setOverlays([...overlays, newOverlay]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Tiny Video Editor</h1>

      <div {...getRootProps()} style={{ border: "2px dashed gray", padding: 20, marginBottom: 10 }}>
        <input {...getInputProps()} />
        {videoFile ? <p>{videoFile.name}</p> : <p>Drag & drop a video here</p>}
      </div>

      <button onClick={handleUpload} disabled={!videoFile} style={{ marginRight: 10 }}>
        Upload Video
      </button>

      <button onClick={addOverlay} style={{ marginRight: 10 }}>
        Add Overlay
      </button>

      <button onClick={handleApplyText} disabled={!videoId}>
        Apply Text
      </button>

      {overlays.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <h3>Current Overlays:</h3>
          {overlays.map((o, idx) => (
            <div key={idx}>{o.text} - {o.position}</div>
          ))}
        </div>
      )}

      {videoUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Preview:</h3>
          <video src={getFullUrl(videoUrl)} controls width={600} />
        </div>
      )}
    </div>
  );
};

export default EditorPage;
