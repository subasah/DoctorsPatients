// ============================================================
// Clinical Conversation Notes - Epic FHIR Integration Service
// Implements HL7 FHIR R4 standard for Epic EHR interoperability
// ============================================================

import { SOAPNote, FHIRDocumentReference, FHIREncounter, AppSettings } from '../types';
import { getSettings } from './storage';
import { soapNoteToText } from '../utils/helpers';

// ─── Authentication ──────────────────────────────────────────

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth2 access token for Epic FHIR API.
 * Implements client credentials flow (for backend apps) or
 * can be extended for SMART on FHIR authorization code flow.
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const settings = await getSettings();

  if (!settings.epicFhirBaseUrl || !settings.epicClientId) {
    throw new Error(
      'Epic FHIR is not configured. Please add your Epic credentials in Settings.'
    );
  }

  try {
    const tokenUrl = `${settings.epicFhirBaseUrl}/oauth2/token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: settings.epicClientId,
        client_secret: settings.epicClientSecret,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data: TokenResponse = await response.json();

    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000, // Refresh 60s early
    };

    return data.access_token;
  } catch (error: any) {
    console.error('Epic authentication error:', error);
    throw new Error(`Epic authentication failed: ${error.message}`);
  }
}

// ─── FHIR API Helpers ────────────────────────────────────────

async function fhirRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const settings = await getSettings();
  const token = await getAccessToken();

  const response = await fetch(`${settings.epicFhirBaseUrl}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FHIR API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// ─── Patient Search ──────────────────────────────────────────

export interface PatientSearchResult {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  mrn?: string;
}

/** Search for patients in Epic by name */
export async function searchPatients(query: string): Promise<PatientSearchResult[]> {
  try {
    const data = await fhirRequest(`/Patient?name=${encodeURIComponent(query)}&_count=10`);

    if (!data.entry) return [];

    return data.entry.map((entry: any) => {
      const patient = entry.resource;
      const name = patient.name?.[0];
      const displayName = name
        ? `${name.given?.join(' ') || ''} ${name.family || ''}`.trim()
        : 'Unknown';

      return {
        id: patient.id,
        name: displayName,
        birthDate: patient.birthDate || '',
        gender: patient.gender || '',
        mrn: patient.identifier?.find(
          (id: any) => id.type?.coding?.[0]?.code === 'MR'
        )?.value,
      };
    });
  } catch (error: any) {
    console.error('Patient search error:', error);
    throw new Error(`Failed to search patients: ${error.message}`);
  }
}

// ─── Encounter Management ────────────────────────────────────

/** Get active encounters for a patient */
export async function getPatientEncounters(patientId: string): Promise<FHIREncounter[]> {
  try {
    const data = await fhirRequest(
      `/Encounter?patient=${patientId}&status=in-progress,planned&_sort=-date&_count=10`
    );

    if (!data.entry) return [];
    return data.entry.map((entry: any) => entry.resource);
  } catch (error: any) {
    console.error('Encounter fetch error:', error);
    throw new Error(`Failed to fetch encounters: ${error.message}`);
  }
}

// ─── Document Reference (SOAP Note Upload) ──────────────────

/**
 * Upload a SOAP note to Epic as a FHIR DocumentReference.
 * This creates a clinical document that can be viewed in Epic.
 */
export async function uploadSOAPNoteToEpic(
  note: SOAPNote,
  patientFhirId: string,
  encounterId?: string
): Promise<string> {
  const settings = await getSettings();

  // Convert SOAP note to text
  const noteText = soapNoteToText(note);

  // Encode to base64
  const base64Content = btoa(unescape(encodeURIComponent(noteText)));

  // Build FHIR DocumentReference resource
  const documentReference: FHIRDocumentReference = {
    resourceType: 'DocumentReference',
    status: 'current',
    type: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '11488-4',
          display: 'Consultation note',
        },
      ],
    },
    subject: {
      reference: `Patient/${patientFhirId}`,
    },
    date: new Date().toISOString(),
    author: [
      {
        reference: settings.practitionerNPI
          ? `Practitioner/${settings.practitionerNPI}`
          : 'Practitioner/unknown',
      },
    ],
    content: [
      {
        attachment: {
          contentType: 'text/plain',
          data: base64Content,
        },
      },
    ],
  };

  // Add encounter context if available
  if (encounterId) {
    (documentReference as any).context = {
      encounter: [{ reference: `Encounter/${encounterId}` }],
    };
  }

  try {
    const result = await fhirRequest('/DocumentReference', 'POST', documentReference);
    return result.id;
  } catch (error: any) {
    console.error('Document upload error:', error);
    throw new Error(`Failed to upload note to Epic: ${error.message}`);
  }
}

// ─── Connection Test ─────────────────────────────────────────

/** Test the Epic FHIR connection with current settings */
export async function testEpicConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const settings = await getSettings();

    if (!settings.epicFhirBaseUrl) {
      return {
        success: false,
        message: 'Epic FHIR Base URL is not configured',
      };
    }

    // Test the metadata endpoint (doesn't require auth)
    const response = await fetch(`${settings.epicFhirBaseUrl}/metadata`, {
      headers: {
        Accept: 'application/fhir+json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `Connected to ${data.software?.name || 'Epic FHIR Server'} (FHIR ${data.fhirVersion || 'R4'})`,
      };
    }

    return {
      success: false,
      message: `Server responded with status ${response.status}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
    };
  }
}

// ─── SMART on FHIR Launch ───────────────────────────────────

/**
 * Generate SMART on FHIR authorization URL for Epic.
 * This would be used in a production app with a web view for the OAuth flow.
 */
export function getSmartAuthUrl(settings: AppSettings): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: settings.epicClientId,
    redirect_uri: settings.epicRedirectUri,
    scope: 'openid fhirUser patient/*.read patient/*.write encounter/*.read encounter/*.write documentreference/*.write',
    state: Math.random().toString(36).substring(2),
    aud: settings.epicFhirBaseUrl,
  });

  return `${settings.epicFhirBaseUrl}/oauth2/authorize?${params.toString()}`;
}
