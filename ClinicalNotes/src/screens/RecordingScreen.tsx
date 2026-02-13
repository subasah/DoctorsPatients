// ============================================================
// Recording Screen - Audio capture with live visualization
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../theme';
import { RootStackParamList, SOAPNote } from '../types';
import { useAppContext } from '../context/AppContext';
import {
  requestMicrophonePermission,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
} from '../services/audioRecording';
import { transcribeAudio, getDemoTranscript } from '../services/speechToText';
import { generateSOAPNote, generateDemoSOAPNote } from '../services/soapGenerator';
import RecordingWave from '../components/RecordingWave';
import { formatDuration } from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RecordingRouteProp = RouteProp<RootStackParamList, 'Recording'>;

export default function RecordingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RecordingRouteProp>();
  const { addNote, state } = useAppContext();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [transcript, setTranscript] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Microphone access is required to record clinical conversations. Please grant permission in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await startRecording();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      startTimer();
    } catch (error: any) {
      Alert.alert('Recording Error', error.message);
    }
  };

  const handlePauseResume = async () => {
    if (isPaused) {
      await resumeRecording();
      setIsPaused(false);
      startTimer();
    } else {
      await pauseRecording();
      setIsPaused(true);
      stopTimer();
    }
  };

  const handleStopRecording = async () => {
    stopTimer();
    setIsRecording(false);
    setIsPaused(false);
    setIsProcessing(true);

    try {
      setProcessingStep('Stopping recording...');
      const audioUri = await stopRecording();

      if (audioUri && state.settings.openAiApiKey) {
        // Real transcription with API key
        setProcessingStep('Transcribing audio with AI...');
        const transcriptText = await transcribeAudio(audioUri);
        setTranscript(transcriptText);

        setProcessingStep('Generating SOAP note...');
        const soapData = await generateSOAPNote(transcriptText);

        await createAndSaveNote(soapData, transcriptText);
      } else {
        // Demo mode without API key
        setProcessingStep('Using demo mode (no API key configured)...');
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const demoTranscript = getDemoTranscript();
        setTranscript(demoTranscript);

        setProcessingStep('Generating demo SOAP note...');
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const soapData = generateDemoSOAPNote();
        await createAndSaveNote(soapData, demoTranscript);
      }
    } catch (error: any) {
      setIsProcessing(false);
      Alert.alert('Processing Error', error.message, [
        { text: 'Try Again', onPress: handleStartRecording },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleDemoGenerate = async () => {
    setIsProcessing(true);
    setProcessingStep('Generating demo clinical conversation...');
    await new Promise((resolve) => setTimeout(resolve, 800));

    const demoTranscript = getDemoTranscript();
    setTranscript(demoTranscript);

    setProcessingStep('AI is analyzing the conversation...');
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setProcessingStep('Structuring into SOAP format...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (state.settings.openAiApiKey) {
      try {
        const soapData = await generateSOAPNote(demoTranscript);
        await createAndSaveNote(soapData, demoTranscript);
      } catch (error) {
        // Fallback to demo
        const soapData = generateDemoSOAPNote();
        await createAndSaveNote(soapData, demoTranscript);
      }
    } else {
      const soapData = generateDemoSOAPNote();
      await createAndSaveNote(soapData, demoTranscript);
    }
  };

  const createAndSaveNote = async (soapData: Partial<SOAPNote>, transcriptText: string) => {
    const now = new Date().toISOString();
    const newNote: SOAPNote = {
      id: uuidv4(),
      patientName: soapData.patientName || 'Unknown Patient',
      encounterDate: now,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      subjective: soapData.subjective || {
        chiefComplaint: '',
        historyOfPresentIllness: '',
        reviewOfSystems: '',
        pastMedicalHistory: '',
        medications: '',
        allergies: '',
        socialHistory: '',
        familyHistory: '',
      },
      objective: soapData.objective || {
        vitalSigns: '',
        physicalExamination: '',
        laboratoryData: '',
        imagingResults: '',
        otherFindings: '',
      },
      assessment: soapData.assessment || {
        primaryDiagnosis: '',
        differentialDiagnoses: '',
        clinicalImpression: '',
      },
      plan: soapData.plan || {
        treatment: '',
        medications: '',
        procedures: '',
        referrals: '',
        followUp: '',
        patientEducation: '',
      },
      transcript: transcriptText,
      recordingDuration: duration,
      epicMetadata: {
        syncStatus: 'not_configured',
      },
    };

    setProcessingStep('Saving note...');
    await addNote(newNote);
    setIsProcessing(false);

    // Navigate to the note editor
    navigation.replace('NoteEditor', { noteId: newNote.id });
  };

  // ─── Rendering ───────────────────────────────────────────

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.processingContainer}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingTitle}>Processing Conversation</Text>
            <Text style={styles.processingStep}>{processingStep}</Text>
            <View style={styles.processingSteps}>
              <ProcessingStepItem
                label="Audio capture"
                done={processingStep !== 'Stopping recording...'}
              />
              <ProcessingStepItem
                label="Transcription"
                done={
                  processingStep.includes('SOAP') ||
                  processingStep.includes('Structuring') ||
                  processingStep.includes('Saving')
                }
              />
              <ProcessingStepItem
                label="SOAP note generation"
                done={processingStep.includes('Saving')}
              />
              <ProcessingStepItem label="Save to device" done={false} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isRecording ? 'Recording Session' : 'New Consultation'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Recording Visualization */}
        <View style={styles.visualizationContainer}>
          {isRecording ? (
            <>
              <View style={styles.recordingIndicator}>
                <View style={[styles.recordingDot, isPaused && styles.recordingDotPaused]} />
                <Text style={styles.recordingLabel}>
                  {isPaused ? 'PAUSED' : 'RECORDING'}
                </Text>
              </View>
              <Text style={styles.durationText}>{formatDuration(duration)}</Text>
              <RecordingWave isRecording={isRecording} isPaused={isPaused} />
            </>
          ) : (
            <>
              <View style={styles.readyIconContainer}>
                <MaterialIcons name="mic-none" size={64} color={Colors.primary} />
              </View>
              <Text style={styles.readyTitle}>Ready to Record</Text>
              <Text style={styles.readyDescription}>
                Place your device near the conversation between you and your patient.
                The AI will listen and generate structured clinical notes.
              </Text>
            </>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {isRecording ? (
            <View style={styles.recordingControls}>
              {/* Pause/Resume */}
              <TouchableOpacity style={styles.secondaryButton} onPress={handlePauseResume}>
                <MaterialIcons
                  name={isPaused ? 'play-arrow' : 'pause'}
                  size={28}
                  color={Colors.primary}
                />
                <Text style={styles.secondaryButtonText}>
                  {isPaused ? 'Resume' : 'Pause'}
                </Text>
              </TouchableOpacity>

              {/* Stop */}
              <TouchableOpacity style={styles.stopButton} onPress={handleStopRecording}>
                <View style={styles.stopIcon} />
              </TouchableOpacity>

              {/* Placeholder for layout */}
              <View style={styles.secondaryButton}>
                <MaterialIcons name="info-outline" size={28} color={Colors.textTertiary} />
                <Text style={[styles.secondaryButtonText, { color: Colors.textTertiary }]}>
                  {formatDuration(duration)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.startControls}>
              {/* Main Record Button */}
              <TouchableOpacity
                style={styles.recordButton}
                onPress={handleStartRecording}
                activeOpacity={0.8}
              >
                <MaterialIcons name="mic" size={36} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.recordHint}>Tap to start recording</Text>

              {/* Demo Button */}
              <TouchableOpacity style={styles.demoButton} onPress={handleDemoGenerate}>
                <MaterialIcons name="play-circle-outline" size={20} color={Colors.primary} />
                <Text style={styles.demoButtonText}>Try with Demo Conversation</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info Cards */}
        {!isRecording && (
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <MaterialIcons name="security" size={20} color={Colors.success} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>HIPAA Compliant</Text>
                <Text style={styles.infoDescription}>
                  Audio is processed securely. Recordings can be deleted after note generation.
                </Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <MaterialIcons name="auto-awesome" size={20} color={Colors.accent} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>AI-Powered</Text>
                <Text style={styles.infoDescription}>
                  Uses advanced AI to identify clinical details and structure them into SOAP format.
                </Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <MaterialIcons name="edit" size={20} color={Colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Always Editable</Text>
                <Text style={styles.infoDescription}>
                  Review and edit generated notes before finalizing. You have full control.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProcessingStepItem({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.stepItem}>
      <MaterialIcons
        name={done ? 'check-circle' : 'radio-button-unchecked'}
        size={18}
        color={done ? Colors.success : Colors.textTertiary}
      />
      <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  visualizationContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    minHeight: 260,
    justifyContent: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.recordingRed,
  },
  recordingDotPaused: {
    backgroundColor: Colors.warning,
  },
  recordingLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.recordingRed,
    letterSpacing: 2,
  },
  durationText: {
    fontSize: 56,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxl,
    fontVariant: ['tabular-nums'],
  },
  readyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  readyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  readyDescription: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  controlsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  secondaryButton: {
    alignItems: 'center',
    gap: Spacing.xs,
    width: 80,
  },
  secondaryButtonText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  stopButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.recordingRed,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.large,
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  startControls: {
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.recordingRed,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.large,
    marginBottom: Spacing.md,
  },
  recordHint: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  demoButtonText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  infoSection: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.small,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  // Processing
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxxl,
  },
  processingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    width: '100%',
    ...Shadows.large,
  },
  processingTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  processingStep: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
    textAlign: 'center',
  },
  processingSteps: {
    width: '100%',
    gap: Spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepLabel: {
    fontSize: FontSizes.md,
    color: Colors.textTertiary,
  },
  stepLabelDone: {
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },
});
