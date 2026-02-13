// ============================================================
// Notes List Screen - Browse, search, and filter SOAP notes
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../theme';
import { RootStackParamList, SOAPNote, NoteStatus } from '../types';
import { useAppContext } from '../context/AppContext';
import NoteCard from '../components/NoteCard';
import EmptyState from '../components/EmptyState';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FILTER_OPTIONS: { label: string; value: NoteStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Finalized', value: 'finalized' },
  { label: 'Synced', value: 'synced' },
];

export default function NotesListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { state, removeNote } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<NoteStatus | 'all'>('all');

  const filteredNotes = useMemo(() => {
    let notes = state.notes;

    // Filter by status
    if (activeFilter !== 'all') {
      notes = notes.filter((n) => n.status === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.patientName.toLowerCase().includes(query) ||
          n.subjective.chiefComplaint.toLowerCase().includes(query) ||
          n.assessment.primaryDiagnosis.toLowerCase().includes(query)
      );
    }

    return notes;
  }, [state.notes, activeFilter, searchQuery]);

  const handleDeleteNote = (note: SOAPNote) => {
    Alert.alert('Delete Note', `Delete note for "${note.patientName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeNote(note.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Clinical Notes</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('Recording', {})}
        >
          <MaterialIcons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by patient, complaint, or diagnosis..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <FlatList
        horizontal
        data={FILTER_OPTIONS}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === item.value && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(item.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === item.value && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => navigation.navigate('NoteEditor', { noteId: item.id })}
            onLongPress={() => handleDeleteNote(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon={searchQuery ? 'search-off' : 'note-add'}
            title={searchQuery ? 'No Results' : 'No Notes Yet'}
            description={
              searchQuery
                ? `No notes found matching "${searchQuery}"`
                : 'Start recording a consultation to create your first SOAP note.'
            }
            actionLabel={searchQuery ? undefined : 'Start Recording'}
            onAction={searchQuery ? undefined : () => navigation.navigate('Recording', {})}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  newButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    flexGrow: 1,
  },
});
