import React from 'react';
import { TouchableOpacity, Text, useWindowDimensions, View, StyleSheet } from 'react-native';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const { width } = useWindowDimensions();
  const isCompact = width < 420;

  return (
    <TouchableOpacity
      onPress={logout}
      activeOpacity={0.8}
      style={[
        styles.container,
        isCompact && styles.containerCompact
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="log-out-outline" size={14} color="#f87171" />
        <Text style={[styles.label, isCompact && styles.labelCompact]}>
          Salir
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  containerCompact: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f87171',
  },
  labelCompact: {
    fontSize: 12,
  },
});
