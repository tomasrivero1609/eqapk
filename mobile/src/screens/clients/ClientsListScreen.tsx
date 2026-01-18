import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
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

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  const renderClient = ({ item }: { item: Client }) => (
    <TouchableOpacity className="mx-4 my-2">
      <Card>
        <Text className="text-lg font-bold text-slate-100">{item.name}</Text>
        <View className="mt-2 space-y-1">
          {item.email ? (
            <Text className="text-sm text-slate-400">{item.email}</Text>
          ) : null}
          {item.phone ? (
            <Text className="text-sm text-slate-400">{item.phone}</Text>
          ) : null}
          {item.address ? (
            <Text className="text-sm text-slate-400">{item.address}</Text>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View className="px-4 pt-4">
        <Button
          label="Nuevo cliente"
          onPress={() => navigation.navigate('CreateClient')}
        />
      </View>
      <FlatList
        data={clients || []}
        renderItem={renderClient}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-6"
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
