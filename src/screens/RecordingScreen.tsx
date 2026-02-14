import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useApp } from '../contexts/AppContext';
import { getTemplateById } from '../data/templates';
import { Session } from '../types';

const { width } = Dimensions.get('window');

export default function RecordingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { templateId, patientId } = route.params;
  const { getPatient, addSession, updateSession } = useApp();

  const patient = getPatient(patientId);
  const template = getTemplateById(templateId);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [context, setContext] = useState('');
  const [selectedTab, setSelectedTab] = useState('transcribe');
  const [sessionId, setSessionId] = useState<string>('');
  const [microphoneError, setMicrophoneError] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create session
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    
    const newSession: Session = {
      id: newSessionId,
      title: patient ? `${patient.name}` : 'Untitled Session',
      timestamp: new Date(),
      patient,
      template,
      transcription: '',
      duration: 0,
      isCompleted: false,
      context: '',
    };
    
    addSession(newSession);

    // Request permissions
    requestPermissions();

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      stopRecording();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setMicrophoneError(true);
        Alert.alert('Permission Required', 'Please enable microphone access to record.');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setMicrophoneError(true);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
      setIsPaused(false);
      setMicrophoneError(false);
      
      startPulseAnimation();

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Simulate transcription (in a real app, this would use speech-to-text)
      simulateTranscription();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setMicrophoneError(true);
      Alert.alert('Recording Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const pauseRecording = async () => {
    try {
      if (recordingRef.current && isRecording) {
        await recordingRef.current.pauseAsync();
        setIsPaused(true);
        stopPulseAnimation();
        
        if (durationInterval.current) {
          clearInterval(durationInterval.current);
        }
      }
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  };

  const resumeRecording = async () => {
    try {
      if (recordingRef.current && isPaused) {
        await recordingRef.current.startAsync();
        setIsPaused(false);
        startPulseAnimation();
        
        durationInterval.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      
      setIsRecording(false);
      setIsPaused(false);
      stopPulseAnimation();
      
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const simulateTranscription = () => {
    // This simulates real-time transcription
    // In a production app, you would integrate with a real speech-to-text service
    
    const sampleTexts = [
      'Subjective:\n- Difficulty eating, fatigue on waking, hemoptysis, weight loss, decreased appetite\n- Weight loss ongoing for a few months\n- Dysuria with hematuria\n\n',
      'Past Medical History:\n- Hypertension\n- Type 2 Diabetes\n\n',
      'Objective:\n- Blood pressure: 140/90 mmHg\n- Temperature: 98.6°F\n- Heart rate: 78 bpm\n\n',
      'Assessment:\n- Concerning symptoms requiring further investigation\n- Possible urinary tract infection\n- Weight loss etiology to be determined\n\n',
      'Plan:\n- Order complete blood count\n- Urinalysis and urine culture\n- Chest X-ray\n- Follow-up in 1 week with results\n- Consider referral to specialist if symptoms persist'
    ];

    let index = 0;
    const transcriptionInterval = setInterval(() => {
      if (index < sampleTexts.length && isRecording) {
        setTranscription(prev => prev + sampleTexts[index]);
        index++;
        
        // Update session
        if (sessionId) {
          updateSession(sessionId, {
            transcription: transcription + sampleTexts[index - 1],
            duration,
          });
        }
      } else {
        clearInterval(transcriptionInterval);
      }
    }, 3000);

    return () => clearInterval(transcriptionInterval);
  };

  const handleToggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const handleComplete = async () => {
    await stopRecording();
    
    if (sessionId) {
      await updateSession(sessionId, {
        transcription,
        duration,
        context,
        isCompleted: true,
      });
    }
    
    navigation.navigate('SessionsList');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.headerButton}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Microphone Visualization */}
        <View style={styles.visualizationContainer}>
          {isRecording && !isPaused && (
            <View style={styles.waveform}>
              {[...Array(5)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveCircle,
                    {
                      width: 100 + i * 40,
                      height: 100 + i * 40,
                      borderRadius: (100 + i * 40) / 2,
                      opacity: 0.1 - i * 0.02,
                    },
                  ]}
                />
              ))}
            </View>
          )}
          
          <Animated.View
            style={[
              styles.microphoneButton,
              isRecording && !isPaused && {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={[
              styles.microphoneInner,
              isRecording && !isPaused && styles.microphoneRecording,
            ]}>
              {!isRecording ? (
                <Text style={styles.microphoneIcon}>🎤</Text>
              ) : isPaused ? (
                <View style={styles.pauseIcon} />
              ) : (
                <View style={styles.stopIcon} />
              )}
            </View>
          </Animated.View>
          
          <Text style={styles.tapToStartText}>
            {!isRecording ? 'Tap to start' : isPaused ? 'Paused' : 'Recording...'}
          </Text>
          
          {microphoneError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>Please check your microphone input</Text>
            </View>
          )}
        </View>

        {/* Duration and Patient Info */}
        <View style={styles.infoSection}>
          <View style={styles.durationContainer}>
            <Text style={styles.durationIcon}>⏱️</Text>
            <Text style={styles.duration}>{formatDuration(duration)}</Text>
          </View>
          
          <Text style={styles.patientTitle}>
            {patient ? `${patient.name} ${patient.age}${patient.gender}` : 'Add patient details'}
          </Text>
        </View>

        {/* Template Selector */}
        <TouchableOpacity style={styles.templateSelector}>
          <Text style={styles.templateIcon}>📋</Text>
          <Text style={styles.templateText}>{template?.name || 'Select template'}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        {/* Context Input */}
        <View style={styles.contextSection}>
          <View style={styles.contextHeader}>
            <Text style={styles.contextTitle}>Add context</Text>
            <TouchableOpacity>
              <Text style={styles.contextIcon}>📎</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.contextInput}
            placeholder="Add notes you'd like the transcription to take into account"
            placeholderTextColor="#666"
            value={context}
            onChangeText={setContext}
            multiline
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'transcribe' && styles.tabActive]}
            onPress={() => setSelectedTab('transcribe')}
          >
            <Text style={[styles.tabText, selectedTab === 'transcribe' && styles.tabTextActive]}>
              Transcribe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'dictate' && styles.tabActive]}
            onPress={() => setSelectedTab('dictate')}
          >
            <Text style={[styles.tabText, selectedTab === 'dictate' && styles.tabTextActive]}>
              Dictate
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transcription Output */}
        <View style={styles.transcriptionContainer}>
          {transcription ? (
            <Text style={styles.transcriptionText}>{transcription}</Text>
          ) : (
            <Text style={styles.transcriptionPlaceholder}>
              Your transcription will appear here as you speak...
            </Text>
          )}
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleToggleRecording}
          >
            <Text style={styles.controlButtonText}>
              {!isRecording ? '🎤 Start' : isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </Text>
          </TouchableOpacity>
          
          {isRecording && (
            <TouchableOpacity
              style={[styles.controlButton, styles.completeButton]}
              onPress={handleComplete}
            >
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
  },
  headerButton: {
    fontSize: 24,
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  visualizationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    position: 'relative',
  },
  waveform: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#34c759',
  },
  microphoneButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  microphoneInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8ab4f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  microphoneRecording: {
    backgroundColor: '#34c759',
  },
  microphoneIcon: {
    fontSize: 40,
  },
  pauseIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#000',
    borderRadius: 4,
  },
  stopIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#000',
  },
  tapToStartText: {
    marginTop: 20,
    fontSize: 17,
    color: '#fff',
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3c1f1f',
    borderWidth: 1,
    borderColor: '#ff3b30',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
    maxWidth: width - 40,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  duration: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  patientTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  templateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  templateIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  templateText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  contextSection: {
    backgroundColor: '#1c1c1e',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 16,
  },
  contextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  contextIcon: {
    fontSize: 20,
  },
  contextInput: {
    color: '#666',
    fontSize: 14,
    minHeight: 60,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#2c2c2e',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  transcriptionContainer: {
    backgroundColor: '#1c1c1e',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 16,
    minHeight: 200,
  },
  transcriptionText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 24,
  },
  transcriptionPlaceholder: {
    color: '#666',
    fontSize: 15,
    fontStyle: 'italic',
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  controlButton: {
    backgroundColor: '#8ab4f8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#34c759',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
