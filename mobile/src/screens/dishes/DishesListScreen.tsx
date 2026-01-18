import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { dishService } from '../../services/dishService';
import { Dish } from '../../types';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';

export default function DishesListScreen() {
  const { data: dishes, isLoading } = useQuery({
    queryKey: ['dishes'],
    queryFn: () => dishService.getAll(true),
  });

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </Screen>
    );
  }

  const renderDish = ({ item }: { item: Dish }) => (
    <View className="mx-4 my-2">
      <Card>
        <View className="flex-row items-start justify-between">
          <Text className="text-lg font-bold text-slate-900 flex-1 pr-2">
            {item.name}
          </Text>
          <Text className="text-sm font-semibold text-blue-600">
            ${item.price.toFixed(2)}
          </Text>
        </View>
        {item.description ? (
          <Text className="mt-2 text-sm text-slate-600">{item.description}</Text>
        ) : null}
        {item.category ? (
          <Text className="mt-3 text-xs text-slate-500">{item.category}</Text>
        ) : null}
      </Card>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={dishes || []}
        renderItem={renderDish}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-6 pt-4"
        ListEmptyComponent={
          <EmptyState
            title="No hay platos disponibles"
            description="Agrega platos para usarlos en menus y eventos"
          />
        }
      />
    </Screen>
  );
}
