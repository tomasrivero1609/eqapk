import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useWindowDimensions } from 'react-native';
import EventsListScreen from '../screens/events/EventsListScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import CreatePaymentScreen from '../screens/events/CreatePaymentScreen';
import PaymentDetailScreen from '../screens/events/PaymentDetailScreen';
import EventsCalendarScreen from '../screens/events/EventsCalendarScreen';
import ClientsListScreen from '../screens/clients/ClientsListScreen';
import CreateClientScreen from '../screens/clients/CreateClientScreen';
import SelectClientScreen from '../screens/clients/SelectClientScreen';
import ClientDetailScreen from '../screens/clients/ClientDetailScreen';
import AdminSummaryScreen from '../screens/admin/AdminSummaryScreen';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import LogoutButton from '../components/ui/LogoutButton';
import RolePill from '../components/ui/RolePill';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const getStackScreenOptions = (isCompact: boolean) => ({
  headerShown: true,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: '#0B1120' },
  headerTitleStyle: {
    fontWeight: '600',
    color: '#E2E8F0',
    fontSize: isCompact ? 16 : 18,
  },
  headerTitleAlign: isCompact ? 'left' : 'center',
  headerTitleContainerStyle: isCompact ? { paddingRight: 64 } : undefined,
  headerTintColor: '#E2E8F0',
  headerLeftContainerStyle: { paddingLeft: 12 },
  headerRightContainerStyle: { paddingRight: 12 },
  headerRight: () => <LogoutButton />,
  headerLeft: () => (isCompact ? null : <RolePill />),
});

function EventsStack({ isCompact }: { isCompact: boolean }) {
  return (
    <Stack.Navigator screenOptions={getStackScreenOptions(isCompact)}>
      <Stack.Screen name="EventsList" component={EventsListScreen} options={{ title: 'Eventos' }} />
      <Stack.Screen name="EventsCalendar" component={EventsCalendarScreen} options={{ title: 'Calendario' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Detalle del evento' }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Nuevo evento' }} />
      <Stack.Screen name="CreatePayment" component={CreatePaymentScreen} options={{ title: 'Registrar pago' }} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} options={{ title: 'Detalle del pago' }} />
      <Stack.Screen name="SelectClient" component={SelectClientScreen} options={{ title: 'Seleccionar cliente' }} />
    </Stack.Navigator>
  );
}

function ClientsStack({ isCompact }: { isCompact: boolean }) {
  return (
    <Stack.Navigator screenOptions={getStackScreenOptions(isCompact)}>
      <Stack.Screen name="ClientsList" component={ClientsListScreen} options={{ title: 'Clientes' }} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Detalle del cliente' }} />
      <Stack.Screen name="CreateClient" component={CreateClientScreen} options={{ title: 'Nuevo cliente' }} />
    </Stack.Navigator>
  );
}

function AdminStack({ isCompact }: { isCompact: boolean }) {
  return (
    <Stack.Navigator screenOptions={getStackScreenOptions(isCompact)}>
      <Stack.Screen name="AdminSummary" component={AdminSummaryScreen} options={{ title: 'Ingresos' }} />
    </Stack.Navigator>
  );
}

export default function MainNavigator({ route }: any) {
  const userRole = useAuthStore((state) => state.user?.role);
  const initialTab = route?.params?.initialTab as
    | 'Events'
    | 'Clients'
    | 'Admin'
    | undefined;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 400;

  return (
    <Tab.Navigator
      initialRouteName={initialTab || 'Events'}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E2E8F0',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopWidth: 0,
          paddingBottom: Math.max(10, insets.bottom + 6),
          paddingTop: 10,
          height: 64 + insets.bottom,
          marginHorizontal: isCompact ? 10 : 16,
          marginBottom: isCompact ? 8 : 12,
          borderRadius: 24,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen name="Events">
        {() => <EventsStack isCompact={isCompact} />}
      </Tab.Screen>
      <Tab.Screen name="Clients">
        {() => <ClientsStack isCompact={isCompact} />}
      </Tab.Screen>
      {userRole === UserRole.SUPERADMIN ? (
        <Tab.Screen name="Admin">
          {() => <AdminStack isCompact={isCompact} />}
        </Tab.Screen>
      ) : null}
    </Tab.Navigator>
  );
}
