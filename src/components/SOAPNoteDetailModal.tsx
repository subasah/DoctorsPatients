import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SOAPNote} from '../types';
import EpicIntegrationService from '../services/EpicIntegrationService';
import StorageService from '../services/StorageService';

interface Props {
  visible: boolean;
  note: SOAPNote;
  onClose: () => void;
  onUpdate: (note: SOAPNote) => void;
}

const SOAPNoteDetailModal: React.FC<Props> = ({
  visible,
  note,
  onClose,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState<SOAPNote>(note);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'soap' | 'transcript'>('soap');

  const handleSave = () => {
    onUpdate(editedNote);
    setIsEditing(false);
    Alert.alert('Success', 'SOAP note updated successfully');
  };

  const handleCancel = () => {
    setEditedNote(note);
    setIsEditing(false);
  };

  const handleShare = async () => {
    const content = formatNoteForExport(note);
    try {
      await Share.share({
        message: content,
        title: `SOAP Note - ${note.date.toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleExportToEpic = async () => {
    setExporting(true);
    try {
      const settings = await StorageService.getSettings();
      
      if (!settings.epicConfig.enabled) {
        Alert.alert(
          'Epic Integration Disabled',
          'Please enable and configure Epic integration in Settings.'
        );
        return;
      }

      EpicIntegrationService.setConfig(settings.epicConfig);
      const success = await EpicIntegrationService.exportSOAPNote(note);

      if (success) {
        const updatedNote = {...note, exported: true};
        onUpdate(updatedNote);
        setEditedNote(updatedNote);
        Alert.alert('Success', 'SOAP note exported to Epic successfully');
      }
    } catch (error) {
      Alert.alert(
        'Export Failed',
        'Failed to export SOAP note to Epic. Please check your connection and try again.'
      );
      console.error('Epic export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatNoteForExport = (noteToFormat: SOAPNote): string => {
    return `
SOAP NOTE
Generated: ${noteToFormat.date.toLocaleString()}
${noteToFormat.patientName ? `Patient: ${noteToFormat.patientName}\n` : ''}
${noteToFormat.patientId ? `Patient ID: ${noteToFormat.patientId}\n` : ''}

SUBJECTIVE:
${noteToFormat.subjective}

OBJECTIVE:
${noteToFormat.objective}

ASSESSMENT:
${noteToFormat.assessment}

PLAN:
${noteToFormat.plan}

Duration: ${Math.floor(noteToFormat.duration / 60000)} minutes
    `.trim();
  };

  const renderSOAPContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.soapSection}>
        <View style={styles.soapHeader}>
          <Text style={styles.soapLabel}>SUBJECTIVE</Text>
          {isEditing && <Icon name="edit" size={16} color="#007AFF" />}
        </View>
        {isEditing ? (
          <TextInput
            style={styles.textArea}
            value={editedNote.subjective}
            onChangeText={(text) =>
              setEditedNote({...editedNote, subjective: text})
            }
            multiline
            placeholder="Patient's subjective information..."
          />
        ) : (
          <Text style={styles.soapText}>{note.subjective}</Text>
        )}
      </View>

      <View style={styles.soapSection}>
        <View style={styles.soapHeader}>
          <Text style={styles.soapLabel}>OBJECTIVE</Text>
          {isEditing && <Icon name="edit" size={16} color="#007AFF" />}
        </View>
        {isEditing ? (
          <TextInput
            style={styles.textArea}
            value={editedNote.objective}
            onChangeText={(text) =>
              setEditedNote({...editedNote, objective: text})
            }
            multiline
            placeholder="Objective findings..."
          />
        ) : (
          <Text style={styles.soapText}>{note.objective}</Text>
        )}
      </View>

      <View style={styles.soapSection}>
        <View style={styles.soapHeader}>
          <Text style={styles.soapLabel}>ASSESSMENT</Text>
          {isEditing && <Icon name="edit" size={16} color="#007AFF" />}
        </View>
        {isEditing ? (
          <TextInput
            style={styles.textArea}
            value={editedNote.assessment}
            onChangeText={(text) =>
              setEditedNote({...editedNote, assessment: text})
            }
            multiline
            placeholder="Clinical assessment..."
          />
        ) : (
          <Text style={styles.soapText}>{note.assessment}</Text>
        )}
      </View>

      <View style={styles.soapSection}>
        <View style={styles.soapHeader}>
          <Text style={styles.soapLabel}>PLAN</Text>
          {isEditing && <Icon name="edit" size={16} color="#007AFF" />}
        </View>
        {isEditing ? (
          <TextInput
            style={styles.textArea}
            value={editedNote.plan}
            onChangeText={(text) =>
              setEditedNote({...editedNote, plan: text})
            }
            multiline
            placeholder="Treatment plan..."
          />
        ) : (
          <Text style={styles.soapText}>{note.plan}</Text>
        )}
      </View>
    </View>
  );

  const renderTranscript = () => (
    <View style={styles.contentContainer}>
      <Text style={styles.transcriptText}>{note.rawTranscript}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SOAP Note Details</Text>
          <View style={styles.headerRight}>
            {isEditing ? (
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Icon name="edit" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Metadata */}
        <View style={styles.metadata}>
          <View style={styles.metadataRow}>
            <Icon name="event" size={16} color="#8E8E93" />
            <Text style={styles.metadataText}>
              {note.date.toLocaleString()}
            </Text>
          </View>
          <View style={styles.metadataRow}>
            <Icon name="access-time" size={16} color="#8E8E93" />
            <Text style={styles.metadataText}>
              {Math.floor(note.duration / 60000)} minutes
            </Text>
          </View>
          {note.exported && (
            <View style={styles.exportedBadge}>
              <Icon name="check-circle" size={16} color="#34C759" />
              <Text style={styles.exportedBadgeText}>Exported to Epic</Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'soap' && styles.activeTab]}
            onPress={() => setActiveTab('soap')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'soap' && styles.activeTabText,
              ]}>
              SOAP Notes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transcript' && styles.activeTab]}
            onPress={() => setActiveTab('transcript')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'transcript' && styles.activeTabText,
              ]}>
              Transcript
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView}>
          {activeTab === 'soap' ? renderSOAPContent() : renderTranscript()}
        </ScrollView>

        {/* Actions */}
        {!isEditing && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.epicButton]}
              onPress={handleExportToEpic}
              disabled={exporting || note.exported}>
              {exporting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon
                    name={note.exported ? 'check-circle' : 'cloud-upload'}
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.epicButtonText}>
                    {note.exported ? 'Exported' : 'Export to Epic'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton]}
              onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.saveButtonFull]}
              onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  saveButton: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  exportedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exportedBadgeText: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 4,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  soapSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  soapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  soapLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  soapText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
  },
  textArea: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
    minHeight: 80,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
  },
  transcriptText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  epicButton: {
    backgroundColor: '#007AFF',
  },
  epicButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  editButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  saveButtonFull: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SOAPNoteDetailModal;
