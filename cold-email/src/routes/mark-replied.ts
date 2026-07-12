import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { markReplied } from "../services/state.js";

const bodySchema = z
  .object({
    prospect_id: z.number().int().positive().optional(),
    company_name: z.string().min(1).optional(),
  })
  .refine((v) => v.prospect_id != null || Boolean(v.company_name), {
    message: "Provide prospect_id or company_name",
  });

export const markRepliedRoutes: FastifyPluginAsync = async (app) => {
  app.post("/mark-replied", async (req, reply) => {
    const parsed = bodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid body", details: parsed.error.flatten() });
    }
    const result = await markReplied(parsed.data);
    return { ...result, replied_at: new Date().toISOString() };
  });
};
