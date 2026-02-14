import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppProvider } from './src/contexts/AppContext';

// Screens
import SessionsListScreen from './src/screens/SessionsListScreen';
import TemplateSelectionScreen from './src/screens/TemplateSelectionScreen';
import PatientDetailsScreen from './src/screens/PatientDetailsScreen';
import RecordingScreen from './src/screens/RecordingScreen';
import SessionDetailScreen from './src/screens/SessionDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="SessionsList"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
          }}
        >
          <Stack.Screen name="SessionsList" component={SessionsListScreen} />
          <Stack.Screen name="TemplateSelection" component={TemplateSelectionScreen} />
          <Stack.Screen name="PatientDetails" component={PatientDetailsScreen} />
          <Stack.Screen name="Recording" component={RecordingScreen} />
          <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
