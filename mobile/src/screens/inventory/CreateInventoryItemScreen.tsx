import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../../services/inventoryService';
import Screen from '../../components/ui/Screen';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function CreateInventoryItemScreen({ navigation, route }: any) {
  const itemId = route?.params?.itemId as string | undefined;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: () => inventoryService.getCategories(),
  });

  const { data: item } = useQuery({
    queryKey: ['inventory-item', itemId],
    queryFn: () => inventoryService.getById(itemId as string),
    enabled: !!itemId,
  });

  useEffect(() => {
    if (!item) return;
    setName(item.name);
    setDescription(item.description || '');
    setCategory(item.category || '');
    setQuantity(String(item.quantity));
    setUnit(item.unit || '');
  }, [item]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => {
      const data = {
        name,
        description: description || undefined,
        category: category || undefined,
        unit: unit || undefined,
        ...(!itemId ? { quantity: parseInt(quantity, 10) || 0 } : {}),
      };
      return itemId
        ? inventoryService.update(itemId, data)
        : inventoryService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      if (itemId) {
        queryClient.invalidateQueries({ queryKey: ['inventory-item', itemId] });
      }
      Alert.alert('Listo', itemId ? 'Item actualizado' : 'Item creado', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo guardar el item',
      );
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    mutation.mutate();
  };

  return (
    <Screen>
      <ScrollView contentContainerClassName="pb-12">
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-slate-100">
            {itemId ? 'Editar item' : 'Nuevo item'}
          </Text>
          <Text className="mt-2 text-sm text-slate-400">
            {itemId
              ? 'Actualiza la informacion del item.'
              : 'Agrega un nuevo item al inventario.'}
          </Text>
        </View>

        <View className="mt-6 px-6 space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej: Botella Jack Daniels"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Descripcion (opcional)"
            placeholder="Detalle del item"
            value={description}
            onChangeText={setDescription}
          />
          <View>
            <Input
              label="Categoria (opcional)"
              placeholder="Ej: Bebidas con alcohol"
              value={category}
              onChangeText={setCategory}
            />
            {categories && categories.length > 0 && !category && (
              <View className="mt-2 flex-row flex-wrap gap-2">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5"
                  >
                    <Text className="text-xs text-slate-300">{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {!itemId && (
            <Input
              label="Cantidad inicial"
              placeholder="0"
              value={quantity}
              onChangeText={(text) => setQuantity(text.replace(/\D/g, ''))}
              keyboardType="number-pad"
            />
          )}
          <Input
            label="Unidad (opcional)"
            placeholder="Ej: botella, caja, unidad"
            value={unit}
            onChangeText={setUnit}
          />
        </View>

        <View className="mt-6 px-6">
          <Button
            label={itemId ? 'Guardar cambios' : 'Crear item'}
            onPress={handleSubmit}
            loading={mutation.isPending}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
