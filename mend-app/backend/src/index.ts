import express, { Express } from "express";
import cors from "cors";
import { config } from "./config.js";
import { createTables } from "./db/schema.js";
import { seed } from "./db/seed.js";
import routes from "./routes/index.js";

const app: Express = express();

app.use(cors());
app.use(express.json());

createTables();
seed();

app.use("/api", routes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(config.port, () => {
  console.log(`Mend backend running at http://localhost:${config.port}`);
  console.log(`API available at http://localhost:${config.port}/api`);
});

export default app;
