import type { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { config } from '../config.js';
import { getOpenAIClient } from '../openaiClient.js';

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, os.tmpdir()),
    filename: (_req, file, cb) => {
      const safeBase = (file.originalname || 'visit-audio')
        .replaceAll(/[^a-zA-Z0-9._-]/g, '_')
        .slice(0, 80);
      cb(null, `${Date.now()}_${safeBase}`);
    }
  }),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB default; tune as needed
  }
});

export function registerTranscribeRoutes(router: Router) {
  router.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    const filePath = req.file?.path;
    let stream: fs.ReadStream | undefined;
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Missing audio file field "audio".' });
      }

      if (!config.openaiApiKey) {
        return res.status(400).json({
          error:
            'OPENAI_API_KEY is not configured on the server. Set it in server/.env to enable transcription.'
        });
      }

      const client = getOpenAIClient();
      if (!filePath) {
        return res.status(400).json({ error: 'Upload failed to produce a file path.' });
      }
      const ext = path.extname(req.file.originalname || '').toLowerCase();
      const mimeGuess =
        ext === '.m4a'
          ? 'audio/m4a'
          : ext === '.wav'
            ? 'audio/wav'
            : ext === '.mp3'
              ? 'audio/mpeg'
              : 'application/octet-stream';

      // OpenAI SDK accepts a ReadStream for file.
      stream = fs.createReadStream(filePath);

      const transcription = await client.audio.transcriptions.create({
        file: stream as any,
        model: config.openaiTranscribeModel,
        // If you want faster + better diarization, use a dedicated STT provider.
        // language: 'en',
        response_format: 'json'
      });

      const text = (transcription as any).text ?? '';

      return res.json({
        transcript: text,
        meta: {
          model: config.openaiTranscribeModel,
          mime: mimeGuess
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        error: 'Transcription failed.',
        detail: err?.message ?? String(err)
      });
    } finally {
      try {
        stream?.destroy();
      } catch {
        // ignore
      }
      if (filePath) {
        await fs.promises.unlink(filePath).catch(() => {});
      }
    }
  });
}

