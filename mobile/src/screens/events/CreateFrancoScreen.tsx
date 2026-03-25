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

interface FormData {
  name: string;
  description: string;
  date: string;
  notes: string;
}

export default function CreateFrancoScreen({ navigation }: any) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const pickerStyleProps =
    Platform.OS === 'ios'
      ? { themeVariant: 'dark' as const, textColor: '#E2E8F0', style: { backgroundColor: '#0F172A' } }
      : {};

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    date: '',
    notes: '',
  });

  const queryClient = useQueryClient();
  const { data: availability, isLoading: isCheckingAvailability } = useQuery({
    queryKey: ['event-availability', formData.date, undefined, EventType.FRANCO],
    queryFn: () => eventService.checkAvailability(formData.date, undefined, EventType.FRANCO),
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
      Alert.alert('Listo', 'Franco registrado', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar el franco');
    },
  });

  const handleSubmit = async () => {
    if (showDatePicker) setShowDatePicker(false);

    if (!formData.name || !formData.date) {
      Alert.alert('Error', 'Completa el motivo y la fecha');
      return;
    }

    const parsedDate = parseLocalDate(formData.date);
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert('Error', 'Fecha invalida');
      return;
    }

    if (availability?.status === 'ok' && !availability.available) {
      Alert.alert(
        'Fecha con eventos',
        `Ya hay ${availability.busyCount || 1} evento(s) en esa fecha. ¿Deseas continuar de todas formas?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => saveFranco() },
        ],
      );
      return;
    }

    saveFranco();
  };

  const saveFranco = async () => {
    const payload: CreateEventDto = {
      name: formData.name,
      date: formData.date,
      startTime: '00:00',
      guestCount: 0,
      eventType: EventType.FRANCO,
      description: formData.description?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    try {
      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error('Create franco error', error);
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
          <Text className="text-2xl font-bold text-slate-100">Nuevo franco</Text>
          <Text className="mt-2 text-sm text-slate-400">
            Registra un franco o dia libre.
          </Text>
        </View>

        <View className="mt-6 px-6 space-y-4">
          <Input
            label="Motivo"
            placeholder="Ej: Franco personal, Feriado"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Input
            label="Descripcion"
            placeholder="Detalle opcional"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />

          <View className="space-y-2">
            <Text className="text-sm font-semibold text-slate-300">Fecha</Text>
            <TouchableOpacity
              onPress={() => {
                if (!isKeyboardVisible && !showDatePicker) {
                  Keyboard.dismiss();
                  setTimeout(() => setShowDatePicker(true), 150);
                }
              }}
              disabled={showDatePicker || isKeyboardVisible}
              className={`rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 ${showDatePicker || isKeyboardVisible ? 'opacity-60' : ''}`}
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

          <Input
            label="Notas"
            placeholder="Notas adicionales"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
          />
        </View>

        <View className="mt-6 px-6">
          <Button
            label="Registrar franco"
            onPress={handleSubmit}
            loading={mutation.isPending}
          />
        </View>

        {Platform.OS !== 'ios' && (
          <Modal visible={showDatePicker} transparent animationType="fade">
            <View className="flex-1 items-center justify-center bg-black/60 px-6">
              <View className="w-full rounded-3xl bg-slate-900 p-4">
                <Text className="text-base font-semibold text-slate-100">Seleccionar fecha</Text>
                <DateTimePicker
                  value={parseLocalDate(formData.date)}
                  mode="date"
                  display="default"
                  {...pickerStyleProps}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setFormData((prev) => ({ ...prev, date: formatDateValue(selectedDate) }));
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
        </ScrollView>
      </TouchableWithoutFeedback>
    </Screen>
  );
}
