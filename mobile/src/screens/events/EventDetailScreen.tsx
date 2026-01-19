import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../../services/eventService';
import { dolarService } from '../../services/dolarService';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { Payment } from '../../types';
import { formatCurrency } from '../../utils/format';
import { convertAmount } from '../../utils/currency';

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

export default function EventDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params;
  const [visiblePaymentsCount, setVisiblePaymentsCount] = useState(10);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getById(eventId),
  });
  const { data: dolarBlue } = useQuery({
    queryKey: ['dolar-blue'],
    queryFn: () => dolarService.getBlue(),
    staleTime: 5 * 60 * 1000,
  });
  const { width } = useWindowDimensions();
  const isCompact = width < 400;
  const payments = event?.payments || [];
  const visiblePayments = payments.slice(0, visiblePaymentsCount);

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  if (!event) {
    return (
      <Screen>
        <EmptyState title="Evento no encontrado" />
      </Screen>
    );
  }

  const exchangeRate = dolarBlue?.venta;
  const hasMixedCurrencies = payments.some(
    (payment: Payment) => payment.currency !== event.currency,
  );
  const hasMissingRates = payments.some(
    (payment: Payment) =>
      payment.currency !== event.currency &&
      !payment.exchangeRate &&
      !exchangeRate,
  );
  const totalCoveredPlates = payments.reduce(
    (sum: number, payment: Payment) => sum + (payment.platesCovered || 0),
    0,
  );
  const coveredPlatesValue = payments.reduce((sum: number, payment: Payment) => {
    if (!payment.platesCovered) {
      return sum;
    }
    const price =
      payment.pricePerDishAtPayment ?? event.pricePerDish;
    return sum + payment.platesCovered * price;
  }, 0);
  const remainingPlates = Math.max(
    0,
    event.dishCount - totalCoveredPlates,
  );
  const totalDue =
    coveredPlatesValue + remainingPlates * event.pricePerDish;
  const totalPaid = payments.reduce((sum: number, payment: Payment) => {
    const rate = payment.exchangeRate ?? exchangeRate;
    const converted = convertAmount(
      payment.amount,
      payment.currency,
      event.currency,
      rate,
    );
    return sum + converted;
  }, 0);
  const balance = totalDue - totalPaid;
  const lastPayment = getLastPaymentDate(payments);
  const overdueReference = lastPayment || new Date(event.createdAt);
  const isOverdue = daysSince(overdueReference) >= 30;

  return (
    <Screen>
      <ScrollView contentContainerClassName="pb-40">
        <View className="px-6 pt-6">
          <Text className={`${isCompact ? 'text-xl' : 'text-2xl'} font-bold text-slate-100`}>{event.name}</Text>
          {event.client?.name ? (
            <Text className={`${isCompact ? 'text-xs' : 'text-sm'} mt-1 text-slate-400`}>
              Cliente: {event.client.name}
            </Text>
          ) : null}
          <Text className={`${isCompact ? 'text-xs' : 'text-sm'} mt-2 text-slate-400`}>
            {new Date(event.date).toLocaleDateString('es-AR')} · {event.startTime}
            {event.endTime ? ` - ${event.endTime}` : ''}
          </Text>
        </View>

        <View className="mt-6 px-6">
          <Card>
            <Text className={`${isCompact ? 'text-xs' : 'text-sm'} font-semibold text-slate-400`}>Resumen</Text>
            <View className="mt-4 flex-row justify-between">
              <View>
                <Text className="text-xs text-slate-400">Invitados</Text>
                <Text className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-slate-100`}>
                  {event.guestCount}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-slate-400">Platos</Text>
                <Text className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-slate-100`}>
                  {event.dishCount}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-slate-400">Precio x plato</Text>
                <Text className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-slate-100`}>
                  {formatCurrency(event.pricePerDish, event.currency)}
                </Text>
              </View>
            </View>
            <View className="mt-4 border-t border-slate-800 pt-4">
              <View className="flex-row justify-between">
                <Text className="text-sm text-slate-400">Total</Text>
                <Text className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-slate-100`}>
                  {formatCurrency(totalDue, event.currency)}
                </Text>
              </View>
              <View className="mt-2 flex-row justify-between">
                <Text className="text-sm text-slate-400">Pagado</Text>
                <Text className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-emerald-400`}>
                  {formatCurrency(totalPaid, event.currency)}
                </Text>
              </View>
              <View className="mt-2 flex-row justify-between">
                <Text className="text-sm text-slate-400">Saldo</Text>
                <Text className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-rose-400`}>
                  {formatCurrency(balance, event.currency)}
                </Text>
              </View>
              {totalCoveredPlates > 0 && (
                <Text className="mt-3 text-xs text-slate-500">
                  Platos cubiertos: {totalCoveredPlates} de {event.dishCount}
                </Text>
              )}
              {hasMixedCurrencies && hasMissingRates && (
                <Text className="mt-3 text-xs text-slate-500">
                  Tipo de cambio blue no disponible, totales sin conversion precisa.
                </Text>
              )}
            </View>
          </Card>
        </View>
        {isOverdue && (
          <View className="mt-4 px-6">
            <Card className="border border-rose-500/30 bg-rose-500/10">
              <Text className="text-sm font-semibold text-rose-200">
                Pago atrasado
              </Text>
              <Text className="mt-1 text-xs text-rose-200/80">
                Pasaron mas de 30 dias desde el ultimo pago.
              </Text>
            </Card>
          </View>
        )}

        {(event.description || event.notes) && (
          <View className="mt-6 px-6">
            <Card>
              {event.description ? (
                <View>
                  <Text className="text-xs font-semibold text-slate-400">
                    Descripcion
                  </Text>
                  <Text className="mt-1 text-sm text-slate-300">
                    {event.description}
                  </Text>
                </View>
              ) : null}
              {event.notes ? (
                <View className="mt-4">
                  <Text className="text-xs font-semibold text-slate-400">
                    Notas
                  </Text>
                  <Text className="mt-1 text-sm text-slate-300">{event.notes}</Text>
                </View>
              ) : null}
            </Card>
          </View>
        )}

        <View className="mt-6 px-6">
          <View className="flex-row items-center justify-between">
            <Text className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-slate-100`}>Pagos</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CreatePayment', {
                  eventId: event.id,
                  currency: event.currency,
                })
              }
            >
              <Text className="text-sm font-semibold text-violet-300">
                Registrar pago
              </Text>
            </TouchableOpacity>
          </View>
          {payments.length === 0 ? (
            <View className="mt-4">
              <EmptyState
                title="Sin pagos registrados"
                description="Agrega el primer pago del evento"
              />
            </View>
          ) : (
            <>
              <View className="mt-4 space-y-3">
                {visiblePayments.map((payment: Payment) => (
                  <TouchableOpacity
                    key={payment.id}
                    onPress={() =>
                      navigation.navigate('PaymentDetail', {
                        payment,
                        eventCurrency: event.currency,
                        eventName: event.name,
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Card className="px-4 py-3">
                      <View className="flex-row justify-between">
                        <Text className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-slate-100`}>
                          {formatCurrency(payment.amount, payment.currency)}
                        </Text>
                        <Text className="text-xs text-slate-400">
                          {new Date(payment.paidAt).toLocaleDateString('es-AR')}
                        </Text>
                      </View>
                      {payment.currency !== event.currency && (
                        <Text className="mt-1 text-xs text-slate-400">
                          {(payment.exchangeRate ?? exchangeRate)
                            ? `Equivalente ${formatCurrency(
                                convertAmount(
                                  payment.amount,
                                  payment.currency,
                                  event.currency,
                                  payment.exchangeRate ?? exchangeRate,
                                ),
                                event.currency,
                              )}`
                            : 'Equivalente no disponible (sin tipo de cambio)'}
                        </Text>
                      )}
                      {payment.exchangeRateDate ? (
                        <Text className="mt-1 text-xs text-slate-500">
                          Cotizacion{' '}
                          {new Date(payment.exchangeRateDate).toLocaleDateString('es-AR')}
                        </Text>
                      ) : null}
                      {payment.platesCovered ? (
                        <Text className="mt-1 text-xs text-slate-500">
                          Platos cubiertos: {payment.platesCovered}
                        </Text>
                      ) : null}
                      {payment.method ? (
                        <Text className="mt-1 text-xs text-slate-400">
                          {payment.method}
                        </Text>
                      ) : null}
                      {payment.notes ? (
                        <Text className="mt-1 text-sm text-slate-300">
                          {payment.notes}
                        </Text>
                      ) : null}
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
              {payments.length > visiblePaymentsCount && (
                <View className="mt-4">
                  <Button
                    label="Ver mas pagos"
                    variant="secondary"
                    onPress={() =>
                      setVisiblePaymentsCount((prev) => Math.min(prev + 10, payments.length))
                    }
                  />
                </View>
              )}
            </>
          )}
        </View>

        <View className="mt-6 px-6">
          <Button
            label="Editar evento"
            variant="secondary"
            onPress={() => navigation.navigate('CreateEvent', { eventId: event.id })}
          />
        </View>

        <View className="mt-4 px-6">
          <Button
            label="Eliminar evento"
            variant="ghost"
            onPress={() => {
              Alert.alert(
                'Eliminar evento',
                'Esta accion no se puede deshacer. Quieres eliminarlo?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await eventService.delete(event.id);
                        navigation.goBack();
                      } catch (error: any) {
                        Alert.alert(
                          'Error',
                          error.response?.data?.message || 'No se pudo eliminar',
                        );
                      }
                    },
                  },
                ],
              );
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
