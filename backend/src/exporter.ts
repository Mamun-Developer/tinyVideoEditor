import { VideoEditor } from "@editor";
import { IEngine } from "@engines/engine-interface";

export class VideoExporter {
  constructor(private editor: VideoEditor, private engine: IEngine) {}

  async export(outputPath: string): Promise<void> {
    this.engine.applyOperations(this.editor.getOperations());
    await this.engine.export(outputPath);
    console.log(`✅ Video exported to ${outputPath}`);
  }
}
