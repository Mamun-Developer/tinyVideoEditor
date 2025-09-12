import Fastify from "fastify";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors"
import path from "path";
import fs from "fs";
import fastifyStatic from "@fastify/static";
import { VideoEditor } from "@editor";
import { VideoExporter } from "@exporter";
import { FFMpegEngine } from "@engines/ffmpeg";

interface EditRequestBody {
  videoId: string;
  overlays?: {
    text: string;
    position?: "top" | "bottom";
    fontSize?: number;
    color?: string;
    start?: number;
    duration?: number;
  }[];
}

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
    if (!data) return reply.status(400).send({ error: "No file uploaded" });

    const buffers: Buffer[] = [];
    for await (const chunk of data.file) buffers.push(chunk);
    const inputPath = path.join("uploads", data.filename);
    fs.writeFileSync(inputPath, Buffer.concat(buffers));

    return reply.send({
      videoId: data.filename,
      url: `/uploads/${data.filename}`,
    });
  });

  // edit endpoint
  fastify.post<{ Body: EditRequestBody }>("/edit", async (req, reply) => {
    const { videoId, overlays = [] } = req.body;

    if (!videoId) {
      return reply.status(400).send({ error: "videoId is required" });
    }

    const inputPath = path.join("uploads", videoId);
    if (!fs.existsSync(inputPath)) {
      return reply.status(404).send({ error: "Video not found" });
    }

    const outputPath = path.join("outputs", `output-${Date.now()}.mp4`);

    const editor = new VideoEditor(inputPath);
    overlays.forEach((o) => editor.addText({ ...o, type: "text" }));

    const exporter = new VideoExporter(editor, new FFMpegEngine(inputPath));
    await exporter.export(outputPath);

    return reply.send({ url: `/outputs/${path.basename(outputPath)}` });
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
