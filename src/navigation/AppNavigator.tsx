import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Import des écrans
import {
  HomeScreen,
  ScannerScreen,
  HistoryScreen,
  ProfileScreen,
  LoginScreen
} from '../screens';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ea',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Accueil' }}
        />
        <Stack.Screen 
          name="Scanner" 
          component={ScannerScreen}
          options={{ title: 'Scanner QR Code' }}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen}
          options={{ title: 'Historique' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profil' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;