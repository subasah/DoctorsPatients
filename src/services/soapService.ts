import { EMPTY_SOAP_NOTE, type SoapNote } from "../types/clinical";

const SOAP_API_URL = process.env.EXPO_PUBLIC_SOAP_API_URL;
const SOAP_API_KEY = process.env.EXPO_PUBLIC_SOAP_API_KEY;

export async function generateSoapNote(transcript: string): Promise<SoapNote> {
  const trimmedTranscript = transcript.trim();
  if (!trimmedTranscript) {
    throw new Error("Transcript is empty. Capture a conversation first.");
  }

  if (!SOAP_API_URL) {
    return buildFallbackSoap(trimmedTranscript);
  }

  const response = await fetch(SOAP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(SOAP_API_KEY ? { Authorization: `Bearer ${SOAP_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      transcript: trimmedTranscript,
      outputFormat: "SOAP",
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`SOAP generation failed (${response.status}): ${details}`);
  }

  const payload: unknown = await response.json();
  const normalized = normalizeSoapResponse(payload);
  if (!normalized) {
    throw new Error("SOAP API response could not be mapped into SOAP sections.");
  }

  return normalized;
}

function buildFallbackSoap(transcript: string): SoapNote {
  const excerpt = transcript.length > 360 ? `${transcript.slice(0, 360)}...` : transcript;

  return {
    subjective: `Patient-reported symptoms from transcript: ${excerpt}`,
    objective:
      "Objective findings were not automatically extracted. Add vitals, exam findings, and diagnostics.",
    assessment:
      "Provisional assessment generated from ambient transcript. Clinician verification required before sign-off.",
    plan:
      "Review transcript, confirm assessment, finalize treatment plan, and submit to EHR after clinician edits.",
  };
}

function normalizeSoapResponse(payload: unknown): SoapNote | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const candidate =
    readSoapCandidate(record) ??
    readSoapCandidate(record.soap) ??
    readSoapCandidate(record.note) ??
    readSoapCandidate(record.data);

  if (!candidate) {
    return null;
  }

  return {
    subjective: candidate.subjective || EMPTY_SOAP_NOTE.subjective,
    objective: candidate.objective || EMPTY_SOAP_NOTE.objective,
    assessment: candidate.assessment || EMPTY_SOAP_NOTE.assessment,
    plan: candidate.plan || EMPTY_SOAP_NOTE.plan,
  };
}

function readSoapCandidate(value: unknown): SoapNote | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;
  const subjective = readString(source.subjective);
  const objective = readString(source.objective);
  const assessment = readString(source.assessment);
  const plan = readString(source.plan);

  if (!subjective && !objective && !assessment && !plan) {
    return null;
  }

  return {
    subjective,
    objective,
    assessment,
    plan,
  };
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
