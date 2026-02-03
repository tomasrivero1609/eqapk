import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleLandingScreen from '../screens/home/RoleLandingScreen';
import DemonstrationsScreen from '../screens/home/DemonstrationsScreen';

const Stack = createNativeStackNavigator();
const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0B1120',
    card: '#0F172A',
    text: '#E2E8F0',
    primary: '#8B5CF6',
    border: '#1E293B',
  },
};

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={AppDarkTheme}>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="RoleLanding" component={RoleLandingScreen} />
          <Stack.Screen name="Demonstrations" component={DemonstrationsScreen} />
          <Stack.Screen name="MainTabs" component={MainNavigator} />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
