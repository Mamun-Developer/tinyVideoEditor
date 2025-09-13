import ffmpeg from "fluent-ffmpeg";
import { IEngine } from "@engines/engine-interface";
import { Operation } from "@editor";

// Helper function to convert hex color to RGB
function hexToRGB(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Return in FFmpeg color format
  return `0x${hex}`;
}

export class FFMpegEngine implements IEngine {
  private command: ffmpeg.FfmpegCommand;

  constructor(private inputPath: string) {
    this.command = ffmpeg(inputPath);
  }

  applyOperations(operations: Operation[]): void {
    // First, configure input with error resilience
    this.command = this.command
      .inputOptions([
        '-y',                    // Overwrite output files without asking
        '-err_detect ignore_err' // Continue on errors
      ]);

    // Apply each text operation
    operations.forEach(op => {
      if (op.type === "text") {
        const start = op.start ?? 0;
        const end = start + (op.duration ?? 5);
        
        // Get coordinates and style from the input
        const xPos = Math.max(0, Math.min(1, op.position.x / 100));
        const yPos = Math.max(0, Math.min(1, op.position.y / 100));
        const style = op.style;
        
        // Convert hex colors to RGB format if needed
        const fontColor = style.fontColor.startsWith('#') 
          ? hexToRGB(style.fontColor) 
          : style.fontColor;
        const borderColor = style.borderColor.startsWith('#')
          ? hexToRGB(style.borderColor)
          : style.borderColor;
        const bgColor = style.backgroundColor.startsWith('#')
          ? hexToRGB(style.backgroundColor)
          : style.backgroundColor;

        // Build filter string with all style options
        const filterString = `drawtext=` +
          `fontfile=${style.fontFamily}:` +
          `text='${op.text}':` +
          `x=${style.padding}+${xPos}*(w-tw-${style.padding}*2):` +
          `y=${style.padding}+${yPos}*(h-th-${style.padding}*2):` +
          `fontsize=${style.fontSize}:` +
          `fontcolor=${fontColor}:` +
          `borderw=${style.borderWidth}:` +
          `bordercolor=${borderColor}:` +
          `box=1:` +
          `boxcolor=${bgColor}@${style.backgroundOpacity}:` +
          `boxborderw=${style.padding}:` +
          `enable='between(t,${start},${end})'`;

        console.log('Adding text overlay with filter:', filterString);
        this.command = this.command.videoFilter(filterString);
      }
    });
  }

  export(outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.command
        // Set output options for better compatibility and quality
        .outputOptions([
          '-c:v libx264',           // Use H.264 codec
          '-crf 23',                // Constant rate factor (quality)
          '-preset medium',          // Better quality preset
          '-profile:v main',        // Main profile for better compatibility
          '-pix_fmt yuv420p',       // Standard pixel format
          '-movflags +faststart',   // Enable fast start for web playback
          '-max_muxing_queue_size 1024', // Increase buffer size
          '-c:a copy'               // Copy audio without re-encoding
        ])
        // Add event handlers for debugging
        .on('start', (commandLine) => {
          console.log('FFmpeg process starting...');
          console.log('Full command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${progress.percent}% done at ${progress.currentFps} fps`);
        })
        .on('stderr', (stderrLine) => {
          console.log('FFmpeg:', stderrLine);
        })
        .output(outputPath)
        .on('error', (err, stdout, stderr) => {
          console.error('FFmpeg Error:', err.message);
          if (stderr) {
            console.error('FFmpeg stderr:', stderr);
          }
          reject(new Error(`FFmpeg failed: ${err.message}`));
        })
        .on('end', () => {
          console.log('FFmpeg processing finished successfully');
          // Verify the output file exists and has size
          const stats = require('fs').statSync(outputPath);
          console.log(`Output file size: ${stats.size} bytes`);
          console.log('✅ Video exported to ' + outputPath);
          resolve();
        })
        .run();
    });
  }
}
