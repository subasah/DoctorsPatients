// ============================================================
// Note Card - Card component for note list items
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../theme';
import { SOAPNote } from '../types';
import { formatDate, getRelativeTime, getStatusInfo, formatDuration, generateNoteSummary } from '../utils/helpers';

interface NoteCardProps {
  note: SOAPNote;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function NoteCard({ note, onPress, onLongPress }: NoteCardProps) {
  const status = getStatusInfo(note.status);
  const summary = generateNoteSummary(note);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={styles.patientInfo}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={20} color={Colors.primary} />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.patientName} numberOfLines={1}>
              {note.patientName || 'Unknown Patient'}
            </Text>
            <Text style={styles.dateText}>{formatDate(note.encounterDate)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
          <MaterialIcons name={status.icon as any} size={12} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Summary */}
      <Text style={styles.summary} numberOfLines={2}>
        {summary}
      </Text>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="access-time" size={14} color={Colors.textTertiary} />
          <Text style={styles.metaText}>{getRelativeTime(note.updatedAt)}</Text>
        </View>
        {note.recordingDuration > 0 && (
          <View style={styles.metaItem}>
            <MaterialIcons name="mic" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{formatDuration(note.recordingDuration)}</Text>
          </View>
        )}
        {note.epicMetadata?.syncStatus === 'synced' && (
          <View style={styles.metaItem}>
            <MaterialIcons name="cloud-done" size={14} color={Colors.secondary} />
            <Text style={[styles.metaText, { color: Colors.secondary }]}>Epic</Text>
          </View>
        )}
        <MaterialIcons name="chevron-right" size={20} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  nameContainer: {
    flex: 1,
  },
  patientName: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  dateText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  summary: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
  },
});
