import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { clientService } from '../../services/clientService';
import Screen from '../../components/ui/Screen';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { Client } from '../../types';

export default function SelectClientScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const { data: result, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => clientService.getAll({ limit: 50, search: search.trim() || undefined }),
  });

  const filteredClients = result?.data ?? [];

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
      onPress={() => {
        navigation.navigate({
          name: 'CreateEvent',
          params: { selectedClient: item },
          merge: true,
        });
      }}
    >
      <Card>
        <Text className="text-base font-semibold text-slate-100">{item.name}</Text>
        {item.phone ? (
          <Text className="mt-1 text-xs text-slate-400">{item.phone}</Text>
        ) : null}
        {item.email ? (
          <Text className="mt-1 text-xs text-slate-400">{item.email}</Text>
        ) : null}
      </Card>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View className="px-4 pt-4">
        <Input
          placeholder="Buscar cliente"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <TouchableOpacity
        className="mx-4 mt-4"
        onPress={() => {
          navigation.navigate({
            name: 'CreateEvent',
            params: { selectedClient: null },
            merge: true,
          });
        }}
      >
        <Card>
          <Text className="text-base font-semibold text-slate-100">
            Sin cliente
          </Text>
          <Text className="mt-1 text-xs text-slate-400">
            El evento no queda asignado a un cliente.
          </Text>
        </Card>
      </TouchableOpacity>
      <FlatList
        data={filteredClients}
        renderItem={renderClient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <EmptyState
            title="No hay clientes"
            description="Crea un cliente para asignarlo al evento"
          />
        }
      />
    </Screen>
  );
}
