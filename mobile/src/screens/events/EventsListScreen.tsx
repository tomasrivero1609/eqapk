import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../../services/eventService';
import { Event, EventStatus } from '../../types';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/format';

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

const statusVariant = (status: EventStatus) => {
  switch (status) {
    case EventStatus.CONFIRMED:
      return 'success';
    case EventStatus.IN_PROGRESS:
      return 'info';
    case EventStatus.COMPLETED:
      return 'neutral';
    case EventStatus.CANCELLED:
      return 'danger';
    default:
      return 'warning';
  }
};

export default function EventsListScreen({ navigation }: any) {
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getAll(),
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  const renderEvent = ({ item }: { item: Event }) => {
    const lastPayment = getLastPaymentDate(item.payments);
    const referenceDate = lastPayment || new Date(item.createdAt);
    const isOverdue = daysSince(referenceDate) >= 30;

    return (
    <TouchableOpacity
      className="mx-4 my-2"
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <Card>
        <View className="flex-row items-start justify-between">
          <Text className="text-lg font-bold text-slate-100 flex-1 pr-2">
            {item.name}
          </Text>
          <View className="items-end space-y-2">
            <Badge label={item.status} variant={statusVariant(item.status)} />
            {isOverdue && (
              <Badge label="Pago atrasado" variant="danger" />
            )}
          </View>
        </View>
        <Text className="mt-2 text-sm text-slate-400">
          {new Date(item.date).toLocaleDateString('es-AR')}
        </Text>
        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-slate-400">Platos</Text>
            <Text className="text-base font-semibold text-slate-100">
              {item.dishCount}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-slate-400">Invitados</Text>
            <Text className="text-base font-semibold text-slate-100">
              {item.guestCount}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-slate-400">Total</Text>
            <Text className="text-base font-semibold text-slate-100">
              {formatCurrency(item.totalAmount, item.currency)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <View className="px-4 pt-4">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Nuevo evento"
              onPress={() => navigation.navigate('CreateEvent')}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Calendario"
              variant="secondary"
              onPress={() => navigation.navigate('EventsCalendar')}
            />
          </View>
        </View>
      </View>

      <FlatList
        data={events || []}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-6"
        ListEmptyComponent={
          <EmptyState
            title="No hay eventos"
            description="Crea tu primer evento para comenzar"
          />
        }
      />
    </Screen>
  );
}
