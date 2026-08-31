import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/env.js";
import { queryRouter } from "./routes/query.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

const distDir = path.resolve(__dirname, "..", "..", "frontend", "dist");
const publicDir = path.resolve(__dirname, "..", "..", "public");
const staticDir = fs.existsSync(distDir) ? distDir : publicDir;
app.use(express.static(staticDir));

app.use("/api", queryRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.listen(config.server.port, () => {
  console.log(
    `[server] LinguaBridge assistant listening on http://localhost:${config.server.port}`
  );
});
