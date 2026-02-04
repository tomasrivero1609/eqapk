import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function RolePill() {
  const role = useAuthStore((state) => state.user?.role);
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isCompact = width < 420;

  if (!role) {
    return null;
  }

  const label = role === 'SUPERADMIN' ? (isCompact ? 'Super' : 'Superadmin') : 'Admin';

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
      activeOpacity={0.8}
      style={[
        styles.container,
        isCompact && styles.containerCompact
      ]}
      accessibilityRole="button"
      accessibilityLabel="Ir al inicio"
      accessibilityHint="Vuelve a la pantalla de inicio"
    >
      <View style={styles.content}>
        <Ionicons name="home-outline" size={14} color="#c4b5fd" />
        <Text style={[styles.label, isCompact && styles.labelCompact]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
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
    color: '#c4b5fd',
  },
  labelCompact: {
    fontSize: 12,
  },
});
