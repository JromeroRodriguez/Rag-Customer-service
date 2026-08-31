import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/env.js";
import { queryRouter } from "./routes/query.js";
import { liveChatRouter } from "./routes/liveChat.js";
import { startTelegramListener } from "./services/liveChat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

const distDir = path.resolve(__dirname, "..", "..", "frontend", "dist");
const publicDir = path.resolve(__dirname, "..", "..", "public");
const staticDir = fs.existsSync(distDir) ? distDir : publicDir;
app.use(express.static(staticDir));

app.use("/api", queryRouter);
app.use("/api/live-chat", liveChatRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.listen(config.server.port, () => {
  console.log(
    `[server] Riwi Lingua assistant listening on http://localhost:${config.server.port}`
  );
  // Start the real-time Telegram advisor listener
  startTelegramListener();
});
