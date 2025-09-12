import ffmpeg from "fluent-ffmpeg";
import { IEngine } from "@engines/engine-interface";
import { Operation } from "@editor";

export class FFMpegEngine implements IEngine {
  private command: ffmpeg.FfmpegCommand;

  constructor(private inputPath: string) {
    this.command = ffmpeg(inputPath);
  }

  applyOperations(operations: Operation[]): void {
    operations.forEach(op => {
      if (op.type === "text") {
        const start = op.start ?? 0;
        const end = start + (op.duration ?? 5);
        this.command = this.command.videoFilter(
          `drawtext=text='${op.text}':x=(w-text_w)/2:y=h-50:fontsize=${op.fontSize ?? 24}:fontcolor=${op.color ?? "white"}:enable='between(t,${start},${end})'`
        );
      }
    });
  }

  export(outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.command
        .output(outputPath)
        .on("end", ()=> resolve())
        .on("error", reject)
        .run();
    });
  }
}
