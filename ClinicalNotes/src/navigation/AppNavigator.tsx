// ============================================================
// Clinical Conversation Notes - Navigation Configuration
// ============================================================

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shadows } from '../theme';
import { RootStackParamList, MainTabParamList } from '../types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import NotesListScreen from '../screens/NotesListScreen';
import RecordingScreen from '../screens/RecordingScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import EpicSyncScreen from '../screens/EpicSyncScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 8,
          ...Shadows.medium,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notes"
        component={NotesListScreen}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="description" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NewRecording"
        component={View}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View style={styles.recordTabIcon}>
              <MaterialIcons name="mic" size={28} color={Colors.white} />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e: any) => {
            e.preventDefault();
            (navigation as any).navigate('Recording', {});
          },
        })}
      />
      <Tab.Screen
        name="EpicSync"
        component={EpicSyncScreen}
        options={{
          tabBarLabel: 'Epic',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="cloud-sync" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreenWrapper}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Wrapper to use Settings as a tab
function SettingsScreenWrapper() {
  return <SettingsScreen />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Recording"
          component={RecordingScreen}
          options={{
            animation: 'slide_from_bottom',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  recordTabIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.recordingRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 24,
    ...Shadows.large,
  },
});
