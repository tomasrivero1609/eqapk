import React, { useEffect, useState } from 'react';
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
import { formatErrorForAlert } from '../../utils/errorMessage';
import { CreateEventDto, EventType } from '../../types';
import Screen from '../../components/ui/Screen';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DateTimePicker from '@react-native-community/datetimepicker';

const formatDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value?: string) => {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map((part) => parseInt(part, 10));
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
};

const formatTimeValue = (date: Date) => {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const parseTimeValue = (time?: string) => {
  if (!time) return new Date();
  const [hours, minutes] = time.split(':').map((v) => parseInt(v, 10));
  const base = new Date();
  base.setHours(Number.isFinite(hours) ? hours : 0);
  base.setMinutes(Number.isFinite(minutes) ? minutes : 0);
  base.setSeconds(0);
  base.setMilliseconds(0);
  return base;
};

interface FormData {
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  attendeeEmail: string;
  location: string;
  notes: string;
}

export default function CreateVisitScreen({ navigation }: any) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const isAnyPickerOpen = showDatePicker || showStartPicker || showEndPicker;
  const pickerStyleProps =
    Platform.OS === 'ios'
      ? { themeVariant: 'dark' as const, textColor: '#E2E8F0', style: { backgroundColor: '#0F172A' } }
      : {};

  const openPicker = (setter: (v: boolean) => void) => {
    if (isAnyPickerOpen) return;
    Keyboard.dismiss();
    setTimeout(() => setter(true), 150);
  };

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    attendeeEmail: '',
    location: '',
    notes: '',
  });

  const queryClient = useQueryClient();
  const { data: availability, isLoading: isCheckingAvailability } = useQuery({
    queryKey: ['event-availability', formData.date, undefined, EventType.VISITA],
    queryFn: () => eventService.checkAvailability(formData.date, undefined, EventType.VISITA),
    enabled: Boolean(formData.date),
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const mutation = useMutation({
    mutationFn: (data: CreateEventDto) => eventService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert('Listo', 'Entrevista registrada', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        formatErrorForAlert(error, 'Error al registrar la entrevista'),
      );
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
        'Fecha con eventos',
        `Ya hay ${availability.busyCount || 1} evento(s) en esa fecha. ¿Deseas continuar de todas formas?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => saveVisit() },
        ],
      );
      return;
    }

    saveVisit();
  };

  const saveVisit = async () => {
    const payload: CreateEventDto = {
      name: formData.name,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime?.trim() || undefined,
      guestCount: 0,
      eventType: EventType.VISITA,
      attendeeEmail: formData.attendeeEmail?.trim() || undefined,
      location: formData.location?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    try {
      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error('Create visit error', error);
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
          <Text className="text-2xl font-bold text-slate-100">Nueva entrevista</Text>
          <Text className="mt-2 text-sm text-slate-400">
            Registra una entrevista con un cliente potencial.
          </Text>
        </View>

        <View className="mt-6 px-6 space-y-4">
          <Input
            label="Nombre / Motivo"
            placeholder="Ej: Entrevista con los Rodriguez"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Input
            label="Descripcion"
            placeholder="Detalle de la entrevista"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />

          <View className="space-y-2">
            <Text className="text-sm font-semibold text-slate-300">Fecha</Text>
            <TouchableOpacity
              onPress={() => { if (!isKeyboardVisible) openPicker(setShowDatePicker); }}
              disabled={isAnyPickerOpen || isKeyboardVisible}
              className={`rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 ${isAnyPickerOpen || isKeyboardVisible ? 'opacity-60' : ''}`}
            >
              <Text className="text-base text-slate-100">
                {formData.date ? formData.date : 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>
            {formData.date && (
              <View className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                {isCheckingAvailability ? (
                  <Text className="text-xs text-slate-400">Verificando disponibilidad...</Text>
                ) : availability?.status === 'ok' ? (
                  <Text className={`text-xs font-semibold ${availability.available ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {availability.available ? 'Fecha disponible' : `Esta fecha tiene ${availability.busyCount || 1} evento(s)`}
                  </Text>
                ) : availability?.status === 'disabled' ? (
                  <Text className="text-xs text-slate-400">Calendario no configurado. Se creará sin verificar.</Text>
                ) : (
                  <Text className="text-xs text-amber-400">No se pudo verificar disponibilidad. Se creará de todas formas.</Text>
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
                    setFormData((prev) => ({ ...prev, date: formatDateValue(selectedDate) }));
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
                onPress={() => { if (!isKeyboardVisible) openPicker(setShowStartPicker); }}
                disabled={isAnyPickerOpen || isKeyboardVisible}
                className={`rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 ${isAnyPickerOpen || isKeyboardVisible ? 'opacity-60' : ''}`}
              >
                <Text className="text-base text-slate-100">
                  {formData.startTime ? formData.startTime : 'Seleccionar'}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1 space-y-2">
              <Text className="text-sm font-semibold text-slate-300">Hora fin</Text>
              <TouchableOpacity
                onPress={() => { if (!isKeyboardVisible) openPicker(setShowEndPicker); }}
                disabled={isAnyPickerOpen || isKeyboardVisible}
                className={`rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 ${isAnyPickerOpen || isKeyboardVisible ? 'opacity-60' : ''}`}
              >
                <Text className="text-base text-slate-100">
                  {formData.endTime ? formData.endTime : 'Opcional'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {Platform.OS === 'ios' && showStartPicker && (
            <Card>
              <DateTimePicker value={parseTimeValue(formData.startTime)} mode="time" display="spinner" {...pickerStyleProps}
                onChange={(event, selectedDate) => { if (event.type === 'set' && selectedDate) setFormData((prev) => ({ ...prev, startTime: formatTimeValue(selectedDate) })); }}
              />
              <View className="mt-2"><Button label="Listo" onPress={() => setShowStartPicker(false)} /></View>
            </Card>
          )}
          {Platform.OS === 'ios' && showEndPicker && (
            <Card>
              <DateTimePicker value={parseTimeValue(formData.endTime || formData.startTime)} mode="time" display="spinner" {...pickerStyleProps}
                onChange={(event, selectedDate) => { if (event.type === 'set' && selectedDate) setFormData((prev) => ({ ...prev, endTime: formatTimeValue(selectedDate) })); }}
              />
              <View className="mt-2"><Button label="Listo" onPress={() => setShowEndPicker(false)} /></View>
            </Card>
          )}

          <Input
            label="Email del entrevistado (opcional)"
            placeholder="ejemplo@mail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.attendeeEmail}
            onChangeText={(text) => setFormData({ ...formData, attendeeEmail: text })}
          />

          <Input
            label="Dirección / Ubicación (opcional)"
            placeholder="Ej: Av. Rivadavia 1234, Quilmes"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />

          <Input
            label="Notas"
            placeholder="Notas adicionales"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
          />
        </View>

        <View className="mt-6 px-6">
          <Button
            label="Registrar entrevista"
            onPress={handleSubmit}
            loading={mutation.isPending}
          />
        </View>

        {Platform.OS !== 'ios' && (
          <Modal visible={showDatePicker} transparent animationType="fade">
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
              <View className="w-full rounded-3xl bg-slate-900 p-4">
                <Text className="text-base font-semibold text-slate-100">Seleccionar fecha</Text>
                <DateTimePicker value={parseLocalDate(formData.date)} mode="date" display="default" {...pickerStyleProps}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && selectedDate) setFormData((prev) => ({ ...prev, date: formatDateValue(selectedDate) }));
                  }}
                />
                <View className="mt-4"><Button label="Listo" onPress={() => setShowDatePicker(false)} /></View>
              </View>
            </View>
          </Modal>
        )}
        {Platform.OS !== 'ios' && (
          <Modal visible={showStartPicker} transparent animationType="fade">
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
              <View className="w-full rounded-3xl bg-slate-900 p-4">
                <Text className="text-base font-semibold text-slate-100">Hora de inicio</Text>
                <DateTimePicker value={parseTimeValue(formData.startTime)} mode="time" display="default" {...pickerStyleProps}
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(false);
                    if (event.type === 'set' && selectedDate) setFormData((prev) => ({ ...prev, startTime: formatTimeValue(selectedDate) }));
                  }}
                />
                <View className="mt-4"><Button label="Listo" onPress={() => setShowStartPicker(false)} /></View>
              </View>
            </View>
          </Modal>
        )}
        {Platform.OS !== 'ios' && (
          <Modal visible={showEndPicker} transparent animationType="fade">
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
              <View className="w-full rounded-3xl bg-slate-900 p-4">
                <Text className="text-base font-semibold text-slate-100">Hora de fin</Text>
                <DateTimePicker value={parseTimeValue(formData.endTime || formData.startTime)} mode="time" display="default" {...pickerStyleProps}
                  onChange={(event, selectedDate) => {
                    setShowEndPicker(false);
                    if (event.type === 'set' && selectedDate) setFormData((prev) => ({ ...prev, endTime: formatTimeValue(selectedDate) }));
                  }}
                />
                <View className="mt-4"><Button label="Listo" onPress={() => setShowEndPicker(false)} /></View>
              </View>
            </View>
          </Modal>
        )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </Screen>
  );
}
