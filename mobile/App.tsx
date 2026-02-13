import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RecordVisitScreen } from './src/screens/RecordVisitScreen';
import { NoteScreen } from './src/screens/NoteScreen';
import { ExportScreen } from './src/screens/ExportScreen';
import type { RootStackParamList } from './src/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Record"
        screenOptions={{
          headerStyle: { backgroundColor: '#0b1220' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#0b1220' }
        }}
      >
        <Stack.Screen
          name="Record"
          component={RecordVisitScreen}
          options={{ title: 'Record' }}
        />
        <Stack.Screen name="Note" component={NoteScreen} options={{ title: 'SOAP Note' }} />
        <Stack.Screen
          name="Export"
          component={ExportScreen}
          options={{ title: 'Export' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
