import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../../services/clientService';
import Screen from '../../components/ui/Screen';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function CreateClientScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      clientService.create({
        name,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      Alert.alert('Listo', 'Cliente creado', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Error al crear cliente');
    },
  });

  const handleSubmit = () => {
    if (!name) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    mutation.mutate();
  };

  return (
    <Screen>
      <ScrollView contentContainerClassName="pb-12">
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-slate-100">Nuevo cliente</Text>
          <Text className="mt-2 text-sm text-slate-400">
            Guarda la informacion basica del cliente.
          </Text>
        </View>

        <View className="mt-6 px-6 space-y-4">
          <Input
            label="Nombre"
            placeholder="Nombre completo"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Email"
            placeholder="correo@dominio.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Input
            label="Telefono"
            placeholder="5550000000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Input
            label="Direccion"
            placeholder="Direccion completa"
            value={address}
            onChangeText={setAddress}
          />
          <Input
            label="Notas"
            placeholder="Notas adicionales"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View className="mt-6 px-6">
          <Button
            label="Guardar cliente"
            onPress={handleSubmit}
            loading={mutation.isPending}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
