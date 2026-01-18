import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <TouchableOpacity
      onPress={logout}
      className="mr-2 rounded-full bg-slate-800 px-3 py-1"
    >
      <Text className="text-xs font-semibold text-slate-200">Salir</Text>
    </TouchableOpacity>
  );
}
