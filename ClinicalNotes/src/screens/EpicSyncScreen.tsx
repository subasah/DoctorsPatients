// ============================================================
// Epic Sync Screen - Manage Epic FHIR integration and sync
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../theme';
import { RootStackParamList, SOAPNote } from '../types';
import { useAppContext } from '../context/AppContext';
import { testEpicConnection, uploadSOAPNoteToEpic } from '../services/epicFhir';
import { formatDateTime, getStatusInfo } from '../utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EpicSyncScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { state, updateNote } = useAppContext();

  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [syncingNoteId, setSyncingNoteId] = useState<string | null>(null);

  const isConfigured = state.settings.epicFhirBaseUrl && state.settings.epicClientId;
  const finalizedNotes = state.notes.filter(
    (n) => n.status === 'finalized' || n.status === 'synced'
  );
  const pendingSyncNotes = state.notes.filter(
    (n) => n.status === 'finalized' && n.epicMetadata?.syncStatus !== 'synced'
  );

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const result = await testEpicConnection();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
      setConnectionMessage(result.message);
    } catch (error: any) {
      setConnectionStatus('disconnected');
      setConnectionMessage(error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncNote = async (note: SOAPNote) => {
    if (!note.epicMetadata?.patientFhirId) {
      Alert.alert(
        'Patient Not Linked',
        'This note needs to be linked to a patient in Epic before syncing. This would typically be done through a patient search flow.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSyncingNoteId(note.id);
    try {
      const docRefId = await uploadSOAPNoteToEpic(
        note,
        note.epicMetadata.patientFhirId,
        note.epicMetadata.encounterId
      );

      const updatedNote: SOAPNote = {
        ...note,
        status: 'synced',
        epicMetadata: {
          ...note.epicMetadata,
          documentReferenceId: docRefId,
          lastSyncedAt: new Date().toISOString(),
          syncStatus: 'synced',
        },
      };

      await updateNote(updatedNote);
      Alert.alert('Success', 'Note successfully synced to Epic!');
    } catch (error: any) {
      Alert.alert('Sync Failed', error.message);
    } finally {
      setSyncingNoteId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Epic Integration</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons name="settings" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Connection Status Card */}
        <View style={styles.connectionCard}>
          <View style={styles.connectionHeader}>
            <View style={styles.connectionIconContainer}>
              <MaterialIcons
                name={
                  connectionStatus === 'connected'
                    ? 'cloud-done'
                    : connectionStatus === 'disconnected'
                    ? 'cloud-off'
                    : 'cloud-queue'
                }
                size={32}
                color={
                  connectionStatus === 'connected'
                    ? Colors.success
                    : connectionStatus === 'disconnected'
                    ? Colors.error
                    : Colors.textTertiary
                }
              />
            </View>
            <View style={styles.connectionInfo}>
              <Text style={styles.connectionTitle}>Epic FHIR Server</Text>
              <Text style={styles.connectionSubtitle}>
                {isConfigured
                  ? connectionStatus === 'connected'
                    ? 'Connected'
                    : connectionStatus === 'disconnected'
                    ? 'Connection Failed'
                    : 'Not tested'
                  : 'Not configured'}
              </Text>
              {connectionMessage ? (
                <Text style={styles.connectionMessage}>{connectionMessage}</Text>
              ) : null}
            </View>
          </View>

          {isConfigured ? (
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <MaterialIcons name="wifi-tethering" size={18} color={Colors.white} />
                  <Text style={styles.testButtonText}>Test Connection</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: Colors.accent }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <MaterialIcons name="settings" size={18} color={Colors.white} />
              <Text style={styles.testButtonText}>Configure</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Integration Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Epic Integration</Text>
          <Text style={styles.infoText}>
            This app uses the HL7 FHIR R4 standard to communicate with Epic EHR systems.
            Finalized SOAP notes are uploaded as DocumentReference resources, making them
            available within the patient's chart in Epic.
          </Text>
          <View style={styles.infoFeatures}>
            <InfoFeatureItem icon="security" text="SMART on FHIR OAuth2 authentication" />
            <InfoFeatureItem icon="description" text="FHIR DocumentReference for clinical notes" />
            <InfoFeatureItem icon="person-search" text="Patient search and matching" />
            <InfoFeatureItem icon="sync" text="Bidirectional encounter synchronization" />
          </View>
        </View>

        {/* Sync Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: Colors.successBg }]}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>
              {state.notes.filter((n) => n.status === 'synced').length}
            </Text>
            <Text style={styles.statLabel}>Synced</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.warningBg }]}>
            <Text style={[styles.statNumber, { color: Colors.warning }]}>
              {pendingSyncNotes.length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.errorBg }]}>
            <Text style={[styles.statNumber, { color: Colors.error }]}>
              {state.notes.filter((n) => n.epicMetadata?.syncStatus === 'failed').length}
            </Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>

        {/* Notes Ready to Sync */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Finalized Notes</Text>
          <Text style={styles.sectionSubtitle}>
            {finalizedNotes.length} note{finalizedNotes.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {finalizedNotes.length > 0 ? (
          finalizedNotes.map((note) => (
            <SyncNoteItem
              key={note.id}
              note={note}
              isSyncing={syncingNoteId === note.id}
              onSync={() => handleSyncNote(note)}
              onPress={() => navigation.navigate('NoteEditor', { noteId: note.id })}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <MaterialIcons name="check-circle" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>
              No finalized notes. Review and finalize draft notes to sync them with Epic.
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoFeatureItem({ icon, text }: { icon: keyof typeof MaterialIcons.glyphMap; text: string }) {
  return (
    <View style={styles.infoFeatureItem}>
      <MaterialIcons name={icon} size={18} color={Colors.primary} />
      <Text style={styles.infoFeatureText}>{text}</Text>
    </View>
  );
}

function SyncNoteItem({
  note,
  isSyncing,
  onSync,
  onPress,
}: {
  note: SOAPNote;
  isSyncing: boolean;
  onSync: () => void;
  onPress: () => void;
}) {
  const statusInfo = getStatusInfo(note.status);
  const isSynced = note.epicMetadata?.syncStatus === 'synced';

  return (
    <TouchableOpacity style={styles.syncNoteCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.syncNoteHeader}>
        <View style={styles.syncNoteInfo}>
          <Text style={styles.syncNoteName}>{note.patientName}</Text>
          <Text style={styles.syncNoteDate}>{formatDateTime(note.encounterDate)}</Text>
        </View>
        {isSynced ? (
          <View style={styles.syncedBadge}>
            <MaterialIcons name="cloud-done" size={16} color={Colors.success} />
            <Text style={styles.syncedText}>Synced</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={onSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <MaterialIcons name="cloud-upload" size={16} color={Colors.white} />
                <Text style={styles.syncButtonText}>Sync</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
      {note.epicMetadata?.lastSyncedAt && (
        <Text style={styles.lastSyncText}>
          Last synced: {formatDateTime(note.epicMetadata.lastSyncedAt)}
        </Text>
      )}
    </TouchableOpacity>
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
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  connectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  connectionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  connectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  connectionMessage: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  testButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  infoFeatures: {
    gap: Spacing.md,
  },
  infoFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoFeatureText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
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
    alignItems: 'baseline',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
  },
  syncNoteCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  syncNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncNoteInfo: {
    flex: 1,
  },
  syncNoteName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  syncNoteDate: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  syncedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.successBg,
    borderRadius: BorderRadius.round,
  },
  syncedText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    color: Colors.success,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
  },
  syncButtonText: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  lastSyncText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.small,
  },
  emptyText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
