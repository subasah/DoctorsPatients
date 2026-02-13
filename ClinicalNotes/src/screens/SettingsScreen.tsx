// ============================================================
// Settings Screen - App configuration and preferences
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../theme';
import { RootStackParamList, AppSettings } from '../types';
import { useAppContext } from '../context/AppContext';
import { deleteAllNotes } from '../services/storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { state, updateSettings, refreshNotes } = useAppContext();
  const [localSettings, setLocalSettings] = useState<AppSettings>(state.settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(state.settings);
  }, [state.settings]);

  const handleChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
      Alert.alert('Saved', 'Settings have been updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  const handleClearAllNotes = () => {
    Alert.alert(
      'Delete All Notes',
      'This will permanently delete all clinical notes. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await deleteAllNotes();
            await refreshNotes();
            Alert.alert('Done', 'All notes have been deleted.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        {hasChanges ? (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Practitioner Info */}
        <SectionHeader icon="person" title="Practitioner Information" />
        <View style={styles.card}>
          <SettingInput
            label="Full Name"
            value={localSettings.practitionerName}
            onChangeText={(v) => handleChange('practitionerName', v)}
            placeholder="Dr. Jane Smith"
          />
          <SettingInput
            label="NPI Number"
            value={localSettings.practitionerNPI}
            onChangeText={(v) => handleChange('practitionerNPI', v)}
            placeholder="1234567890"
            keyboardType="numeric"
          />
          <SettingInput
            label="Specialty"
            value={localSettings.practitionerSpecialty}
            onChangeText={(v) => handleChange('practitionerSpecialty', v)}
            placeholder="General Medicine"
          />
        </View>

        {/* AI Configuration */}
        <SectionHeader icon="auto-awesome" title="AI Configuration" />
        <View style={styles.card}>
          <SettingInput
            label="OpenAI API Key"
            value={localSettings.openAiApiKey}
            onChangeText={(v) => handleChange('openAiApiKey', v)}
            placeholder="sk-..."
            secureTextEntry
          />
          <Text style={styles.helpText}>
            Required for AI transcription and SOAP note generation. Get your API key from{' '}
            <Text style={styles.linkText}>platform.openai.com</Text>
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLabel}>
              <Text style={styles.settingLabel}>Auto-Generate SOAP Notes</Text>
              <Text style={styles.settingDescription}>
                Automatically generate SOAP notes after recording
              </Text>
            </View>
            <Switch
              value={localSettings.autoGenerateSOAP}
              onValueChange={(v) => handleChange('autoGenerateSOAP', v)}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Epic FHIR Configuration */}
        <SectionHeader icon="cloud" title="Epic FHIR Integration" />
        <View style={styles.card}>
          <SettingInput
            label="FHIR Base URL"
            value={localSettings.epicFhirBaseUrl}
            onChangeText={(v) => handleChange('epicFhirBaseUrl', v)}
            placeholder="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
            autoCapitalize="none"
          />
          <SettingInput
            label="Client ID"
            value={localSettings.epicClientId}
            onChangeText={(v) => handleChange('epicClientId', v)}
            placeholder="Your Epic app client ID"
          />
          <SettingInput
            label="Client Secret"
            value={localSettings.epicClientSecret}
            onChangeText={(v) => handleChange('epicClientSecret', v)}
            placeholder="Your Epic app client secret"
            secureTextEntry
          />
          <SettingInput
            label="Redirect URI"
            value={localSettings.epicRedirectUri}
            onChangeText={(v) => handleChange('epicRedirectUri', v)}
            placeholder="clinicalnotes://callback"
            autoCapitalize="none"
          />
          <Text style={styles.helpText}>
            Register your app on the Epic App Orchard (open.epic.com) to obtain credentials.
            The FHIR Base URL is provided by your Epic administrator.
          </Text>
        </View>

        {/* Preferences */}
        <SectionHeader icon="tune" title="Preferences" />
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingRowLabel}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>
                Vibration feedback on button presses
              </Text>
            </View>
            <Switch
              value={localSettings.hapticFeedback}
              onValueChange={(v) => handleChange('hapticFeedback', v)}
              trackColor={{ true: Colors.primary, false: Colors.border }}
              thumbColor={Colors.white}
            />
          </View>

          <SettingInput
            label="Default Specialty"
            value={localSettings.defaultSpecialty}
            onChangeText={(v) => handleChange('defaultSpecialty', v)}
            placeholder="General Medicine"
          />
        </View>

        {/* Data Management */}
        <SectionHeader icon="storage" title="Data Management" />
        <View style={styles.card}>
          <View style={styles.dataInfo}>
            <Text style={styles.dataInfoText}>
              {state.notes.length} note{state.notes.length !== 1 ? 's' : ''} stored locally
            </Text>
          </View>
          <TouchableOpacity style={styles.dangerButton} onPress={handleClearAllNotes}>
            <MaterialIcons name="delete-forever" size={20} color={Colors.error} />
            <Text style={styles.dangerButtonText}>Delete All Notes</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <SectionHeader icon="info" title="About" />
        <View style={styles.card}>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>FHIR Version</Text>
            <Text style={styles.aboutValue}>R4 (4.0.1)</Text>
          </View>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>AI Model</Text>
            <Text style={styles.aboutValue}>GPT-4 / Whisper</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <MaterialIcons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function SettingInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'sentences'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  saveButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  helpText: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: FontWeights.medium,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  settingRowLabel: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
  settingDescription: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  dataInfo: {
    paddingVertical: Spacing.md,
  },
  dataInfoText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: Spacing.md,
  },
  dangerButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.error,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  aboutLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  aboutValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.textPrimary,
  },
});
