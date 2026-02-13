// ============================================================
// Clinical Conversation Notes - Type Definitions
// ============================================================

/** SOAP Note structure following medical documentation standards */
export interface SOAPNote {
  id: string;
  patientName: string;
  patientId?: string;
  encounterDate: string;
  createdAt: string;
  updatedAt: string;
  status: NoteStatus;

  /** Subjective: Patient's symptoms, complaints, history in their own words */
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: string;
    pastMedicalHistory: string;
    medications: string;
    allergies: string;
    socialHistory: string;
    familyHistory: string;
  };

  /** Objective: Measurable, observable findings */
  objective: {
    vitalSigns: string;
    physicalExamination: string;
    laboratoryData: string;
    imagingResults: string;
    otherFindings: string;
  };

  /** Assessment: Diagnosis or differential diagnoses */
  assessment: {
    primaryDiagnosis: string;
    differentialDiagnoses: string;
    clinicalImpression: string;
  };

  /** Plan: Treatment plan, follow-up, referrals */
  plan: {
    treatment: string;
    medications: string;
    procedures: string;
    referrals: string;
    followUp: string;
    patientEducation: string;
  };

  /** Raw transcript from the conversation */
  transcript: string;

  /** Recording metadata */
  recordingDuration: number;

  /** Epic FHIR integration metadata */
  epicMetadata?: EpicMetadata;
}

export type NoteStatus = 'recording' | 'processing' | 'draft' | 'reviewed' | 'finalized' | 'synced';

export interface EpicMetadata {
  encounterId?: string;
  patientFhirId?: string;
  practitionerId?: string;
  documentReferenceId?: string;
  lastSyncedAt?: string;
  syncStatus: 'pending' | 'synced' | 'failed' | 'not_configured';
}

/** Recording state for the audio capture */
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  uri?: string;
  transcript: string;
  isTranscribing: boolean;
}

/** Settings for the app */
export interface AppSettings {
  // API Keys
  openAiApiKey: string;
  speechToTextProvider: 'whisper' | 'google' | 'azure';

  // Epic FHIR Configuration
  epicFhirBaseUrl: string;
  epicClientId: string;
  epicClientSecret: string;
  epicRedirectUri: string;

  // App Preferences
  autoGenerateSOAP: boolean;
  darkMode: boolean;
  hapticFeedback: boolean;
  defaultSpecialty: string;

  // Practitioner Info
  practitionerName: string;
  practitionerNPI: string;
  practitionerSpecialty: string;
}

/** Navigation param types */
export type RootStackParamList = {
  MainTabs: undefined;
  Recording: { noteId?: string };
  NoteEditor: { noteId: string };
  NotePreview: { noteId: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Notes: undefined;
  NewRecording: undefined;
  EpicSync: undefined;
  Profile: undefined;
};

/** Epic FHIR Resource Types */
export interface FHIRDocumentReference {
  resourceType: 'DocumentReference';
  status: 'current' | 'superseded' | 'entered-in-error';
  type: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  date: string;
  author: Array<{
    reference: string;
  }>;
  content: Array<{
    attachment: {
      contentType: string;
      data: string;
    };
  }>;
}

export interface FHIREncounter {
  resourceType: 'Encounter';
  id: string;
  status: string;
  class: {
    system: string;
    code: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  period: {
    start: string;
    end?: string;
  };
}
