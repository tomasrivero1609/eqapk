import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Screen from '../../components/ui/Screen';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import Card from '../../components/ui/Card';
import { dolarService } from '../../services/dolarService';

const routesByRole: Record<UserRole, Array<{ key: string; label: string }>> = {
  [UserRole.ADMIN]: [
    { key: 'Events', label: 'Eventos' },
    { key: 'Clients', label: 'Clientes' },
    { key: 'Demonstrations', label: 'Demostraciones' },
  ],
  [UserRole.SUPERADMIN]: [
    { key: 'Events', label: 'Eventos' },
    { key: 'Clients', label: 'Clientes' },
    { key: 'Admin', label: 'Ingresos' },
    { key: 'Demonstrations', label: 'Demostraciones' },
  ],
};

const actionDescriptions: Record<string, string> = {
  Events: 'Crea y gestiona eventos',
  Clients: 'Administra tus clientes',
  Admin: 'Revisa ingresos totales',
  Demonstrations: 'Muestra los platos disponibles',
};

export default function RoleLandingScreen({ navigation }: any) {
  const { role, name } = useAuthStore((state) => ({
    role: state.user?.role || UserRole.ADMIN,
    name: state.user?.name || 'Equipo',
  }));
  const logout = useAuthStore((state) => state.logout);
  const actions = routesByRole[role];
  const roleLabel = role === UserRole.SUPERADMIN ? 'Superadmin' : 'Admin';
  const { width } = useWindowDimensions();
  const isCompact = width < 400;
  const sectionPadding = isCompact ? 'px-4' : 'px-6';
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

  return (
    <Screen>
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
          showsVerticalScrollIndicator={false}
        >
          <View className={`${sectionPadding} ${isCompact ? 'pt-4' : 'pt-6'}`}>
            <View className={isCompact ? 'flex-col' : 'flex-row items-center justify-between'}>
              <View className={isCompact ? '' : 'flex-1 pr-3'}>
                <Text
                  className={isCompact ? 'text-2xl font-semibold text-white' : 'text-3xl font-semibold text-white'}
                  numberOfLines={2}
                >
                  Bienvenido, {name}
                </Text>
                <Text className="mt-2 text-sm text-slate-300">
                  Rol: {roleLabel}
                </Text>
              </View>
              <TouchableOpacity
                onPress={logout}
                className={isCompact ? 'mt-3 self-start rounded-full bg-slate-800 px-4 py-2' : 'rounded-full bg-slate-800 px-4 py-2'}
              >
                <Text className="text-xs font-semibold text-slate-200">Salir</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className={`${isCompact ? 'mt-6' : 'mt-8'} ${sectionPadding}`}>
            <Card className="bg-slate-900/90 border-violet-500/30">
              <Text className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-slate-100`}>
                Panel de control
              </Text>
              <Text className={`${isCompact ? 'text-xs' : 'text-sm'} mt-2 text-slate-300`}>
                Elige a donde queres ir y gestiona tu salon desde un solo lugar.
              </Text>
            </Card>
          </View>
          <View className={`mt-4 ${sectionPadding} space-y-3`}>
            <Card>
              <Text className="text-xs font-semibold text-slate-400">
                Dolar oficial
              </Text>
              {isLoadingDolarOficial && (
                <Text className="mt-1 text-sm text-slate-200">Cargando...</Text>
              )}
              {!isLoadingDolarOficial && dolarOficial && (
                <>
              <Text className={`${isCompact ? 'text-sm' : 'text-base'} mt-1 font-semibold text-slate-100`}>
                Compra {dolarOficial.compra} - Venta {dolarOficial.venta}
              </Text>
                  <Text className="mt-1 text-xs text-slate-500">
                    Actualizado {new Date(dolarOficial.fechaActualizacion).toLocaleString('es-AR')}
                  </Text>
                </>
              )}
              {!isLoadingDolarOficial && !dolarOficial && (
                <Text className="mt-1 text-sm text-slate-300">
                  No disponible por ahora.
                </Text>
              )}
            </Card>
            <Card>
              <Text className="text-xs font-semibold text-slate-400">
                Dolar blue
              </Text>
              {isLoadingDolarBlue && (
                <Text className="mt-1 text-sm text-slate-200">Cargando...</Text>
              )}
              {!isLoadingDolarBlue && dolarBlue && (
                <>
              <Text className={`${isCompact ? 'text-sm' : 'text-base'} mt-1 font-semibold text-slate-100`}>
                Compra {dolarBlue.compra} - Venta {dolarBlue.venta}
              </Text>
                  <Text className="mt-1 text-xs text-slate-500">
                    Actualizado {new Date(dolarBlue.fechaActualizacion).toLocaleString('es-AR')}
                  </Text>
                </>
              )}
              {!isLoadingDolarBlue && !dolarBlue && (
                <Text className="mt-1 text-sm text-slate-300">
                  No disponible por ahora.
                </Text>
              )}
            </Card>
          </View>

          <View className={`mt-6 ${sectionPadding} flex-row flex-wrap ${isCompact ? 'gap-3' : 'gap-4'}`}>
            {actions.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => {
                  if (item.key === 'Demonstrations') {
                    navigation.navigate('Demonstrations');
                    return;
                  }
                  navigation.replace('MainTabs', { initialTab: item.key });
                }}
                className={isCompact ? 'w-full' : 'w-[48%]'}
              >
                <Card className={isCompact ? 'h-24 justify-between' : 'h-28 justify-between'}>
                <Text className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold text-slate-100`}>
                  {item.label}
                </Text>
                <Text className="text-xs text-slate-400">
                  {actionDescriptions[item.key]}
                </Text>
              </Card>
              </TouchableOpacity>
            ))}
          </View>

          <View className={`mt-6 ${sectionPadding}`}>
            <Button
              label="Ir al panel"
              onPress={() => navigation.replace('MainTabs', { initialTab: 'Events' })}
              className="bg-violet-600"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
