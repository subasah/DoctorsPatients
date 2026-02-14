import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';
import { Patient } from '../types';

export default function PatientDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addPatient, patients } = useApp();
  const { templateId } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewPatient = () => {
    setShowNewPatient(true);
    setSearchQuery('');
  };

  const handleSavePatient = async () => {
    if (!newPatientName.trim()) {
      Alert.alert('Error', 'Please enter patient details');
      return;
    }

    // Parse the patient name format: "e.g John Smith 35M"
    const parts = newPatientName.trim().split(' ');
    let name = '';
    let age = '';
    let gender = '';

    if (parts.length >= 2) {
      // Last part might contain age and gender (e.g., "35M")
      const lastPart = parts[parts.length - 1];
      const ageGenderMatch = lastPart.match(/^(\d+)([MFmf])?$/);
      
      if (ageGenderMatch) {
        age = ageGenderMatch[1];
        gender = ageGenderMatch[2]?.toUpperCase() || '';
        name = parts.slice(0, -1).join(' ');
      } else {
        name = parts.join(' ');
      }
    } else {
      name = newPatientName.trim();
    }

    const patient: Patient = {
      id: Date.now().toString(),
      name,
      age,
      gender,
    };

    await addPatient(patient);
    navigation.navigate('Recording', { 
      templateId, 
      patientId: patient.id 
    });
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    navigation.navigate('Recording', { 
      templateId, 
      patientId: patient.id 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <TouchableOpacity onPress={() => setShowNewPatient(false)}>
              <Text style={[styles.headerTab, !showNewPatient && styles.headerTabActive]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreateNewPatient}>
              <Text style={[styles.headerTab, showNewPatient && styles.headerTabActive]}>
                New patient
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!showNewPatient ? (
          <>
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for patient or type title"
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity
              style={styles.createNewButton}
              onPress={handleCreateNewPatient}
            >
              <Text style={styles.createNewIcon}>👤</Text>
              <Text style={styles.createNewText}>Create new patient</Text>
            </TouchableOpacity>

            <ScrollView style={styles.patientsList}>
              {filteredPatients.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>👤</Text>
                  <Text style={styles.emptyTitle}>No patients</Text>
                  <Text style={styles.emptySubtitle}>
                    Create a patient with the field above
                  </Text>
                </View>
              ) : (
                filteredPatients.map(patient => (
                  <TouchableOpacity
                    key={patient.id}
                    style={styles.patientItem}
                    onPress={() => handleSelectPatient(patient)}
                  >
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </Text>
                    </View>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <Text style={styles.patientMeta}>
                        {patient.age && `${patient.age} years`}
                        {patient.age && patient.gender && ' • '}
                        {patient.gender}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </>
        ) : (
          <View style={styles.newPatientForm}>
            <Text style={styles.formTitle}>Patient Details</Text>
            
            <TextInput
              style={styles.patientInput}
              placeholder="e.g John Smith 35M"
              placeholderTextColor="#666"
              value={newPatientName}
              onChangeText={setNewPatientName}
              autoFocus
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePatient}
            >
              <Text style={styles.saveIcon}>👤</Text>
              <Text style={styles.saveButtonText}>Save patient</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  headerTab: {
    fontSize: 17,
    color: '#666',
    paddingVertical: 8,
  },
  headerTabActive: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 20,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
  },
  createNewIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  createNewText: {
    fontSize: 17,
    color: '#007aff',
    fontWeight: '500',
  },
  patientsList: {
    flex: 1,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  patientMeta: {
    fontSize: 14,
    color: '#8e8e93',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  newPatientForm: {
    flex: 1,
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  patientInput: {
    backgroundColor: '#1c1c1e',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 17,
    color: '#fff',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#8ab4f8',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  saveIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
});
