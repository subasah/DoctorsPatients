const TRANSCRIPTION_API_URL = process.env.EXPO_PUBLIC_TRANSCRIPTION_API_URL;
const TRANSCRIPTION_API_KEY = process.env.EXPO_PUBLIC_TRANSCRIPTION_API_KEY;

type UploadableAudio = {
  uri: string;
  name: string;
  type: string;
};

function fallbackTranscript(): string {
  return [
    "Doctor: Good morning. What brings you in today?",
    "Patient: I have had a sore throat, low-grade fever, and dry cough for 3 days.",
    "Doctor: Any shortness of breath or chest pain?",
    "Patient: No chest pain and breathing is okay, but I feel fatigued.",
    "Doctor: We will check vitals and do a rapid strep test.",
  ].join(" ");
}

export async function transcribeAudioFile(audioUri: string): Promise<string> {
  if (!TRANSCRIPTION_API_URL) {
    return fallbackTranscript();
  }

  const audioFile: UploadableAudio = {
    uri: audioUri,
    name: "encounter.m4a",
    type: "audio/m4a",
  };

  const formData = new FormData();
  formData.append("file", audioFile as unknown as Blob);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (TRANSCRIPTION_API_KEY) {
    headers.Authorization = `Bearer ${TRANSCRIPTION_API_KEY}`;
  }

  const response = await fetch(TRANSCRIPTION_API_URL, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Transcription failed (${response.status}): ${details}`);
  }

  const payload: unknown = await response.json();
  const transcript = extractTranscript(payload);

  if (!transcript) {
    throw new Error("Transcription API response did not include transcript text.");
  }

  return transcript.trim();
}

function extractTranscript(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const direct = record.transcript ?? record.text;
  if (typeof direct === "string") {
    return direct;
  }

  const result = record.result;
  if (result && typeof result === "object") {
    const nested = (result as Record<string, unknown>).transcript;
    if (typeof nested === "string") {
      return nested;
    }
  }

  return null;
}
