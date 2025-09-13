import React, { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { uploadVideo, editVideo, getFullUrl } from "../api/video";
import { TextOverlay, defaultTextStyle } from "../types/api";
import { Timeline } from "../components/Timeline/Timeline";
import { TimelineTrack } from "../components/Timeline/types";
import { VideoPreview } from "../components/VideoPreview/VideoPreview";

const EditorPage = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        setVideoDuration(videoRef.current?.duration || 0);
      });
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "video/*": [] },
    onDrop: (acceptedFiles) => setVideoFile(acceptedFiles[0]),
  });

  const handleUpload = async () => {
    if (!videoFile) return;
    try {
      const result = await uploadVideo(videoFile);
      console.log('Upload result:', result); // Debug log
      
      if (result.success && result.data) {
        const uploadedUrl = `/uploads/${result.data.fileName}`;
        console.log('Setting video URL:', uploadedUrl); // Debug log
        setVideoUrl(uploadedUrl);
        setVideoId(result.data.fileName);
      } else {
        console.error('Upload failed:', result.error);
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleApplyText = async () => {
    if (!videoId) return;
    // Use the current state of overlays which includes any dragged positions
    console.log('Sending overlays to API:', overlays); // Debug log
    const result = await editVideo(videoId, overlays);
    if (result.success && result.data) {
      setVideoUrl(`/outputs/${result.data.outputPath}`);
    }
  };

  const [newOverlayText, setNewOverlayText] = useState("");
  const [newOverlayX, setNewOverlayX] = useState(10);
  const [newOverlayY, setNewOverlayY] = useState(10);
  const [newOverlayTimestamp, setNewOverlayTimestamp] = useState(0);

  const addOverlay = () => {
    if (!newOverlayText) return;

    const newOverlay: TextOverlay = {
      text: newOverlayText,
      position: { 
        x: newOverlayX,
        y: newOverlayY 
      },
      timestamp: newOverlayTimestamp,
      style: defaultTextStyle
    };
    
    setOverlays([...overlays, newOverlay]);
    setNewOverlayText(""); // Reset form
    console.log('Added new overlay:', newOverlay); // Debug log
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

      {videoId && (
        <div style={{ marginTop: 20, padding: 20, border: '1px solid #ccc', borderRadius: 4 }}>
          <h3>Add Text Overlay</h3>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5 }}>Text:</label>
            <input
              type="text"
              value={newOverlayText}
              onChange={(e) => setNewOverlayText(e.target.value)}
              placeholder="Enter text for overlay"
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 20, marginBottom: 15 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5 }}>X Position:</label>
              <input
                type="number"
                value={newOverlayX}
                onChange={(e) => setNewOverlayX(Number(e.target.value))}
                style={{ width: 100, padding: 8 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 5 }}>Y Position:</label>
              <input
                type="number"
                value={newOverlayY}
                onChange={(e) => setNewOverlayY(Number(e.target.value))}
                style={{ width: 100, padding: 8 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 5 }}>Timestamp (seconds):</label>
              <input
                type="number"
                value={newOverlayTimestamp}
                onChange={(e) => setNewOverlayTimestamp(Number(e.target.value))}
                min="0"
                step="0.1"
                style={{ width: 100, padding: 8 }}
              />
            </div>
          </div>

          <button 
            onClick={addOverlay}
            disabled={!newOverlayText}
            style={{ 
              padding: '8px 16px',
              backgroundColor: newOverlayText ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: newOverlayText ? 'pointer' : 'not-allowed'
            }}
          >
            Add Overlay
          </button>
        </div>
      )}

      {overlays.length > 0 && (
        <div style={{ marginTop: 20, padding: 20, border: '1px solid #ccc', borderRadius: 4 }}>
          <h3>Current Overlays:</h3>
          {overlays.map((o, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              marginBottom: 5,
              backgroundColor: '#f5f5f5',
              borderRadius: 4
            }}>
              <div>
                <strong>{o.text}</strong>
                <br />
                <small>Position: ({o.position.x}, {o.position.y}) at {o.timestamp}s</small>
              </div>
              <button
                onClick={() => {
                  const newOverlays = [...overlays];
                  newOverlays.splice(idx, 1);
                  setOverlays(newOverlays);
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button 
            onClick={handleApplyText}
            style={{ 
              marginTop: 15,
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Apply Text Overlays
          </button>
        </div>
      )}

      {videoUrl && (
        <div className="editor-workspace" style={{ 
          marginTop: 20,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              flex: '0 1 auto',
              minWidth: '320px',
              maxWidth: '100%'
            }}>
              <VideoPreview
                videoUrl={getFullUrl(videoUrl)}
                currentTime={currentTime}
                overlays={overlays}
                onOverlayUpdate={(updatedOverlay) => {
                  // Find overlay by matching text and timestamp
                  const index = overlays.findIndex(o => 
                    o.text === updatedOverlay.text && 
                    o.timestamp === updatedOverlay.timestamp
                  );
                  if (index !== -1) {
                    const newOverlays = [...overlays];
                    // Update the overlay with new position while preserving other properties
                    newOverlays[index] = {
                      ...newOverlays[index],
                      position: updatedOverlay.position
                    };
                    setOverlays(newOverlays);
                    console.log('Updated overlay position:', newOverlays[index]); // Debug log
                  }
                }}
                onTimeUpdate={setCurrentTime}
              />
            </div>
          </div>
          <Timeline
            duration={videoDuration}
            currentTime={currentTime}
            tracks={overlays.map(overlay => ({
              id: `${overlay.text}-${overlay.timestamp}`,
              type: 'overlay',
              startTime: overlay.timestamp,
              endTime: overlay.timestamp + 5, // Default 5 second duration
              data: overlay
            }))}
            onTimeUpdate={setCurrentTime}
            onTrackUpdate={(track) => {
              const overlay = overlays.find(o => 
                `${o.text}-${o.timestamp}` === track.id
              );
              if (overlay) {
                const newOverlay = {
                  ...overlay,
                  timestamp: track.startTime
                };
                const newOverlays = overlays.map(o => 
                  `${o.text}-${o.timestamp}` === track.id ? newOverlay : o
                );
                setOverlays(newOverlays);
              }
            }}
            onTrackAdd={(track) => {
              if (track.type === 'overlay' && track.data) {
                setOverlays([...overlays, track.data]);
              }
            }}
            onTrackDelete={(trackId) => {
              const newOverlays = overlays.filter(o => 
                `${o.text}-${o.timestamp}` !== trackId
              );
              setOverlays(newOverlays);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EditorPage;
