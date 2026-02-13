import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { generateFhirComposition } from '../api';
import type { VisitDraft } from '../types';
import type { RootStackParamList } from '../navigation';
import { ui } from '../ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Export'>;

export function ExportScreen({ route, navigation }: Props) {
  const visit = route.params.visit;
  const [patientRef, setPatientRef] = useState('Patient/EXAMPLE');
  const [encounterRef, setEncounterRef] = useState('Encounter/EXAMPLE');
  const [authorRef, setAuthorRef] = useState('Practitioner/EXAMPLE');
  const [busy, setBusy] = useState(false);
  const [fhirJson, setFhirJson] = useState('');

  async function buildFhir() {
    if (!visit.soap) {
      Alert.alert('No SOAP note to export.');
      return;
    }
    setBusy(true);
    try {
      const res = await generateFhirComposition({
        soap: visit.soap,
        patient: patientRef ? { reference: patientRef } : undefined,
        encounter: encounterRef ? { reference: encounterRef } : undefined,
        author: authorRef ? { reference: authorRef } : undefined,
        title: 'Clinical Note (SOAP)'
      });
      setFhirJson(JSON.stringify(res.composition, null, 2));
    } catch (e: any) {
      Alert.alert('FHIR export failed', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!fhirJson) return;
    await Clipboard.setStringAsync(fhirJson);
    Alert.alert('Copied to clipboard.');
  }

  return (
    <ScrollView style={ui.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={ui.card}>
        <Text style={ui.h1}>Export for Epic</Text>
        <Text style={ui.p}>
          Epic integrations should post to a FHIR server using SMART on FHIR (OAuth). This app
          generates a FHIR `Composition` payload; the actual write should happen via your backend.
        </Text>
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>FHIR references (example)</Text>
        <Text style={ui.subtle}>Patient reference</Text>
        <TextInput value={patientRef} onChangeText={setPatientRef} style={ui.input} />
        <Text style={[ui.subtle, { marginTop: 8 }]}>Encounter reference</Text>
        <TextInput value={encounterRef} onChangeText={setEncounterRef} style={ui.input} />
        <Text style={[ui.subtle, { marginTop: 8 }]}>Author reference</Text>
        <TextInput value={authorRef} onChangeText={setAuthorRef} style={ui.input} />

        <TouchableOpacity
          disabled={busy}
          onPress={buildFhir}
          style={[ui.button, busy && { opacity: 0.6 }]}
        >
          <Text style={ui.buttonText}>{busy ? 'Building…' : 'Generate FHIR Composition JSON'}</Text>
        </TouchableOpacity>
      </View>

      <View style={ui.card}>
        <Text style={ui.h2}>FHIR JSON</Text>
        <TextInput
          value={fhirJson}
          editable={false}
          multiline
          style={[ui.input, { minHeight: 260, textAlignVertical: 'top' }]}
        />
        <TouchableOpacity
          disabled={!fhirJson}
          onPress={copy}
          style={[ui.button, ui.buttonSecondary, !fhirJson && { opacity: 0.5 }]}
        >
          <Text style={ui.buttonText}>Copy JSON</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Note', { visit })}
          style={[ui.button, ui.buttonSecondary, { marginTop: 10 }]}
        >
          <Text style={ui.buttonText}>Back to note</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

