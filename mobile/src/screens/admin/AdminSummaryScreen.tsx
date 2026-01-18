import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../../services/paymentService';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import { formatCurrency } from '../../utils/format';
import { Currency } from '../../types';

export default function AdminSummaryScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['payments-summary'],
    queryFn: () => paymentService.getSummary(),
  });

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  const ars = data?.[Currency.ARS] ?? 0;
  const usd = data?.[Currency.USD] ?? 0;

  return (
    <Screen>
      <View className="px-6 pt-6">
        <Text className="text-2xl font-bold text-slate-100">
          Resumen de ingresos
        </Text>
        <Text className="mt-2 text-sm text-slate-400">
          Totales globales en pesos y dolares.
        </Text>
      </View>

      <View className="mt-6 px-6 space-y-4">
        <Card>
          <Text className="text-sm text-slate-400">Total ARS</Text>
          <Text className="mt-2 text-2xl font-bold text-slate-100">
            {formatCurrency(ars, 'ARS')}
          </Text>
        </Card>
        <Card>
          <Text className="text-sm text-slate-400">Total USD</Text>
          <Text className="mt-2 text-2xl font-bold text-slate-100">
            {formatCurrency(usd, 'USD')}
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
