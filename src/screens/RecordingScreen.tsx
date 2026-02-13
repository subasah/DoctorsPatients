import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AudioService from '../services/AudioService';
import TranscriptionService from '../services/TranscriptionService';
import SOAPGeneratorService from '../services/SOAPGeneratorService';
import StorageService from '../services/StorageService';
import {SOAPNote} from '../types';

const RecordingScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1000);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      await AudioService.startRecording();
      await TranscriptionService.startListening(
        (text) => setTranscript(text),
      );
      setIsRecording(true);
      setDuration(0);
      setTranscript('');
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording. Please check permissions.');
      console.error('Recording error:', error);
    }
  };

  const handlePauseRecording = async () => {
    try {
      if (isPaused) {
        await AudioService.resumeRecording();
        setIsPaused(false);
      } else {
        await AudioService.pauseRecording();
        setIsPaused(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pause/resume recording.');
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsProcessing(true);
      
      await AudioService.stopRecording();
      const finalTranscript = await TranscriptionService.stopListening();
      
      // Generate SOAP notes
      const soapData = await SOAPGeneratorService.generateSOAPNotes(
        finalTranscript || transcript
      );

      // Create and save the SOAP note
      const newNote: SOAPNote = {
        id: Date.now().toString(),
        date: new Date(),
        ...soapData,
        duration: duration,
        exported: false,
      };

      await StorageService.saveSOAPNote(newNote);

      Alert.alert(
        'Success',
        'SOAP note generated and saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsRecording(false);
              setIsPaused(false);
              setDuration(0);
              setTranscript('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process recording.');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRecording = () => {
    Alert.alert(
      'Cancel Recording',
      'Are you sure you want to cancel? The recording will be lost.',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            await AudioService.stopRecording();
            await TranscriptionService.cancelListening();
            setIsRecording(false);
            setIsPaused(false);
            setDuration(0);
            setTranscript('');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Recording Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, isRecording && !isPaused && styles.statusRecording]} />
          <Text style={styles.statusText}>
            {isRecording
              ? isPaused
                ? 'Paused'
                : 'Recording...'
              : 'Ready to Record'}
          </Text>
        </View>

        {/* Duration Display */}
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>
        </View>

        {/* Live Transcript Preview */}
        {isRecording && transcript && (
          <View style={styles.transcriptPreview}>
            <TouchableOpacity
              style={styles.transcriptHeader}
              onPress={() => setShowTranscript(!showTranscript)}>
              <Text style={styles.transcriptHeaderText}>Live Transcript</Text>
              <Icon
                name={showTranscript ? 'expand-less' : 'expand-more'}
                size={24}
                color="#007AFF"
              />
            </TouchableOpacity>
            {showTranscript && (
              <ScrollView style={styles.transcriptScroll}>
                <Text style={styles.transcriptText}>{transcript}</Text>
              </ScrollView>
            )}
          </View>
        )}

        {/* Instructions */}
        {!isRecording && (
          <View style={styles.instructionsContainer}>
            <Icon name="info-outline" size={24} color="#8E8E93" />
            <Text style={styles.instructionsText}>
              Tap the microphone button to start recording the doctor-patient conversation.
              The app will transcribe and generate SOAP notes automatically.
            </Text>
          </View>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.processingText}>
              Generating SOAP notes...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleStartRecording}
            disabled={isProcessing}>
            <Icon name="mic" size={40} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleCancelRecording}>
              <Icon name="close" size={28} color="#FF3B30" />
              <Text style={styles.controlButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton]}
              onPress={handlePauseRecording}>
              <Icon name={isPaused ? 'play-arrow' : 'pause'} size={28} color="#007AFF" />
              <Text style={styles.controlButtonText}>
                {isPaused ? 'Resume' : 'Pause'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStopRecording}>
              <Icon name="stop" size={28} color="#fff" />
              <Text style={[styles.controlButtonText, styles.stopButtonText]}>
                Stop
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8E8E93',
    marginRight: 8,
  },
  statusRecording: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  durationContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  durationText: {
    fontSize: 56,
    fontWeight: '300',
    color: '#1C1C1E',
    fontVariant: ['tabular-nums'],
  },
  transcriptPreview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transcriptHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  transcriptScroll: {
    maxHeight: 200,
    marginTop: 12,
  },
  transcriptText: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
  },
  instructionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
    marginLeft: 12,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  controlsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF3B30',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
  },
  pauseButton: {},
  stopButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  controlButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  stopButtonText: {
    color: '#fff',
  },
});

export default RecordingScreen;
