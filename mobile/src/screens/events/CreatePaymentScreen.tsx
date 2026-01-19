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

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map((part) => parseInt(part, 10));
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

const normalizeDecimalInput = (value: string) => {
  const cleaned = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length <= 1) {
    return cleaned.replace(/^0+(?=\d)/, '');
  }
  return `${parts[0].replace(/^0+(?=\d)/, '')}.${parts.slice(1).join('')}`;
};

const normalizeIntInput = (value: string) => {
  return value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
};

export default function CreatePaymentScreen({ navigation, route }: any) {
  const { eventId, currency } = route.params as {
    eventId: string;
    currency: Currency;
  };

  const [amount, setAmount] = useState('0');
  const [paymentCurrency, setPaymentCurrency] = useState<Currency>(currency);
  const [adultCovered, setAdultCovered] = useState('');
  const [juvenileCovered, setJuvenileCovered] = useState('');
  const [childCovered, setChildCovered] = useState('');
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
  const sectionData = useMemo(() => {
    if (!event) {
      return {
        adultCount: 0,
        juvenileCount: 0,
        childCount: 0,
        adultPrice: 0,
        juvenilePrice: 0,
        childPrice: 0,
      };
    }
    const sectionTotal =
      (event.adultCount || 0) +
      (event.juvenileCount || 0) +
      (event.childCount || 0);
    if (sectionTotal === 0 && event.dishCount > 0) {
      return {
        adultCount: event.dishCount,
        juvenileCount: 0,
        childCount: 0,
        adultPrice: event.pricePerDish,
        juvenilePrice: 0,
        childPrice: 0,
      };
    }
    return {
      adultCount: event.adultCount || 0,
      juvenileCount: event.juvenileCount || 0,
      childCount: event.childCount || 0,
      adultPrice: event.adultPrice || 0,
      juvenilePrice: event.juvenilePrice || 0,
      childPrice: event.childPrice || 0,
    };
  }, [event]);
  const parsedAmount = useMemo(() => parseFloat(amount), [amount]);
  const parsedAdultCovered = useMemo(
    () => parseInt(adultCovered, 10) || 0,
    [adultCovered],
  );
  const parsedJuvenileCovered = useMemo(
    () => parseInt(juvenileCovered, 10) || 0,
    [juvenileCovered],
  );
  const parsedChildCovered = useMemo(
    () => parseInt(childCovered, 10) || 0,
    [childCovered],
  );
  const convertedAmount = useMemo(
    () => convertAmount(parsedAmount, paymentCurrency, currency, exchangeRate),
    [parsedAmount, paymentCurrency, currency, exchangeRate],
  );
  const coveredCostEventCurrency = useMemo(() => {
    return (
      parsedAdultCovered * sectionData.adultPrice +
      parsedJuvenileCovered * sectionData.juvenilePrice +
      parsedChildCovered * sectionData.childPrice
    );
  }, [
    parsedAdultCovered,
    parsedJuvenileCovered,
    parsedChildCovered,
    sectionData.adultPrice,
    sectionData.juvenilePrice,
    sectionData.childPrice,
  ]);
  const coveredCostPaymentCurrency = useMemo(() => {
    return convertAmount(
      coveredCostEventCurrency,
      event?.currency || currency,
      paymentCurrency,
      exchangeRate,
    );
  }, [
    coveredCostEventCurrency,
    event,
    currency,
    paymentCurrency,
    exchangeRate,
  ]);
  const adultCostPaymentCurrency = useMemo(() => {
    return convertAmount(
      parsedAdultCovered * sectionData.adultPrice,
      event?.currency || currency,
      paymentCurrency,
      exchangeRate,
    );
  }, [parsedAdultCovered, sectionData.adultPrice, event, currency, paymentCurrency, exchangeRate]);
  const juvenileCostPaymentCurrency = useMemo(() => {
    return convertAmount(
      parsedJuvenileCovered * sectionData.juvenilePrice,
      event?.currency || currency,
      paymentCurrency,
      exchangeRate,
    );
  }, [parsedJuvenileCovered, sectionData.juvenilePrice, event, currency, paymentCurrency, exchangeRate]);
  const childCostPaymentCurrency = useMemo(() => {
    return convertAmount(
      parsedChildCovered * sectionData.childPrice,
      event?.currency || currency,
      paymentCurrency,
      exchangeRate,
    );
  }, [parsedChildCovered, sectionData.childPrice, event, currency, paymentCurrency, exchangeRate]);
  const paymentRemaining = useMemo(() => {
    return parsedAmount - coveredCostPaymentCurrency;
  }, [parsedAmount, coveredCostPaymentCurrency]);
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
  const coveredTotals = useMemo(() => {
    if (!event) {
      return {
        adultCovered: 0,
        juvenileCovered: 0,
        childCovered: 0,
        coveredValue: 0,
      };
    }
    return (event.payments || []).reduce(
      (acc: any, payment: any) => {
        const hasSections =
          payment.adultCovered != null ||
          payment.juvenileCovered != null ||
          payment.childCovered != null;
        const adult = hasSections ? payment.adultCovered || 0 : payment.platesCovered || 0;
        const juvenile = hasSections ? payment.juvenileCovered || 0 : 0;
        const child = hasSections ? payment.childCovered || 0 : 0;
        const adultPrice =
          payment.adultPriceAtPayment ?? sectionData.adultPrice;
        const juvenilePrice =
          payment.juvenilePriceAtPayment ?? sectionData.juvenilePrice;
        const childPrice =
          payment.childPriceAtPayment ?? sectionData.childPrice;
        acc.adultCovered += adult;
        acc.juvenileCovered += juvenile;
        acc.childCovered += child;
        acc.coveredValue +=
          adult * adultPrice + juvenile * juvenilePrice + child * childPrice;
        return acc;
      },
      { adultCovered: 0, juvenileCovered: 0, childCovered: 0, coveredValue: 0 },
    );
  }, [event, sectionData]);
  const totalDue = useMemo(() => {
    if (!event) {
      return 0;
    }
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
    return (
      coveredTotals.coveredValue +
      remainingAdult * sectionData.adultPrice +
      remainingJuvenile * sectionData.juvenilePrice +
      remainingChild * sectionData.childPrice
    );
  }, [event, coveredTotals, sectionData]);
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
        adultCovered: parsedAdultCovered > 0 ? parsedAdultCovered : undefined,
        juvenileCovered: parsedJuvenileCovered > 0 ? parsedJuvenileCovered : undefined,
        childCovered: parsedChildCovered > 0 ? parsedChildCovered : undefined,
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
    if (parsedAdultCovered < 0 || parsedJuvenileCovered < 0 || parsedChildCovered < 0) {
      Alert.alert('Error', 'Platos cubiertos invalido');
      return;
    }
    if (event) {
      const hasCoveredSections =
        parsedAdultCovered > 0 ||
        parsedJuvenileCovered > 0 ||
        parsedChildCovered > 0;
      if (hasCoveredSections && paymentCurrency !== event.currency && !exchangeRate) {
        Alert.alert(
          'Error',
          'No hay tipo de cambio blue disponible para validar el saldo.',
        );
        return;
      }
      if (hasCoveredSections) {
        if (paymentRemaining > 0.01) {
          Alert.alert(
            'Saldo sobrante',
            `El pago excede el costo de los platos cargados. Te sobran ${formatCurrency(
              paymentRemaining,
              paymentCurrency,
            )}.`,
          );
          return;
        }
        if (paymentRemaining < -0.01) {
          Alert.alert(
            'Saldo pendiente',
            `El pago no alcanza para cubrir los platos cargados. Falta ${formatCurrency(
              Math.abs(paymentRemaining),
              paymentCurrency,
            )}.`,
          );
          return;
        }
      }
      if (parsedAdultCovered > 0) {
        const totalAfter = coveredTotals.adultCovered + parsedAdultCovered;
        if (totalAfter > sectionData.adultCount) {
          Alert.alert('Platos excedidos', 'Los platos adultos superan el total.');
          return;
        }
      }
      if (parsedJuvenileCovered > 0) {
        const totalAfter =
          coveredTotals.juvenileCovered + parsedJuvenileCovered;
        if (totalAfter > sectionData.juvenileCount) {
          Alert.alert('Platos excedidos', 'Los platos juveniles superan el total.');
          return;
        }
      }
      if (parsedChildCovered > 0) {
        const totalAfter = coveredTotals.childCovered + parsedChildCovered;
        if (totalAfter > sectionData.childCount) {
          Alert.alert('Platos excedidos', 'Los platos infantiles superan el total.');
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
            onChangeText={(text) => setAmount(normalizeDecimalInput(text))}
            keyboardType="decimal-pad"
          />
          <Card>
            <Text className="text-sm font-semibold text-slate-300">
              Platos cubiertos
            </Text>
            <View className="mt-3 space-y-3">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Adultos"
                    placeholder="0"
                    value={adultCovered}
                    onChangeText={(text) => setAdultCovered(normalizeIntInput(text))}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Juveniles"
                    placeholder="0"
                    value={juvenileCovered}
                    onChangeText={(text) => setJuvenileCovered(normalizeIntInput(text))}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Infantiles"
                    placeholder="0"
                    value={childCovered}
                    onChangeText={(text) => setChildCovered(normalizeIntInput(text))}
                    keyboardType="number-pad"
                  />
                </View>
                <View className="flex-1">
                  <View className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4">
                    <Text className="text-xs text-slate-400">Disponibles</Text>
                    <Text className="mt-1 text-sm font-semibold text-slate-100">
                      {sectionData.adultCount - coveredTotals.adultCovered} A /{' '}
                      {sectionData.juvenileCount - coveredTotals.juvenileCovered} J /{' '}
                      {sectionData.childCount - coveredTotals.childCovered} I
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
          {(parsedAdultCovered > 0 ||
            parsedJuvenileCovered > 0 ||
            parsedChildCovered > 0) && (
            <Card>
              <Text className="text-xs font-semibold text-slate-400">
                Costo de platos ({paymentCurrency})
              </Text>
              <View className="mt-2 space-y-1">
                <Text className="text-xs text-slate-300">
                  Adultos: {formatCurrency(adultCostPaymentCurrency, paymentCurrency)}
                </Text>
                <Text className="text-xs text-slate-300">
                  Juveniles: {formatCurrency(juvenileCostPaymentCurrency, paymentCurrency)}
                </Text>
                <Text className="text-xs text-slate-300">
                  Infantiles: {formatCurrency(childCostPaymentCurrency, paymentCurrency)}
                </Text>
              </View>
              <Text className="mt-1 text-base font-semibold text-slate-100">
                {formatCurrency(coveredCostPaymentCurrency, paymentCurrency)}
              </Text>
              <Text
                className={`mt-2 text-xs font-semibold ${
                  Math.abs(paymentRemaining) <= 0.01
                    ? 'text-emerald-300'
                    : paymentRemaining > 0
                    ? 'text-amber-300'
                    : 'text-rose-300'
                }`}
              >
                Saldo del pago: {formatCurrency(paymentRemaining, paymentCurrency)}
              </Text>
              {paymentCurrency !== currency && (
                <Text className="mt-1 text-xs text-slate-500">
                  Calculado con dolar blue {exchangeRate ?? 'N/D'}.
                </Text>
              )}
            </Card>
          )}
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
                value={paidAt ? parseLocalDate(paidAt) : new Date()}
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
                value={paidAt ? parseLocalDate(paidAt) : new Date()}
                mode="date"
                display="spinner"
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
