import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { initTracking, trackingMode } from "./services/state.js";
import { loadProspects } from "./services/prospects.js";
import { statusRoutes } from "./routes/status.js";
import { sendBatchRoutes } from "./routes/send-batch.js";
import { previewRoutes } from "./routes/preview.js";
import { markRepliedRoutes } from "./routes/mark-replied.js";

async function main() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, { origin: true });

  app.addHook("onRequest", async (req, reply) => {
    if (req.url === "/health") return;
    const key = req.headers["x-api-key"];
    if (key !== config.apiKey) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });

  app.get("/health", async () => ({ ok: true }));

  await app.register(statusRoutes);
  await app.register(previewRoutes);
  await app.register(sendBatchRoutes);
  await app.register(markRepliedRoutes);

  // Warm CSV cache; tracking init is lazy on first use so boot works without Sheets in CI
  loadProspects();

  app.addHook("onReady", async () => {
    try {
      const { mode } = await initTracking();
      app.log.info(
        mode === "sheets"
          ? "Tracking: Google Sheets (Sends + State tabs)"
          : "Tracking: local data/state.json (set GOOGLE_* for Sheets)",
      );
    } catch (err) {
      app.log.warn(
        { err },
        "Tracking init deferred/failed — check Sheets credentials or local data/",
      );
    }
  });

  await app.listen({ port: config.port, host: "0.0.0.0" });
  app.log.info(
    `Cold email API on :${config.port} (batch=${config.defaultBatchSize}, concurrency=${config.sendConcurrency}, delay=${config.sendDelayMs}ms, tracking=${trackingMode()})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
