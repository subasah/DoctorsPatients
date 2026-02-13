import { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generateSoap } from '../api';
import type { SoapNote, VisitDraft } from '../types';
import type { RootStackParamList } from '../navigation';
import { saveVisit } from '../storage';
import { ui } from '../ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Note'>;

export function NoteScreen({ route, navigation }: Props) {
  const initialVisit = route.params.visit;
  const [visit, setVisit] = useState<VisitDraft>(initialVisit);
  const [saving, setSaving] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);

  const soap = useMemo<SoapNote>(
    () =>
      visit.soap ?? {
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        redFlags: [],
        needsReview: true
      },
    [visit.soap]
  );

  async function updateSoap(partial: Partial<SoapNote>) {
    const next: VisitDraft = {
      ...visit,
      soap: { ...soap, ...partial }
    };
    setVisit(next);
    try {
      setSaving(true);
      await saveVisit(next);
    } finally {
      setSaving(false);
    }
  }

  async function updateTranscript(nextTranscript: string) {
    const next: VisitDraft = { ...visit, transcript: nextTranscript };
    setVisit(next);
    try {
      setSaving(true);
      await saveVisit(next);
    } finally {
      setSaving(false);
    }
  }

  async function regenerateFromTranscript() {
    if (!visit.transcript?.trim()) {
      Alert.alert('No transcript available.');
      return;
    }
    setRegenBusy(true);
    try {
      const res = await generateSoap({ transcript: visit.transcript });
      const next: VisitDraft = { ...visit, soap: res.soap };
      setVisit(next);
      await saveVisit(next);
    } catch (e: any) {
      Alert.alert('Regeneration failed', e?.message ?? String(e));
    } finally {
      setRegenBusy(false);
    }
  }

  async function goExport() {
    if (!visit.soap) {
      Alert.alert('No SOAP note found.');
      return;
    }
    navigation.navigate('Export', { visit });
  }

  return (
    <ScrollView style={ui.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={ui.card}>
        <Text style={ui.h1}>Draft SOAP note</Text>
        <Text style={ui.subtle}>
          Draft created at {new Date(visit.createdAt).toLocaleString()}. Always review and edit.
        </Text>
        {!!visit.transcript && (
          <Text style={[ui.subtle, { marginTop: 8 }]}>
            Transcript length: {visit.transcript.length.toLocaleString()} chars
          </Text>
        )}
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>Transcript</Text>
        <Text style={ui.subtle}>
          You can edit the transcript and regenerate the SOAP note if needed.
        </Text>
        <TextInput
          value={visit.transcript ?? ''}
          onChangeText={updateTranscript}
          placeholder="Transcript will appear here after transcription…"
          placeholderTextColor="rgba(255,255,255,0.35)"
          multiline
          style={[ui.input, { minHeight: 160, textAlignVertical: 'top' }]}
        />
        <TouchableOpacity
          onPress={regenerateFromTranscript}
          disabled={regenBusy || !visit.transcript?.trim()}
          style={[
            ui.button,
            ui.buttonSecondary,
            (regenBusy || !visit.transcript?.trim()) && { opacity: 0.5 }
          ]}
        >
          <Text style={ui.buttonText}>{regenBusy ? 'Regenerating…' : 'Regenerate SOAP'}</Text>
        </TouchableOpacity>
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>Subjective</Text>
        <TextInput
          value={soap.subjective}
          onChangeText={(v) => updateSoap({ subjective: v })}
          multiline
          style={[ui.input, { minHeight: 120, textAlignVertical: 'top' }]}
        />
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>Objective</Text>
        <TextInput
          value={soap.objective}
          onChangeText={(v) => updateSoap({ objective: v })}
          multiline
          style={[ui.input, { minHeight: 120, textAlignVertical: 'top' }]}
        />
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>Assessment</Text>
        <TextInput
          value={soap.assessment}
          onChangeText={(v) => updateSoap({ assessment: v })}
          multiline
          style={[ui.input, { minHeight: 120, textAlignVertical: 'top' }]}
        />
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>Plan</Text>
        <TextInput
          value={soap.plan}
          onChangeText={(v) => updateSoap({ plan: v })}
          multiline
          style={[ui.input, { minHeight: 120, textAlignVertical: 'top' }]}
        />
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>Patient-friendly summary (optional)</Text>
        <TextInput
          value={soap.patientSummary ?? ''}
          onChangeText={(v) => updateSoap({ patientSummary: v })}
          multiline
          style={[ui.input, { minHeight: 90, textAlignVertical: 'top' }]}
        />
        <Text style={[ui.subtle, { marginTop: 8 }]}>
          {saving ? 'Saving…' : 'Saved locally.'}
        </Text>

        <TouchableOpacity onPress={goExport} style={[ui.button, { marginTop: 12 }]}>
          <Text style={ui.buttonText}>Export (FHIR / Epic-ready)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Record')}
          style={[ui.button, ui.buttonSecondary, { marginTop: 10 }]}
        >
          <Text style={ui.buttonText}>New recording</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

