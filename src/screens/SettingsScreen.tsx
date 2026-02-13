import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StorageService from '../services/StorageService';
import EpicIntegrationService from '../services/EpicIntegrationService';
import {AppSettings} from '../types';

const SettingsScreen = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await StorageService.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: AppSettings) => {
    setSaving(true);
    try {
      await StorageService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof AppSettings) => {
    if (!settings) return;
    const updated = {...settings, [key]: !settings[key]};
    saveSettings(updated);
  };

  const handleEpicConfigChange = (key: keyof AppSettings['epicConfig'], value: string | boolean) => {
    if (!settings) return;
    const updated = {
      ...settings,
      epicConfig: {
        ...settings.epicConfig,
        [key]: value,
      },
    };
    setSettings(updated);
  };

  const handleSaveEpicConfig = () => {
    if (settings) {
      saveSettings(settings);
    }
  };

  const handleTestConnection = async () => {
    if (!settings) return;

    setTestingConnection(true);
    try {
      const isValid = await EpicIntegrationService.validateConfig(
        settings.epicConfig
      );

      if (isValid) {
        Alert.alert('Success', 'Successfully connected to Epic FHIR API');
      } else {
        Alert.alert(
          'Connection Failed',
          'Unable to connect to Epic. Please check your credentials.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to test Epic connection');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all SOAP notes and reset settings. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await loadSettings();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  if (loading || !settings) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Settings</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Icon name="transcribe" size={24} color="#007AFF" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Auto Transcribe</Text>
              <Text style={styles.settingDescription}>
                Automatically transcribe during recording
              </Text>
            </View>
          </View>
          <Switch
            value={settings.autoTranscribe}
            onValueChange={() => handleToggle('autoTranscribe')}
            trackColor={{false: '#E5E5EA', true: '#34C759'}}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Icon name="auto-awesome" size={24} color="#007AFF" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Auto Generate SOAP</Text>
              <Text style={styles.settingDescription}>
                Automatically generate SOAP notes after recording
              </Text>
            </View>
          </View>
          <Switch
            value={settings.autoGenerateSOAP}
            onValueChange={() => handleToggle('autoGenerateSOAP')}
            trackColor={{false: '#E5E5EA', true: '#34C759'}}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Icon name="save" size={24} color="#007AFF" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Save Raw Audio</Text>
              <Text style={styles.settingDescription}>
                Keep audio recordings after processing
              </Text>
            </View>
          </View>
          <Switch
            value={settings.saveRawAudio}
            onValueChange={() => handleToggle('saveRawAudio')}
            trackColor={{false: '#E5E5EA', true: '#34C759'}}
          />
        </View>
      </View>

      {/* Epic Integration */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Epic Integration</Text>
          <Switch
            value={settings.epicConfig.enabled}
            onValueChange={(value) => handleEpicConfigChange('enabled', value)}
            trackColor={{false: '#E5E5EA', true: '#34C759'}}
          />
        </View>

        {settings.epicConfig.enabled && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>FHIR Base URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
                value={settings.epicConfig.fhirBaseUrl}
                onChangeText={(value) => handleEpicConfigChange('fhirBaseUrl', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Client ID</Text>
              <TextInput
                style={styles.input}
                placeholder="Your Epic Client ID"
                value={settings.epicConfig.clientId}
                onChangeText={(value) => handleEpicConfigChange('clientId', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>API Key</Text>
              <TextInput
                style={styles.input}
                placeholder="Your Epic API Key"
                value={settings.epicConfig.apiKey}
                onChangeText={(value) => handleEpicConfigChange('apiKey', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleTestConnection}
                disabled={testingConnection}>
                {testingConnection ? (
                  <ActivityIndicator color="#007AFF" />
                ) : (
                  <>
                    <Icon name="check-circle" size={20} color="#007AFF" />
                    <Text style={styles.secondaryButtonText}>Test Connection</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSaveEpicConfig}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="save" size={20} color="#fff" />
                    <Text style={styles.primaryButtonText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Icon name="info" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                To integrate with Epic, you need to register your app at Epic App Orchard
                and obtain FHIR API credentials.
              </Text>
            </View>
          </>
        )}
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>

        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>App Name</Text>
          <Text style={styles.aboutValue}>SOAP Notes Assistant</Text>
        </View>

        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Icon name="delete-forever" size={24} color="#FF3B30" />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  settingDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
    lineHeight: 18,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  aboutLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  aboutValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    marginTop: 16,
  },
  dangerButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SettingsScreen;
