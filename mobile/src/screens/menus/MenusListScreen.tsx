import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../../services/menuService';
import { Menu } from '../../types';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';

export default function MenusListScreen() {
  const { data: menus, isLoading } = useQuery({
    queryKey: ['menus'],
    queryFn: () => menuService.getAll(true),
  });

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </Screen>
    );
  }

  const renderMenu = ({ item }: { item: Menu }) => (
    <View className="mx-4 my-2">
      <Card>
        <View className="flex-row items-start justify-between">
          <Text className="text-lg font-bold text-slate-900 flex-1 pr-2">
            {item.name}
          </Text>
          {item.price ? (
            <Text className="text-sm font-semibold text-purple-600">
              ${item.price.toFixed(2)}
            </Text>
          ) : null}
        </View>
        {item.description ? (
          <Text className="mt-2 text-sm text-slate-600">{item.description}</Text>
        ) : null}
        {item.menuDishes?.length ? (
          <Text className="mt-3 text-xs text-slate-500">
            {item.menuDishes.length} plato{item.menuDishes.length > 1 ? 's' : ''} incluido
          </Text>
        ) : null}
      </Card>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={menus || []}
        renderItem={renderMenu}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-6 pt-4"
        ListEmptyComponent={
          <EmptyState
            title="No hay menus disponibles"
            description="Agrega menus para usarlos en eventos"
          />
        }
      />
    </Screen>
  );
}
