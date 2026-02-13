import type { SoapNote } from './types';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:8787';

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function transcribeAudio(params: {
  audioUri: string;
  fileName?: string;
}) {
  const uri = params.audioUri;
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  const type =
    ext === 'wav'
      ? 'audio/wav'
      : ext === 'mp3'
        ? 'audio/mpeg'
        : ext === 'm4a'
          ? 'audio/m4a'
          : ext === 'aac'
            ? 'audio/aac'
            : ext === '3gp'
              ? 'audio/3gpp'
              : 'application/octet-stream';
  const name = params.fileName ?? `visit.${ext || 'm4a'}`;

  const form = new FormData();
  form.append(
    'audio',
    {
      // React Native / Expo understands this file object shape for multipart uploads.
      uri,
      name,
      type
    } as any
  );

  const res = await fetch(`${API_BASE_URL}/api/transcribe`, {
    method: 'POST',
    body: form
    // Do NOT set Content-Type; RN will add the correct boundary.
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? 'Transcription failed.');
  return json as { transcript: string };
}

export async function generateSoap(params: {
  transcript: string;
  context?: {
    clinicianName?: string;
    patientName?: string;
    visitReason?: string;
  };
}) {
  const res = await fetch(`${API_BASE_URL}/api/soap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? 'SOAP generation failed.');
  return json as { soap: SoapNote };
}

export async function generateFhirComposition(params: {
  soap: SoapNote;
  patient?: { reference: string; display?: string };
  encounter?: { reference: string; display?: string };
  author?: { reference: string; display?: string };
  title?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/api/fhir/composition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? 'FHIR export failed.');
  return json as { composition: any };
}

