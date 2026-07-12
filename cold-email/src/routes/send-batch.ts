import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { config } from "../config.js";
import { sendBatch } from "../services/batch.js";

const bodySchema = z.object({
  batchSize: z.number().int().positive().max(100).optional(),
});

export const sendBatchRoutes: FastifyPluginAsync = async (app) => {
  app.post("/send-batch", async (req, reply) => {
    const parsed = bodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid body", details: parsed.error.flatten() });
    }
    const batchSize = Math.min(
      parsed.data.batchSize ?? config.defaultBatchSize,
      config.maxBatchSize,
    );
    const result = await sendBatch(batchSize);
    return result;
  });
};
