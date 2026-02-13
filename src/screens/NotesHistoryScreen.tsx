import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StorageService from '../services/StorageService';
import {SOAPNote} from '../types';
import SOAPNoteDetailModal from '../components/SOAPNoteDetailModal';

const NotesHistoryScreen = () => {
  const [notes, setNotes] = useState<SOAPNote[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SOAPNote | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadNotes = async () => {
    try {
      const loadedNotes = await StorageService.getAllSOAPNotes();
      // Sort by date, newest first
      loadedNotes.sort((a, b) => b.date.getTime() - a.date.getTime());
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load SOAP notes');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handleNotePress = (note: SOAPNote) => {
    setSelectedNote(note);
    setModalVisible(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this SOAP note?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteSOAPNote(noteId);
              await loadNotes();
              Alert.alert('Success', 'Note deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const renderNoteItem = ({item}: {item: SOAPNote}) => {
    const duration = Math.floor(item.duration / 60000);
    const dateStr = item.date.toLocaleDateString();
    const timeStr = item.date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.noteCard}
        onPress={() => handleNotePress(item)}>
        <View style={styles.noteHeader}>
          <View style={styles.noteHeaderLeft}>
            <Icon name="description" size={24} color="#007AFF" />
            <View style={styles.noteHeaderText}>
              <Text style={styles.noteDateText}>
                {dateStr} at {timeStr}
              </Text>
              {item.patientName && (
                <Text style={styles.patientNameText}>{item.patientName}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteNote(item.id)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="delete-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.notePreview}>
          <Text style={styles.sectionLabel}>Subjective:</Text>
          <Text style={styles.previewText} numberOfLines={2}>
            {item.subjective}
          </Text>
        </View>

        <View style={styles.noteFooter}>
          <View style={styles.noteTag}>
            <Icon name="access-time" size={14} color="#8E8E93" />
            <Text style={styles.noteTagText}>{duration} min</Text>
          </View>
          {item.exported && (
            <View style={[styles.noteTag, styles.exportedTag]}>
              <Icon name="check-circle" size={14} color="#34C759" />
              <Text style={[styles.noteTagText, styles.exportedText]}>
                Exported to Epic
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="description" size={80} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>No SOAP Notes Yet</Text>
      <Text style={styles.emptyText}>
        Start recording a doctor-patient conversation to generate your first SOAP note.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {selectedNote && (
        <SOAPNoteDetailModal
          visible={modalVisible}
          note={selectedNote}
          onClose={() => {
            setModalVisible(false);
            setSelectedNote(null);
          }}
          onUpdate={async (updatedNote) => {
            await StorageService.updateSOAPNote(updatedNote);
            await loadNotes();
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    padding: 16,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  noteHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  noteDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  patientNameText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  notePreview: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  noteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  noteTagText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  exportedTag: {
    backgroundColor: '#E8F8EC',
  },
  exportedText: {
    color: '#34C759',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotesHistoryScreen;
