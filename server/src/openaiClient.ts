import OpenAI from 'openai';
import { config } from './config.js';

export function getOpenAIClient(): OpenAI {
  if (!config.openaiApiKey) {
    throw new Error(
      'OPENAI_API_KEY is not set. Create server/.env from server/.env.example and set OPENAI_API_KEY, or run endpoints in mock mode.'
    );
  }
  return new OpenAI({ apiKey: config.openaiApiKey });
}

