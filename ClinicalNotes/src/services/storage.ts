// ============================================================
// Clinical Conversation Notes - Local Storage Service
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOAPNote, AppSettings } from '../types';

const NOTES_KEY = '@clinical_notes';
const SETTINGS_KEY = '@app_settings';

// ─── Notes CRUD ──────────────────────────────────────────────

export async function getAllNotes(): Promise<SOAPNote[]> {
  try {
    const data = await AsyncStorage.getItem(NOTES_KEY);
    if (!data) return [];
    const notes: SOAPNote[] = JSON.parse(data);
    return notes.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
}

export async function getNoteById(id: string): Promise<SOAPNote | null> {
  try {
    const notes = await getAllNotes();
    return notes.find((n) => n.id === id) || null;
  } catch (error) {
    console.error('Error getting note:', error);
    return null;
  }
}

export async function saveNote(note: SOAPNote): Promise<void> {
  try {
    const notes = await getAllNotes();
    const existingIndex = notes.findIndex((n) => n.id === note.id);

    if (existingIndex >= 0) {
      notes[existingIndex] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      notes.push(note);
    }

    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving note:', error);
    throw new Error('Failed to save note');
  }
}

export async function deleteNote(id: string): Promise<void> {
  try {
    const notes = await getAllNotes();
    const filtered = notes.filter((n) => n.id !== id);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('Failed to delete note');
  }
}

export async function deleteAllNotes(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTES_KEY);
  } catch (error) {
    console.error('Error deleting all notes:', error);
    throw new Error('Failed to delete all notes');
  }
}

// ─── Settings ────────────────────────────────────────────────

export const DEFAULT_SETTINGS: AppSettings = {
  openAiApiKey: '',
  speechToTextProvider: 'whisper',
  epicFhirBaseUrl: '',
  epicClientId: '',
  epicClientSecret: '',
  epicRedirectUri: '',
  autoGenerateSOAP: true,
  darkMode: false,
  hapticFeedback: true,
  defaultSpecialty: 'General Medicine',
  practitionerName: '',
  practitionerNPI: '',
  practitionerSpecialty: 'General Medicine',
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw new Error('Failed to save settings');
  }
}
