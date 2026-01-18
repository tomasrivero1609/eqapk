import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Platform, Modal, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../../services/paymentService';
import { eventService } from '../../services/eventService';
import { dolarService } from '../../services/dolarService';
import Screen from '../../components/ui/Screen';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Currency } from '../../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import Card from '../../components/ui/Card';
import { convertAmount } from '../../utils/currency';
import { formatCurrency } from '../../utils/format';

const paymentMethods = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'];

export default function CreatePaymentScreen({ navigation, route }: any) {
  const { eventId, currency } = route.params as {
    eventId: string;
    currency: Currency;
  };

  const [amount, setAmount] = useState('0');
  const [paymentCurrency, setPaymentCurrency] = useState<Currency>(currency);
  const [platesCovered, setPlatesCovered] = useState('');
  const [method, setMethod] = useState(paymentMethods[0]);
  const [notes, setNotes] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [showPaidAtPicker, setShowPaidAtPicker] = useState(false);
  const isAnyPickerOpen = showPaidAtPicker;
  const pickerStyleProps =
    Platform.OS === 'ios'
      ? { themeVariant: 'dark' as const, textColor: '#E2E8F0', style: { backgroundColor: '#0F172A' } }
      : {};

  const openPicker = () => {
    if (isAnyPickerOpen) {
      return;
    }
    Keyboard.dismiss();
    setTimeout(() => setShowPaidAtPicker(true), 150);
  };

  const queryClient = useQueryClient();
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getById(eventId),
  });
  const { data: dolarOficial, isLoading: isLoadingDolarOficial } = useQuery({
    queryKey: ['dolar-oficial'],
    queryFn: () => dolarService.getOficial(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: dolarBlue, isLoading: isLoadingDolarBlue } = useQuery({
    queryKey: ['dolar-blue'],
    queryFn: () => dolarService.getBlue(),
    staleTime: 5 * 60 * 1000,
  });
  const exchangeRate = dolarBlue?.venta;
  const parsedAmount = useMemo(() => parseFloat(amount), [amount]);
  const parsedPlatesCovered = useMemo(
    () => parseInt(platesCovered, 10) || 0,
    [platesCovered],
  );
  const convertedAmount = useMemo(
    () => convertAmount(parsedAmount, paymentCurrency, currency, exchangeRate),
    [parsedAmount, paymentCurrency, currency, exchangeRate],
  );
  const totalPaidInEventCurrency = useMemo(() => {
    if (!event) {
      return 0;
    }
    return (event.payments || []).reduce((sum: number, payment: any) => {
      const rate = payment.exchangeRate ?? exchangeRate;
      return (
        sum +
        convertAmount(payment.amount, payment.currency, event.currency, rate)
      );
    }, 0);
  }, [event, exchangeRate]);
  const totalCoveredPlates = useMemo(() => {
    if (!event) {
      return 0;
    }
    return (event.payments || []).reduce((sum: number, payment: any) => {
      return sum + (payment.platesCovered || 0);
    }, 0);
  }, [event]);
  const coveredPlatesValue = useMemo(() => {
    if (!event) {
      return 0;
    }
    return (event.payments || []).reduce((sum: number, payment: any) => {
      if (!payment.platesCovered) {
        return sum;
      }
      const price =
        payment.pricePerDishAtPayment ?? event.pricePerDish;
      return sum + payment.platesCovered * price;
    }, 0);
  }, [event]);
  const totalDue = useMemo(() => {
    if (!event) {
      return 0;
    }
    const remainingPlates = Math.max(
      0,
      event.dishCount - totalCoveredPlates,
    );
    return coveredPlatesValue + remainingPlates * event.pricePerDish;
  }, [event, coveredPlatesValue, totalCoveredPlates]);
  const newPaymentInEventCurrency = useMemo(() => {
    if (!event) {
      return parsedAmount;
    }
    return convertAmount(
      parsedAmount,
      paymentCurrency,
      event.currency,
      exchangeRate,
    );
  }, [event, parsedAmount, paymentCurrency, exchangeRate]);
  const mutation = useMutation({
    mutationFn: () =>
      paymentService.create({
        eventId,
        amount: parseFloat(amount),
        currency: paymentCurrency,
        exchangeRate:
          paymentCurrency !== currency && exchangeRate ? exchangeRate : undefined,
        exchangeRateDate:
          paymentCurrency !== currency && exchangeRate
            ? (paidAt ? new Date(paidAt).toISOString() : new Date().toISOString())
            : undefined,
        platesCovered: parsedPlatesCovered > 0 ? parsedPlatesCovered : undefined,
        method,
        notes: notes || undefined,
        paidAt: paidAt || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      Alert.alert('Listo', 'Pago registrado', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar pago');
    },
  });

  const handleSubmit = () => {
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto valido');
      return;
    }
    if (parsedPlatesCovered < 0) {
      Alert.alert('Error', 'Platos cubiertos invalido');
      return;
    }
    if (event) {
      if (parsedPlatesCovered > 0) {
        const totalPlatesAfter = totalCoveredPlates + parsedPlatesCovered;
        if (totalPlatesAfter > event.dishCount) {
          Alert.alert(
            'Platos excedidos',
            'Los platos cubiertos superan el total del evento.',
          );
          return;
        }
      }
      const canCompare =
        paymentCurrency === event.currency || Boolean(exchangeRate);
      if (canCompare) {
        const totalAfter = totalPaidInEventCurrency + newPaymentInEventCurrency;
        if (totalAfter > totalDue + 0.005) {
          Alert.alert(
            'Monto excedido',
            'Este pago excede el total del evento.',
          );
          return;
        }
      }
    }
    mutation.mutate();
  };

  return (
    <Screen>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerClassName="pb-32"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-slate-100">Registrar pago</Text>
          <Text className="mt-2 text-sm text-slate-400">
            Agrega un pago del evento.
          </Text>
        </View>
        <View className="mt-4 px-6 space-y-3">
          <Card>
            <Text className="text-xs font-semibold text-slate-400">
              Dolar oficial
            </Text>
            {isLoadingDolarOficial && (
              <Text className="mt-1 text-sm text-slate-200">Cargando...</Text>
            )}
            {!isLoadingDolarOficial && dolarOficial && (
              <>
                <Text className="mt-1 text-base font-semibold text-slate-100">
                  Compra {dolarOficial.compra} - Venta {dolarOficial.venta}
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  Actualizado {new Date(dolarOficial.fechaActualizacion).toLocaleString('es-AR')}
                </Text>
              </>
            )}
            {!isLoadingDolarOficial && !dolarOficial && (
              <Text className="mt-1 text-sm text-slate-300">
                No disponible por ahora.
              </Text>
            )}
          </Card>
          <Card>
            <Text className="text-xs font-semibold text-slate-400">
              Dolar blue
            </Text>
            {isLoadingDolarBlue && (
              <Text className="mt-1 text-sm text-slate-200">Cargando...</Text>
            )}
            {!isLoadingDolarBlue && dolarBlue && (
              <>
                <Text className="mt-1 text-base font-semibold text-slate-100">
                  Compra {dolarBlue.compra} - Venta {dolarBlue.venta}
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  Actualizado {new Date(dolarBlue.fechaActualizacion).toLocaleString('es-AR')}
                </Text>
              </>
            )}
            {!isLoadingDolarBlue && !dolarBlue && (
              <Text className="mt-1 text-sm text-slate-300">
                No disponible por ahora.
              </Text>
            )}
          </Card>
        </View>

        <View className="mt-6 px-6 space-y-4">
          <Input
            label={`Monto (${paymentCurrency})`}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <Input
            label="Platos cubiertos (opcional)"
            placeholder="0"
            value={platesCovered}
            onChangeText={setPlatesCovered}
            keyboardType="number-pad"
          />
          <View>
            <Text className="text-sm font-semibold text-slate-300 mb-2">
              Moneda del pago
            </Text>
            <View className="flex-row gap-2">
              {[Currency.ARS, Currency.USD].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setPaymentCurrency(item)}
                  className={`flex-1 rounded-2xl border px-3 py-4 ${
                    paymentCurrency === item
                      ? 'border-violet-400 bg-violet-500/20'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      paymentCurrency === item ? 'text-violet-200' : 'text-slate-300'
                    }`}
                  >
                    {item === Currency.ARS ? 'ARS' : 'USD'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {paymentCurrency !== currency && (
              <View className="mt-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                <Text className="text-xs font-semibold text-slate-400">
                  Equivalente en {currency}
                </Text>
                {exchangeRate ? (
                  <Text className="mt-1 text-sm text-slate-100">
                    {formatCurrency(
                      Number.isFinite(convertedAmount) ? convertedAmount : 0,
                      currency,
                    )}
                  </Text>
                ) : (
                  <Text className="mt-1 text-xs text-slate-500">
                    Sin tipo de cambio blue disponible.
                  </Text>
                )}
              </View>
            )}
          </View>
          <View>
            <Text className="text-sm font-semibold text-slate-300 mb-2">
              Metodo
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {paymentMethods.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setMethod(item)}
                  className={`rounded-full border px-4 py-2 ${
                    method === item
                      ? 'border-violet-400 bg-violet-500/20'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      method === item ? 'text-violet-200' : 'text-slate-300'
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="space-y-2">
            <Text className="text-sm font-semibold text-slate-300">
              Fecha de pago
            </Text>
            <TouchableOpacity
              onPress={openPicker}
              disabled={isAnyPickerOpen}
              className={`rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 ${
                isAnyPickerOpen ? 'opacity-60' : ''
              }`}
            >
              <Text className="text-base text-slate-100">
                {paidAt ? paidAt : 'Seleccionar fecha (opcional)'}
              </Text>
            </TouchableOpacity>
            <Text className="text-xs text-slate-400">
              Deja vacio para usar la fecha actual
            </Text>
          </View>
          <Input
            label="Notas"
            placeholder="Detalle del pago"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View className="mt-6 px-6">
          <Button
            label="Guardar pago"
            onPress={handleSubmit}
            loading={mutation.isPending}
          />
        </View>
        {Platform.OS === 'ios' && showPaidAtPicker && (
          <View className="px-6 pb-4">
            <Card>
              <DateTimePicker
                value={paidAt ? new Date(paidAt) : new Date()}
                mode="date"
                display="inline"
                {...pickerStyleProps}
                onChange={(event, selectedDate) => {
                  if (event.type === 'set' && selectedDate) {
                    const year = selectedDate.getFullYear();
                    const month = `${selectedDate.getMonth() + 1}`.padStart(2, '0');
                    const day = `${selectedDate.getDate()}`.padStart(2, '0');
                    setPaidAt(`${year}-${month}-${day}`);
                  }
                }}
              />
              <View className="mt-2">
                <Button label="Listo" onPress={() => setShowPaidAtPicker(false)} />
              </View>
            </Card>
          </View>
        )}
        {Platform.OS !== 'ios' && (
          <Modal visible={showPaidAtPicker} transparent animationType="fade">
          <View className="flex-1 items-center justify-center bg-black/60 px-6">
            <View className="w-full rounded-3xl bg-slate-900 p-4">
              <Text className="text-base font-semibold text-slate-100">
                Fecha de pago
              </Text>
              <DateTimePicker
                value={paidAt ? new Date(paidAt) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                {...pickerStyleProps}
                onChange={(event, selectedDate) => {
                  if (Platform.OS !== 'ios') {
                    setShowPaidAtPicker(false);
                  }
                  if (event.type === 'set' && selectedDate) {
                    const year = selectedDate.getFullYear();
                    const month = `${selectedDate.getMonth() + 1}`.padStart(2, '0');
                    const day = `${selectedDate.getDate()}`.padStart(2, '0');
                    setPaidAt(`${year}-${month}-${day}`);
                  }
                }}
              />
              <View className="mt-4">
                <Button label="Listo" onPress={() => setShowPaidAtPicker(false)} />
              </View>
            </View>
          </View>
        </Modal>
        )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </Screen>
  );
}
