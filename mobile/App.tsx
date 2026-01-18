import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useAuthStore } from './src/store/authStore';
import AppNavigator from './src/navigation/AppNavigator';
import './global.css';

const queryClient = new QueryClient();

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handler = (error: any, isFatal?: boolean) => {
      const message = error?.message || String(error);
      Alert.alert(
        'Error inesperado',
        `${message}${isFatal ? '\n\n(La app se cerro por un error fatal)' : ''}`,
      );
      // eslint-disable-next-line no-console
      console.error(error);
    };

    const errorUtils = (global as any).ErrorUtils;
    if (errorUtils?.setGlobalHandler) {
      errorUtils.setGlobalHandler(handler);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
}
