export type SoapNote = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  patientSummary?: string;
  redFlags: string[];
  needsReview: boolean;
};

export type VisitDraft = {
  id: string;
  createdAt: string;
  audioUri?: string;
  transcript?: string;
  soap?: SoapNote;
};

