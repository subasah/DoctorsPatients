// ============================================================
// Clinical Conversation Notes - Speech-to-Text Service
// Supports OpenAI Whisper API for transcription
// ============================================================

import { getSettings } from './storage';

/** Transcribe audio file using OpenAI Whisper API */
export async function transcribeAudio(audioUri: string): Promise<string> {
  const settings = await getSettings();

  if (!settings.openAiApiKey) {
    throw new Error(
      'OpenAI API key is not configured. Please add your API key in Settings to enable transcription.'
    );
  }

  try {
    // Create form data for the Whisper API
    const formData = new FormData();

    // Create a blob-like object for React Native
    const audioBlob = {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any;

    formData.append('file', audioBlob);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'text');
    formData.append(
      'prompt',
      'This is a clinical conversation between a doctor and a patient. ' +
        'Medical terminology may be used. Transcribe accurately including speaker labels where possible.'
    );

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.openAiApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Transcription failed: ${errorData.error?.message || response.statusText}`
      );
    }

    const transcript = await response.text();
    return transcript.trim();
  } catch (error: any) {
    if (error.message.includes('API key')) {
      throw error;
    }
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

/**
 * Simulate transcription for demo/testing purposes.
 * Returns a realistic clinical conversation transcript.
 */
export function getDemoTranscript(): string {
  return `Doctor: Good morning, Mrs. Johnson. How are you feeling today?

Patient: Good morning, Doctor. I've been having these really bad headaches for the past two weeks. They're mostly on the right side of my head and they come and go throughout the day.

Doctor: I'm sorry to hear that. Can you describe the headaches more? Are they sharp, throbbing, or more of a dull ache?

Patient: They're mostly throbbing. Sometimes I feel nauseous when they get really bad. Light seems to bother me too.

Doctor: Have you noticed any triggers? Stress, certain foods, changes in sleep patterns?

Patient: Well, I've been really stressed at work lately. And I haven't been sleeping well - maybe 4 to 5 hours a night instead of my usual 7 or 8.

Doctor: Any history of migraines in your family?

Patient: Yes, my mother had migraines. She used to get them pretty frequently.

Doctor: Are you currently taking any medications?

Patient: Just my blood pressure medication - lisinopril 10 milligrams - and a daily multivitamin.

Doctor: Any allergies to medications?

Patient: I'm allergic to penicillin. I get a rash.

Doctor: Let me check your vitals and do a brief examination. Your blood pressure is 138 over 88, which is slightly elevated. Heart rate is 76. Temperature is normal at 98.6. Let me check your neurological exam... Your cranial nerves are intact. Pupillary responses are equal and reactive. No papilledema on fundoscopic exam. Neck is supple without rigidity. Motor strength is 5 out of 5 in all extremities.

Doctor: Based on your symptoms - the unilateral throbbing headaches with nausea and photophobia, combined with your family history - this is most consistent with migraine without aura. Your slightly elevated blood pressure could also be contributing.

Doctor: Here's what I'd like to do. First, I'm going to prescribe sumatriptan 50mg to take at the onset of a migraine. I also want to start you on a preventive medication - propranolol 40mg twice daily, which will also help with your blood pressure. We should work on improving your sleep hygiene. I'd like you to keep a headache diary to track frequency and triggers. Let's follow up in 4 weeks to see how you're responding to treatment. If the headaches worsen or you develop any new neurological symptoms, please come in right away or go to the ER.

Patient: Thank you, Doctor. That sounds like a good plan.`;
}
