import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clientService } from '../../services/clientService';
import { Client } from '../../types';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export default function ClientsListScreen({ navigation }: any) {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll(),
  });
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 400;

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  const renderClient = ({ item }: { item: Client }) => (
    <TouchableOpacity
      className="mx-4 my-2"
      onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
    >
      <Card>
        <View className="flex-row items-center justify-between">
          <Text className={`${isCompact ? 'text-base' : 'text-lg'} font-bold text-slate-100`}>{item.name}</Text>
          <Text className="text-xs font-semibold text-violet-300">Ver</Text>
        </View>
        <View className={`${isCompact ? 'mt-1' : 'mt-2'} space-y-1`}>
          {item.email ? (
            <Text className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-400`}>{item.email}</Text>
          ) : null}
          {item.phone ? (
            <Text className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-400`}>{item.phone}</Text>
          ) : null}
          {item.address ? (
            <Text className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-400`}>{item.address}</Text>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View className="px-4 pt-6">
        <Button
          label="Nuevo cliente"
          onPress={() => navigation.navigate('CreateClient')}
        />
      </View>
      <FlatList
        data={clients || []}
        renderItem={renderClient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        ListEmptyComponent={
          <EmptyState
            title="No hay clientes"
            description="Crea un cliente para comenzar"
          />
        }
      />
    </Screen>
  );
}
