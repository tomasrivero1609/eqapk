import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../../services/eventService';
import { clientService } from '../../services/clientService';
import { dolarService } from '../../services/dolarService';
import { CreateEventDto, Currency } from '../../types';
import Screen from '../../components/ui/Screen';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { formatCurrency } from '../../utils/format';
import DateTimePicker from '@react-native-community/datetimepicker';

const currencyOptions: Currency[] = [Currency.ARS, Currency.USD];

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value?: string) => {
  if (!value) {
    return new Date();
  }
  const [year, month, day] = value.split('-').map((part) => parseInt(part, 10));
  if (!year || !month || !day) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

const formatTimeValue = (date: Date) => {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const parseTimeValue = (time?: string) => {
  if (!time) {
    return new Date();
  }
  const [hours, minutes] = time.split(':').map((value) => parseInt(value, 10));
  const base = new Date();
  base.setHours(Number.isFinite(hours) ? hours : 0);
  base.setMinutes(Number.isFinite(minutes) ? minutes : 0);
  base.setSeconds(0);
  base.setMilliseconds(0);
  return base;
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

export default function CreateEventScreen({ navigation, route }: any) {
  const eventId = route.params?.eventId as string | undefined;
  const selectedClient = route.params?.selectedClient;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const isAnyPickerOpen = showDatePicker || showStartPicker || showEndPicker;
  const pickerStyleProps =
    Platform.OS === 'ios'
      ? { themeVariant: 'dark' as const, textColor: '#E2E8F0', style: { backgroundColor: '#0F172A' } }
      : {};

  const openPicker = (setter: (value: boolean) => void) => {
    if (isAnyPickerOpen) {
      return;
    }
    Keyboard.dismiss();
    setTimeout(() => setter(true), 150);
  };

  const [formData, setFormData] = useState<CreateEventDto>({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    guestCount: 0,
    dishCount: 0,
    pricePerDish: 0,
    adultCount: 0,
    juvenileCount: 0,
    childCount: 0,
    adultPrice: 0,
    juvenilePrice: 0,
    childPrice: 0,
    quarterlyAdjustmentPercent: 0,
    menuDescription: '',
    eventHours: '',
    receptionType: '',
    courseCountAdult: '',
    courseCountJuvenile: '',
    courseCountChild: '',
    islandType: '',
    dessert: '',
    sweetTable: '',
    partyEnd: '',
    specialDishes: '',
    cake: '',
    familyMembers: '',
    hallSetupDescription: '',
    tablecloth: '',
    tableNumbers: '',
    centerpieces: '',
    souvenirs: '',
    bouquet: '',
    candles: '',
    charms: '',
    roses: '',
    cotillon: '',
    photographer: '',
    currency: Currency.ARS,
    notes: '',
    clientId: undefined,
  });

  const queryClient = useQueryClient();
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getById(eventId as string),
    enabled: !!eventId,
  });
  const { data: availability, isLoading: isCheckingAvailability } = useQuery({
    queryKey: ['event-availability', formData.date, eventId],
    queryFn: () => eventService.checkAvailability(formData.date, eventId),
    enabled: Boolean(formData.date),
    staleTime: 60 * 1000,
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll(),
  });

  useEffect(() => {
    if (event) {
      const sectionCount =
        (event.adultCount || 0) +
        (event.juvenileCount || 0) +
        (event.childCount || 0);
      const mapped: CreateEventDto = {
        name: event.name,
        description: event.description || '',
        date: event.date.slice(0, 10),
        startTime: event.startTime,
        endTime: event.endTime || '',
        guestCount: event.guestCount,
        dishCount: event.dishCount,
        pricePerDish: event.pricePerDish,
        adultCount: event.adultCount || 0,
        juvenileCount: event.juvenileCount || 0,
        childCount: event.childCount || 0,
        adultPrice: event.adultPrice || 0,
        juvenilePrice: event.juvenilePrice || 0,
        childPrice: event.childPrice || 0,
        quarterlyAdjustmentPercent: event.quarterlyAdjustmentPercent || 0,
        menuDescription: event.menuDescription || '',
        eventHours: event.eventHours || '',
        receptionType: event.receptionType || '',
        courseCountAdult: event.courseCountAdult || '',
        courseCountJuvenile: event.courseCountJuvenile || '',
        courseCountChild: event.courseCountChild || '',
        islandType: event.islandType || '',
        dessert: event.dessert || '',
        sweetTable: event.sweetTable || '',
        partyEnd: event.partyEnd || '',
        specialDishes: event.specialDishes || '',
        cake: event.cake || '',
        familyMembers: event.familyMembers || '',
        hallSetupDescription: event.hallSetupDescription || '',
        tablecloth: event.tablecloth || '',
        tableNumbers: event.tableNumbers || '',
        centerpieces: event.centerpieces || '',
        souvenirs: event.souvenirs || '',
        bouquet: event.bouquet || '',
        candles: event.candles || '',
        charms: event.charms || '',
        roses: event.roses || '',
        cotillon: event.cotillon || '',
        photographer: event.photographer || '',
        currency: event.currency,
        notes: event.notes || '',
        clientId: event.clientId,
      };
      setFormData(mapped);
    }
  }, [event]);

  useEffect(() => {
    if (selectedClient === null) {
      setFormData((prev) => ({ ...prev, clientId: undefined }));
      return;
    }
    if (selectedClient?.id) {
      setFormData((prev) => ({ ...prev, clientId: selectedClient.id }));
    }
  }, [selectedClient]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const clientLabel = useMemo(() => {
    if (!clients) {
      return 'Cargando clientes...';
    }
    if (!formData.clientId) {
      return 'Sin cliente asignado';
    }
    const client = clients.find((item) => item.id === formData.clientId);
    return client ? client.name : 'Cliente no encontrado';
  }, [formData.clientId, clients]);

  const totalGuests =
    (formData.adultCount || 0) +
    (formData.juvenileCount || 0) +
    (formData.childCount || 0);
  const contractedPlates = formData.dishCount ?? 0;
  const totalAmount =
    (formData.adultCount || 0) * (formData.adultPrice || 0) +
    (formData.juvenileCount || 0) * (formData.juvenilePrice || 0) +
    (formData.childCount || 0) * (formData.childPrice || 0);
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

  const mutation = useMutation({
    mutationFn: (data: CreateEventDto) =>
      eventId ? eventService.update(eventId, data) : eventService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      }
      Alert.alert('Listo', eventId ? 'Evento actualizado' : 'Evento creado', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar el evento');
    },
  });

  const handleSubmit = async () => {
    if (showDatePicker || showStartPicker || showEndPicker) {
      setShowDatePicker(false);
      setShowStartPicker(false);
      setShowEndPicker(false);
    }

    if (!formData.name || !formData.date || !formData.startTime) {
      Alert.alert('Error', 'Completa nombre, fecha y hora de inicio');
      return;
    }

    const parsedDate = parseLocalDate(formData.date);
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert('Error', 'Fecha invalida');
      return;
    }

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(formData.startTime)) {
      Alert.alert('Error', 'Hora de inicio invalida');
      return;
    }
    if (formData.endTime && !timeRegex.test(formData.endTime)) {
      Alert.alert('Error', 'Hora de fin invalida');
      return;
    }
    if (availability?.status === 'ok' && !availability.available) {
      Alert.alert(
        'Fecha no disponible',
        'Ya hay eventos en esa fecha. Elige otra.',
      );
      return;
    }

    if (
      !Number.isFinite(totalGuests) ||
      !Number.isFinite(contractedPlates) ||
      !Number.isFinite(formData.adultPrice) ||
      !Number.isFinite(formData.juvenilePrice) ||
      !Number.isFinite(formData.childPrice)
    ) {
      Alert.alert('Error', 'Revisa los valores numericos');
      return;
    }

    if (contractedPlates <= 0) {
      Alert.alert('Error', 'Completa la cantidad de platos contratados');
      return;
    }

    if (totalGuests > contractedPlates) {
      Alert.alert(
        'Cantidad invalida',
        'La suma de platos adultos, juveniles e infantiles no puede superar los platos contratados.',
      );
      return;
    }

    const payload: CreateEventDto = {
      ...formData,
      guestCount: contractedPlates,
      dishCount: contractedPlates,
      pricePerDish: 0,
      menuDescription: formData.menuDescription?.trim() || undefined,
      eventHours: formData.eventHours?.trim() || undefined,
      receptionType: formData.receptionType?.trim() || undefined,
      courseCountAdult: formData.courseCountAdult?.trim() || undefined,
      courseCountJuvenile: formData.courseCountJuvenile?.trim() || undefined,
      courseCountChild: formData.courseCountChild?.trim() || undefined,
      islandType: formData.islandType?.trim() || undefined,
      dessert: formData.dessert?.trim() || undefined,
      sweetTable: formData.sweetTable?.trim() || undefined,
      partyEnd: formData.partyEnd?.trim() || undefined,
      specialDishes: formData.specialDishes?.trim() || undefined,
      cake: formData.cake?.trim() || undefined,
      familyMembers: formData.familyMembers?.trim() || undefined,
      hallSetupDescription: formData.hallSetupDescription?.trim() || undefined,
      tablecloth: formData.tablecloth?.trim() || undefined,
      tableNumbers: formData.tableNumbers?.trim() || undefined,
      centerpieces: formData.centerpieces?.trim() || undefined,
      souvenirs: formData.souvenirs?.trim() || undefined,
      bouquet: formData.bouquet?.trim() || undefined,
      candles: formData.candles?.trim() || undefined,
      charms: formData.charms?.trim() || undefined,
      roses: formData.roses?.trim() || undefined,
      cotillon: formData.cotillon?.trim() || undefined,
      photographer: formData.photographer?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      endTime: formData.endTime?.trim() || undefined,
      clientId: formData.clientId || undefined,
    };

    try {
      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error('Create event error', error);
    }
  };

  return (
    <Screen>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerClassName="pb-40"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-slate-100">
            {eventId ? 'Editar evento' : 'Nuevo evento'}
          </Text>
          <Text className="mt-2 text-sm text-slate-400">
            Registra la informacion clave del evento y sus pagos.
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
            label="Nombre del evento"
            placeholder="Ej: Boda de Ana y Luis"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Input
            label="Descripcion"
            placeholder="Describe el evento"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />

          <Input
            label="Familiares"
            placeholder="Padres y hermanos"
            value={formData.familyMembers}
            onChangeText={(text) => setFormData({ ...formData, familyMembers: text })}
          />

          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-slate-300">Cliente</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SelectClient')}
            >
              <Text className="text-sm font-semibold text-violet-300">Cambiar</Text>
            </TouchableOpacity>
          </View>
          <Card>
            <Text className="text-base font-semibold text-slate-100">{clientLabel}</Text>
            <Text className="mt-1 text-xs text-slate-400">
              Asigna un cliente o deja sin cliente.
            </Text>
          </Card>

          <View className="space-y-2">
            <Text className="text-sm font-semibold text-slate-300">Fecha</Text>
            <TouchableOpacity
              onPress={() => {
                if (!isKeyboardVisible) {
                  openPicker(setShowDatePicker);
                }
              }}
              disabled={isAnyPickerOpen || isKeyboardVisible}
              className={`rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 ${
                isAnyPickerOpen || isKeyboardVisible ? 'opacity-60' : ''
              }`}
            >
              <Text className="text-base text-slate-100">
                {formData.date ? formData.date : 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>
            {formData.date && (
              <View className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                {isCheckingAvailability ? (
                  <Text className="text-xs text-slate-400">
                    Verificando disponibilidad...
                  </Text>
                ) : availability?.status === 'ok' ? (
                  <Text
                    className={`text-xs font-semibold ${
                      availability.available
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {availability.available
                      ? 'Fecha disponible'
                      : 'Fecha ocupada'}
                  </Text>
                ) : (
                  <Text className="text-xs text-slate-400">
                    No se pudo verificar disponibilidad.
                  </Text>
                )}
              </View>
            )}
          </View>
          {Platform.OS === 'ios' && showDatePicker && (
            <Card>
              <DateTimePicker
                value={parseLocalDate(formData.date)}
                mode="date"
                display="inline"
                {...pickerStyleProps}
                onChange={(event, selectedDate) => {
                  if (event.type === 'set' && selectedDate) {
                    setFormData((prev) => ({
                      ...prev,
                      date: formatDateValue(selectedDate),
                    }));
                  }
                }}
              />
              <View className="mt-2">
                <Button label="Listo" onPress={() => setShowDatePicker(false)} />
              </View>
            </Card>
          )}

          <View className="flex-row gap-4">
            <View className="flex-1 space-y-2">
              <Text className="text-sm font-semibold text-slate-300">Hora inicio</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!isKeyboardVisible) {
                    openPicker(setShowStartPicker);
                  }
                }}
                disabled={isAnyPickerOpen || isKeyboardVisible}
                className={`rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 ${
                  isAnyPickerOpen || isKeyboardVisible ? 'opacity-60' : ''
                }`}
              >
                <Text className="text-base text-slate-100">
                  {formData.startTime ? formData.startTime : 'Seleccionar'}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1 space-y-2">
              <Text className="text-sm font-semibold text-slate-300">Hora fin</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!isKeyboardVisible) {
                    openPicker(setShowEndPicker);
                  }
                }}
                disabled={isAnyPickerOpen || isKeyboardVisible}
                className={`rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 ${
                  isAnyPickerOpen || isKeyboardVisible ? 'opacity-60' : ''
                }`}
              >
                <Text className="text-base text-slate-100">
                  {formData.endTime ? formData.endTime : 'Opcional'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {Platform.OS === 'ios' && showStartPicker && (
            <Card>
              <DateTimePicker
                value={parseTimeValue(formData.startTime)}
                mode="time"
                display="spinner"
                {...pickerStyleProps}
                onChange={(event, selectedDate) => {
                  if (event.type === 'set' && selectedDate) {
                    setFormData((prev) => ({
                      ...prev,
                      startTime: formatTimeValue(selectedDate),
                    }));
                  }
                }}
              />
              <View className="mt-2">
                <Button label="Listo" onPress={() => setShowStartPicker(false)} />
              </View>
            </Card>
          )}
          {Platform.OS === 'ios' && showEndPicker && (
            <Card>
              <DateTimePicker
                value={parseTimeValue(formData.endTime || formData.startTime)}
                mode="time"
                display="spinner"
                {...pickerStyleProps}
                onChange={(event, selectedDate) => {
                  if (event.type === 'set' && selectedDate) {
                    setFormData((prev) => ({
                      ...prev,
                      endTime: formatTimeValue(selectedDate),
                    }));
                  }
                }}
              />
              <View className="mt-2">
                <Button label="Listo" onPress={() => setShowEndPicker(false)} />
              </View>
            </Card>
          )}

          <View className="space-y-4">
            <Input
              label="Platos contratados"
              placeholder="100"
              keyboardType="number-pad"
              value={formData.dishCount?.toString() || '0'}
              onChangeText={(text) => {
                const nextValue = Math.max(0, parseInt(normalizeIntInput(text) || '0', 10));
                setFormData((prev) => ({
                  ...prev,
                  dishCount: nextValue,
                  adultCount: Math.min(prev.adultCount || 0, nextValue),
                  juvenileCount: Math.min(prev.juvenileCount || 0, nextValue),
                  childCount: Math.min(prev.childCount || 0, nextValue),
                }));
              }}
            />
            {totalGuests > contractedPlates && contractedPlates > 0 && (
              <Text className="text-xs font-semibold text-rose-400">
                La suma de platos no puede superar los contratados.
              </Text>
            )}
            <Text className="text-sm font-semibold text-slate-300">
              Platos por seccion
            </Text>
            <Card>
              <Text className="text-sm font-semibold text-slate-100">Adultos</Text>
              <View className="mt-3 flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Cantidad"
                    placeholder="50"
                    keyboardType="number-pad"
                    value={formData.adultCount?.toString() || '0'}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        adultCount: Math.max(0, parseInt(normalizeIntInput(text) || '0', 10)),
                      }))
                    }
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Precio"
                    placeholder="450"
                    keyboardType="decimal-pad"
                    value={formData.adultPrice?.toString() || '0'}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        adultPrice: text ? parseFloat(normalizeDecimalInput(text)) : 0,
                      }))
                    }
                  />
                </View>
              </View>
            </Card>
            <Card>
              <Text className="text-sm font-semibold text-slate-100">Juveniles</Text>
              <View className="mt-3 flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Cantidad"
                    placeholder="25"
                    keyboardType="number-pad"
                    value={formData.juvenileCount?.toString() || '0'}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        juvenileCount: Math.max(0, parseInt(normalizeIntInput(text) || '0', 10)),
                      }))
                    }
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Precio"
                    placeholder="350"
                    keyboardType="decimal-pad"
                    value={formData.juvenilePrice?.toString() || '0'}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        juvenilePrice: text ? parseFloat(normalizeDecimalInput(text)) : 0,
                      }))
                    }
                  />
                </View>
              </View>
            </Card>
            <Card>
              <Text className="text-sm font-semibold text-slate-100">Infantiles</Text>
              <View className="mt-3 flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Cantidad"
                    placeholder="25"
                    keyboardType="number-pad"
                    value={formData.childCount?.toString() || '0'}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        childCount: Math.max(0, parseInt(normalizeIntInput(text) || '0', 10)),
                      }))
                    }
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Precio"
                    placeholder="250"
                    keyboardType="decimal-pad"
                    value={formData.childPrice?.toString() || '0'}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        childPrice: text ? parseFloat(normalizeDecimalInput(text)) : 0,
                      }))
                    }
                  />
                </View>
              </View>
            </Card>
          </View>

          <Card>
            <Text className="text-sm font-semibold text-slate-400">
              Platos asignados
            </Text>
            <Text className="mt-1 text-xl font-bold text-slate-100">
              {totalGuests} / {contractedPlates}
            </Text>
          </Card>

          <View className="space-y-2">
            <Text className="text-sm font-semibold text-slate-300 mb-2">
              Moneda
            </Text>
            <View className="flex-row gap-2">
              {currencyOptions.map((currency) => (
                <TouchableOpacity
                  key={currency}
                  onPress={() => setFormData({ ...formData, currency })}
                  className={`flex-1 rounded-2xl border px-3 py-4 ${
                    formData.currency === currency
                      ? 'border-violet-400 bg-violet-500/20'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  <Text
                    className={`text-center text-sm font-semibold ${
                      formData.currency === currency
                        ? 'text-violet-200'
                        : 'text-slate-300'
                    }`}
                  >
                    {currency === Currency.ARS ? 'ARS' : 'USD'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Card>
            <Text className="text-sm font-semibold text-slate-400">Total</Text>
            <Text className="mt-1 text-xl font-bold text-slate-100">
              {formatCurrency(totalAmount, formData.currency || 'ARS')}
            </Text>
          </Card>

          <Card>
            <Text className="text-sm font-semibold text-slate-300">
              Ajuste trimestral
            </Text>
            <Text className="mt-1 text-xs text-slate-400">
              Se aplica cada 3 meses sobre los platos restantes.
            </Text>
            <View className="mt-3">
              <Input
                label="Porcentaje (%)"
                placeholder="3"
                value={formData.quarterlyAdjustmentPercent?.toString() || '0'}
                keyboardType="decimal-pad"
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    quarterlyAdjustmentPercent: text
                      ? parseFloat(normalizeDecimalInput(text))
                      : 0,
                  }))
                }
              />
            </View>
          </Card>

          <Input
            label="Notas"
            placeholder="Notas adicionales"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
          />
        </View>

        <View className="mt-6 px-6">
          <Button
            label={eventId ? 'Guardar cambios' : 'Crear evento'}
            onPress={handleSubmit}
            loading={mutation.isPending}
          />
        </View>
        {Platform.OS !== 'ios' && (
          <Modal visible={showDatePicker} transparent animationType="fade">
          <View className="flex-1 items-center justify-center bg-black/60 px-6">
            <View className="w-full rounded-3xl bg-slate-900 p-4">
              <Text className="text-base font-semibold text-slate-100">
                Seleccionar fecha
              </Text>
              <DateTimePicker
                value={parseLocalDate(formData.date)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                {...pickerStyleProps}
                onChange={(event, selectedDate) => {
                  if (Platform.OS !== 'ios') {
                    setShowDatePicker(false);
                  }
                  if (event.type === 'set' && selectedDate) {
                    setFormData((prev) => ({
                      ...prev,
                      date: formatDateValue(selectedDate),
                    }));
                  }
                }}
              />
              <View className="mt-4">
                <Button label="Listo" onPress={() => setShowDatePicker(false)} />
              </View>
            </View>
          </View>
        </Modal>
        )}
        {Platform.OS !== 'ios' && (
          <Modal visible={showStartPicker} transparent animationType="fade">
          <View className="flex-1 items-center justify-center bg-black/60 px-6">
            <View className="w-full rounded-3xl bg-slate-900 p-4">
              <Text className="text-base font-semibold text-slate-100">
                Hora de inicio
              </Text>
              <DateTimePicker
                value={parseTimeValue(formData.startTime)}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                {...pickerStyleProps}
                onChange={(event, selectedDate) => {
                  if (Platform.OS !== 'ios') {
                    setShowStartPicker(false);
                  }
                  if (event.type === 'set' && selectedDate) {
                    setFormData((prev) => ({
                      ...prev,
                      startTime: formatTimeValue(selectedDate),
                    }));
                  }
                }}
              />
              <View className="mt-4">
                <Button label="Listo" onPress={() => setShowStartPicker(false)} />
              </View>
            </View>
          </View>
        </Modal>
        )}
        {Platform.OS !== 'ios' && (
          <Modal visible={showEndPicker} transparent animationType="fade">
          <View className="flex-1 items-center justify-center bg-black/60 px-6">
            <View className="w-full rounded-3xl bg-slate-900 p-4">
              <Text className="text-base font-semibold text-slate-100">
                Hora de fin
              </Text>
              <DateTimePicker
                value={parseTimeValue(formData.endTime || formData.startTime)}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                {...pickerStyleProps}
                onChange={(event, selectedDate) => {
                  if (Platform.OS !== 'ios') {
                    setShowEndPicker(false);
                  }
                  if (event.type === 'set' && selectedDate) {
                    setFormData((prev) => ({
                      ...prev,
                      endTime: formatTimeValue(selectedDate),
                    }));
                  }
                }}
              />
              <View className="mt-4">
                <Button label="Listo" onPress={() => setShowEndPicker(false)} />
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
