import Voice from '@react-native-voice/voice';

class TranscriptionService {
  private transcript: string = '';
  private onResultCallback?: (text: string) => void;
  private onEndCallback?: () => void;

  constructor() {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  async startListening(
    onResult?: (text: string) => void,
    onEnd?: () => void,
  ): Promise<void> {
    this.transcript = '';
    this.onResultCallback = onResult;
    this.onEndCallback = onEnd;

    try {
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      throw error;
    }
  }

  async stopListening(): Promise<string> {
    try {
      await Voice.stop();
      return this.transcript;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      throw error;
    }
  }

  async cancelListening(): Promise<void> {
    try {
      await Voice.cancel();
      this.transcript = '';
    } catch (error) {
      console.error('Error canceling voice recognition:', error);
    }
  }

  private onSpeechStart(event: any): void {
    console.log('Speech recognition started');
  }

  private onSpeechEnd(event: any): void {
    console.log('Speech recognition ended');
    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }

  private onSpeechResults(event: any): void {
    if (event.value && event.value.length > 0) {
      this.transcript = event.value[0];
      if (this.onResultCallback) {
        this.onResultCallback(this.transcript);
      }
    }
  }

  private onSpeechPartialResults(event: any): void {
    if (event.value && event.value.length > 0) {
      const partialTranscript = event.value[0];
      if (this.onResultCallback) {
        this.onResultCallback(partialTranscript);
      }
    }
  }

  private onSpeechError(event: any): void {
    console.error('Speech recognition error:', event.error);
  }

  async isAvailable(): Promise<boolean> {
    try {
      return await Voice.isAvailable();
    } catch (error) {
      return false;
    }
  }

  getTranscript(): string {
    return this.transcript;
  }
}

export default new TranscriptionService();
