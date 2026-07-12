import type { FastifyPluginAsync } from "fastify";
import { getCurrentIndex, trackingMode } from "../services/state.js";
import { getMaxProspectId, loadProspects } from "../services/prospects.js";
import { config } from "../config.js";

export const statusRoutes: FastifyPluginAsync = async (app) => {
  app.get("/status", async () => {
    const prospects = loadProspects();
    const withEmail = prospects.filter((p) => p.contact_emails.length > 0).length;
    const currentIndex = await getCurrentIndex();
    return {
      current_index: currentIndex,
      max_id: getMaxProspectId(),
      total_prospects: prospects.length,
      with_email: withEmail,
      remaining_from_cursor: prospects.filter((p) => p.id >= currentIndex).length,
      dry_run: config.dryRun,
      tracking: trackingMode(),
      default_batch_size: config.defaultBatchSize,
      send_concurrency: config.sendConcurrency,
      send_delay_ms: config.sendDelayMs,
    };
  });
};
