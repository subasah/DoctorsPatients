import React, { createContext, useContext, useState, useCallback } from 'react';
import { SOAPNote } from '../types';

interface AppConfig {
  openaiApiKey: string;
  useMockServices: boolean;
  epicFhirUrl: string;
}

interface AppContextType {
  notes: SOAPNote[];
  addNote: (note: SOAPNote) => void;
  config: AppConfig;
  updateConfig: (config: Partial<AppConfig>) => void;
}

const defaultConfig: AppConfig = {
  openaiApiKey: '',
  useMockServices: true,
  epicFhirUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<SOAPNote[]>([]);
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  const addNote = useCallback((note: SOAPNote) => {
    setNotes(prev => [note, ...prev]);
  }, []);

  const updateConfig = useCallback((updates: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <AppContext.Provider value={{ notes, addNote, config, updateConfig }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
