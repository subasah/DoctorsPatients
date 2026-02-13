/**
 * Epic FHIR Integration Service
 * Converts SOAP notes to FHIR Composition resources for Epic EHR integration
 * Epic supports FHIR R4 - https://fhir.epic.com/
 */

import { SOAPNote, FHIRComposition } from '../types';

/**
 * Convert SOAP note to FHIR Composition resource
 * Epic accepts Composition resources for clinical documentation
 */
export function soapToFhirComposition(soapNote: SOAPNote): FHIRComposition {
  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br/>');

  return {
    resourceType: 'Composition',
    status: 'preliminary',
    type: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '11488-4',
          display: 'Consult note',
        },
      ],
    },
    date: soapNote.date,
    title: 'SOAP Clinical Note',
    section: [
      {
        title: 'Subjective',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '61149-1',
              display: 'Subjective narrative',
            },
          ],
        },
        text: {
          status: 'generated',
          div: `<div xmlns="http://www.w3.org/1999/xhtml">${escapeHtml(soapNote.subjective)}</div>`,
        },
      },
      {
        title: 'Objective',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '61150-9',
              display: 'Objective narrative',
            },
          ],
        },
        text: {
          status: 'generated',
          div: `<div xmlns="http://www.w3.org/1999/xhtml">${escapeHtml(soapNote.objective)}</div>`,
        },
      },
      {
        title: 'Assessment',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '61151-7',
              display: 'Assessment and plan',
            },
          ],
        },
        text: {
          status: 'generated',
          div: `<div xmlns="http://www.w3.org/1999/xhtml">${escapeHtml(soapNote.assessment)}</div>`,
        },
      },
      {
        title: 'Plan',
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '61152-5',
              display: 'Plan of care',
            },
          ],
        },
        text: {
          status: 'generated',
          div: `<div xmlns="http://www.w3.org/1999/xhtml">${escapeHtml(soapNote.plan)}</div>`,
        },
      },
    ],
  };
}

/**
 * Export note for Epic integration
 * In production: POST to Epic FHIR API endpoint
 * Epic FHIR Base: https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/
 */
export async function pushToEpic(
  composition: FHIRComposition,
  epicConfig: {
    fhirBaseUrl: string;
    accessToken: string;
    patientId?: string;
    encounterId?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch(
      `${epicConfig.fhirBaseUrl}/Composition`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
          'Authorization': `Bearer ${epicConfig.accessToken}`,
        },
        body: JSON.stringify(composition),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
