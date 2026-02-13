import type { SoapNote, FhirReference } from './types.js';

// Minimal FHIR R4 Composition for a clinical note.
// Epic accepts FHIR, but exact requirements depend on tenant + app registration.
export function buildSoapComposition(args: {
  soap: SoapNote;
  patient?: FhirReference;
  encounter?: FhirReference;
  author?: FhirReference;
  title?: string;
  date?: string; // ISO
}) {
  const nowIso = args.date ?? new Date().toISOString();
  const title = args.title ?? 'Clinical Note (SOAP)';

  return {
    resourceType: 'Composition',
    status: 'final',
    type: {
      // LOINC "Clinical note"
      coding: [
        {
          system: 'http://loinc.org',
          code: '34109-9',
          display: 'Note'
        }
      ],
      text: 'Clinical note'
    },
    subject: args.patient,
    encounter: args.encounter,
    date: nowIso,
    author: args.author ? [args.author] : undefined,
    title,
    section: [
      {
        title: 'Subjective',
        text: { status: 'generated', div: asDiv(args.soap.subjective) }
      },
      {
        title: 'Objective',
        text: { status: 'generated', div: asDiv(args.soap.objective) }
      },
      {
        title: 'Assessment',
        text: { status: 'generated', div: asDiv(args.soap.assessment) }
      },
      {
        title: 'Plan',
        text: { status: 'generated', div: asDiv(args.soap.plan) }
      }
    ]
  };
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function asDiv(text: string): string {
  // FHIR Narrative requires XHTML in a div with the xmlns.
  // Keep it simple and safe: escape then convert newlines to <br/>.
  const safe = escapeHtml(text).replaceAll('\n', '<br/>');
  return `<div xmlns="http://www.w3.org/1999/xhtml">${safe}</div>`;
}

