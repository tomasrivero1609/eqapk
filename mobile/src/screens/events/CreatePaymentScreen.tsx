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
import { formatErrorForAlert } from '../../utils/errorMessage';

const paymentMethods = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'];

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split('-').map((part) => parseInt(part, 10));
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

const normalizeDecimalInput = (value: string) => {
  const hasComma = value.includes(',');
  let cleaned: string;
  if (hasComma) {
    cleaned = value
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^0-9.]/g, '');
  } else {
    cleaned = value.replace(/[^0-9.]/g, '');
  }
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

  const [customRate, setCustomRate] = useState('');

  const [discountEnabled, setDiscountEnabled] = useState(false);

  const [showComplement, setShowComplement] = useState(false);
  const [complementAmount, setComplementAmount] = useState('0');
  const [complementCurrency, setComplementCurrency] = useState<Currency>(currency);
  const [complementMethod, setComplementMethod] = useState(paymentMethods[1]);
  const [complementNotes, setComplementNotes] = useState('');
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
  const blueRate = dolarBlue?.venta;
  const parsedCustomRate = parseFloat(customRate) || 0;
  const exchangeRate = parsedCustomRate > 0 ? parsedCustomRate : blueRate;
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
  const isFirstPayment = (event?.payments || []).length === 0;
  const coversAllPlates = useMemo(() => {
    return (
      parsedAdultCovered === sectionData.adultCount &&
      parsedJuvenileCovered === sectionData.juvenileCount &&
      parsedChildCovered === sectionData.childCount &&
      (parsedAdultCovered + parsedJuvenileCovered + parsedChildCovered) > 0
    );
  }, [parsedAdultCovered, parsedJuvenileCovered, parsedChildCovered, sectionData]);
  const canApplyDiscount = isFirstPayment && coversAllPlates;
  const discountMultiplier = canApplyDiscount && discountEnabled ? 0.9 : 1;

  const coveredCostEventCurrencyRaw = useMemo(() => {
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
  const coveredCostEventCurrency = coveredCostEventCurrencyRaw * discountMultiplier;
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
      parsedAdultCovered * sectionData.adultPrice * discountMultiplier,
      event?.currency || currency,
      paymentCurrency,
      exchangeRate,
    );
  }, [parsedAdultCovered, sectionData.adultPrice, discountMultiplier, event, currency, paymentCurrency, exchangeRate]);
  const juvenileCostPaymentCurrency = useMemo(() => {
    return convertAmount(
      parsedJuvenileCovered * sectionData.juvenilePrice * discountMultiplier,
      event?.currency || currency,
      paymentCurrency,
      exchangeRate,
    );
  }, [parsedJuvenileCovered, sectionData.juvenilePrice, discountMultiplier, event, currency, paymentCurrency, exchangeRate]);
  const childCostPaymentCurrency = useMemo(() => {
    return convertAmount(
      parsedChildCovered * sectionData.childPrice * discountMultiplier,
      event?.currency || currency,
      paymentCurrency,
      exchangeRate,
    );
  }, [parsedChildCovered, sectionData.childPrice, discountMultiplier, event, currency, paymentCurrency, exchangeRate]);
  const paymentRemaining = useMemo(() => {
    return parsedAmount - coveredCostPaymentCurrency;
  }, [parsedAmount, coveredCostPaymentCurrency]);
  const shortfallEventCurrency = useMemo(() => {
    if (paymentRemaining >= -0.01) return 0;
    return Math.abs(
      convertAmount(
        paymentRemaining,
        paymentCurrency,
        event?.currency || currency,
        exchangeRate,
      ),
    );
  }, [paymentRemaining, paymentCurrency, event, currency, exchangeRate]);
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

  const existingDiscount = useMemo(() => {
    if (!event) return 0;
    return (event.payments || []).reduce((sum: number, p: any) => {
      if (!p.discountPercent || p.discountPercent <= 0) return sum;
      const adult = p.adultCovered || 0;
      const juvenile = p.juvenileCovered || 0;
      const child = p.childCovered || 0;
      const ap = p.adultPriceAtPayment ?? sectionData.adultPrice;
      const jp = p.juvenilePriceAtPayment ?? sectionData.juvenilePrice;
      const cp = p.childPriceAtPayment ?? sectionData.childPrice;
      return sum + (adult * ap + juvenile * jp + child * cp) * (p.discountPercent / 100);
    }, 0);
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
      remainingChild * sectionData.childPrice -
      existingDiscount
    );
  }, [event, coveredTotals, sectionData, existingDiscount]);
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
  const parsedComplementAmount = parseFloat(complementAmount) || 0;
  const complementInEventCurrency = useMemo(() => {
    return convertAmount(
      parsedComplementAmount,
      complementCurrency,
      event?.currency || currency,
      exchangeRate,
    );
  }, [parsedComplementAmount, complementCurrency, event, currency, exchangeRate]);

  const mutation = useMutation({
    mutationFn: () => {
      const compExchangeDate =
        complementCurrency !== currency && exchangeRate
          ? (paidAt ? new Date(paidAt).toISOString() : new Date().toISOString())
          : undefined;
      const complementPayload =
        showComplement && parsedComplementAmount > 0
          ? {
              amount: parsedComplementAmount,
              currency: complementCurrency,
              exchangeRate:
                complementCurrency !== currency && exchangeRate
                  ? exchangeRate
                  : undefined,
              exchangeRateDate: compExchangeDate,
              method: complementMethod,
              notes: complementNotes || 'Complemento de pago',
            }
          : undefined;

      return paymentService.create({
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
        discountPercent: canApplyDiscount && discountEnabled ? 10 : undefined,
        complement: complementPayload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      const msg = showComplement && parsedComplementAmount > 0
        ? 'Pago compuesto registrado'
        : 'Pago registrado';
      Alert.alert('Listo', msg, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', formatErrorForAlert(error, 'Error al registrar pago'));
    },
  });

  const handleSubmit = () => {
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto valido');
      return;
    }
    if (showComplement && parsedComplementAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto valido para el complemento');
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
        const isCrossCurrency =
          paymentCurrency !== event.currency ||
          (showComplement && complementCurrency !== event.currency);
        const plateTolerance = isCrossCurrency ? 1 : 0.01;

        const totalPaymentInEventCurrency =
          newPaymentInEventCurrency +
          (showComplement ? complementInEventCurrency : 0);
        const effectiveRemaining =
          totalPaymentInEventCurrency - coveredCostEventCurrency;

        if (effectiveRemaining > plateTolerance) {
          Alert.alert(
            'Saldo sobrante',
            `El pago excede el costo de los platos cargados. Sobran ${formatCurrency(
              effectiveRemaining,
              event.currency,
            )}.`,
          );
          return;
        }
        if (effectiveRemaining < -plateTolerance) {
          Alert.alert(
            'Saldo pendiente',
            `El pago no alcanza para cubrir los platos cargados. Falta ${formatCurrency(
              Math.abs(effectiveRemaining),
              event.currency,
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
        const compInEvent = showComplement ? complementInEventCurrency : 0;
        const totalAfter =
          totalPaidInEventCurrency + newPaymentInEventCurrency + compInEvent;
        const currentDiscount =
          canApplyDiscount && discountEnabled
            ? coveredCostEventCurrencyRaw * 0.1
            : 0;
        const effectiveTotalDue = totalDue - currentDiscount;
        const hasCrossPayments =
          paymentCurrency !== event.currency ||
          (showComplement && complementCurrency !== event.currency) ||
          (event.payments || []).some(
            (p: any) => p.currency !== event.currency,
          );
        const exceedTolerance = hasCrossPayments
          ? Math.max(1, effectiveTotalDue * 0.001)
          : 0.01;
        if (totalAfter > effectiveTotalDue + exceedTolerance) {
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
          {paymentCurrency !== currency && (
            <Card>
              <Text className="text-xs font-semibold text-slate-400">
                Dolar pactado
              </Text>
              <Text className="mt-1 text-xs text-slate-500">
                Si acordaron un tipo de cambio distinto al blue, ingresalo aca.
              </Text>
              <View className="mt-2">
                <Input
                  label="Tipo de cambio"
                  placeholder={blueRate ? String(blueRate) : '1415'}
                  value={customRate}
                  onChangeText={(text) => setCustomRate(normalizeDecimalInput(text))}
                  keyboardType="decimal-pad"
                />
              </View>
              {parsedCustomRate > 0 && (
                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-xs text-emerald-300">
                    Usando ${parsedCustomRate} pactado
                  </Text>
                  <TouchableOpacity onPress={() => setCustomRate('')}>
                    <Text className="text-xs text-slate-500">Usar blue</Text>
                  </TouchableOpacity>
                </View>
              )}
              {parsedCustomRate === 0 && blueRate && (
                <Text className="mt-2 text-xs text-slate-500">
                  Usando blue automatico: ${blueRate}
                </Text>
              )}
            </Card>
          )}
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
          {canApplyDiscount && (
            <Card className="border-emerald-500/30">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-emerald-300">
                    Descuento 10% por pago total
                  </Text>
                  <Text className="mt-1 text-xs text-slate-400">
                    Primer pago cubriendo todos los platos
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setDiscountEnabled(!discountEnabled)}
                  className={`rounded-full border px-4 py-2 ${
                    discountEnabled
                      ? 'border-emerald-400 bg-emerald-500/20'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      discountEnabled ? 'text-emerald-300' : 'text-slate-400'
                    }`}
                  >
                    {discountEnabled ? 'Aplicado' : 'Aplicar'}
                  </Text>
                </TouchableOpacity>
              </View>
              {discountEnabled && (
                <View className="mt-3 rounded-xl bg-emerald-500/10 px-3 py-2">
                  <Text className="text-xs text-slate-400">
                    Total sin descuento: {formatCurrency(
                      convertAmount(coveredCostEventCurrencyRaw, event?.currency || currency, paymentCurrency, exchangeRate),
                      paymentCurrency,
                    )}
                  </Text>
                  <Text className="text-sm font-semibold text-emerald-200">
                    Total con 10% off: {formatCurrency(coveredCostPaymentCurrency, paymentCurrency)}
                  </Text>
                  <Text className="text-xs text-emerald-400">
                    Ahorro: {formatCurrency(
                      convertAmount(coveredCostEventCurrencyRaw * 0.1, event?.currency || currency, paymentCurrency, exchangeRate),
                      paymentCurrency,
                    )}
                  </Text>
                </View>
              )}
            </Card>
          )}
          {(parsedAdultCovered > 0 ||
            parsedJuvenileCovered > 0 ||
            parsedChildCovered > 0) && (
            <Card>
              <Text className="text-xs font-semibold text-slate-400">
                Costo de platos ({paymentCurrency}){discountEnabled ? ' — con 10% dto.' : ''}
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
                  Calculado con {parsedCustomRate > 0 ? `dolar pactado ${parsedCustomRate}` : `dolar blue ${blueRate ?? 'N/D'}`}.
                </Text>
              )}
              {paymentRemaining < -1 && !showComplement && (
                <TouchableOpacity
                  onPress={() => {
                    setShowComplement(true);
                    const otherCurrency =
                      paymentCurrency === Currency.USD ? Currency.ARS : Currency.USD;
                    setComplementCurrency(otherCurrency);
                    const shortfall = Math.abs(paymentRemaining);
                    const inOther = convertAmount(
                      shortfall,
                      paymentCurrency,
                      otherCurrency,
                      exchangeRate,
                    );
                    setComplementAmount(String(Math.ceil(inOther * 100) / 100));
                  }}
                  className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
                >
                  <Text className="text-center text-sm font-semibold text-amber-300">
                    + Agregar complemento en {paymentCurrency === Currency.USD ? 'ARS' : 'USD'}
                  </Text>
                  <Text className="mt-1 text-center text-xs text-amber-400/70">
                    Faltante: {formatCurrency(shortfallEventCurrency, event?.currency || currency)}
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          )}
          {showComplement && (
            <Card>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-amber-300">
                  Pago complementario
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowComplement(false);
                    setComplementAmount('0');
                  }}
                >
                  <Text className="text-xs text-rose-400">Quitar</Text>
                </TouchableOpacity>
              </View>
              <View className="mt-3">
                <Input
                  label={`Monto (${complementCurrency})`}
                  placeholder="0.00"
                  value={complementAmount}
                  onChangeText={(text) => setComplementAmount(normalizeDecimalInput(text))}
                  keyboardType="decimal-pad"
                />
              </View>
              <View className="mt-3">
                <Text className="text-xs font-semibold text-slate-400 mb-2">
                  Moneda del complemento
                </Text>
                <View className="flex-row gap-2">
                  {[Currency.ARS, Currency.USD].map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setComplementCurrency(item)}
                      className={`flex-1 rounded-xl border px-3 py-3 ${
                        complementCurrency === item
                          ? 'border-amber-400 bg-amber-500/20'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      <Text
                        className={`text-center text-xs font-semibold ${
                          complementCurrency === item ? 'text-amber-200' : 'text-slate-300'
                        }`}
                      >
                        {item === Currency.ARS ? 'ARS' : 'USD'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="mt-3">
                <Text className="text-xs font-semibold text-slate-400 mb-2">
                  Metodo del complemento
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {paymentMethods.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setComplementMethod(item)}
                      className={`rounded-full border px-3 py-2 ${
                        complementMethod === item
                          ? 'border-amber-400 bg-amber-500/20'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          complementMethod === item ? 'text-amber-200' : 'text-slate-300'
                        }`}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Input
                label="Notas del complemento"
                placeholder="Detalle del complemento"
                value={complementNotes}
                onChangeText={setComplementNotes}
              />
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
                  <>
                    <Text className="mt-1 text-sm text-slate-100">
                      {formatCurrency(
                        Number.isFinite(convertedAmount) ? convertedAmount : 0,
                        currency,
                      )}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-500">
                      TC: {parsedCustomRate > 0 ? `$${parsedCustomRate} pactado` : `$${blueRate} blue`}
                    </Text>
                  </>
                ) : (
                  <Text className="mt-1 text-xs text-slate-500">
                    Sin tipo de cambio disponible.
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
            label={showComplement ? 'Guardar pago compuesto' : 'Guardar pago'}
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
