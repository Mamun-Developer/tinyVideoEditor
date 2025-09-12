import { Operation } from "@editor";

export interface IEngine {
  applyOperations(operations: Operation[]): void;
  export(outputPath: string): Promise<void>;
}
