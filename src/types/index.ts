export interface Patient {
  id: string;
  name: string;
  age: string;
  gender: string;
}

export interface Template {
  id: string;
  name: string;
  sections: string[];
}

export interface Session {
  id: string;
  title: string;
  timestamp: Date;
  patient?: Patient;
  template?: Template;
  transcription: string;
  duration: number;
  isCompleted: boolean;
  context?: string;
}

export interface TranscriptionSegment {
  text: string;
  timestamp: number;
}
