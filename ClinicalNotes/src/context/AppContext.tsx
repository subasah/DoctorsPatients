// ============================================================
// Clinical Conversation Notes - App Context & State Management
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { SOAPNote, AppSettings } from '../types';
import {
  getAllNotes,
  saveNote,
  deleteNote as deleteNoteFromStorage,
  getSettings,
  saveSettings as saveSettingsToStorage,
  DEFAULT_SETTINGS,
} from '../services/storage';

// ─── State Types ─────────────────────────────────────────────

interface AppState {
  notes: SOAPNote[];
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTES'; payload: SOAPNote[] }
  | { type: 'ADD_NOTE'; payload: SOAPNote }
  | { type: 'UPDATE_NOTE'; payload: SOAPNote }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_SETTINGS'; payload: AppSettings };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshNotes: () => Promise<void>;
  addNote: (note: SOAPNote) => Promise<void>;
  updateNote: (note: SOAPNote) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

// ─── Initial State ───────────────────────────────────────────

const initialState: AppState = {
  notes: [],
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  error: null,
};

// ─── Reducer ─────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload, isLoading: false };
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [action.payload, ...state.notes],
      };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload),
      };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const [notes, settings] = await Promise.all([getAllNotes(), getSettings()]);
      dispatch({ type: 'SET_NOTES', payload: notes });
      dispatch({ type: 'SET_SETTINGS', payload: settings });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function refreshNotes() {
    try {
      const notes = await getAllNotes();
      dispatch({ type: 'SET_NOTES', payload: notes });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh notes' });
    }
  }

  async function addNote(note: SOAPNote) {
    try {
      await saveNote(note);
      dispatch({ type: 'ADD_NOTE', payload: note });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save note' });
      throw error;
    }
  }

  async function updateNote(note: SOAPNote) {
    try {
      await saveNote(note);
      dispatch({ type: 'UPDATE_NOTE', payload: note });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update note' });
      throw error;
    }
  }

  async function removeNote(id: string) {
    try {
      await deleteNoteFromStorage(id);
      dispatch({ type: 'DELETE_NOTE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete note' });
      throw error;
    }
  }

  async function updateSettings(newSettings: Partial<AppSettings>) {
    try {
      await saveSettingsToStorage(newSettings);
      const updated = await getSettings();
      dispatch({ type: 'SET_SETTINGS', payload: updated });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save settings' });
      throw error;
    }
  }

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        refreshNotes,
        addNote,
        updateNote,
        removeNote,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
