export type SoapNote = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

export type EncounterMetadata = {
  startedAt: string;
  endedAt: string;
  clinicianName?: string;
  location?: string;
};

export type EpicIntegrationConfig = {
  baseUrl: string;
  accessToken: string;
  patientId: string;
  encounterId: string;
  practitionerId: string;
};

export const EMPTY_SOAP_NOTE: SoapNote = {
  subjective: "",
  objective: "",
  assessment: "",
  plan: "",
};

export const EMPTY_EPIC_CONFIG: EpicIntegrationConfig = {
  baseUrl: "",
  accessToken: "",
  patientId: "",
  encounterId: "",
  practitionerId: "",
};
