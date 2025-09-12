export interface TextOperation {
  type: "text";
  text: string;
  position?: "top" | "bottom";
  fontSize?: number;
  color?: string;
  start?: number;
  duration?: number;
}

export type Operation = TextOperation; // extendable for other operations

export class VideoEditor {
  private operations: Operation[] = [];

  constructor(public inputPath: string) {}

  addText(op: TextOperation) {
    this.operations.push({ ...op, type: "text" });
  }

  getOperations(): Operation[] {
    return this.operations;
  }
}
