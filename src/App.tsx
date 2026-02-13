import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import RecordingScreen from './screens/RecordingScreen';
import NotesHistoryScreen from './screens/NotesHistoryScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            headerStyle: {
              backgroundColor: '#fff',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E5EA',
            },
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 17,
            },
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor: '#E5E5EA',
              borderTopWidth: 1,
            },
          }}>
          <Tab.Screen
            name="Record"
            component={RecordingScreen}
            options={{
              title: 'Record Session',
              tabBarIcon: ({color, size}) => (
                <Icon name="mic" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={NotesHistoryScreen}
            options={{
              title: 'SOAP Notes',
              tabBarIcon: ({color, size}) => (
                <Icon name="description" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
              tabBarIcon: ({color, size}) => (
                <Icon name="settings" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
