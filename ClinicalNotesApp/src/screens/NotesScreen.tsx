import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { SOAPNote } from '../types';
import { soapToFhirComposition } from '../services/epicFhirService';

function SOAPNoteCard({ note, onExport }: { note: SOAPNote; onExport: () => void }) {
  const sections = [
    { label: 'Subjective', content: note.subjective, color: '#3b82f6' },
    { label: 'Objective', content: note.objective, color: '#10b981' },
    { label: 'Assessment', content: note.assessment, color: '#f59e0b' },
    { label: 'Plan', content: note.plan, color: '#8b5cf6' },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{note.date}</Text>
        <TouchableOpacity onPress={onExport} style={styles.exportButton}>
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      {sections.map(({ label, content, color }) => (
        <View key={label} style={styles.section}>
          <View style={[styles.sectionBadge, { backgroundColor: color + '30' }]}>
            <Text style={[styles.sectionLabel, { color }]}>{label}</Text>
          </View>
          <Text style={styles.sectionContent}>{content}</Text>
        </View>
      ))}
    </View>
  );
}

export function NotesScreen() {
  const { notes } = useApp();

  const handleExport = async (note: SOAPNote) => {
    const composition = soapToFhirComposition(note);
    const json = JSON.stringify(composition, null, 2);

    try {
      await Share.share({
        message: `SOAP Note - ${note.date}\n\nSubjective: ${note.subjective}\n\nObjective: ${note.objective}\n\nAssessment: ${note.assessment}\n\nPlan: ${note.plan}\n\n--- FHIR Composition (Epic-ready) ---\n${json}`,
        title: `Clinical Note ${note.date}`,
      });
    } catch (err) {
      Alert.alert('Export', 'Could not share note');
    }
  };

  if (notes.length === 0) {
    return (
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyTitle}>No notes yet</Text>
        <Text style={styles.emptySubtitle}>
          Record a patient-doctor conversation to generate your first SOAP note
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>SOAP Notes</Text>
        <Text style={styles.subtitle}>{notes.length} note{notes.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SOAPNoteCard
            note={item}
            onExport={() => handleExport(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  cardDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionContent: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 22,
  },
});
