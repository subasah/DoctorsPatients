// ============================================================
// Home Screen - Dashboard with stats and quick actions
// ============================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../theme';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../types';
import NoteCard from '../components/NoteCard';
import EmptyState from '../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { state } = useAppContext();
  const { notes, settings } = state;

  const recentNotes = notes.slice(0, 3);
  const draftCount = notes.filter((n) => n.status === 'draft').length;
  const finalizedCount = notes.filter((n) => n.status === 'finalized' || n.status === 'synced').length;
  const todayCount = notes.filter(
    (n) => new Date(n.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.doctorName}>
              {settings.practitionerName || 'Doctor'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons name="settings" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Quick Action - Start Recording */}
        <TouchableOpacity
          style={styles.recordingCTA}
          onPress={() => navigation.navigate('Recording', {})}
          activeOpacity={0.8}
        >
          <View style={styles.ctaContent}>
            <View style={styles.ctaIconContainer}>
              <MaterialIcons name="mic" size={32} color={Colors.white} />
            </View>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Start New Consultation</Text>
              <Text style={styles.ctaDescription}>
                Record a patient conversation and auto-generate SOAP notes
              </Text>
            </View>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color={Colors.white} />
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.primaryBg }]}>
            <MaterialIcons name="today" size={24} color={Colors.primary} />
            <Text style={[styles.statNumber, { color: Colors.primary }]}>{todayCount}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.warningBg }]}>
            <MaterialIcons name="edit-note" size={24} color={Colors.warning} />
            <Text style={[styles.statNumber, { color: Colors.warning }]}>{draftCount}</Text>
            <Text style={styles.statLabel}>Drafts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.successBg }]}>
            <MaterialIcons name="check-circle" size={24} color={Colors.success} />
            <Text style={[styles.statNumber, { color: Colors.success }]}>
              {finalizedCount}
            </Text>
            <Text style={styles.statLabel}>Finalized</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.secondaryBg }]}>
            <MaterialIcons name="description" size={24} color={Colors.secondary} />
            <Text style={[styles.statNumber, { color: Colors.secondary }]}>
              {notes.length}
            </Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Recent Notes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notes</Text>
          {notes.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Notes' } as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentNotes.length > 0 ? (
          recentNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPress={() => navigation.navigate('NoteEditor', { noteId: note.id })}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="note-add"
              title="No Notes Yet"
              description="Start your first consultation recording to generate SOAP notes automatically."
              actionLabel="Start Recording"
              onAction={() => navigation.navigate('Recording', {})}
            />
          </View>
        )}

        {/* Quick Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <MaterialIcons name="lightbulb" size={20} color={Colors.accent} />
            <Text style={styles.tipsTitle}>Quick Tips</Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="fiber-manual-record" size={8} color={Colors.textTertiary} />
            <Text style={styles.tipText}>
              Tap the microphone to start recording a patient conversation
            </Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="fiber-manual-record" size={8} color={Colors.textTertiary} />
            <Text style={styles.tipText}>
              AI will automatically generate SOAP notes from the transcript
            </Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="fiber-manual-record" size={8} color={Colors.textTertiary} />
            <Text style={styles.tipText}>
              Review and edit notes before finalizing for Epic integration
            </Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialIcons name="fiber-manual-record" size={8} color={Colors.textTertiary} />
            <Text style={styles.tipText}>
              Configure your OpenAI API key in Settings for AI features
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  doctorName: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  recordingCTA: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    ...Shadows.large,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  ctaDescription: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  emptyContainer: {
    height: 280,
  },
  tipsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadows.small,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  tipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
});
