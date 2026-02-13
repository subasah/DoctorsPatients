// ============================================================
// Clinical Conversation Notes - AI SOAP Note Generator
// Uses OpenAI GPT-4 to parse clinical conversation transcripts
// into structured SOAP format notes
// ============================================================

import { SOAPNote } from '../types';
import { getSettings } from './storage';

const SOAP_SYSTEM_PROMPT = `You are an expert medical scribe AI assistant. Your job is to analyze clinical conversation transcripts between doctors and patients, and generate structured SOAP notes.

You MUST respond with ONLY a valid JSON object (no markdown, no explanation). The JSON must follow this exact structure:

{
  "patientName": "Patient name if mentioned, otherwise 'Unknown Patient'",
  "subjective": {
    "chiefComplaint": "Primary reason for the visit in a concise statement",
    "historyOfPresentIllness": "Detailed narrative of the current illness including onset, duration, character, severity, location, radiation, timing, aggravating/relieving factors",
    "reviewOfSystems": "Systematic review of symptoms by organ system mentioned in conversation",
    "pastMedicalHistory": "Relevant past medical conditions, surgeries, hospitalizations",
    "medications": "Current medications with dosages",
    "allergies": "Known drug allergies and reactions",
    "socialHistory": "Relevant social factors: occupation, stress, habits, lifestyle",
    "familyHistory": "Relevant family medical history"
  },
  "objective": {
    "vitalSigns": "Blood pressure, heart rate, temperature, respiratory rate, SpO2, weight, height, BMI if mentioned",
    "physicalExamination": "Physical exam findings organized by system",
    "laboratoryData": "Lab results if mentioned",
    "imagingResults": "Imaging study results if mentioned",
    "otherFindings": "Any other objective findings"
  },
  "assessment": {
    "primaryDiagnosis": "Most likely diagnosis with ICD-10 code if identifiable",
    "differentialDiagnoses": "Other possible diagnoses considered",
    "clinicalImpression": "Overall clinical reasoning and impression"
  },
  "plan": {
    "treatment": "Treatment approach and interventions",
    "medications": "New prescriptions or medication changes with dosages",
    "procedures": "Any procedures ordered or performed",
    "referrals": "Specialty referrals if any",
    "followUp": "Follow-up timeline and instructions",
    "patientEducation": "Education and instructions given to the patient"
  }
}

Guidelines:
- Be thorough but concise
- Use medical terminology appropriately
- If information is not available in the transcript, write "Not discussed" for that field
- Include ICD-10 codes where the diagnosis is clear
- Format medications with drug name, dose, route, and frequency
- Maintain clinical accuracy and professional medical language
- Do NOT fabricate information not present in the transcript`;

/** Generate SOAP note from a transcript using OpenAI GPT-4 */
export async function generateSOAPNote(transcript: string): Promise<Partial<SOAPNote>> {
  const settings = await getSettings();

  if (!settings.openAiApiKey) {
    throw new Error(
      'OpenAI API key is not configured. Please add your API key in Settings to enable AI SOAP note generation.'
    );
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SOAP_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Please analyze the following clinical conversation transcript and generate a SOAP note:\n\n${transcript}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `SOAP generation failed: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response received from AI model');
    }

    // Parse the JSON response
    const soapData = JSON.parse(content);

    return {
      patientName: soapData.patientName || 'Unknown Patient',
      subjective: {
        chiefComplaint: soapData.subjective?.chiefComplaint || '',
        historyOfPresentIllness: soapData.subjective?.historyOfPresentIllness || '',
        reviewOfSystems: soapData.subjective?.reviewOfSystems || '',
        pastMedicalHistory: soapData.subjective?.pastMedicalHistory || '',
        medications: soapData.subjective?.medications || '',
        allergies: soapData.subjective?.allergies || '',
        socialHistory: soapData.subjective?.socialHistory || '',
        familyHistory: soapData.subjective?.familyHistory || '',
      },
      objective: {
        vitalSigns: soapData.objective?.vitalSigns || '',
        physicalExamination: soapData.objective?.physicalExamination || '',
        laboratoryData: soapData.objective?.laboratoryData || '',
        imagingResults: soapData.objective?.imagingResults || '',
        otherFindings: soapData.objective?.otherFindings || '',
      },
      assessment: {
        primaryDiagnosis: soapData.assessment?.primaryDiagnosis || '',
        differentialDiagnoses: soapData.assessment?.differentialDiagnoses || '',
        clinicalImpression: soapData.assessment?.clinicalImpression || '',
      },
      plan: {
        treatment: soapData.plan?.treatment || '',
        medications: soapData.plan?.medications || '',
        procedures: soapData.plan?.procedures || '',
        referrals: soapData.plan?.referrals || '',
        followUp: soapData.plan?.followUp || '',
        patientEducation: soapData.plan?.patientEducation || '',
      },
    };
  } catch (error: any) {
    if (error.message.includes('API key')) {
      throw error;
    }
    console.error('SOAP generation error:', error);
    throw new Error(`Failed to generate SOAP note: ${error.message}`);
  }
}

/**
 * Generate a demo SOAP note for testing without API key.
 * Based on the demo transcript of a migraine patient.
 */
export function generateDemoSOAPNote(): Partial<SOAPNote> {
  return {
    patientName: 'Mrs. Johnson',
    subjective: {
      chiefComplaint: 'Recurrent throbbing headaches for the past 2 weeks, predominantly right-sided',
      historyOfPresentIllness:
        'Patient reports 2-week history of recurrent throbbing headaches, primarily on the right side. Headaches are intermittent throughout the day. Associated symptoms include nausea during severe episodes and photophobia. Patient identifies work-related stress and poor sleep (4-5 hours/night vs. usual 7-8 hours) as potential contributing factors. No reported aura.',
      reviewOfSystems:
        'Neurological: Throbbing headaches, nausea, photophobia. No vision changes, weakness, numbness, or speech difficulties reported.',
      pastMedicalHistory: 'Hypertension (on treatment)',
      medications: 'Lisinopril 10mg daily, Daily multivitamin',
      allergies: 'Penicillin - causes rash',
      socialHistory: 'Reports significant work-related stress. Sleep deprivation (4-5 hours/night).',
      familyHistory: 'Mother with history of frequent migraines',
    },
    objective: {
      vitalSigns:
        'BP: 138/88 mmHg (slightly elevated), HR: 76 bpm, Temp: 98.6°F (normal)',
      physicalExamination:
        'Neurological: Cranial nerves intact. Pupils equal and reactive to light. No papilledema on fundoscopic examination. Neck supple without rigidity. Motor strength 5/5 in all extremities bilaterally.',
      laboratoryData: 'Not discussed',
      imagingResults: 'Not discussed',
      otherFindings: 'Not discussed',
    },
    assessment: {
      primaryDiagnosis: 'Migraine without aura (ICD-10: G43.009) - Unilateral throbbing headaches with nausea and photophobia, positive family history',
      differentialDiagnoses:
        'Tension-type headache, Secondary headache due to hypertension, Medication-related headache',
      clinicalImpression:
        'Clinical presentation is most consistent with episodic migraine without aura. The unilateral location, throbbing quality, associated nausea and photophobia, and positive family history strongly support the diagnosis. Contributing factors include stress and sleep deprivation. Slightly elevated blood pressure may be a contributing factor and needs ongoing management.',
    },
    plan: {
      treatment:
        'Acute: Abortive therapy with sumatriptan. Preventive: Start beta-blocker for migraine prophylaxis (will also benefit blood pressure). Non-pharmacological: Sleep hygiene improvement.',
      medications:
        'Sumatriptan 50mg PO PRN at migraine onset. Propranolol 40mg PO BID for migraine prophylaxis and blood pressure control. Continue Lisinopril 10mg daily.',
      procedures: 'Not discussed',
      referrals: 'Not discussed at this time',
      followUp:
        '4-week follow-up to assess treatment response. Patient instructed to go to ER or return immediately if headaches worsen or new neurological symptoms develop.',
      patientEducation:
        'Headache diary to track frequency, severity, and triggers. Sleep hygiene counseling. Stress management discussion. Warning signs requiring immediate medical attention reviewed.',
    },
  };
}
