/**
 * SOAP Note Generation Service
 * Uses AI to convert conversation transcripts into structured SOAP notes
 * Compatible with Epic EHR documentation standards
 */

import { SOAPNote } from '../types';

const OPENAI_CHAT_API = 'https://api.openai.com/v1/chat/completions';

const SOAP_SYSTEM_PROMPT = `You are a medical scribe AI that converts patient-doctor conversations into professional SOAP (Subjective, Objective, Assessment, Plan) clinical notes. 

Output format requirements:
- SUBJECTIVE: Patient's chief complaint, history of present illness, relevant symptoms in patient's own words, review of systems
- OBJECTIVE: Vital signs (if mentioned), physical exam findings, lab results (if mentioned), observations
- ASSESSMENT: Clinical impression, diagnosis, differential considerations
- PLAN: Treatment plan, medications, follow-up, patient education, referrals

Be concise, use proper medical terminology, and maintain HIPAA-compliant documentation standards. 
Output ONLY valid JSON with keys: subjective, objective, assessment, plan. No markdown or extra text.`;

export async function generateSOAPFromTranscript(
  transcript: string,
  apiKey: string
): Promise<Omit<SOAPNote, 'id' | 'date' | 'createdAt'>> {
  const response = await fetch(OPENAI_CHAT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SOAP_SYSTEM_PROMPT },
        { role: 'user', content: `Convert this patient-doctor conversation into a SOAP note:\n\n${transcript}` },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`SOAP generation failed: ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim() || '{}';
  
  // Parse JSON from response (handle potential markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  return {
    subjective: parsed.subjective || '',
    objective: parsed.objective || '',
    assessment: parsed.assessment || '',
    plan: parsed.plan || '',
    rawTranscript: transcript,
  };
}

/**
 * Mock SOAP generation for development
 */
export function mockGenerateSOAP(transcript: string): Omit<SOAPNote, 'id' | 'date' | 'createdAt'> {
  const hasContent = transcript && transcript.length > 10;
  
  return {
    subjective: hasContent 
      ? `Patient reports: ${transcript.slice(0, 200)}...`
      : 'Patient presents for evaluation. Chief complaint and history to be documented from conversation.',
    objective: hasContent
      ? 'Vital signs and physical exam findings to be documented. No acute distress observed.'
      : 'Awaiting objective findings from encounter.',
    assessment: hasContent
      ? 'Clinical assessment pending full evaluation. Differential to be refined.'
      : 'Assessment to be completed.',
    plan: hasContent
      ? 'Treatment plan to be formulated. Follow-up as clinically indicated.'
      : 'Plan to be documented upon completion of encounter.',
    rawTranscript: transcript,
  };
}
