/**
 * SOAP Note structure - Standard format for clinical documentation
 * Compatible with Epic EHR integration via FHIR
 */
export interface SOAPNote {
  id: string;
  patientId?: string;
  encounterId?: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  rawTranscript?: string;
  createdAt: string;
}

/**
 * FHIR Composition resource - Epic-compatible clinical note format
 * https://www.hl7.org/fhir/composition.html
 */
export interface FHIRComposition {
  resourceType: 'Composition';
  id?: string;
  status: 'preliminary' | 'final' | 'amended' | 'entered-in-error';
  type: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  date: string;
  title: string;
  section: Array<{
    title: string;
    code?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    text: {
      status: string;
      div: string;
    };
  }>;
}

export interface ConversationSegment {
  speaker: 'patient' | 'doctor' | 'unknown';
  text: string;
  timestamp: number;
}

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'error';
