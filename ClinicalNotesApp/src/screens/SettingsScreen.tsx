import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

export function SettingsScreen() {
  const { config, updateConfig } = useApp();
  const [apiKey, setApiKey] = useState(config.openaiApiKey);
  const [epicUrl, setEpicUrl] = useState(config.epicFhirUrl);

  const handleSave = () => {
    updateConfig({
      openaiApiKey: apiKey.trim(),
      epicFhirUrl: epicUrl.trim() || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
    });
    updateConfig({ useMockServices: !apiKey.trim() });
    Alert.alert('Saved', 'Settings have been updated.');
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Configure API and Epic integration</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OpenAI API</Text>
            <Text style={styles.sectionDesc}>
              Required for live transcription (Whisper) and SOAP generation (GPT).
              Get your key at platform.openai.com
            </Text>
            <TextInput
              style={styles.input}
              placeholder="sk-..."
              placeholderTextColor="#64748b"
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Demo Mode</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Use mock services (no API key needed)</Text>
              <Switch
                value={config.useMockServices}
                onValueChange={(v) => updateConfig({ useMockServices: v })}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#f8fafc"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Epic FHIR Endpoint</Text>
            <Text style={styles.sectionDesc}>
              Epic FHIR base URL for note integration. Configure OAuth in production.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="https://fhir.epic.com/..."
              placeholderTextColor="#64748b"
              value={epicUrl}
              onChangeText={setEpicUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Epic Integration</Text>
            <Text style={styles.infoText}>
              To push notes to Epic: 1) Register your app in Epic App Orchard,
              2) Configure OAuth 2.0, 3) Use the pushToEpic() function with
              patient/encounter context. FHIR Composition format is Epic-compatible.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: '#e2e8f0',
    flex: 1,
    marginRight: 16,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60a5fa',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#93c5fd',
    lineHeight: 20,
  },
});
