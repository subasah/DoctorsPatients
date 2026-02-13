/**
 * Transcription Service
 * Converts audio recordings to text. Integrates with:
 * - OpenAI Whisper API (recommended for production)
 * - Google Cloud Speech-to-Text
 * - Or mock for development
 */

const OPENAI_WHISPER_API = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
  text: string;
  segments?: Array<{ text: string; start: number; end: number }>;
  language?: string;
}

/**
 * Transcribe audio file using OpenAI Whisper API
 * Requires OPENAI_API_KEY in environment
 */
export async function transcribeWithWhisper(
  audioUri: string,
  apiKey: string
): Promise<TranscriptionResult> {
  const formData = new FormData();
  
  // For React Native, we need to pass the file differently
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a',
  } as any);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');

  const response = await fetch(OPENAI_WHISPER_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transcription failed: ${error}`);
  }

  const data = await response.json();
  return {
    text: data.text,
    segments: data.segments?.map((s: any) => ({
      text: s.text,
      start: s.start,
      end: s.end,
    })),
    language: data.language,
  };
}

/**
 * Mock transcription for development when API key is not available
 */
export function mockTranscribe(transcript: string): TranscriptionResult {
  return {
    text: transcript || 'Patient presents with headache for 3 days. Doctor: Can you describe the pain? Patient: It is throbbing, mainly on the right side. Doctor: Any nausea or vision changes? Patient: Some sensitivity to light. Doctor: I recommend rest, hydration, and over-the-counter ibuprofen. Follow up if symptoms worsen.',
    segments: [],
  };
}
