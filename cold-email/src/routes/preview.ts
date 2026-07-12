import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getProspectById } from "../services/prospects.js";
import { renderOutreach } from "../services/template.js";

const bodySchema = z.object({
  prospectId: z.number().int().positive(),
});

export const previewRoutes: FastifyPluginAsync = async (app) => {
  app.post("/preview", async (req, reply) => {
    const parsed = bodySchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return reply.code(400).send({ error: "prospectId is required" });
    }
    const prospect = getProspectById(parsed.data.prospectId);
    if (!prospect) {
      return reply.code(404).send({ error: "Prospect not found" });
    }
    const rendered = renderOutreach(prospect);
    return {
      prospect_id: prospect.id,
      company_name: prospect.company_name,
      contact_emails: prospect.contact_emails,
      ...rendered,
      has_emails: prospect.contact_emails.length > 0,
    };
  });
};
