import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';

export default function RolePill() {
  const role = useAuthStore((state) => state.user?.role);
  const navigation = useNavigation();

  if (!role) {
    return null;
  }

  const label = role === 'SUPERADMIN' ? 'Superadmin' : 'Admin';

  const handlePress = () => {
    const parent = navigation.getParent();
    const root = parent?.getParent();
    if (root) {
      root.navigate('RoleLanding' as never);
      return;
    }
    if (parent) {
      parent.navigate('RoleLanding' as never);
      return;
    }
    navigation.navigate('RoleLanding' as never);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="ml-2 rounded-full bg-violet-600/20 px-3 py-1"
      accessibilityRole="button"
      accessibilityLabel="Ir al inicio"
      accessibilityHint="Vuelve a la pantalla de inicio"
    >
      <View>
        <Text className="text-xs font-semibold text-violet-200">{label}</Text>
      </View>
    </TouchableOpacity>
  );
}
