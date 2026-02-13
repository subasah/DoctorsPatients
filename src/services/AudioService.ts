import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';
import {Platform, PermissionsAndroid} from 'react-native';

class AudioService {
  private audioRecorderPlayer: AudioRecorderPlayer;
  private recordingPath: string;

  constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.recordingPath = '';
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        return (
          granted['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Permission request failed:', err);
        return false;
      }
    }
    return true;
  }

  async startRecording(
    onProgress?: (data: {currentPosition: number}) => void,
  ): Promise<string> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Recording permission not granted');
    }

    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 1,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };

    const path = Platform.select({
      ios: 'recording.m4a',
      android: 'sdcard/recording.mp4',
    });

    this.recordingPath = await this.audioRecorderPlayer.startRecorder(
      path,
      audioSet,
    );

    if (onProgress) {
      this.audioRecorderPlayer.addRecordBackListener(onProgress);
    }

    return this.recordingPath;
  }

  async pauseRecording(): Promise<void> {
    await this.audioRecorderPlayer.pauseRecorder();
  }

  async resumeRecording(): Promise<void> {
    await this.audioRecorderPlayer.resumeRecorder();
  }

  async stopRecording(): Promise<string> {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    return result;
  }

  getRecordingPath(): string {
    return this.recordingPath;
  }

  async playRecording(
    path: string,
    onProgress?: (data: {currentPosition: number; duration: number}) => void,
  ): Promise<void> {
    await this.audioRecorderPlayer.startPlayer(path);
    if (onProgress) {
      this.audioRecorderPlayer.addPlayBackListener(onProgress);
    }
  }

  async stopPlayback(): Promise<void> {
    await this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
  }
}

export default new AudioService();
