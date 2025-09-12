export class VideoImporter {
  constructor(public inputPath: string) {}

  load(): string {
    // Currently just returns path; could later include metadata
    return this.inputPath;
  }
}
