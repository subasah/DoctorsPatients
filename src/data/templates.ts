import { Template } from '../types';

export const templates: Template[] = [
  {
    id: 'carers-certificate',
    name: "Carer's Certificate",
    sections: ['Patient Information', 'Certification Details', 'Medical Justification']
  },
  {
    id: 'certificate-terminal-illness',
    name: 'Certificate of Terminal Illness',
    sections: ['Patient Information', 'Diagnosis', 'Prognosis', 'Clinical Details']
  },
  {
    id: 'follow-up-note',
    name: 'Follow-Up Note',
    sections: ['Chief Complaint', 'Interval History', 'Physical Examination', 'Assessment', 'Plan']
  },
  {
    id: 'general-follow-up',
    name: 'General Follow Up',
    sections: ['Reason for Visit', 'History', 'Examination', 'Impression', 'Plan']
  },
  {
    id: 'generic-referral-letter',
    name: 'Generic Referral Letter',
    sections: ['Patient Details', 'Reason for Referral', 'History', 'Examination', 'Investigations']
  },
  {
    id: 'gcs-assessment',
    name: 'Glasgow Coma Scale (GCS) Assessment',
    sections: ['Eye Response', 'Verbal Response', 'Motor Response', 'Total Score', 'Clinical Notes']
  },
  {
    id: 'hp',
    name: 'H & P',
    sections: ['History', 'Physical Examination']
  },
  {
    id: 'hp-including-issues',
    name: 'H & P (Including Issues)',
    sections: ['History', 'Physical Examination', 'Issues', 'Plan']
  },
  {
    id: 'hospital-discharge-summary',
    name: 'Hospital Discharge Summary',
    sections: ['Admission Date', 'Discharge Date', 'Hospital Course', 'Discharge Medications', 'Follow-up']
  },
  {
    id: 'hospitalist-progress-note',
    name: 'Hospitalist Progress Note',
    sections: ['Subjective', 'Objective', 'Assessment', 'Plan']
  },
  {
    id: 'internal-medicine-note',
    name: 'Internal Medicine Note',
    sections: ['Chief Complaint', 'History', 'Physical Examination', 'Assessment', 'Plan']
  },
  {
    id: 'iron-infusion-consent',
    name: 'Iron Infusion Consent',
    sections: ['Patient Information', 'Procedure Details', 'Risks and Benefits', 'Consent']
  },
  {
    id: 'issues-list',
    name: 'Issues List',
    sections: ['Active Issues', 'Resolved Issues', 'Chronic Conditions']
  },
  {
    id: 'soap-note',
    name: 'SOAP Note',
    sections: ['Subjective', 'Objective', 'Assessment', 'Plan']
  },
  {
    id: 'sbar-handover',
    name: 'SBAR handover',
    sections: ['Situation', 'Background', 'Assessment', 'Recommendation']
  }
];

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(template => template.id === id);
};
