import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, Patient } from '../types';

interface AppContextType {
  sessions: Session[];
  patients: Patient[];
  addSession: (session: Session) => Promise<void>;
  updateSession: (id: string, updates: Partial<Session>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  addPatient: (patient: Patient) => Promise<void>;
  getPatient: (id: string) => Patient | undefined;
  searchSessions: (query: string) => Session[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SESSIONS_KEY = '@medical_transcription_sessions';
const PATIENTS_KEY = '@medical_transcription_patients';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsData, patientsData] = await Promise.all([
        AsyncStorage.getItem(SESSIONS_KEY),
        AsyncStorage.getItem(PATIENTS_KEY)
      ]);

      if (sessionsData) {
        const parsedSessions = JSON.parse(sessionsData);
        // Convert timestamp strings back to Date objects
        const sessions = parsedSessions.map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp)
        }));
        setSessions(sessions);
      }

      if (patientsData) {
        setPatients(JSON.parse(patientsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (newSessions: Session[], newPatients: Patient[]) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions)),
        AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(newPatients))
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addSession = async (session: Session) => {
    const newSessions = [...sessions, session];
    setSessions(newSessions);
    await saveData(newSessions, patients);
  };

  const updateSession = async (id: string, updates: Partial<Session>) => {
    const newSessions = sessions.map(session =>
      session.id === id ? { ...session, ...updates } : session
    );
    setSessions(newSessions);
    await saveData(newSessions, patients);
  };

  const deleteSession = async (id: string) => {
    const newSessions = sessions.filter(session => session.id !== id);
    setSessions(newSessions);
    await saveData(newSessions, patients);
  };

  const addPatient = async (patient: Patient) => {
    const newPatients = [...patients, patient];
    setPatients(newPatients);
    await saveData(sessions, newPatients);
  };

  const getPatient = (id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  };

  const searchSessions = (query: string): Session[] => {
    if (!query.trim()) return sessions;
    
    const lowerQuery = query.toLowerCase();
    return sessions.filter(session => {
      const titleMatch = session.title.toLowerCase().includes(lowerQuery);
      const patientMatch = session.patient?.name.toLowerCase().includes(lowerQuery);
      const transcriptionMatch = session.transcription.toLowerCase().includes(lowerQuery);
      return titleMatch || patientMatch || transcriptionMatch;
    });
  };

  return (
    <AppContext.Provider
      value={{
        sessions,
        patients,
        addSession,
        updateSession,
        deleteSession,
        addPatient,
        getPatient,
        searchSessions
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
