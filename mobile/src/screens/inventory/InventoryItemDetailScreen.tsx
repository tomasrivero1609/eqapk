import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  useWindowDimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import { formatErrorForAlert } from '../../utils/errorMessage';
import { InventoryMovement, MovementType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function InventoryItemDetailScreen({ route, navigation }: any) {
  const { itemId } = route.params as { itemId: string };
  const canEdit = useAuthStore((s) => s.hasPermission('inventario', 'editar'));
  const canCreate = useAuthStore((s) => s.hasPermission('inventario', 'crear'));
  const canDelete = useAuthStore((s) => s.hasPermission('inventario', 'eliminar'));
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const isCompact = width < 400;

  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<MovementType>(MovementType.USO);
  const [movementQty, setMovementQty] = useState('');
  const [movementNotes, setMovementNotes] = useState('');

  const { data: item, isLoading: isLoadingItem } = useQuery({
    queryKey: ['inventory-item', itemId],
    queryFn: () => inventoryService.getById(itemId),
  });

  const { data: movements, isLoading: isLoadingMovements } = useQuery({
    queryKey: ['inventory-movements', itemId],
    queryFn: () => inventoryService.getMovements(itemId),
  });

  const movementMutation = useMutation({
    mutationFn: () =>
      inventoryService.createMovement(itemId, {
        type: movementType,
        quantity: parseInt(movementQty, 10),
        notes: movementNotes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements', itemId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowMovementModal(false);
      setMovementQty('');
      setMovementNotes('');
      Alert.alert('Listo', movementType === MovementType.USO ? 'Uso registrado' : 'Stock repuesto');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        formatErrorForAlert(error, 'No se pudo registrar el movimiento'),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => inventoryService.remove(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Error', formatErrorForAlert(error, 'No se pudo eliminar'));
    },
  });

  const handleMovementSubmit = () => {
    const qty = parseInt(movementQty, 10);
    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad valida');
      return;
    }
    movementMutation.mutate();
  };

  const handleDelete = () => {
    Alert.alert('Eliminar item', 'Se eliminara el item y todo su historial. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const openMovementModal = (type: MovementType) => {
    setMovementType(type);
    setMovementQty('');
    setMovementNotes('');
    setShowMovementModal(true);
  };

  if (isLoadingItem) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <EmptyState title="Item no encontrado" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerClassName="pb-32">
        <View className="px-6 pt-6">
          <Text className={`${isCompact ? 'text-xl' : 'text-2xl'} font-bold text-slate-100`}>
            {item.name}
          </Text>
          {item.category ? (
            <Text className="mt-1 text-xs font-semibold text-violet-300 uppercase tracking-wider">
              {item.category}
            </Text>
          ) : null}
          {item.description ? (
            <Text className="mt-2 text-sm text-slate-400">{item.description}</Text>
          ) : null}
        </View>

        <View className="mt-6 px-6">
          <Card>
            <Text className="text-xs font-semibold text-slate-400">Stock actual</Text>
            <Text
              className={`mt-1 text-3xl font-bold ${
                item.quantity === 0 ? 'text-rose-400' : 'text-slate-100'
              }`}
            >
              {item.quantity}
              {item.unit ? (
                <Text className="text-lg text-slate-400"> {item.unit}</Text>
              ) : null}
            </Text>
          </Card>
        </View>

        {canCreate && (
          <View className="mt-4 px-6 flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Registrar uso"
                variant="danger"
                iconName="remove-circle"
                onPress={() => openMovementModal(MovementType.USO)}
              />
            </View>
            <View className="flex-1">
              <Button
                label="Reponer"
                variant="primary"
                iconName="add-circle"
                onPress={() => openMovementModal(MovementType.REPOSICION)}
              />
            </View>
          </View>
        )}

        <View className="mt-8 px-6">
          <Text className={`${isCompact ? 'text-base' : 'text-lg'} font-semibold text-slate-100`}>
            Historial
          </Text>
          {isLoadingMovements ? (
            <ActivityIndicator className="mt-4" size="small" color="#8B5CF6" />
          ) : !movements || movements.length === 0 ? (
            <View className="mt-4">
              <EmptyState title="Sin movimientos" />
            </View>
          ) : (
            <View className="mt-4 space-y-3">
              {movements.map((mov: InventoryMovement) => (
                <Card key={mov.id} className="px-4 py-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View
                        className={`h-2 w-2 rounded-full ${
                          mov.type === MovementType.USO ? 'bg-rose-400' : 'bg-emerald-400'
                        }`}
                      />
                      <Text className="text-sm font-semibold text-slate-100">
                        {mov.type === MovementType.USO ? 'Uso' : 'Reposicion'}
                      </Text>
                    </View>
                    <Text
                      className={`text-base font-bold ${
                        mov.type === MovementType.USO ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {mov.type === MovementType.USO ? '-' : '+'}
                      {mov.quantity}
                    </Text>
                  </View>
                  {mov.notes ? (
                    <Text className="mt-1 text-xs text-slate-400">{mov.notes}</Text>
                  ) : null}
                  <Text className="mt-1 text-xs text-slate-500">
                    {new Date(mov.createdAt).toLocaleDateString('es-AR')}{' '}
                    {new Date(mov.createdAt).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        <View className="mt-8 px-6">
          <View className="flex-row gap-3">
            {canEdit && (
              <View className="flex-1">
                <Button
                  label="Editar"
                  variant="secondary"
                  iconName="pencil"
                  onPress={() => navigation.navigate('CreateInventoryItem', { itemId: item.id })}
                />
              </View>
            )}
            {canDelete && (
              <View className="flex-1">
                <Button
                  label="Eliminar"
                  variant="danger"
                  iconName="trash"
                  onPress={handleDelete}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showMovementModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 items-center justify-center bg-black/60 px-6">
            <View className="w-full rounded-3xl bg-slate-900 p-4">
              <Text className="text-base font-semibold text-slate-100">
                {movementType === MovementType.USO ? 'Registrar uso' : 'Reponer stock'}
              </Text>
              <Text className="mt-1 text-xs text-slate-400">
                Stock actual: {item.quantity} {item.unit || ''}
              </Text>
              <View className="mt-4 space-y-3">
                <Input
                  label="Cantidad"
                  placeholder="0"
                  value={movementQty}
                  onChangeText={(text) => setMovementQty(text.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                />
                <Input
                  label="Notas (opcional)"
                  placeholder="Detalle del movimiento"
                  value={movementNotes}
                  onChangeText={setMovementNotes}
                />
              </View>
              <View className="mt-4 space-y-2">
                <Button
                  label={movementType === MovementType.USO ? 'Registrar uso' : 'Reponer'}
                  onPress={handleMovementSubmit}
                  loading={movementMutation.isPending}
                />
                <Button
                  label="Cancelar"
                  variant="secondary"
                  onPress={() => setShowMovementModal(false)}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Screen>
  );
}
