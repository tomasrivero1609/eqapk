import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { paymentService } from '../../services/paymentService';
import { eventService } from '../../services/eventService';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import { formatCurrency } from '../../utils/format';
import { Currency, Event } from '../../types';

const daysSince = (date: Date) => {
  const now = Date.now();
  return Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24));
};

const getLastPaymentDate = (payments?: Array<{ paidAt: string }>) => {
  if (!payments || payments.length === 0) {
    return null;
  }
  return payments
    .map((payment) => new Date(payment.paidAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];
};

export default function AdminSummaryScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['payments-summary'],
    queryFn: () => paymentService.getSummary(),
  });
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getAll(),
  });
  const { width } = useWindowDimensions();
  const isCompact = width < 400;
  const insets = useSafeAreaInsets();

  const ars = data?.[Currency.ARS] ?? 0;
  const usd = data?.[Currency.USD] ?? 0;
  const now = new Date();
  const monthEvents = useMemo(() => {
    return (events || []).filter((event: Event) => {
      const date = new Date(event.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, [events, now]);
  const upcomingEvents = useMemo(() => {
    return (events || []).filter((event: Event) => {
      const date = new Date(event.date);
      const diff = date.getTime() - now.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    });
  }, [events, now]);
  const overdueEvents = useMemo(() => {
    return (events || []).filter((event: Event) => {
      const lastPayment = getLastPaymentDate(event.payments);
      const referenceDate = lastPayment || new Date(event.createdAt);
      return daysSince(referenceDate) >= 30;
    });
  }, [events]);

  if (isLoading || isLoadingEvents) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className={`${isCompact ? 'px-4 pt-4' : 'px-6 pt-6'}`}>
          <Text className={`${isCompact ? 'text-xl' : 'text-2xl'} font-bold text-slate-100`}>
            Resumen de ingresos
          </Text>
          <Text className="mt-2 text-sm text-slate-400">
            Totales globales en pesos y dolares.
          </Text>
        </View>

        <View className={`${isCompact ? 'mt-4 px-4' : 'mt-6 px-6'} space-y-4`}>
          <Card>
            <Text className="text-sm text-slate-400">Total ARS</Text>
            <Text className={`${isCompact ? 'text-xl' : 'text-2xl'} mt-2 font-bold text-slate-100`}>
              {formatCurrency(ars, 'ARS')}
            </Text>
          </Card>
          <Card>
            <Text className="text-sm text-slate-400">Total USD</Text>
            <Text className={`${isCompact ? 'text-xl' : 'text-2xl'} mt-2 font-bold text-slate-100`}>
              {formatCurrency(usd, 'USD')}
            </Text>
          </Card>
          <Card>
            <Text className="text-sm text-slate-400">Eventos del mes</Text>
            <Text className={`${isCompact ? 'text-xl' : 'text-2xl'} mt-2 font-bold text-slate-100`}>
              {monthEvents.length}
            </Text>
          </Card>
          <Card>
            <Text className="text-sm text-slate-400">Proximos 7 dias</Text>
            <Text className={`${isCompact ? 'text-xl' : 'text-2xl'} mt-2 font-bold text-slate-100`}>
              {upcomingEvents.length}
            </Text>
          </Card>
          <Card>
            <Text className="text-sm text-slate-400">Pagos atrasados</Text>
            <Text className={`${isCompact ? 'text-xl' : 'text-2xl'} mt-2 font-bold text-rose-300`}>
              {overdueEvents.length}
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}
