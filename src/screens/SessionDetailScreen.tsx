import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';

export default function SessionDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sessionId } = route.params;
  const { sessions } = useApp();

  const session = sessions.find(s => s.id === sessionId);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </SafeAreaView>
    );
  }

  const formatDate = (date: Date) => {
    const sessionDate = new Date(date);
    return sessionDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }) + ' ' + sessionDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${session.title}\n\n${session.transcription}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFeedback = () => {
    // Implement feedback functionality
    alert('Feedback feature coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Text style={styles.headerButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            {session.patient ? session.patient.name : session.title}
            {session.patient && ` ${session.patient.age}${session.patient.gender}`}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{formatDate(session.timestamp)}</Text>
            <Text style={styles.metaSeparator}>⏱️</Text>
            <Text style={styles.metaText}>{formatDuration(session.duration)}</Text>
          </View>
        </View>

        {/* Template Badge */}
        {session.template && (
          <View style={styles.templateBadge}>
            <Text style={styles.templateIcon}>📋</Text>
            <Text style={styles.templateName}>{session.template.name}</Text>
          </View>
        )}

        {/* Context Section */}
        {session.context && (
          <View style={styles.contextSection}>
            <View style={styles.contextBadge}>
              <Text style={styles.contextBadgeText}>Context</Text>
            </View>
            <Text style={styles.contextText}>{session.context}</Text>
          </View>
        )}

        {/* Transcription */}
        <View style={styles.transcriptionSection}>
          <Text style={styles.transcriptionText}>{session.transcription}</Text>
        </View>

        {/* Feedback Button */}
        <TouchableOpacity style={styles.feedbackButton} onPress={handleFeedback}>
          <Text style={styles.feedbackIcon}>💬</Text>
          <Text style={styles.feedbackText}>Provide feedback</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.resumeButton}>
          <Text style={styles.resumeIcon}>🎤</Text>
          <Text style={styles.resumeButtonText}>Resume</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 17,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  metaSeparator: {
    fontSize: 14,
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1c1c1e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  templateIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  templateName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  contextSection: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  contextBadge: {
    backgroundColor: '#2c2c2e',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  contextBadgeText: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contextText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
  },
  transcriptionSection: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  transcriptionText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 24,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 100,
  },
  feedbackIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  feedbackText: {
    fontSize: 16,
    color: '#fff',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#1c1c1e',
  },
  resumeButton: {
    backgroundColor: '#8ab4f8',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  resumeButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});
