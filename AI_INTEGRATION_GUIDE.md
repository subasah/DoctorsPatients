# AI Integration Guide for SOAP Note Generation

This guide explains how to integrate advanced AI services for improved SOAP note generation from medical conversations.

## Overview

The current implementation uses keyword-based parsing for SOAP note generation. For production use, integrating with AI/NLP services significantly improves accuracy and clinical relevance.

## Recommended AI Services

### 1. OpenAI GPT-4

Best for: General medical conversation understanding and SOAP note generation

#### Setup

```bash
npm install openai
```

#### Implementation

```typescript
import OpenAI from 'openai';

class OpenAISOAPGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateSOAPNote(transcript: string): Promise<{
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  }> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a medical documentation assistant. Convert doctor-patient conversation transcripts into structured SOAP notes.

SOAP Format:
- Subjective (S): Patient's complaints, symptoms, and history as told by the patient
- Objective (O): Observable facts, examination findings, vital signs, test results
- Assessment (A): Clinical diagnosis or impression based on S and O
- Plan (P): Treatment plan, medications, follow-up instructions

Extract and organize information accurately. If information is missing for a section, note it appropriately.`,
        },
        {
          role: 'user',
          content: `Convert this medical conversation into a SOAP note:\n\n${transcript}`,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent medical documentation
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content || '';
    return this.parseSOAPFromResponse(content);
  }

  private parseSOAPFromResponse(content: string): {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  } {
    const sections = {
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
    };

    // Parse sections from AI response
    const subjectiveMatch = content.match(/Subjective:?\s*\n([\s\S]*?)(?=\n\s*Objective:|$)/i);
    const objectiveMatch = content.match(/Objective:?\s*\n([\s\S]*?)(?=\n\s*Assessment:|$)/i);
    const assessmentMatch = content.match(/Assessment:?\s*\n([\s\S]*?)(?=\n\s*Plan:|$)/i);
    const planMatch = content.match(/Plan:?\s*\n([\s\S]*?)$/i);

    if (subjectiveMatch) sections.subjective = subjectiveMatch[1].trim();
    if (objectiveMatch) sections.objective = objectiveMatch[1].trim();
    if (assessmentMatch) sections.assessment = assessmentMatch[1].trim();
    if (planMatch) sections.plan = planMatch[1].trim();

    return sections;
  }

  async extractMedicalEntities(transcript: string): Promise<{
    symptoms: string[];
    medications: string[];
    diagnoses: string[];
    procedures: string[];
  }> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Extract medical entities from the conversation. Return as JSON with symptoms, medications, diagnoses, and procedures arrays.',
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }
}
```

#### Usage in App

```typescript
// In SOAPGeneratorService.ts
import {OpenAISOAPGenerator} from './OpenAISOAPGenerator';

async generateSOAPNotes(transcript: string, openaiApiKey?: string): Promise<SOAPNote> {
  if (openaiApiKey) {
    const aiGenerator = new OpenAISOAPGenerator(openaiApiKey);
    const soapNote = await aiGenerator.generateSOAPNote(transcript);
    return {
      ...soapNote,
      rawTranscript: transcript,
    };
  }
  
  // Fallback to keyword-based generation
  return this.parseTranscriptIntoSOAP(transcript);
}
```

### 2. Azure Health Bot / Text Analytics for Health

Best for: HIPAA-compliant medical text analysis with entity recognition

#### Setup

```bash
npm install @azure/ai-text-analytics
```

#### Implementation

```typescript
import { TextAnalyticsClient, AzureKeyCredential } from '@azure/ai-text-analytics';

class AzureHealthAnalytics {
  private client: TextAnalyticsClient;

  constructor(endpoint: string, apiKey: string) {
    this.client = new TextAnalyticsClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );
  }

  async analyzeHealthcareEntities(transcript: string) {
    const documents = [transcript];
    
    const poller = await this.client.beginAnalyzeHealthcareEntities(documents);
    const results = await poller.pollUntilDone();

    const entities = {
      symptoms: [],
      conditions: [],
      medications: [],
      dosages: [],
      bodyStructures: [],
      examinations: [],
      treatments: [],
    };

    for await (const result of results) {
      if (!result.error) {
        for (const entity of result.entities) {
          switch (entity.category) {
            case 'SymptomOrSign':
              entities.symptoms.push(entity.text);
              break;
            case 'Diagnosis':
              entities.conditions.push(entity.text);
              break;
            case 'MedicationName':
              entities.medications.push(entity.text);
              break;
            case 'Dosage':
              entities.dosages.push(entity.text);
              break;
            case 'BodyStructure':
              entities.bodyStructures.push(entity.text);
              break;
            case 'ExaminationName':
              entities.examinations.push(entity.text);
              break;
            case 'TreatmentName':
              entities.treatments.push(entity.text);
              break;
          }
        }
      }
    }

    return entities;
  }

  async generateSOAPWithEntities(transcript: string, entities: any) {
    return {
      subjective: this.buildSubjective(transcript, entities),
      objective: this.buildObjective(transcript, entities),
      assessment: this.buildAssessment(transcript, entities),
      plan: this.buildPlan(transcript, entities),
    };
  }

  private buildSubjective(transcript: string, entities: any): string {
    // Use symptoms and patient statements
    const symptoms = entities.symptoms.join(', ');
    return `Chief Complaint: ${symptoms}\n\nPatient reports: ${this.extractPatientStatements(transcript)}`;
  }

  private buildObjective(transcript: string, entities: any): string {
    // Use examinations and body structures
    const exams = entities.examinations.join(', ');
    const bodyParts = entities.bodyStructures.join(', ');
    return `Examination findings: ${exams}\nAreas examined: ${bodyParts}\n${this.extractVitals(transcript)}`;
  }

  private buildAssessment(transcript: string, entities: any): string {
    // Use conditions/diagnoses
    const conditions = entities.conditions.join(', ');
    return `Diagnosis: ${conditions || 'To be determined'}`;
  }

  private buildPlan(transcript: string, entities: any): string {
    // Use medications, dosages, and treatments
    const meds = entities.medications.map((med, i) => 
      `${med} ${entities.dosages[i] || ''}`
    ).join('\n');
    const treatments = entities.treatments.join(', ');
    return `Medications:\n${meds}\n\nTreatments: ${treatments}\n\n${this.extractFollowUp(transcript)}`;
  }

  private extractPatientStatements(transcript: string): string {
    // Extract sentences where patient speaks
    return transcript
      .split('.')
      .filter(s => s.toLowerCase().includes('patient') || s.toLowerCase().includes('i feel'))
      .join('. ');
  }

  private extractVitals(transcript: string): string {
    const vitalsRegex = /(?:blood pressure|bp|temperature|temp|pulse|heart rate|respiratory rate|weight|height)[:\s]+[\d\/]+/gi;
    const vitals = transcript.match(vitalsRegex) || [];
    return vitals.length > 0 ? `Vitals: ${vitals.join(', ')}` : '';
  }

  private extractFollowUp(transcript: string): string {
    const followUpRegex = /(?:follow up|return|come back|schedule)[^.]*\./gi;
    const followUp = transcript.match(followUpRegex) || [];
    return followUp.length > 0 ? `Follow-up: ${followUp.join(' ')}` : '';
  }
}
```

### 3. AWS Comprehend Medical

Best for: Medical entity extraction and PHI detection

#### Setup

```bash
npm install @aws-sdk/client-comprehendmedical
```

#### Implementation

```typescript
import {
  ComprehendMedicalClient,
  DetectEntitiesV2Command,
  DetectPHICommand,
} from '@aws-sdk/client-comprehendmedical';

class AWSComprehendMedical {
  private client: ComprehendMedicalClient;

  constructor(region: string) {
    this.client = new ComprehendMedicalClient({ region });
  }

  async detectMedicalEntities(transcript: string) {
    const command = new DetectEntitiesV2Command({
      Text: transcript,
    });

    const response = await this.client.send(command);
    return this.categorizeEntities(response.Entities || []);
  }

  async detectPHI(transcript: string) {
    const command = new DetectPHICommand({
      Text: transcript,
    });

    const response = await this.client.send(command);
    return response.Entities || [];
  }

  private categorizeEntities(entities: any[]) {
    const categorized = {
      medications: [],
      conditions: [],
      symptoms: [],
      anatomy: [],
      testResults: [],
      procedures: [],
    };

    for (const entity of entities) {
      switch (entity.Category) {
        case 'MEDICATION':
          categorized.medications.push(entity);
          break;
        case 'MEDICAL_CONDITION':
          categorized.conditions.push(entity);
          break;
        case 'ANATOMY':
          categorized.anatomy.push(entity);
          break;
        case 'TEST_TREATMENT_PROCEDURE':
          if (entity.Type === 'TEST_NAME') {
            categorized.testResults.push(entity);
          } else {
            categorized.procedures.push(entity);
          }
          break;
      }
    }

    return categorized;
  }
}
```

## Fine-Tuning Custom Models

For best results, fine-tune models on your specific use case:

### 1. Prepare Training Data

```json
[
  {
    "transcript": "Patient complains of severe headache for 3 days...",
    "soap": {
      "subjective": "Patient reports severe headache x3 days...",
      "objective": "BP 120/80, temp 98.6F...",
      "assessment": "Tension headache",
      "plan": "Ibuprofen 400mg TID..."
    }
  }
]
```

### 2. Fine-Tune GPT-4

```typescript
import OpenAI from 'openai';

async function fineTuneModel(trainingFile: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const file = await openai.files.create({
    file: fs.createReadStream(trainingFile),
    purpose: 'fine-tune',
  });

  const fineTune = await openai.fineTuning.jobs.create({
    training_file: file.id,
    model: 'gpt-4',
  });

  return fineTune;
}
```

## Privacy & Compliance

### HIPAA Compliance Checklist

- [ ] Use BAA-compliant AI service
- [ ] Encrypt data in transit (TLS 1.2+)
- [ ] Encrypt data at rest
- [ ] Implement access controls
- [ ] Enable audit logging
- [ ] Set data retention policies
- [ ] Implement PHI de-identification
- [ ] Regular security assessments

### De-identification

```typescript
async function deidentifyTranscript(transcript: string): Promise<string> {
  // Use AWS Comprehend Medical or similar
  const phiEntities = await detectPHI(transcript);
  
  let deidentified = transcript;
  
  // Replace PHI with generic placeholders
  for (const entity of phiEntities) {
    const replacement = `[${entity.Type}]`;
    deidentified = deidentified.replace(entity.Text, replacement);
  }
  
  return deidentified;
}
```

## Error Handling

```typescript
class AIServiceError extends Error {
  constructor(
    message: string,
    public service: string,
    public code?: string
  ) {
    super(message);
  }
}

async function generateWithFallback(transcript: string): Promise<SOAPNote> {
  try {
    // Try primary AI service (OpenAI)
    return await openaiGenerator.generate(transcript);
  } catch (error) {
    console.error('Primary AI service failed:', error);
    
    try {
      // Fallback to Azure
      return await azureGenerator.generate(transcript);
    } catch (error2) {
      console.error('Secondary AI service failed:', error2);
      
      // Final fallback to keyword-based
      return await keywordGenerator.generate(transcript);
    }
  }
}
```

## Performance Optimization

### 1. Caching

```typescript
class AICache {
  private cache = new Map<string, any>();
  
  async getOrGenerate(
    transcript: string,
    generator: () => Promise<any>
  ): Promise<any> {
    const hash = this.hashTranscript(transcript);
    
    if (this.cache.has(hash)) {
      return this.cache.get(hash);
    }
    
    const result = await generator();
    this.cache.set(hash, result);
    
    return result;
  }
  
  private hashTranscript(transcript: string): string {
    // Use a hashing library
    return crypto.createHash('sha256').update(transcript).digest('hex');
  }
}
```

### 2. Batch Processing

```typescript
async function generateBatch(transcripts: string[]): Promise<SOAPNote[]> {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < transcripts.length; i += batchSize) {
    const batch = transcripts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(t => generateSOAPNote(t))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

## Cost Optimization

### API Usage Tracking

```typescript
class UsageTracker {
  private usage = {
    tokens: 0,
    requests: 0,
    cost: 0,
  };

  track(tokens: number, model: string) {
    this.usage.tokens += tokens;
    this.usage.requests++;
    this.usage.cost += this.calculateCost(tokens, model);
  }

  private calculateCost(tokens: number, model: string): number {
    const rates = {
      'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    };
    
    return (tokens / 1000) * (rates[model]?.input || 0);
  }

  getUsage() {
    return this.usage;
  }
}
```

## Testing

```typescript
describe('AI SOAP Generation', () => {
  it('should generate valid SOAP note', async () => {
    const transcript = 'Patient reports headache...';
    const soap = await generator.generate(transcript);
    
    expect(soap.subjective).toBeTruthy();
    expect(soap.objective).toBeTruthy();
    expect(soap.assessment).toBeTruthy();
    expect(soap.plan).toBeTruthy();
  });

  it('should handle errors gracefully', async () => {
    const invalidTranscript = '';
    const soap = await generator.generate(invalidTranscript);
    
    expect(soap).toBeDefined();
  });
});
```

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Azure Text Analytics for Health](https://azure.microsoft.com/en-us/services/cognitive-services/text-analytics/)
- [AWS Comprehend Medical](https://aws.amazon.com/comprehend/medical/)
- [HIPAA Cloud Computing Guide](https://www.hhs.gov/hipaa/for-professionals/special-topics/cloud-computing/index.html)

---

**Last Updated**: February 2026
