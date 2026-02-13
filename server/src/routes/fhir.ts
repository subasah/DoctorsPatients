import type { Router } from 'express';
import { z } from 'zod';
import { buildSoapComposition } from '../fhir.js';
import { SoapNoteSchema } from '../types.js';

const RequestSchema = z.object({
  soap: SoapNoteSchema,
  patient: z
    .object({
      reference: z.string().min(1),
      display: z.string().optional()
    })
    .optional(),
  encounter: z
    .object({
      reference: z.string().min(1),
      display: z.string().optional()
    })
    .optional(),
  author: z
    .object({
      reference: z.string().min(1),
      display: z.string().optional()
    })
    .optional(),
  title: z.string().optional()
});

export function registerFhirRoutes(router: Router) {
  router.post('/api/fhir/composition', async (req, res) => {
    const parsed = RequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request.', issues: parsed.error.issues });
    }

    const composition = buildSoapComposition(parsed.data);
    return res.json({ composition });
  });
}

