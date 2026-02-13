import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRecording } from '../hooks/useRecording';
import { useApp } from '../context/AppContext';
import { RecordingStatus } from '../types';

export function RecordScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  const { addNote, config } = useApp();
  const {
    status,
    error,
    transcript,
    startRecording,
    stopRecording,
  } = useRecording({
    apiKey: config.openaiApiKey,
    useMock: config.useMockServices,
    onNoteGenerated: (note) => {
      addNote(note);
      navigation?.navigate('Notes');
    },
  });

  const handleRecordPress = () => {
    if (status === 'recording') {
      stopRecording();
    } else if (status === 'idle' || status === 'completed' || status === 'error') {
      startRecording();
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#0f172a']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Clinical Notes</Text>
          <Text style={styles.subtitle}>
            Record patient-doctor conversations{'\n'}for automatic SOAP documentation
          </Text>
        </View>

        <View style={styles.recordSection}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              status === 'recording' && styles.recordButtonActive,
              (status === 'processing' || status === 'error') && styles.recordButtonDisabled,
            ]}
            onPress={handleRecordPress}
            disabled={status === 'processing'}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                status === 'recording'
                  ? ['#ef4444', '#dc2626']
                  : ['#3b82f6', '#2563eb']
              }
              style={styles.recordButtonGradient}
            >
              {status === 'processing' ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <View style={[
                  styles.recordIcon,
                  status === 'recording' && styles.recordIconActive,
                ]} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.recordLabel}>
            {status === 'idle' && 'Tap to start recording'}
            {status === 'recording' && 'Recording... Tap to stop'}
            {status === 'processing' && 'Generating SOAP note...'}
            {status === 'completed' && 'Note generated! View in Notes'}
            {status === 'error' && 'Tap to try again'}
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {transcript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>Transcript</Text>
            <Text style={styles.transcriptText}>{transcript}</Text>
          </View>
        ) : config.useMockServices && (
          <View style={styles.demoNotice}>
            <Text style={styles.demoText}>
              Demo mode: Using sample conversation.{'\n'}
              Add OpenAI API key in Settings for live transcription.
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    lineHeight: 24,
  },
  recordSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  recordButtonDisabled: {
    opacity: 0.8,
  },
  recordButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  recordIconActive: {
    borderRadius: 8,
  },
  recordLabel: {
    marginTop: 24,
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
  },
  transcriptBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  transcriptText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 22,
  },
  demoNotice: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  demoText: {
    color: '#93c5fd',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
