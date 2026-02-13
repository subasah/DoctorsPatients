import { useEffect, useMemo, useState, type ReactNode } from "react";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  buildSoapDocumentReference,
  sendDocumentReferenceToEpic,
} from "./src/services/epicService";
import { generateSoapNote } from "./src/services/soapService";
import { loadEpicConfig, saveEpicConfig } from "./src/services/storageService";
import { transcribeAudioFile } from "./src/services/transcriptionService";
import {
  EMPTY_EPIC_CONFIG,
  EMPTY_SOAP_NOTE,
  type EncounterMetadata,
  type EpicIntegrationConfig,
  type SoapNote,
} from "./src/types/clinical";

const SOAP_SECTIONS: Array<{
  key: keyof SoapNote;
  label: string;
  placeholder: string;
}> = [
  {
    key: "subjective",
    label: "Subjective",
    placeholder: "Patient-reported history, symptoms, and concerns...",
  },
  {
    key: "objective",
    label: "Objective",
    placeholder: "Vitals, exam findings, labs, imaging, observed signs...",
  },
  {
    key: "assessment",
    label: "Assessment",
    placeholder: "Clinical impression / differential diagnosis...",
  },
  {
    key: "plan",
    label: "Plan",
    placeholder: "Orders, medications, follow-up, patient instructions...",
  },
];

export default function App() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [soapNote, setSoapNote] = useState<SoapNote>(EMPTY_SOAP_NOTE);
  const [epicConfig, setEpicConfig] =
    useState<EpicIntegrationConfig>(EMPTY_EPIC_CONFIG);
  const [visitStartAt, setVisitStartAt] = useState(new Date().toISOString());
  const [visitEndAt, setVisitEndAt] = useState(new Date().toISOString());
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);
  const [isSendingToEpic, setIsSendingToEpic] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Ready. Start recording to capture a patient-doctor conversation."
  );
  const [fhirPreview, setFhirPreview] = useState("");
  const [lastEpicResponse, setLastEpicResponse] = useState("");

  const encounterMetadata: EncounterMetadata = useMemo(
    () => ({
      startedAt: visitStartAt,
      endedAt: visitEndAt,
    }),
    [visitStartAt, visitEndAt]
  );

  useEffect(() => {
    let isMounted = true;

    const hydrateConfig = async () => {
      try {
        const savedConfig = await loadEpicConfig();
        if (savedConfig && isMounted) {
          setEpicConfig(savedConfig);
          setStatusMessage("Loaded saved Epic integration credentials.");
        }
      } catch (error) {
        console.warn(error);
      }
    };

    hydrateConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const isBusy =
    isTranscribing || isGeneratingSoap || isSendingToEpic || isSavingConfig;

  async function startRecording(): Promise<void> {
    if (isRecording) {
      return;
    }

    try {
      const permissions = await Audio.requestPermissionsAsync();
      if (permissions.status !== "granted") {
        Alert.alert(
          "Microphone permission needed",
          "Grant microphone access so the app can listen during the visit."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: liveRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      const now = new Date().toISOString();
      setVisitStartAt(now);
      setVisitEndAt(now);
      setRecording(liveRecording);
      setIsRecording(true);
      setAudioUri(null);
      setStatusMessage("Listening to encounter audio...");
    } catch (error) {
      console.error(error);
      Alert.alert("Recording error", errorMessage(error));
      setStatusMessage("Unable to start recording.");
    }
  }

  async function stopRecording(): Promise<string | null> {
    if (!recording) {
      return audioUri;
    }

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      const now = new Date().toISOString();

      setRecording(null);
      setIsRecording(false);
      setVisitEndAt(now);

      if (!uri) {
        setStatusMessage("Recording stopped, but no audio file was produced.");
        return null;
      }

      setAudioUri(uri);
      setStatusMessage("Audio captured. Ready for transcription.");
      return uri;
    } catch (error) {
      console.error(error);
      Alert.alert("Stop recording error", errorMessage(error));
      setStatusMessage("Could not stop recording safely.");
      return null;
    }
  }

  async function transcribeConversation(): Promise<void> {
    const sourceUri = isRecording ? await stopRecording() : audioUri;
    if (!sourceUri) {
      Alert.alert("No recording found", "Record the encounter first.");
      return;
    }

    setIsTranscribing(true);
    setStatusMessage("Transcribing encounter audio...");

    try {
      const generatedTranscript = await transcribeAudioFile(sourceUri);
      setTranscript(generatedTranscript);
      setStatusMessage("Transcript generated. Review and then create SOAP note.");
    } catch (error) {
      console.error(error);
      Alert.alert("Transcription failed", errorMessage(error));
      setStatusMessage("Transcription failed.");
    } finally {
      setIsTranscribing(false);
    }
  }

  async function createSoapDraft(): Promise<void> {
    if (!transcript.trim()) {
      Alert.alert("No transcript", "Create or paste a transcript first.");
      return;
    }

    setIsGeneratingSoap(true);
    setStatusMessage("Generating SOAP draft from transcript...");

    try {
      const generatedNote = await generateSoapNote(transcript);
      setSoapNote(generatedNote);
      setStatusMessage("SOAP draft generated. Clinician review is still required.");
    } catch (error) {
      console.error(error);
      Alert.alert("SOAP generation failed", errorMessage(error));
      setStatusMessage("Could not generate SOAP note.");
    } finally {
      setIsGeneratingSoap(false);
    }
  }

  async function persistEpicConfig(): Promise<void> {
    setIsSavingConfig(true);
    try {
      await saveEpicConfig(epicConfig);
      setStatusMessage("Epic credentials saved to secure storage.");
      Alert.alert("Saved", "Epic integration settings were saved securely.");
    } catch (error) {
      console.error(error);
      Alert.alert("Save failed", errorMessage(error));
      setStatusMessage("Could not save Epic credentials.");
    } finally {
      setIsSavingConfig(false);
    }
  }

  function buildPreviewPayload(): void {
    if (!transcript.trim()) {
      Alert.alert("Missing transcript", "Create transcript before building payload.");
      return;
    }

    const previewConfig = {
      ...epicConfig,
      patientId: epicConfig.patientId || "example-patient-id",
      encounterId: epicConfig.encounterId || "example-encounter-id",
      practitionerId: epicConfig.practitionerId || "example-practitioner-id",
    };

    const payload = buildSoapDocumentReference(
      soapNote,
      transcript,
      previewConfig,
      encounterMetadata
    );
    setFhirPreview(JSON.stringify(payload, null, 2));
    setStatusMessage("FHIR DocumentReference preview refreshed.");
  }

  async function syncWithEpic(): Promise<void> {
    const missingFields = validateEpicConfig(epicConfig);
    if (missingFields.length > 0) {
      Alert.alert(
        "Missing Epic fields",
        `Provide these fields before sync: ${missingFields.join(", ")}`
      );
      return;
    }

    if (!transcript.trim()) {
      Alert.alert("Missing transcript", "Generate transcript before Epic sync.");
      return;
    }

    setIsSendingToEpic(true);
    setStatusMessage("Sending SOAP note to Epic FHIR endpoint...");

    try {
      const payload = buildSoapDocumentReference(
        soapNote,
        transcript,
        epicConfig,
        encounterMetadata
      );
      setFhirPreview(JSON.stringify(payload, null, 2));

      const response = await sendDocumentReferenceToEpic(payload, epicConfig);
      setLastEpicResponse(JSON.stringify(response, null, 2));
      setStatusMessage("SOAP note synced to Epic.");
      Alert.alert("Sync complete", "DocumentReference was sent to Epic.");
    } catch (error) {
      console.error(error);
      Alert.alert("Epic sync failed", errorMessage(error));
      setStatusMessage("Epic sync failed.");
    } finally {
      setIsSendingToEpic(false);
    }
  }

  function updateSoapSection(key: keyof SoapNote, value: string): void {
    setSoapNote((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateEpicConfigField(
    key: keyof EpicIntegrationConfig,
    value: string
  ): void {
    setEpicConfig((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <View style={styles.page}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Epic SOAP Scribe</Text>
        <Text style={styles.subtitle}>
          Ambient AI assistant for patient-doctor visits. Capture the conversation,
          generate a SOAP draft, review it, and send an Epic-compatible FHIR
          DocumentReference.
        </Text>

        <Card title="1) Capture encounter audio">
          <Text style={styles.metaText}>Visit start: {prettyTime(visitStartAt)}</Text>
          <Text style={styles.metaText}>Visit end: {prettyTime(visitEndAt)}</Text>

          <View style={styles.buttonRow}>
            <PrimaryButton
              label={isRecording ? "Listening..." : "Start Listening"}
              onPress={startRecording}
              disabled={isRecording || isBusy}
            />
            <SecondaryButton
              label="Stop + Transcribe"
              onPress={transcribeConversation}
              disabled={(!isRecording && !audioUri) || isBusy}
            />
          </View>

          {isTranscribing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Converting speech to text...</Text>
            </View>
          ) : null}
        </Card>

        <Card title="2) Transcript">
          <TextInput
            multiline
            value={transcript}
            onChangeText={setTranscript}
            placeholder="Transcript will appear here..."
            style={styles.largeInput}
            textAlignVertical="top"
          />
          <PrimaryButton
            label={isGeneratingSoap ? "Generating SOAP..." : "Generate SOAP Draft"}
            onPress={createSoapDraft}
            disabled={isBusy || !transcript.trim()}
          />
        </Card>

        <Card title="3) SOAP note (clinician editable)">
          {SOAP_SECTIONS.map((section) => (
            <View key={section.key} style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              <TextInput
                multiline
                value={soapNote[section.key]}
                onChangeText={(value) => updateSoapSection(section.key, value)}
                placeholder={section.placeholder}
                style={styles.mediumInput}
                textAlignVertical="top"
              />
            </View>
          ))}
        </Card>

        <Card title="4) Epic integration settings">
          <LabeledInput
            label="FHIR Base URL"
            value={epicConfig.baseUrl}
            placeholder="https://your-epic-fhir-base-url"
            onChangeText={(value) => updateEpicConfigField("baseUrl", value)}
          />
          <LabeledInput
            label="OAuth Access Token"
            value={epicConfig.accessToken}
            placeholder="Bearer access token"
            secureTextEntry
            onChangeText={(value) => updateEpicConfigField("accessToken", value)}
          />
          <LabeledInput
            label="Patient ID"
            value={epicConfig.patientId}
            placeholder="Epic patient resource id"
            onChangeText={(value) => updateEpicConfigField("patientId", value)}
          />
          <LabeledInput
            label="Encounter ID"
            value={epicConfig.encounterId}
            placeholder="Epic encounter resource id"
            onChangeText={(value) => updateEpicConfigField("encounterId", value)}
          />
          <LabeledInput
            label="Practitioner ID"
            value={epicConfig.practitionerId}
            placeholder="Epic practitioner resource id"
            onChangeText={(value) => updateEpicConfigField("practitionerId", value)}
          />

          <View style={styles.buttonColumn}>
            <SecondaryButton
              label={isSavingConfig ? "Saving..." : "Save Credentials Securely"}
              onPress={persistEpicConfig}
              disabled={isBusy}
            />
            <SecondaryButton
              label="Build FHIR Preview"
              onPress={buildPreviewPayload}
              disabled={isBusy || !transcript.trim()}
            />
            <PrimaryButton
              label={isSendingToEpic ? "Syncing to Epic..." : "Send to Epic"}
              onPress={syncWithEpic}
              disabled={isBusy || !transcript.trim()}
            />
          </View>
        </Card>

        <Card title="FHIR DocumentReference preview">
          <TextInput
            multiline
            value={fhirPreview}
            editable={false}
            placeholder="Build preview to inspect the FHIR payload..."
            style={styles.codeInput}
            textAlignVertical="top"
          />
        </Card>

        <Card title="Last Epic API response">
          <TextInput
            multiline
            value={lastEpicResponse}
            editable={false}
            placeholder="Response body will appear after Epic sync..."
            style={styles.codeInput}
            textAlignVertical="top"
          />
        </Card>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

type CardProps = {
  title: string;
  children: ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

type LabeledInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
};

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
}: LabeledInputProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={styles.textInput}
        autoCapitalize="none"
      />
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
};

function PrimaryButton({ label, onPress, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        styles.primaryButton,
        (disabled || pressed) && styles.buttonDisabled,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        styles.secondaryButton,
        (disabled || pressed) && styles.buttonDisabled,
      ]}
    >
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error occurred.";
}

function prettyTime(isoTime: string): string {
  const time = new Date(isoTime);
  if (Number.isNaN(time.getTime())) {
    return "-";
  }

  return time.toLocaleString();
}

function validateEpicConfig(config: EpicIntegrationConfig): string[] {
  const missing: string[] = [];
  if (!config.baseUrl.trim()) {
    missing.push("FHIR Base URL");
  }
  if (!config.accessToken.trim()) {
    missing.push("OAuth Access Token");
  }
  if (!config.patientId.trim()) {
    missing.push("Patient ID");
  }
  if (!config.encounterId.trim()) {
    missing.push("Encounter ID");
  }
  if (!config.practitionerId.trim()) {
    missing.push("Practitioner ID");
  }
  return missing;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f3f5f8",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4b5563",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  metaText: {
    fontSize: 13,
    color: "#374151",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  buttonColumn: {
    gap: 10,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#075985",
  },
  secondaryButton: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#1e3a8a",
    fontWeight: "600",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#374151",
    fontSize: 13,
  },
  largeInput: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  mediumInput: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  textInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  codeInput: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#f9fafb",
    color: "#111827",
    fontFamily: "monospace",
  },
  sectionBlock: {
    gap: 7,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  fieldBlock: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
  },
  statusCard: {
    backgroundColor: "#ecfeff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#a5f3fc",
    gap: 4,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#155e75",
  },
  statusText: {
    fontSize: 13,
    color: "#164e63",
    lineHeight: 19,
  },
});
