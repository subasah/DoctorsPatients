import AsyncStorage from '@react-native-async-storage/async-storage';
import {SOAPNote, AppSettings} from '../types';

const STORAGE_KEYS = {
  SOAP_NOTES: '@soap_notes',
  APP_SETTINGS: '@app_settings',
};

class StorageService {
  async saveSOAPNote(note: SOAPNote): Promise<void> {
    try {
      const notes = await this.getAllSOAPNotes();
      notes.push(note);
      await AsyncStorage.setItem(STORAGE_KEYS.SOAP_NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving SOAP note:', error);
      throw error;
    }
  }

  async getAllSOAPNotes(): Promise<SOAPNote[]> {
    try {
      const notesJson = await AsyncStorage.getItem(STORAGE_KEYS.SOAP_NOTES);
      if (!notesJson) {
        return [];
      }
      
      const notes = JSON.parse(notesJson);
      // Convert date strings back to Date objects
      return notes.map((note: any) => ({
        ...note,
        date: new Date(note.date),
      }));
    } catch (error) {
      console.error('Error retrieving SOAP notes:', error);
      return [];
    }
  }

  async getSOAPNoteById(id: string): Promise<SOAPNote | null> {
    try {
      const notes = await this.getAllSOAPNotes();
      return notes.find(note => note.id === id) || null;
    } catch (error) {
      console.error('Error retrieving SOAP note by ID:', error);
      return null;
    }
  }

  async updateSOAPNote(updatedNote: SOAPNote): Promise<void> {
    try {
      const notes = await this.getAllSOAPNotes();
      const index = notes.findIndex(note => note.id === updatedNote.id);
      
      if (index !== -1) {
        notes[index] = updatedNote;
        await AsyncStorage.setItem(STORAGE_KEYS.SOAP_NOTES, JSON.stringify(notes));
      } else {
        throw new Error('SOAP note not found');
      }
    } catch (error) {
      console.error('Error updating SOAP note:', error);
      throw error;
    }
  }

  async deleteSOAPNote(id: string): Promise<void> {
    try {
      const notes = await this.getAllSOAPNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.SOAP_NOTES, JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Error deleting SOAP note:', error);
      throw error;
    }
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      
      if (!settingsJson) {
        // Return default settings
        return this.getDefaultSettings();
      }
      
      return JSON.parse(settingsJson);
    } catch (error) {
      console.error('Error retrieving settings:', error);
      return this.getDefaultSettings();
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  private getDefaultSettings(): AppSettings {
    return {
      autoTranscribe: true,
      autoGenerateSOAP: true,
      saveRawAudio: false,
      language: 'en-US',
      epicConfig: {
        fhirBaseUrl: '',
        clientId: '',
        apiKey: '',
        enabled: false,
      },
    };
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SOAP_NOTES,
        STORAGE_KEYS.APP_SETTINGS,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

export default new StorageService();
