import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { clientService } from '../../services/clientService';
import { Client } from '../../types';

export default function ClientDetailScreen({ route, navigation }: any) {
  const { clientId } = route.params as { clientId: string };

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientService.getById(clientId),
  });

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  if (!client) {
    return (
      <Screen>
        <EmptyState title="Cliente no encontrado" />
      </Screen>
    );
  }

  const events = client.events || [];

  return (
    <Screen>
      <ScrollView contentContainerClassName="pb-32">
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-slate-100">{client.name}</Text>
          <Text className="mt-2 text-sm text-slate-400">
            Informacion del cliente.
          </Text>
        </View>

        <View className="mt-6 px-6 space-y-4">
          <Card>
            <Text className="text-xs font-semibold text-slate-400">Contacto</Text>
            {client.email ? (
              <Text className="mt-2 text-sm text-slate-200">{client.email}</Text>
            ) : null}
            {client.phone ? (
              <Text className="mt-1 text-sm text-slate-200">{client.phone}</Text>
            ) : null}
            {client.address ? (
              <Text className="mt-1 text-sm text-slate-200">{client.address}</Text>
            ) : null}
          </Card>
          {client.notes ? (
            <Card>
              <Text className="text-xs font-semibold text-slate-400">Notas</Text>
              <Text className="mt-2 text-sm text-slate-200">{client.notes}</Text>
            </Card>
          ) : null}
        </View>

        <View className="mt-6 px-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-slate-100">
              Eventos asociados
            </Text>
          </View>
          {events.length === 0 ? (
            <View className="mt-4">
              <EmptyState
                title="Sin eventos asociados"
                description="Este cliente aun no tiene eventos."
              />
            </View>
          ) : (
            <View className="mt-4 space-y-3">
              {events.map((event: Client['events'][number]) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() =>
                    navigation.navigate('Events', {
                      screen: 'EventDetail',
                      params: { eventId: event.id },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Card className="px-4 py-3">
                    <Text className="text-base font-semibold text-slate-100">
                      {event.name}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-400">
                      {new Date(event.date).toLocaleDateString('es-AR')}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-500">
                      Estado: {event.status}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View className="mt-6 px-6">
          <Button
            label="Editar datos"
            onPress={() => navigation.navigate('CreateClient', { clientId })}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
