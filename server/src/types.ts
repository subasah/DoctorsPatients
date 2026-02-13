import { z } from 'zod';

export const SoapNoteSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessment: z.string(),
  plan: z.string(),
  patientSummary: z.string().optional(),
  redFlags: z.array(z.string()).default([]),
  needsReview: z.boolean().default(true)
});

export type SoapNote = z.infer<typeof SoapNoteSchema>;

export const SoapRequestSchema = z.object({
  transcript: z.string().min(1),
  context: z
    .object({
      clinicianName: z.string().optional(),
      patientName: z.string().optional(),
      visitReason: z.string().optional()
    })
    .optional()
});

export type SoapRequest = z.infer<typeof SoapRequestSchema>;

export type FhirReference = {
  reference: string;
  display?: string;
};

