import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { isColdStart } from '../../services/api';

type NetworkErrorProps = {
  error: unknown;
  onRetry: () => void;
  isRetrying?: boolean;
};

export default function NetworkError({ error, onRetry, isRetrying }: NetworkErrorProps) {
  const coldStart = isColdStart(error);

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="h-16 w-16 rounded-full bg-slate-800 items-center justify-center mb-4">
        <Ionicons
          name={coldStart ? 'cloud-offline-outline' : 'wifi-outline'}
          size={32}
          color={coldStart ? '#f59e0b' : '#ef4444'}
        />
      </View>
      <Text className="text-lg font-semibold text-slate-200 text-center">
        {coldStart ? 'Servidor iniciando…' : 'Sin conexión'}
      </Text>
      <Text className="mt-2 text-center text-sm text-slate-400">
        {coldStart
          ? 'El servidor está despertando. Suele tardar hasta 30 segundos la primera vez.'
          : 'No se pudo conectar al servidor. Verificá tu red e intentá de nuevo.'}
      </Text>
      <TouchableOpacity
        className="mt-6 flex-row items-center gap-2 rounded-xl bg-violet-600 px-6 py-3"
        onPress={onRetry}
        disabled={isRetrying}
        activeOpacity={0.8}
      >
        {isRetrying ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="refresh-outline" size={18} color="#fff" />
        )}
        <Text className="font-semibold text-white">
          {isRetrying ? 'Reintentando…' : 'Reintentar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
