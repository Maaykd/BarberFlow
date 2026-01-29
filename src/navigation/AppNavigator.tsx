import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: { slug: string; name: string };
  Dashboard: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  // Por enquanto: fluxo simples fixo (Onboarding -> Login -> Dashboard).
  // Depois a gente troca isso por um AuthProvider e decide automaticamente.
  const [hasSeenOnboarding] = useState(false);
  const [isLoggedIn] = useState(false);

  const initialRouteName: keyof RootStackParamList = !hasSeenOnboarding
    ? 'Onboarding'
    : !isLoggedIn
      ? 'Login'
      : 'Dashboard';

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Entrar' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'SlotCut' }}
      />
    </Stack.Navigator>
  );
}
