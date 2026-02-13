export interface SOAPNote {
  id: string;
  date: Date;
  patientId?: string;
  patientName?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  rawTranscript: string;
  duration: number;
  exported: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  currentPath: string | null;
}

export interface EpicConfig {
  fhirBaseUrl: string;
  clientId: string;
  apiKey: string;
  enabled: boolean;
}

export interface AppSettings {
  autoTranscribe: boolean;
  autoGenerateSOAP: boolean;
  saveRawAudio: boolean;
  epicConfig: EpicConfig;
  language: string;
}
