import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/ui/Screen';
import { useAuthStore } from '../../store/authStore';
import { UserRole, PermissionModule } from '../../types';
import Card from '../../components/ui/Card';
import { dolarService } from '../../services/dolarService';

type LandingRoute = {
  key: string;
  label: string;
  icon: string;
  screen: string;
  description: string;
  permissionModule: PermissionModule;
};

const ALL_ROUTES: LandingRoute[] = [
  { key: 'Events', label: 'Eventos', icon: 'calendar', screen: 'EventsList', description: 'Crea y gestiona eventos del salón', permissionModule: 'eventos' },
  { key: 'Entrevistas', label: 'Entrevistas', icon: 'people', screen: 'EntrevistasList', description: 'Entrevistas programadas', permissionModule: 'entrevistas' },
  { key: 'Francos', label: 'Francos', icon: 'sunny', screen: 'FrancosList', description: 'Días libres y francos', permissionModule: 'francos' },
  { key: 'Clients', label: 'Clientes', icon: 'person-circle', screen: 'ClientsList', description: 'Administra tus clientes', permissionModule: 'clientes' },
  { key: 'Admin', label: 'Ingresos', icon: 'stats-chart', screen: 'AdminSummary', description: 'Revisa ingresos totales', permissionModule: 'ingresos' },
  { key: 'Demonstrations', label: 'Demostraciones', icon: 'images', screen: 'Demonstrations', description: 'Galería de platos', permissionModule: 'demostraciones' },
  { key: 'Users', label: 'Usuarios', icon: 'people-circle', screen: 'UsersManagement', description: 'Gestiona usuarios y permisos', permissionModule: 'usuarios' },
];

export default function RoleLandingScreen({ navigation }: any) {
  const { role, name } = useAuthStore((state) => ({
    role: state.user?.role || UserRole.ADMIN,
    name: state.user?.name || 'Equipo',
  }));
  const logout = useAuthStore((state) => state.logout);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const actions = useMemo(
    () => ALL_ROUTES.filter((r) => hasPermission(r.permissionModule, 'ver')),
    [hasPermission],
  );
  const roleLabel = role === UserRole.SUPERADMIN ? 'Superadmin' : 'Admin';
  const { width } = useWindowDimensions();
  const isCompact = width < 400;
  const insets = useSafeAreaInsets();

  const { data: dolarOficial, isLoading: isLoadingDolarOficial } = useQuery({
    queryKey: ['dolar-oficial'],
    queryFn: () => dolarService.getOficial(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: dolarBlue, isLoading: isLoadingDolarBlue } = useQuery({
    queryKey: ['dolar-blue'],
    queryFn: () => dolarService.getBlue(),
    staleTime: 5 * 60 * 1000,
  });

  const navigateTo = (item: LandingRoute) => {
    if (item.key === 'Demonstrations') {
      navigation.navigate('Demonstrations');
      return;
    }
    navigation.navigate('MainTabs', { screen: item.screen });
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.headerTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.greeting, isCompact && styles.greetingCompact]}>
                  Hola, {name}
                </Text>
                <Text style={styles.roleText}>{roleLabel}</Text>
              </View>
              <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dólar cards */}
          <View style={styles.dolarSection}>
            <View style={styles.dolarRow}>
              <View style={[styles.dolarCard, { marginRight: 6 }]}>
                <Text style={styles.dolarLabel}>Dólar oficial</Text>
                {isLoadingDolarOficial ? (
                  <Text style={styles.dolarLoading}>...</Text>
                ) : dolarOficial ? (
                  <Text style={styles.dolarValue}>
                    ${dolarOficial.venta}
                  </Text>
                ) : (
                  <Text style={styles.dolarLoading}>N/D</Text>
                )}
              </View>
              <View style={[styles.dolarCard, { marginLeft: 6 }]}>
                <Text style={styles.dolarLabel}>Dólar blue</Text>
                {isLoadingDolarBlue ? (
                  <Text style={styles.dolarLoading}>...</Text>
                ) : dolarBlue ? (
                  <Text style={styles.dolarValue}>
                    ${dolarBlue.venta}
                  </Text>
                ) : (
                  <Text style={styles.dolarLoading}>N/D</Text>
                )}
              </View>
            </View>
          </View>

          {/* Action grid */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Accesos rápidos</Text>
            <View style={[styles.actionsGrid, isCompact && styles.actionsGridCompact]}>
              {actions.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => navigateTo(item)}
                  style={[styles.actionCard, isCompact && styles.actionCardCompact]}
                  activeOpacity={0.8}
                >
                  <View style={styles.actionIconContainer}>
                    <Ionicons name={item.icon as any} size={22} color="#c4b5fd" />
                  </View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                  <Text style={styles.actionDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerDivider} />
            <Text style={styles.footerText}>
              Desarrollado por Tomás Rivero — 2026
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  greetingCompact: {
    fontSize: 24,
  },
  roleText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dolarSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  dolarRow: {
    flexDirection: 'row',
  },
  dolarCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  dolarLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dolarValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e2e8f0',
    marginTop: 6,
  },
  dolarLoading: {
    fontSize: 16,
    color: '#475569',
    marginTop: 6,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionsGridCompact: {
    gap: 10,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    minHeight: 120,
    justifyContent: 'space-between',
  },
  actionCardCompact: {
    width: '100%',
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
  },
  actionIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  actionDescription: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 40,
    alignItems: 'center',
  },
  footerDivider: {
    width: 60,
    height: 1,
    backgroundColor: '#1e293b',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
});
