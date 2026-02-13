// ============================================================
// Note Editor Screen - Full SOAP note editor with sections
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../theme';
import { RootStackParamList, SOAPNote, NoteStatus } from '../types';
import { useAppContext } from '../context/AppContext';
import SOAPSectionCard from '../components/SOAPSectionCard';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime, formatDuration, soapNoteToText } from '../utils/helpers';
import * as Clipboard from 'expo-clipboard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditorRouteProp = RouteProp<RootStackParamList, 'NoteEditor'>;

export default function NoteEditorScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditorRouteProp>();
  const { state, updateNote, removeNote } = useAppContext();

  const [note, setNote] = useState<SOAPNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const found = state.notes.find((n) => n.id === route.params.noteId);
    if (found) {
      setNote(found);
    }
  }, [route.params.noteId, state.notes]);

  const handleSave = useCallback(async () => {
    if (!note) return;
    setIsSaving(true);
    try {
      await updateNote(note);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  }, [note, updateNote]);

  const handleStatusChange = async (newStatus: NoteStatus) => {
    if (!note) return;
    const updatedNote = { ...note, status: newStatus, updatedAt: new Date().toISOString() };
    setNote(updatedNote);
    await updateNote(updatedNote);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to permanently delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (note) {
              await removeNote(note.id);
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleCopyToClipboard = async () => {
    if (!note) return;
    const text = soapNoteToText(note);
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'SOAP note copied to clipboard');
  };

  const handleFieldChange = (
    section: 'subjective' | 'objective' | 'assessment' | 'plan',
    key: string,
    value: string
  ) => {
    if (!note) return;
    setNote({
      ...note,
      [section]: {
        ...note[section],
        [key]: value,
      },
    });
  };

  if (!note) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading note...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {note.patientName}
          </Text>
          <StatusBadge status={note.status} size="small" />
        </View>
        <View style={styles.headerActions}>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              <MaterialIcons name="edit" size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Patient Info Card */}
        <View style={styles.patientCard}>
          <View style={styles.patientCardHeader}>
            <View style={styles.patientAvatar}>
              <MaterialIcons name="person" size={28} color={Colors.primary} />
            </View>
            <View style={styles.patientDetails}>
              {isEditing ? (
                <TextInput
                  style={styles.patientNameInput}
                  value={note.patientName}
                  onChangeText={(text) => setNote({ ...note, patientName: text })}
                  placeholder="Patient name"
                />
              ) : (
                <Text style={styles.patientName}>{note.patientName}</Text>
              )}
              <Text style={styles.encounterDate}>
                {formatDateTime(note.encounterDate)}
              </Text>
              {note.recordingDuration > 0 && (
                <Text style={styles.recordingDuration}>
                  Recording: {formatDuration(note.recordingDuration)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* SOAP Sections */}
        <SOAPSectionCard
          title="Subjective"
          color={Colors.soapSubjective}
          icon="person-outline"
          editable={isEditing}
          onFieldChange={(key, value) => handleFieldChange('subjective', key, value)}
          fields={[
            { key: 'chiefComplaint', label: 'Chief Complaint', value: note.subjective.chiefComplaint },
            { key: 'historyOfPresentIllness', label: 'History of Present Illness', value: note.subjective.historyOfPresentIllness },
            { key: 'reviewOfSystems', label: 'Review of Systems', value: note.subjective.reviewOfSystems },
            { key: 'pastMedicalHistory', label: 'Past Medical History', value: note.subjective.pastMedicalHistory },
            { key: 'medications', label: 'Current Medications', value: note.subjective.medications },
            { key: 'allergies', label: 'Allergies', value: note.subjective.allergies },
            { key: 'socialHistory', label: 'Social History', value: note.subjective.socialHistory },
            { key: 'familyHistory', label: 'Family History', value: note.subjective.familyHistory },
          ]}
        />

        <SOAPSectionCard
          title="Objective"
          color={Colors.soapObjective}
          icon="assessment"
          editable={isEditing}
          onFieldChange={(key, value) => handleFieldChange('objective', key, value)}
          fields={[
            { key: 'vitalSigns', label: 'Vital Signs', value: note.objective.vitalSigns },
            { key: 'physicalExamination', label: 'Physical Examination', value: note.objective.physicalExamination },
            { key: 'laboratoryData', label: 'Laboratory Data', value: note.objective.laboratoryData },
            { key: 'imagingResults', label: 'Imaging Results', value: note.objective.imagingResults },
            { key: 'otherFindings', label: 'Other Findings', value: note.objective.otherFindings },
          ]}
        />

        <SOAPSectionCard
          title="Assessment"
          color={Colors.soapAssessment}
          icon="psychology"
          editable={isEditing}
          onFieldChange={(key, value) => handleFieldChange('assessment', key, value)}
          fields={[
            { key: 'primaryDiagnosis', label: 'Primary Diagnosis', value: note.assessment.primaryDiagnosis },
            { key: 'differentialDiagnoses', label: 'Differential Diagnoses', value: note.assessment.differentialDiagnoses },
            { key: 'clinicalImpression', label: 'Clinical Impression', value: note.assessment.clinicalImpression },
          ]}
        />

        <SOAPSectionCard
          title="Plan"
          color={Colors.soapPlan}
          icon="playlist-add-check"
          editable={isEditing}
          onFieldChange={(key, value) => handleFieldChange('plan', key, value)}
          fields={[
            { key: 'treatment', label: 'Treatment', value: note.plan.treatment },
            { key: 'medications', label: 'Medications Prescribed', value: note.plan.medications },
            { key: 'procedures', label: 'Procedures', value: note.plan.procedures },
            { key: 'referrals', label: 'Referrals', value: note.plan.referrals },
            { key: 'followUp', label: 'Follow-Up', value: note.plan.followUp },
            { key: 'patientEducation', label: 'Patient Education', value: note.plan.patientEducation },
          ]}
        />

        {/* Transcript Section */}
        {note.transcript && (
          <TouchableOpacity
            style={styles.transcriptToggle}
            onPress={() => setShowTranscript(!showTranscript)}
          >
            <View style={styles.transcriptHeader}>
              <MaterialIcons name="subtitles" size={20} color={Colors.textSecondary} />
              <Text style={styles.transcriptTitle}>Original Transcript</Text>
            </View>
            <MaterialIcons
              name={showTranscript ? 'expand-less' : 'expand-more'}
              size={24}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        )}
        {showTranscript && note.transcript && (
          <View style={styles.transcriptContent}>
            <Text style={styles.transcriptText}>{note.transcript}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Text style={styles.actionsSectionTitle}>Actions</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleCopyToClipboard}>
            <MaterialIcons name="content-copy" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Copy to Clipboard</Text>
          </TouchableOpacity>

          {note.status === 'draft' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonHighlight]}
              onPress={() => handleStatusChange('reviewed')}
            >
              <MaterialIcons name="check-circle" size={20} color={Colors.white} />
              <Text style={[styles.actionButtonText, { color: Colors.white }]}>
                Mark as Reviewed
              </Text>
            </TouchableOpacity>
          )}

          {note.status === 'reviewed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSuccess]}
              onPress={() => handleStatusChange('finalized')}
            >
              <MaterialIcons name="verified" size={20} color={Colors.white} />
              <Text style={[styles.actionButtonText, { color: Colors.white }]}>
                Finalize Note
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleDelete}
          >
            <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
            <Text style={[styles.actionButtonText, { color: Colors.error }]}>
              Delete Note
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  patientCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  patientCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  patientNameInput: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingBottom: 4,
  },
  encounterDate: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  recordingDuration: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  transcriptToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  transcriptTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  transcriptContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  transcriptText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  actionsSection: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  actionsSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  actionButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.primary,
  },
  actionButtonHighlight: {
    backgroundColor: Colors.primary,
  },
  actionButtonSuccess: {
    backgroundColor: Colors.success,
  },
  actionButtonDanger: {
    borderWidth: 1,
    borderColor: Colors.errorBg,
  },
});
