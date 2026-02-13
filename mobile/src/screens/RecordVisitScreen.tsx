import { Audio } from 'expo-av';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getApiBaseUrl, generateSoap, transcribeAudio } from '../api';
import type { VisitDraft } from '../types';
import type { RootStackParamList } from '../navigation';
import { getConsent, saveVisit, setConsent } from '../storage';
import { ui } from '../ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Record'>;

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function RecordVisitScreen({ navigation }: Props) {
  const [consent, setConsentState] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [clinicianName, setClinicianName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [visitReason, setVisitReason] = useState('');

  const [busy, setBusy] = useState(false);

  const canStart = consent && !isRecording && !busy;
  const canStop = consent && isRecording && !busy;
  const canDraft = consent && !!audioUri && !isRecording && !busy;

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    getConsent().then(setConsentState).catch(() => {});
  }, []);

  async function handleToggleConsent(v: boolean) {
    setConsentState(v);
    await setConsent(v);
  }

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone permission is required to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setAudioUri(undefined);
      setIsRecording(true);
    } catch (e: any) {
      Alert.alert('Failed to start recording', e?.message ?? String(e));
    }
  }

  async function stopRecording() {
    try {
      const recording = recordingRef.current;
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI() ?? undefined;
      recordingRef.current = null;
      setIsRecording(false);
      setAudioUri(uri);
      if (!uri) Alert.alert('Recording stopped, but no audio file was produced.');
    } catch (e: any) {
      Alert.alert('Failed to stop recording', e?.message ?? String(e));
    }
  }

  async function transcribeAndDraft() {
    if (!audioUri) return;
    setBusy(true);
    try {
      const visit: VisitDraft = {
        id: makeId(),
        createdAt: new Date().toISOString(),
        audioUri
      };

      await saveVisit(visit);

      const t = await transcribeAudio({ audioUri });
      visit.transcript = t.transcript;
      await saveVisit(visit);

      const s = await generateSoap({
        transcript: t.transcript,
        context: {
          clinicianName: clinicianName || undefined,
          patientName: patientName || undefined,
          visitReason: visitReason || undefined
        }
      });
      visit.soap = s.soap;
      await saveVisit(visit);

      navigation.navigate('Note', { visit });
    } catch (e: any) {
      Alert.alert('Draft failed', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={ui.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={ui.card}>
        <Text style={ui.h1}>SOAP Scribe</Text>
        <Text style={ui.p}>
          Record the clinician–patient conversation, generate a draft SOAP note, then export a
          FHIR-ready payload for Epic integration (via your backend).
        </Text>
        <Text style={[ui.subtle, { marginTop: 8 }]}>
          API base: {apiBase} (set with EXPO_PUBLIC_API_BASE_URL)
        </Text>
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>Consent</Text>
        <Text style={ui.subtle}>
          You must obtain patient consent before recording. This app stores drafts locally and
          sends audio/transcripts to your configured API.
        </Text>
        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Switch value={consent} onValueChange={handleToggleConsent} />
          <Text style={ui.p}>I have patient consent to record this visit</Text>
        </View>
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>Visit context (optional)</Text>
        <View style={ui.row}>
          <View style={ui.rowItem}>
            <Text style={ui.subtle}>Clinician</Text>
            <TextInput
              value={clinicianName}
              onChangeText={setClinicianName}
              placeholder="Dr. Smith"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={ui.input}
            />
          </View>
          <View style={ui.rowItem}>
            <Text style={ui.subtle}>Patient</Text>
            <TextInput
              value={patientName}
              onChangeText={setPatientName}
              placeholder="Jane Doe"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={ui.input}
            />
          </View>
        </View>
        <Text style={[ui.subtle, { marginTop: 8 }]}>Reason for visit</Text>
        <TextInput
          value={visitReason}
          onChangeText={setVisitReason}
          placeholder="e.g., Follow-up for hypertension"
          placeholderTextColor="rgba(255,255,255,0.35)"
          style={ui.input}
        />
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>Recorder</Text>
        <Text style={ui.subtle}>
          Tip: keep the phone close to the conversation. You can stop anytime.
        </Text>

        {!isRecording ? (
          <TouchableOpacity
            disabled={!canStart}
            onPress={startRecording}
            style={[ui.button, !canStart && { opacity: 0.5 }]}
          >
            <Text style={ui.buttonText}>{busy ? 'Working…' : 'Start recording'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={!canStop}
            onPress={stopRecording}
            style={[ui.button, ui.buttonDanger, !canStop && { opacity: 0.5 }]}
          >
            <Text style={ui.buttonText}>Stop recording</Text>
          </TouchableOpacity>
        )}

        <Text style={[ui.subtle, { marginTop: 10 }]}>
          {audioUri ? `Audio captured: ${audioUri}` : 'No audio captured yet.'}
        </Text>

        <TouchableOpacity
          disabled={!canDraft}
          onPress={transcribeAndDraft}
          style={[
            ui.button,
            ui.buttonSecondary,
            !canDraft && { opacity: 0.5 },
            { marginTop: 12 }
          ]}
        >
          <Text style={ui.buttonText}>{busy ? 'Generating…' : 'Transcribe & draft SOAP'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

