import type {
  EncounterMetadata,
  EpicIntegrationConfig,
  SoapNote,
} from "../types/clinical";

type FhirReference = {
  reference: string;
};

type FhirDocumentReference = {
  resourceType: "DocumentReference";
  status: "current";
  type: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: FhirReference;
  context: {
    encounter: FhirReference[];
    period: {
      start: string;
      end: string;
    };
  };
  author: FhirReference[];
  date: string;
  description: string;
  content: Array<{
    attachment: {
      contentType: string;
      title: string;
      data: string;
      creation: string;
    };
  }>;
};

export function buildSoapDocumentReference(
  soapNote: SoapNote,
  transcript: string,
  config: EpicIntegrationConfig,
  encounter: EncounterMetadata
): FhirDocumentReference {
  const now = new Date().toISOString();
  const soapText = formatSoapForDocument(soapNote);

  return {
    resourceType: "DocumentReference",
    status: "current",
    type: {
      coding: [
        {
          system: "http://loinc.org",
          code: "34133-9",
          display: "Summarization of episode note",
        },
      ],
      text: "SOAP note",
    },
    subject: {
      reference: `Patient/${config.patientId}`,
    },
    context: {
      encounter: [
        {
          reference: `Encounter/${config.encounterId}`,
        },
      ],
      period: {
        start: encounter.startedAt,
        end: encounter.endedAt,
      },
    },
    author: [
      {
        reference: `Practitioner/${config.practitionerId}`,
      },
    ],
    date: now,
    description: "Ambient clinical conversation transformed into clinician-reviewed SOAP note",
    content: [
      {
        attachment: {
          contentType: "text/plain; charset=utf-8",
          title: "SOAP note",
          data: toBase64(soapText),
          creation: now,
        },
      },
      {
        attachment: {
          contentType: "text/plain; charset=utf-8",
          title: "Source transcript",
          data: toBase64(transcript),
          creation: now,
        },
      },
    ],
  };
}

export async function sendDocumentReferenceToEpic(
  documentReference: ReturnType<typeof buildSoapDocumentReference>,
  config: EpicIntegrationConfig
): Promise<unknown> {
  const normalizedBaseUrl = config.baseUrl.endsWith("/")
    ? config.baseUrl.slice(0, -1)
    : config.baseUrl;

  const endpoint = `${normalizedBaseUrl}/DocumentReference`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/fhir+json",
      Accept: "application/fhir+json",
    },
    body: JSON.stringify(documentReference),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Epic API rejected the note (${response.status}): ${details}`);
  }

  return response.json();
}

function formatSoapForDocument(soapNote: SoapNote): string {
  return [
    "Subjective",
    soapNote.subjective || "-",
    "",
    "Objective",
    soapNote.objective || "-",
    "",
    "Assessment",
    soapNote.assessment || "-",
    "",
    "Plan",
    soapNote.plan || "-",
  ].join("\n");
}

function toBase64(value: string): string {
  const bytes = utf8ToBytes(value);
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = bytes[index + 1] ?? 0;
    const third = bytes[index + 2] ?? 0;
    const triple = (first << 16) | (second << 8) | third;

    output += alphabet[(triple >> 18) & 63];
    output += alphabet[(triple >> 12) & 63];
    output += index + 1 < bytes.length ? alphabet[(triple >> 6) & 63] : "=";
    output += index + 2 < bytes.length ? alphabet[triple & 63] : "=";
  }

  return output;
}

function utf8ToBytes(input: string): number[] {
  if (typeof TextEncoder !== "undefined") {
    return Array.from(new TextEncoder().encode(input));
  }

  const escaped = encodeURIComponent(input);
  const bytes: number[] = [];

  for (let index = 0; index < escaped.length; index++) {
    const current = escaped[index];
    if (current === "%") {
      const hex = escaped.slice(index + 1, index + 3);
      bytes.push(Number.parseInt(hex, 16));
      index += 2;
    } else {
      bytes.push(current.charCodeAt(0));
    }
  }

  return bytes;
}
