// This module provides a flexible interface for transcription
// It currently uses Web Speech API (via expo-speech) but can be easily swapped

export interface TranscriptionService {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  isAvailable: () => Promise<boolean>;
}

// Placeholder for future implementation
// You can swap this with Whisper, Google Cloud Speech, or any other service
export class InAppTranscriptionService implements TranscriptionService {
  private recognition: any = null;
  private interimTranscript: string = '';
  private finalTranscript: string = '';

  async isAvailable(): Promise<boolean> {
    // Check if speech recognition is available
    if (typeof window !== 'undefined') {
      return !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition;
    }
    return false;
  }

  async startRecording(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof window === 'undefined') {
          reject(new Error('Speech recognition not available'));
          return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        
        if (!SpeechRecognition) {
          reject(new Error('Speech recognition not supported'));
          return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.interimTranscript = '';
        this.finalTranscript = '';

        this.recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              this.finalTranscript += transcript + ' ';
            } else {
              interim += transcript;
            }
          }
          this.interimTranscript = interim;
        };

        this.recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
        };

        this.recognition.start();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve) => {
      if (this.recognition) {
        this.recognition.stop();
        setTimeout(() => {
          resolve(this.finalTranscript.trim());
        }, 500);
      } else {
        resolve('');
      }
    });
  }

  getCurrentTranscript(): string {
    return (this.finalTranscript + this.interimTranscript).trim();
  }
}

// Factory function to get transcription service
// This makes it easy to swap implementations
export const getTranscriptionService = (): TranscriptionService => {
  return new InAppTranscriptionService();
};
