import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { RecordingStatus } from '../types';
import { transcribeWithWhisper, mockTranscribe } from '../services/transcriptionService';
import { generateSOAPFromTranscript, mockGenerateSOAP } from '../services/soapGenerationService';
import { SOAPNote } from '../types';

interface UseRecordingOptions {
  apiKey: string;
  useMock: boolean;
  onNoteGenerated?: (note: SOAPNote) => void;
}

export function useRecording({ apiKey, useMock, onNoteGenerated }: UseRecordingOptions) {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = newRecording;
      setRecording(newRecording);
      setStatus('recording');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setStatus('error');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    const currentRecording = recordingRef.current;
    if (!currentRecording) return;

    let uri: string | null = null;
    try {
      setStatus('processing');
      await currentRecording.stopAndUnloadAsync();
      uri = currentRecording.getURI();
      recordingRef.current = null;
      setRecording(null);

      let transcriptText = '';

      if (useMock) {
        // For demo: use sample medical conversation
        transcriptText = mockTranscribe('').text;
        setTranscript(transcriptText);
      } else if (uri && apiKey) {
        const result = await transcribeWithWhisper(uri, apiKey);
        transcriptText = result.text;
        setTranscript(transcriptText);
      } else if (!useMock && !apiKey) {
        throw new Error('API key required for transcription');
      }

      // Generate SOAP note
      let soapData;
      if (useMock) {
        soapData = mockGenerateSOAP(transcriptText);
      } else if (apiKey) {
        soapData = await generateSOAPFromTranscript(transcriptText, apiKey);
      } else {
        throw new Error('API key required');
      }

      const note: SOAPNote = {
        id: `note-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        ...soapData,
      };

      onNoteGenerated?.(note);
      setStatus('completed');
      return note;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setStatus('error');
    } finally {
      try {
        if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch (_) {}
    }
  }, [apiKey, useMock, onNoteGenerated]);

  return {
    status,
    error,
    transcript,
    recording,
    startRecording,
    stopRecording,
  };
}
