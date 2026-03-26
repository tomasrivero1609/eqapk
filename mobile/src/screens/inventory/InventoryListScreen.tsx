import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { inventoryService } from '../../services/inventoryService';
import { InventoryItem } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const SEED_DATA = [
  { name: 'Coca Cola', category: 'Bebidas sin alcohol - Linea Coca', unit: 'unidad' },
  { name: 'Coca Zero', category: 'Bebidas sin alcohol - Linea Coca', unit: 'unidad' },
  { name: 'Fanta', category: 'Bebidas sin alcohol - Linea Coca', unit: 'unidad' },
  { name: 'Sprite', category: 'Bebidas sin alcohol - Linea Coca', unit: 'unidad' },
  { name: 'Schweppes Pomelo', category: 'Bebidas sin alcohol - Linea Coca', unit: 'unidad' },
  { name: 'Schweppes Tonica', category: 'Bebidas sin alcohol - Linea Coca', unit: 'unidad' },
  { name: 'Agua saborizada Pomelo', category: 'Bebidas sin alcohol - Aguas saborizadas', unit: 'unidad' },
  { name: 'Agua saborizada Manzana', category: 'Bebidas sin alcohol - Aguas saborizadas', unit: 'unidad' },
  { name: 'Agua saborizada Naranja', category: 'Bebidas sin alcohol - Aguas saborizadas', unit: 'unidad' },
  { name: 'Agua con gas', category: 'Bebidas sin alcohol - Aguas', unit: 'unidad' },
  { name: 'Agua sin gas', category: 'Bebidas sin alcohol - Aguas', unit: 'unidad' },
  { name: 'Baggio Naranja', category: 'Bebidas sin alcohol - Jugos', unit: 'unidad' },
  { name: 'Speed', category: 'Bebidas sin alcohol - Energizantes', unit: 'unidad' },
  { name: 'Trumpeter Malbec', category: 'Bebidas con alcohol - Vinos', unit: 'botella' },
  { name: 'Trumpeter Chardonnay', category: 'Bebidas con alcohol - Vinos', unit: 'botella' },
  { name: 'Norton Cosecha Tardia', category: 'Bebidas con alcohol - Vinos', unit: 'botella' },
  { name: 'Smirnoff Vodka', category: 'Bebidas con alcohol - Destilados', unit: 'botella' },
  { name: 'Gancia', category: 'Bebidas con alcohol - Aperitivos', unit: 'botella' },
  { name: 'Fernet Branca', category: 'Bebidas con alcohol - Aperitivos', unit: 'botella' },
  { name: 'Campari', category: 'Bebidas con alcohol - Aperitivos', unit: 'botella' },
  { name: 'Aperol', category: 'Bebidas con alcohol - Aperitivos', unit: 'botella' },
  { name: 'Cachaca', category: 'Bebidas con alcohol - Destilados', unit: 'botella' },
  { name: 'Cynar', category: 'Bebidas con alcohol - Aperitivos', unit: 'botella' },
  { name: 'Martini Rosso', category: 'Bebidas con alcohol - Aperitivos', unit: 'botella' },
  { name: 'Bacardi Ron Blanco', category: 'Bebidas con alcohol - Destilados', unit: 'botella' },
  { name: 'Bacardi Ron Dorado', category: 'Bebidas con alcohol - Destilados', unit: 'botella' },
  { name: 'Gin Gordons', category: 'Bebidas con alcohol - Destilados', unit: 'botella' },
  { name: 'Cinzano Spritz', category: 'Bebidas con alcohol - Aperitivos', unit: 'botella' },
  { name: 'Tequila Jose Cuervo', category: 'Bebidas con alcohol - Destilados', unit: 'botella' },
  { name: 'Gin Bombay', category: 'Bebidas con alcohol - Destilados', unit: 'botella' },
  { name: 'Baileys', category: 'Bebidas con alcohol - Licores', unit: 'botella' },
  { name: 'Whiskey Gold Label', category: 'Bebidas con alcohol - Whiskey', unit: 'botella' },
  { name: 'Whiskey Black Label', category: 'Bebidas con alcohol - Whiskey', unit: 'botella' },
  { name: 'Whiskey Red Label', category: 'Bebidas con alcohol - Whiskey', unit: 'botella' },
  { name: 'Blue Curacao', category: 'Bebidas con alcohol - Licores', unit: 'botella' },
  { name: 'Chandon', category: 'Bebidas con alcohol - Espumantes', unit: 'botella' },
  { name: 'Baron B', category: 'Bebidas con alcohol - Espumantes', unit: 'botella' },
  { name: 'Stella Artois', category: 'Bebidas con alcohol - Cervezas', unit: 'unidad' },
  { name: 'Corona', category: 'Bebidas con alcohol - Cervezas', unit: 'unidad' },
];

interface Section {
  title: string;
  data: InventoryItem[];
}

export default function InventoryListScreen({ navigation }: any) {
  const canCreate = useAuthStore((s) => s.hasPermission('inventario', 'crear'));
  const queryClient = useQueryClient();
  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.getAll(),
  });
  const insets = useSafeAreaInsets();

  const seedMutation = useMutation({
    mutationFn: () => inventoryService.bulkCreate(SEED_DATA.map((d) => ({ ...d, quantity: 0 }))),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      Alert.alert('Listo', `Se cargaron ${result.count} items`);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo cargar');
    },
  });
  const { width } = useWindowDimensions();
  const isCompact = width < 400;

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refetch());
    return unsubscribe;
  }, [navigation, refetch]);

  const sections = useMemo<Section[]>(() => {
    if (!items || items.length === 0) return [];
    const grouped: Record<string, InventoryItem[]> = {};
    for (const item of items) {
      const cat = item.category || 'Sin categoria';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }
    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [items]);

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity
      className="mx-4 my-1.5"
      onPress={() => navigation.navigate('InventoryItemDetail', { itemId: item.id })}
      activeOpacity={0.8}
    >
      <Card className="px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text
              className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-slate-100`}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.description ? (
              <Text className="mt-0.5 text-xs text-slate-500" numberOfLines={1}>
                {item.description}
              </Text>
            ) : null}
          </View>
          <View className="items-end">
            <Text
              className={`${isCompact ? 'text-base' : 'text-lg'} font-bold ${
                item.quantity === 0 ? 'text-rose-400' : 'text-slate-100'
              }`}
            >
              {item.quantity}
            </Text>
            {item.unit ? (
              <Text className="text-xs text-slate-500">{item.unit}</Text>
            ) : null}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View className="mx-4 mt-4 mb-1 px-1">
      <Text className={`${isCompact ? 'text-xs' : 'text-sm'} font-bold text-violet-300 uppercase tracking-wider`}>
        {section.title}
      </Text>
    </View>
  );

  return (
    <Screen>
      {canCreate && (
        <View className="px-4 pt-6 pb-2">
          <Button
            label="Nuevo item"
            iconName="add"
            onPress={() => navigation.navigate('CreateInventoryItem')}
          />
        </View>
      )}
      {sections.length === 0 ? (
        <View className="flex-1 justify-center px-6">
          <EmptyState
            title="No hay items de inventario"
            description="Agrega items para gestionar tu stock"
          />
          {canCreate && (
            <View className="mt-6 space-y-3">
              <Button
                label="Cargar items predefinidos"
                variant="secondary"
                iconName="cloud-download"
                onPress={() =>
                  Alert.alert(
                    'Carga inicial',
                    `Se crearan ${SEED_DATA.length} items con cantidad 0. Continuar?`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Cargar', onPress: () => seedMutation.mutate() },
                    ],
                  )
                }
                loading={seedMutation.isPending}
              />
            </View>
          )}
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: canCreate ? 4 : 24,
            paddingBottom: insets.bottom + 120,
          }}
          stickySectionHeadersEnabled={false}
        />
      )}
    </Screen>
  );
}
