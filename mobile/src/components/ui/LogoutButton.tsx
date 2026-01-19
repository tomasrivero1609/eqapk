import React from 'react';
import { TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const { width } = useWindowDimensions();
  const isCompact = width < 420;

  return (
    <TouchableOpacity
      onPress={logout}
      className={`mr-2 rounded-full bg-slate-800 ${isCompact ? 'px-2 py-1' : 'px-3 py-1'}`}
    >
      <Text className="text-xs font-semibold text-slate-200">Salir</Text>
    </TouchableOpacity>
  );
}
