# Transcription Service Integration Guide

This guide explains how to integrate different speech-to-text services into the Medical Transcription App.

## Architecture Overview

The app uses a **service-based architecture** that makes it easy to swap transcription providers without changing the UI code.

### Core Interface

All transcription services implement this interface:

```typescript
export interface TranscriptionService {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  isAvailable: () => Promise<boolean>;
}
```

## Integration Options

### Option 1: OpenAI Whisper (Recommended)

Whisper provides high accuracy for medical terminology.

#### 1. Install Dependencies

```bash
npm install openai expo-file-system
```

#### 2. Get API Key

1. Sign up at https://platform.openai.com
2. Create an API key
3. Add to your app (use environment variables for production)

#### 3. Implementation

Create `src/utils/whisper-service.ts`:

```typescript
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { TranscriptionService } from './transcription';

export class WhisperTranscriptionService implements TranscriptionService {
  private recording: Audio.Recording | null = null;
  private audioUri: string | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    return this.apiKey.length > 0;
  }

  async startRecording(): Promise<void> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission denied');
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      
      this.recording = recording;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string> {
    if (!this.recording) {
      return '';
    }

    try {
      // Stop recording
      await this.recording.stopAndUnloadAsync();
      this.audioUri = this.recording.getURI();
      this.recording = null;

      if (!this.audioUri) {
        throw new Error('No audio file recorded');
      }

      // Send to Whisper API
      const transcription = await this.transcribeWithWhisper(this.audioUri);
      return transcription;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  private async transcribeWithWhisper(audioUri: string): Promise<string> {
    try {
      // Read audio file
      const audioFile = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Call Whisper API
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }
}
```

#### 4. Update Factory Function

Edit `src/utils/transcription.ts`:

```typescript
import { WhisperTranscriptionService } from './whisper-service';

export const getTranscriptionService = (): TranscriptionService => {
  const apiKey = process.env.OPENAI_API_KEY || 'your-api-key';
  return new WhisperTranscriptionService(apiKey);
};
```

#### 5. Add Environment Variable

Create `.env`:
```
OPENAI_API_KEY=sk-your-api-key-here
```

### Option 2: Google Cloud Speech-to-Text

Google offers excellent real-time transcription.

#### 1. Install Dependencies

```bash
npm install @google-cloud/speech
```

#### 2. Setup

1. Create project at https://console.cloud.google.com
2. Enable Speech-to-Text API
3. Create service account and download JSON key
4. Add credentials to app

#### 3. Implementation

```typescript
import { TranscriptionService } from './transcription';
import speech from '@google-cloud/speech';

export class GoogleSpeechService implements TranscriptionService {
  private client: speech.SpeechClient;
  private recording: Audio.Recording | null = null;
  private recognizeStream: any = null;
  private transcription: string = '';

  constructor(credentials: any) {
    this.client = new speech.SpeechClient({ credentials });
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async startRecording(): Promise<void> {
    // Set up streaming recognition
    const request = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
        model: 'medical_conversation', // Medical-specific model
      },
      interimResults: true,
    };

    this.recognizeStream = this.client
      .streamingRecognize(request)
      .on('data', (data: any) => {
        if (data.results[0] && data.results[0].alternatives[0]) {
          const transcriptPart = data.results[0].alternatives[0].transcript;
          if (data.results[0].isFinal) {
            this.transcription += transcriptPart + ' ';
          }
        }
      })
      .on('error', console.error);

    // Start audio recording and pipe to Google
    // Implementation depends on audio setup
  }

  async stopRecording(): Promise<string> {
    if (this.recognizeStream) {
      this.recognizeStream.end();
    }
    return this.transcription;
  }
}
```

### Option 3: AWS Transcribe

AWS offers medical-specific transcription.

#### 1. Install Dependencies

```bash
npm install @aws-sdk/client-transcribe-streaming
```

#### 2. Implementation

```typescript
import { TranscribeStreamingClient, StartStreamTranscriptionCommand } from '@aws-sdk/client-transcribe-streaming';

export class AWSTranscribeService implements TranscriptionService {
  private client: TranscribeStreamingClient;
  private transcription: string = '';

  constructor(region: string, credentials: any) {
    this.client = new TranscribeStreamingClient({
      region,
      credentials,
    });
  }

  async startRecording(): Promise<void> {
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: 'en-US',
      MediaEncoding: 'pcm',
      MediaSampleRateHertz: 16000,
      VocabularyName: 'medical-terms', // Custom medical vocabulary
      ShowSpeakerLabel: true, // Identify doctor vs patient
    });

    // Set up audio stream and send to AWS
    // Handle responses to build transcription
  }

  async stopRecording(): Promise<string> {
    return this.transcription;
  }
}
```

### Option 4: React Native Voice (On-Device)

For offline transcription using device capabilities.

#### 1. Install Dependencies

```bash
npm install @react-native-voice/voice
```

#### 2. Implementation

```typescript
import Voice from '@react-native-voice/voice';

export class DeviceVoiceService implements TranscriptionService {
  private transcription: string = '';

  constructor() {
    Voice.onSpeechResults = (event) => {
      if (event.value) {
        this.transcription = event.value[0];
      }
    };
  }

  async isAvailable(): Promise<boolean> {
    return await Voice.isAvailable();
  }

  async startRecording(): Promise<void> {
    await Voice.start('en-US');
  }

  async stopRecording(): Promise<string> {
    await Voice.stop();
    return this.transcription;
  }
}
```

## Real-Time Transcription

For real-time display during recording, modify the RecordingScreen:

### 1. Add Live Updates

```typescript
// In RecordingScreen.tsx

const [liveTranscription, setLiveTranscription] = useState('');

// Create transcription service with callback
const transcriptionService = new WhisperTranscriptionService(apiKey);
transcriptionService.onPartialResult((partial: string) => {
  setLiveTranscription(partial);
});
```

### 2. Update Service Interface

```typescript
export interface TranscriptionService {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  isAvailable: () => Promise<boolean>;
  onPartialResult?: (callback: (text: string) => void) => void; // NEW
}
```

### 3. Display Live Results

```typescript
<View style={styles.transcriptionContainer}>
  {liveTranscription ? (
    <Text style={styles.transcriptionText}>{liveTranscription}</Text>
  ) : (
    <Text style={styles.transcriptionPlaceholder}>
      Listening...
    </Text>
  )}
</View>
```

## Medical-Specific Features

### Custom Medical Vocabulary

Many services support custom vocabularies:

#### Whisper
```typescript
// In API call
formData.append('prompt', 'Medical terminology: SOAP, hemoptysis, dysuria...');
```

#### Google Cloud
```typescript
config: {
  speechContexts: [{
    phrases: ['SOAP', 'hemoptysis', 'dysuria', 'hematuria'],
    boost: 20, // Prioritize these words
  }],
}
```

#### AWS Transcribe
```typescript
VocabularyName: 'medical-terms',
VocabularyFilterName: 'medical-filter',
```

### Speaker Identification

Separate doctor and patient speech:

```typescript
config: {
  diarizationConfig: {
    enableSpeakerDiarization: true,
    minSpeakerCount: 2,
    maxSpeakerCount: 2,
  },
}
```

## Error Handling

Add robust error handling:

```typescript
export class ResilientTranscriptionService implements TranscriptionService {
  private primaryService: TranscriptionService;
  private fallbackService: TranscriptionService;

  async startRecording(): Promise<void> {
    try {
      await this.primaryService.startRecording();
    } catch (error) {
      console.error('Primary service failed, using fallback:', error);
      await this.fallbackService.startRecording();
    }
  }
}
```

## Testing

### Mock Service for Testing

```typescript
export class MockTranscriptionService implements TranscriptionService {
  async isAvailable(): Promise<boolean> {
    return true;
  }

  async startRecording(): Promise<void> {
    console.log('Mock: Recording started');
  }

  async stopRecording(): Promise<string> {
    return 'This is a mock transcription for testing';
  }
}
```

Use in development:

```typescript
export const getTranscriptionService = (): TranscriptionService => {
  if (__DEV__) {
    return new MockTranscriptionService();
  }
  return new WhisperTranscriptionService(apiKey);
};
```

## Performance Optimization

### Audio Chunking

For long recordings, send audio in chunks:

```typescript
private async sendAudioChunk(chunk: Blob): Promise<void> {
  // Send chunk to API
  // Update transcription progressively
}
```

### Caching

Cache common medical terms:

```typescript
private termCache = new Map<string, string>();

private getCachedTranscription(audioHash: string): string | null {
  return this.termCache.get(audioHash) || null;
}
```

## Security Considerations

### Secure API Keys

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiKey = async (): Promise<string> => {
  return await AsyncStorage.getItem('OPENAI_API_KEY') || '';
};
```

### HTTPS Only

```typescript
const API_URL = 'https://api.openai.com'; // Always use HTTPS
```

### Data Encryption

```typescript
import * as Crypto from 'expo-crypto';

const encryptAudio = async (audioData: string): Promise<string> => {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    audioData
  );
};
```

## Cost Optimization

### Batch Processing

```typescript
private async batchTranscribe(audioFiles: string[]): Promise<string[]> {
  // Process multiple files in one API call
  // Reduces per-request overhead
}
```

### Compression

```typescript
import * as FileSystem from 'expo-file-system';

const compressAudio = async (audioUri: string): Promise<string> => {
  // Compress audio before sending
  // Reduces bandwidth and API costs
};
```

## Comparison Table

| Service | Accuracy | Real-time | Medical | Cost | Offline |
|---------|----------|-----------|---------|------|---------|
| **Whisper** | ⭐⭐⭐⭐⭐ | ❌ | ✅ | Low | ❌ |
| **Google Cloud** | ⭐⭐⭐⭐⭐ | ✅ | ✅ | Medium | ❌ |
| **AWS Transcribe** | ⭐⭐⭐⭐ | ✅ | ✅ | Medium | ❌ |
| **React Native Voice** | ⭐⭐⭐ | ✅ | ❌ | Free | ✅ |
| **Azure Speech** | ⭐⭐⭐⭐ | ✅ | ✅ | Medium | ❌ |

## Recommendations

### For Development
Use **Mock Service** or **React Native Voice** for free testing.

### For Production (Best Accuracy)
Use **OpenAI Whisper** with custom medical prompts.

### For Real-Time (Live Feedback)
Use **Google Cloud Speech-to-Text** with medical model.

### For Cost Efficiency
Use **Whisper** with audio compression and batching.

### For Offline Usage
Use **React Native Voice** or on-device Whisper model.

## Next Steps

1. Choose transcription service based on requirements
2. Sign up and get API credentials
3. Install required dependencies
4. Implement service class
5. Update factory function
6. Test with real medical conversations
7. Optimize for accuracy with medical vocabulary
8. Deploy with secure credential management

---

**Ready to integrate? Start with the Mock Service for testing, then switch to your production service!**
