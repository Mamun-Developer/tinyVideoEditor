import { TextOverlay, TextStyle } from "./types/api";

export interface TextPosition {
  x: number;
  y: number;
}

export interface TextOperation {
  type: "text";
  text: string;
  position: TextPosition;
  style: TextStyle;
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
