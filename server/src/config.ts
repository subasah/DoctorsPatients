import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? '8787'),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiTranscribeModel: process.env.OPENAI_TRANSCRIBE_MODEL ?? 'whisper-1',
  openaiChatModel: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
  fhirBaseUrl: process.env.FHIR_BASE_URL,
  fhirAccessToken: process.env.FHIR_ACCESS_TOKEN,
  required
};

