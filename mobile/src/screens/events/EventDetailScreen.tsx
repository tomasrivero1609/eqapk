import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, useWindowDimensions, Modal } from 'react-native';
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
import { formatLocalDate } from '../../utils/date';

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

  const { data: event, isLoading, refetch } = useQuery({
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
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentPreview, setAdjustmentPreview] = useState<any>(null);
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);

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
  const sectionTotal =
    (event.adultCount || 0) +
    (event.juvenileCount || 0) +
    (event.childCount || 0);
  const sectionData =
    sectionTotal === 0 && event.dishCount > 0 && event.pricePerDish > 0
      ? {
          adultCount: event.dishCount,
          juvenileCount: 0,
          childCount: 0,
          adultPrice: event.pricePerDish,
          juvenilePrice: 0,
          childPrice: 0,
        }
      : {
          adultCount: event.adultCount || 0,
          juvenileCount: event.juvenileCount || 0,
          childCount: event.childCount || 0,
          adultPrice: event.adultPrice || 0,
          juvenilePrice: event.juvenilePrice || 0,
          childPrice: event.childPrice || 0,
        };
  const coveredTotals = payments.reduce(
    (acc, payment: Payment) => {
      const hasSections =
        payment.adultCovered != null ||
        payment.juvenileCovered != null ||
        payment.childCovered != null;
      const adult = hasSections ? payment.adultCovered || 0 : payment.platesCovered || 0;
      const juvenile = hasSections ? payment.juvenileCovered || 0 : 0;
      const child = hasSections ? payment.childCovered || 0 : 0;
      const adultPrice = payment.adultPriceAtPayment ?? sectionData.adultPrice;
      const juvenilePrice =
        payment.juvenilePriceAtPayment ?? sectionData.juvenilePrice;
      const childPrice = payment.childPriceAtPayment ?? sectionData.childPrice;
      acc.adultCovered += adult;
      acc.juvenileCovered += juvenile;
      acc.childCovered += child;
      acc.coveredValue +=
        adult * adultPrice + juvenile * juvenilePrice + child * childPrice;
      return acc;
    },
    { adultCovered: 0, juvenileCovered: 0, childCovered: 0, coveredValue: 0 },
  );
  const remainingAdult = Math.max(
    0,
    sectionData.adultCount - coveredTotals.adultCovered,
  );
  const remainingJuvenile = Math.max(
    0,
    sectionData.juvenileCount - coveredTotals.juvenileCovered,
  );
  const remainingChild = Math.max(
    0,
    sectionData.childCount - coveredTotals.childCovered,
  );
  const totalDue =
    coveredTotals.coveredValue +
    remainingAdult * sectionData.adultPrice +
    remainingJuvenile * sectionData.juvenilePrice +
    remainingChild * sectionData.childPrice;
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

  const handleQuarterlyAdjustment = async () => {
    if (!event) {
      return;
    }
    try {
      setIsAdjusting(true);
      const preview = await eventService.previewQuarterlyAdjustment(event.id);
      setAdjustmentPreview(preview);
      setAdjustmentError(null);
      setShowAdjustmentModal(true);
    } catch (error: any) {
      setAdjustmentError(
        error.response?.data?.message || 'No se pudo calcular el ajuste.',
      );
      setShowAdjustmentModal(true);
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleApplyAdjustment = async () => {
    if (!event) {
      return;
    }
    try {
      setIsAdjusting(true);
      const force = adjustmentPreview && !adjustmentPreview.eligible;
      await eventService.applyQuarterlyAdjustment(event.id, force);
      await refetch();
      setShowAdjustmentModal(false);
      Alert.alert('Listo', 'Ajuste trimestral aplicado.');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo aplicar el ajuste.',
      );
    } finally {
      setIsAdjusting(false);
    }
  };

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
          {event.familyMembers ? (
            <Text className={`${isCompact ? 'text-xs' : 'text-sm'} mt-1 text-slate-400`}>
              Familiares: {event.familyMembers}
            </Text>
          ) : null}
          <Text className={`${isCompact ? 'text-xs' : 'text-sm'} mt-2 text-slate-400`}>
            {formatLocalDate(event.date)} - {event.startTime}
            {event.endTime ? ` - ${event.endTime}` : ''}
          </Text>
        </View>

        <View className="mt-6 px-6">
          <Card>
            <Text className={`${isCompact ? 'text-xs' : 'text-sm'} font-semibold text-slate-400`}>Resumen</Text>
            <Text className="mt-2 text-xs text-slate-500">
              Platos contratados: {event.dishCount}
            </Text>
            <View className="mt-4 flex-row justify-between">
              <View>
                <Text className="text-xs text-slate-400">Adultos</Text>
                <Text className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-slate-100`}>
                  {sectionData.adultCount}
                </Text>
                <Text className="text-xs text-slate-500">
                  {formatCurrency(sectionData.adultPrice, event.currency)}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-slate-400">Juveniles</Text>
                <Text className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-slate-100`}>
                  {sectionData.juvenileCount}
                </Text>
                <Text className="text-xs text-slate-500">
                  {formatCurrency(sectionData.juvenilePrice, event.currency)}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-slate-400">Infantiles</Text>
                <Text className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-slate-100`}>
                  {sectionData.childCount}
                </Text>
                <Text className="text-xs text-slate-500">
                  {formatCurrency(sectionData.childPrice, event.currency)}
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
              {event.quarterlyAdjustmentEnabled &&
                event.quarterlyAdjustmentPercent > 0 && (
                  <Text className="mt-3 text-xs text-slate-500">
                    Ajuste trimestral configurado: {event.quarterlyAdjustmentPercent}%
                  </Text>
                )}
              {(coveredTotals.adultCovered > 0 ||
                coveredTotals.juvenileCovered > 0 ||
                coveredTotals.childCovered > 0) && (
                <Text className="mt-3 text-xs text-slate-500">
                  Platos cubiertos: {coveredTotals.adultCovered} A /{' '}
                  {coveredTotals.juvenileCovered} J / {coveredTotals.childCovered} I
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

        <View className="mt-4 px-6 space-y-4">
          <Button
            label="Especificaciones tecnicas"
            variant="secondary"
            onPress={() => navigation.navigate('EventSpecs', { event })}
          />

          {event.quarterlyAdjustmentEnabled &&
            event.quarterlyAdjustmentPercent > 0 && (
              <Card className="mt-2">
                <Text className="text-sm font-semibold text-slate-100">
                  Ajuste trimestral ({event.quarterlyAdjustmentPercent}%)
                </Text>
                <Text className="mt-2 text-xs text-slate-500">
                  Ultimo ajuste:{' '}
                  {event.lastAdjustmentAt
                    ? new Date(event.lastAdjustmentAt).toLocaleDateString('es-AR')
                    : new Date(event.createdAt).toLocaleDateString('es-AR')}
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  Proximo ajuste disponible desde:{' '}
                  {(() => {
                    const base = event.lastAdjustmentAt
                      ? new Date(event.lastAdjustmentAt)
                      : new Date(event.createdAt);
                    const next = new Date(base);
                    next.setMonth(next.getMonth() + 3);
                    return next.toLocaleDateString('es-AR');
                  })()}
                </Text>
                <View className="mt-3">
                  <Button
                    label="Ver calculo trimestral"
                    variant="secondary"
                    onPress={handleQuarterlyAdjustment}
                    loading={isAdjusting}
                  />
                </View>
              </Card>
            )}
        </View>

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
                      {(payment.adultCovered ||
                        payment.juvenileCovered ||
                        payment.childCovered) ? (
                        <Text className="mt-1 text-xs text-slate-500">
                          Platos cubiertos: {payment.adultCovered || 0} A /{' '}
                          {payment.juvenileCovered || 0} J /{' '}
                          {payment.childCovered || 0} I
                        </Text>
                      ) : payment.platesCovered ? (
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

        <View className="mt-6 px-6 space-y-3">
          <Button
            label="Editar evento"
            variant="secondary"
            onPress={() => navigation.navigate('CreateEvent', { eventId: event.id })}
          />

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

      <Modal visible={showAdjustmentModal} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View className="w-full rounded-3xl bg-slate-900 p-4">
            <Text className="text-base font-semibold text-slate-100">
              Calculo trimestral
            </Text>
            {adjustmentError ? (
              <Text className="mt-2 text-sm text-rose-300">{adjustmentError}</Text>
            ) : adjustmentPreview ? (
              <>
                <Text className="mt-2 text-xs text-slate-400">
                  Precios actuales a nuevos
                </Text>
                <View className="mt-3 space-y-2">
                  <Text className="text-sm text-slate-200">
                    Adulto: {formatCurrency(adjustmentPreview.currentPrices.adult, event.currency)} a{' '}
                    {formatCurrency(adjustmentPreview.newPrices.adult, event.currency)}
                  </Text>
                  <Text className="text-sm text-slate-200">
                    Juvenil: {formatCurrency(adjustmentPreview.currentPrices.juvenile, event.currency)} a{' '}
                    {formatCurrency(adjustmentPreview.newPrices.juvenile, event.currency)}
                  </Text>
                  <Text className="text-sm text-slate-200">
                    Infantil: {formatCurrency(adjustmentPreview.currentPrices.child, event.currency)} a{' '}
                    {formatCurrency(adjustmentPreview.newPrices.child, event.currency)}
                  </Text>
                </View>
                {!adjustmentPreview.eligible && (
                  <Text className="mt-3 text-xs text-amber-300">
                    Disponible desde {new Date(adjustmentPreview.nextEligibleAt).toLocaleDateString('es-AR')}.
                  </Text>
                )}
              </>
            ) : (
              <Text className="mt-2 text-sm text-slate-400">Cargando...</Text>
            )}
          <View className="mt-4 space-y-2">
            <Button label="Cerrar" variant="secondary" onPress={() => setShowAdjustmentModal(false)} />
            <Button
              label="Ajustar ahora"
              onPress={handleApplyAdjustment}
              loading={isAdjusting}
            />
          </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
