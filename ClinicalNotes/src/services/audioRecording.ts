// ============================================================
// Clinical Conversation Notes - Audio Recording Service
// ============================================================

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

let recording: Audio.Recording | null = null;

/** Request microphone permissions */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return false;
  }
}

/** Configure audio mode for recording */
async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
  });
}

/** Start recording audio */
export async function startRecording(): Promise<Audio.Recording> {
  try {
    // Configure audio mode
    await configureAudioMode();

    // Create and prepare recording with high quality preset
    const { recording: newRecording } = await Audio.Recording.createAsync(
      {
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      }
    );

    recording = newRecording;
    return newRecording;
  } catch (error) {
    console.error('Error starting recording:', error);
    throw new Error('Failed to start recording. Please check microphone permissions.');
  }
}

/** Pause recording */
export async function pauseRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.pauseAsync();
    }
  } catch (error) {
    console.error('Error pausing recording:', error);
  }
}

/** Resume recording */
export async function resumeRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.startAsync();
    }
  } catch (error) {
    console.error('Error resuming recording:', error);
  }
}

/** Stop recording and return the URI of the recorded file */
export async function stopRecording(): Promise<string | null> {
  try {
    if (!recording) return null;

    await recording.stopAndUnloadAsync();

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    recording = null;
    return uri;
  } catch (error) {
    console.error('Error stopping recording:', error);
    recording = null;
    return null;
  }
}

/** Get recording status */
export async function getRecordingStatus(): Promise<Audio.RecordingStatus | null> {
  try {
    if (!recording) return null;
    return await recording.getStatusAsync();
  } catch (error) {
    console.error('Error getting recording status:', error);
    return null;
  }
}

/** Delete a recorded audio file */
export async function deleteRecordingFile(uri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (error) {
    console.error('Error deleting recording file:', error);
  }
}

/** Get current recording instance */
export function getCurrentRecording(): Audio.Recording | null {
  return recording;
}
