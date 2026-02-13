import type { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { getOpenAIClient } from '../openaiClient.js';
import { SoapNoteSchema, SoapRequestSchema } from '../types.js';

export function registerSoapRoutes(router: Router) {
  router.post('/api/soap', async (req, res) => {
    try {
      const parsed = SoapRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request.', issues: parsed.error.issues });
      }

      if (!config.openaiApiKey) {
        return res.status(400).json({
          error:
            'OPENAI_API_KEY is not configured on the server. Set it in server/.env to enable SOAP generation.'
        });
      }

      const client = getOpenAIClient();
      const { transcript, context } = parsed.data;

      const system = [
        'You are a clinical documentation assistant.',
        'Your job: convert a visit transcript into a SOAP note draft.',
        'Rules:',
        '- Do NOT invent facts. If something is unclear, leave it as "Unknown" or omit it.',
        '- Keep it concise, clinically useful, and formatted as plain text per section.',
        '- If the transcript contains PHI, do not repeat unnecessary identifiers.',
        '- Include red flags if mentioned; otherwise empty list.',
        '- Mark needsReview=true always.'
      ].join('\n');

      const user = [
        context?.clinicianName ? `Clinician: ${context.clinicianName}` : '',
        context?.patientName ? `Patient: ${context.patientName}` : '',
        context?.visitReason ? `Visit reason: ${context.visitReason}` : '',
        '',
        'Transcript:',
        transcript
      ]
        .filter(Boolean)
        .join('\n');

      // Ask for strict JSON so the app can render/edit reliably.
      const completion = await client.chat.completions.create({
        model: config.openaiChatModel,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'SoapNote',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                subjective: { type: 'string' },
                objective: { type: 'string' },
                assessment: { type: 'string' },
                plan: { type: 'string' },
                patientSummary: { type: 'string' },
                redFlags: { type: 'array', items: { type: 'string' } },
                needsReview: { type: 'boolean' }
              },
              required: ['subjective', 'objective', 'assessment', 'plan', 'redFlags', 'needsReview']
            }
          }
        }
      });

      const content = completion.choices[0]?.message?.content ?? '';
      const json = JSON.parse(content);
      const soap = SoapNoteSchema.parse(json);

      return res.json({
        soap,
        meta: {
          model: config.openaiChatModel
        }
      });
    } catch (err: any) {
      // Provide nicer JSON parsing errors.
      const detail = err?.message ?? String(err);
      const isZod = err instanceof z.ZodError;
      return res.status(500).json({
        error: 'SOAP generation failed.',
        detail,
        issues: isZod ? err.issues : undefined
      });
    }
  });
}

