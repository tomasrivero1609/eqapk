import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useWindowDimensions } from 'react-native';
import EventsListScreen from '../screens/events/EventsListScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import CreateVisitScreen from '../screens/events/CreateVisitScreen';
import CreateFrancoScreen from '../screens/events/CreateFrancoScreen';
import EntrevistasListScreen from '../screens/events/EntrevistasListScreen';
import EntrevistaDetailScreen from '../screens/events/EntrevistaDetailScreen';
import FrancosListScreen from '../screens/events/FrancosListScreen';
import FrancoDetailScreen from '../screens/events/FrancoDetailScreen';
import CreatePaymentScreen from '../screens/events/CreatePaymentScreen';
import PaymentDetailScreen from '../screens/events/PaymentDetailScreen';
import EventsCalendarScreen from '../screens/events/EventsCalendarScreen';
import EventSpecsScreen from '../screens/events/EventSpecsScreen';
import ClientsListScreen from '../screens/clients/ClientsListScreen';
import CreateClientScreen from '../screens/clients/CreateClientScreen';
import SelectClientScreen from '../screens/clients/SelectClientScreen';
import ClientDetailScreen from '../screens/clients/ClientDetailScreen';
import AdminSummaryScreen from '../screens/admin/AdminSummaryScreen';
import HomeButton from '../components/ui/HomeButton';

const Stack = createNativeStackNavigator();

const getScreenOptions = (isCompact: boolean) => ({
  headerShown: true,
  headerShadowVisible: true,
  headerStyle: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitleStyle: {
    fontWeight: 'bold' as const,
    color: '#f1f5f9',
    fontSize: isCompact ? 18 : 20,
  },
  headerTitleAlign: 'center' as const,
  headerTintColor: '#E2E8F0',
  headerBackTitleVisible: false,
  headerLeftContainerStyle: { paddingLeft: 8 },
  headerRightContainerStyle: { paddingRight: 16 },
});

export default function MainNavigator({ route }: any) {
  const initialScreen = route?.params?.screen || 'EventsList';
  const { width } = useWindowDimensions();
  const isCompact = width < 400;

  return (
    <Stack.Navigator
      initialRouteName={initialScreen}
      screenOptions={getScreenOptions(isCompact)}
    >
      {/* Pantallas raíz con botón Home a la izquierda */}
      <Stack.Screen name="EventsList" component={EventsListScreen} options={{ title: 'Eventos', headerLeft: () => <HomeButton /> }} />
      <Stack.Screen name="EntrevistasList" component={EntrevistasListScreen} options={{ title: 'Entrevistas', headerLeft: () => <HomeButton /> }} />
      <Stack.Screen name="FrancosList" component={FrancosListScreen} options={{ title: 'Francos', headerLeft: () => <HomeButton /> }} />
      <Stack.Screen name="ClientsList" component={ClientsListScreen} options={{ title: 'Clientes', headerLeft: () => <HomeButton /> }} />
      <Stack.Screen name="AdminSummary" component={AdminSummaryScreen} options={{ title: 'Ingresos', headerLeft: () => <HomeButton /> }} />

      {/* Sub-pantallas con back nativo */}
      <Stack.Screen name="EventsCalendar" component={EventsCalendarScreen} options={{ title: 'Calendario' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Detalle del evento' }} />
      <Stack.Screen name="EventSpecs" component={EventSpecsScreen} options={{ title: 'Especificaciones' }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: 'Nuevo evento' }} />
      <Stack.Screen name="EntrevistaDetail" component={EntrevistaDetailScreen} options={{ title: 'Detalle entrevista' }} />
      <Stack.Screen name="CreateVisit" component={CreateVisitScreen} options={{ title: 'Nueva entrevista' }} />
      <Stack.Screen name="FrancoDetail" component={FrancoDetailScreen} options={{ title: 'Detalle franco' }} />
      <Stack.Screen name="CreateFranco" component={CreateFrancoScreen} options={{ title: 'Nuevo franco' }} />
      <Stack.Screen name="CreatePayment" component={CreatePaymentScreen} options={{ title: 'Registrar pago' }} />
      <Stack.Screen name="PaymentDetail" component={PaymentDetailScreen} options={{ title: 'Detalle del pago' }} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'Detalle del cliente' }} />
      <Stack.Screen name="CreateClient" component={CreateClientScreen} options={{ title: 'Nuevo cliente' }} />
      <Stack.Screen name="SelectClient" component={SelectClientScreen} options={{ title: 'Seleccionar cliente' }} />
    </Stack.Navigator>
  );
}
