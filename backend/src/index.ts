import Fastify from "fastify";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors"
import path from "path";
import fs from "fs";
import fastifyStatic from "@fastify/static";
import { VideoEditor } from "@editor";
import { VideoExporter } from "@exporter";
import { FFMpegEngine } from "@engines/ffmpeg";

import { EditVideoRequest, EditVideoResponse, UploadVideoResponse, TextOverlay } from "./types/api";

async function buildServer() {
  const fastify = Fastify({ logger: true });

  // ✅ register multipart without top-level await
  fastify.register(multipart);
  fastify.register(cors, {origin: ["*"]});

  // ensure upload/output folders exist
  ["uploads", "outputs"].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  });

  // upload endpoint
  fastify.post("/upload", async (req, reply) => {
    const data = await req.file();
    if (!data) {
      const response: UploadVideoResponse = { success: false, error: "No file uploaded" };
      return reply.status(400).send(response);
    }

    const buffers: Buffer[] = [];
    for await (const chunk of data.file) buffers.push(chunk);
    const inputPath = path.join("uploads", data.filename);
    fs.writeFileSync(inputPath, Buffer.concat(buffers));

    const response: UploadVideoResponse = {
      success: true,
      data: {
        fileName: data.filename
      }
    };
    return reply.send(response);
  });

  // edit endpoint
  fastify.post<{ Body: EditVideoRequest }>("/edit", async (req, reply) => {
    try {
      const { videoId, textOverlays = [] } = req.body;
      console.log('Received edit request:', { videoId, textOverlays }); // Debug log

      if (!videoId) {
        const response: EditVideoResponse = { success: false, error: "videoId is required" };
        return reply.status(400).send(response);
      }

      const inputPath = path.join("uploads", videoId);
      console.log('Input path:', inputPath); // Debug log
      
      if (!fs.existsSync(inputPath)) {
        console.error('Video file not found:', inputPath); // Debug log
        const response: EditVideoResponse = { success: false, error: "Video not found" };
        return reply.status(404).send(response);
      }

      const timestamp = Date.now();
      const outputName = `output-${timestamp}.mp4`;
      const outputPath = path.join("outputs", outputName);
      console.log('Output path:', outputPath); // Debug log

      const editor = new VideoEditor(inputPath);
      textOverlays.forEach((overlay: TextOverlay) => {
        editor.addText({
          type: "text",
          text: overlay.text,
          start: overlay.timestamp,
          duration: 5,
          position: {
            x: overlay.position.x,
            y: overlay.position.y
          },
          style: overlay.style
        });
      });

      const exporter = new VideoExporter(editor, new FFMpegEngine(inputPath));
      await exporter.export(outputPath);

      const response: EditVideoResponse = {
        success: true,
        data: {
          outputPath: outputName
        }
      };
      return reply.send(response);
    } catch (error) {
      console.error('Error processing video:', error);
      const response: EditVideoResponse = {
        success: false,
        error: 'Error processing video: ' + (error instanceof Error ? error.message : String(error))
      };
      return reply.status(500).send(response);
    }
  });

  // static serving (uploads + outputs)
  fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
    decorateReply: false,
  });

  fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), "outputs"),
    prefix: "/outputs/",
    decorateReply: false,
  });

  return fastify;
}

// bootstrap
buildServer()
  .then((fastify) => {
    fastify.listen({ port: 3000 }, (err) => {
      if (err) throw err;
      console.log("🚀 Fastify TS backend running at http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
