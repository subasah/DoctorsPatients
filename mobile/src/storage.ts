import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VisitDraft } from './types';

const KEY_VISITS = 'ccn_visits_v1';
const KEY_CONSENT = 'ccn_consent_v1';

export async function loadVisits(): Promise<VisitDraft[]> {
  const raw = await AsyncStorage.getItem(KEY_VISITS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as VisitDraft[];
  } catch {
    return [];
  }
}

export async function saveVisit(visit: VisitDraft): Promise<void> {
  const visits = await loadVisits();
  const next = [visit, ...visits.filter((v) => v.id !== visit.id)].slice(0, 25);
  await AsyncStorage.setItem(KEY_VISITS, JSON.stringify(next));
}

export async function getConsent(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(KEY_CONSENT);
  return raw === 'true';
}

export async function setConsent(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEY_CONSENT, value ? 'true' : 'false');
}

