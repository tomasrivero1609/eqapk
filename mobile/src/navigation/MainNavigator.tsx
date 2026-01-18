import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventsListScreen from '../screens/events/EventsListScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import CreatePaymentScreen from '../screens/events/CreatePaymentScreen';
import PaymentDetailScreen from '../screens/events/PaymentDetailScreen';
import ClientsListScreen from '../screens/clients/ClientsListScreen';
import CreateClientScreen from '../screens/clients/CreateClientScreen';
import SelectClientScreen from '../screens/clients/SelectClientScreen';
import AdminSummaryScreen from '../screens/admin/AdminSummaryScreen';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import LogoutButton from '../components/ui/LogoutButton';
import RolePill from '../components/ui/RolePill';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerShown: true,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: '#0B1120' },
  headerTitleStyle: { fontWeight: '600', color: '#E2E8F0' },
  headerTintColor: '#E2E8F0',
  headerLeftContainerStyle: { paddingLeft: 12 },
  headerRightContainerStyle: { paddingRight: 12 },
  headerRight: () => <LogoutButton />,
  headerLeft: () => <RolePill />,
};

function EventsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="EventsList" component={EventsListScreen} options={{ title: 'Eventos' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Detalle del evento' }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Nuevo evento' }} />
      <Stack.Screen name="CreatePayment" component={CreatePaymentScreen} options={{ title: 'Registrar pago' }} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} options={{ title: 'Detalle del pago' }} />
      <Stack.Screen name="SelectClient" component={SelectClientScreen} options={{ title: 'Seleccionar cliente' }} />
    </Stack.Navigator>
  );
}

function ClientsStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ClientsList" component={ClientsListScreen} options={{ title: 'Clientes' }} />
      <Stack.Screen name="CreateClient" component={CreateClientScreen} options={{ title: 'Nuevo cliente' }} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
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
          paddingBottom: 10,
          paddingTop: 10,
          height: 64,
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 24,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen name="Events" component={EventsStack} options={{ title: 'Eventos' }} />
      <Tab.Screen name="Clients" component={ClientsStack} options={{ title: 'Clientes' }} />
      {userRole === UserRole.SUPERADMIN ? (
        <Tab.Screen name="Admin" component={AdminStack} options={{ title: 'Ingresos' }} />
      ) : null}
    </Tab.Navigator>
  );
}
