import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  useWindowDimensions,
  StyleSheet 
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '../../services/eventService';
import { Event, EventStatus } from '../../types';
import Screen from '../../components/ui/Screen';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/format';
import { formatLocalDate } from '../../utils/date';

const daysSince = (date: Date) => {
  const now = Date.now();
  return Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24));
};

const getLastPaymentDate = (payments?: Array<{ paidAt: string }>) => {
  if (!payments || payments.length === 0) {
    return null;
  }
  return payments
    .map((payment) => new Date(payment.paidAt))
    .sort((a, b) => b.getTime() - a.getTime())[0];
};

const statusVariant = (status: EventStatus) => {
  switch (status) {
    case EventStatus.CONFIRMED:
      return 'success';
    case EventStatus.IN_PROGRESS:
      return 'info';
    case EventStatus.COMPLETED:
      return 'neutral';
    case EventStatus.CANCELLED:
      return 'danger';
    default:
      return 'warning';
  }
};

export default function EventsListScreen({ navigation }: any) {
  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getAll(),
  });
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isCompact = width < 400;
  const isLandscape = width > height;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  const renderEvent = ({ item }: { item: Event }) => {
    const lastPayment = getLastPaymentDate(item.payments);
    const referenceDate = lastPayment || new Date(item.createdAt);
    const isOverdue = daysSince(referenceDate) >= 30;
    const totalGuests = (item.adultCount || 0) + (item.juvenileCount || 0) + (item.childCount || 0);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.eventCardWrapper}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      >
        <View style={styles.eventCard}>
          {/* Header con título y badges */}
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.eventTitle, isCompact && styles.eventTitleCompact]} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                <Text style={styles.eventDate}>{formatLocalDate(item.date)}</Text>
              </View>
            </View>
            <View style={styles.badgesContainer}>
              <Badge label={item.status} variant={statusVariant(item.status)} />
              {isOverdue && (
                <View style={styles.overdueBadge}>
                  <Badge label="Pago atrasado" variant="danger" />
                </View>
              )}
            </View>
          </View>

          {/* Métricas */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <View style={styles.metricIconContainer}>
                <Ionicons name="restaurant-outline" size={18} color="#c4b5fd" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Contratados</Text>
                <Text style={[styles.metricValue, isCompact && styles.metricValueCompact]}>
                  {item.dishCount}
                </Text>
              </View>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <View style={styles.metricIconContainer}>
                <Ionicons name="people-outline" size={18} color="#60a5fa" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Asignados</Text>
                <Text style={[styles.metricValue, isCompact && styles.metricValueCompact]}>
                  {totalGuests}
                </Text>
              </View>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <View style={styles.metricIconContainer}>
                <Ionicons name="cash-outline" size={18} color="#34d399" />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Total</Text>
                <Text style={[styles.metricValue, isCompact && styles.metricValueCompact]}>
                  {formatCurrency(item.totalAmount, item.currency)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      {/* Header con botones */}
      <View style={[styles.header, { paddingTop: isLandscape ? 24 : 16 }]}>
        {isCompact ? (
          <View style={styles.buttonsColumn}>
            <Button
              label="Nuevo evento"
              iconName="add-circle-outline"
              onPress={() => navigation.navigate('CreateEvent')}
            />
            <Button
              label="Calendario"
              variant="secondary"
              iconName="calendar-outline"
              onPress={() => navigation.navigate('EventsCalendar')}
            />
          </View>
        ) : (
          <View style={styles.buttonsRow}>
            <View style={styles.buttonWrapper}>
              <Button
                label="Nuevo evento"
                iconName="add-circle-outline"
                onPress={() => navigation.navigate('CreateEvent')}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                label="Calendario"
                variant="secondary"
                iconName="calendar-outline"
                onPress={() => navigation.navigate('EventsCalendar')}
              />
            </View>
          </View>
        )}
      </View>

      {/* Lista de eventos */}
      <FlatList
        data={events || []}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 120 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No hay eventos"
            description="Crea tu primer evento para comenzar"
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonsColumn: {
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  eventCardWrapper: {
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 8,
    lineHeight: 24,
  },
  eventTitleCompact: {
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
  badgesContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  overdueBadge: {
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  metricValueCompact: {
    fontSize: 14,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#1e293b',
    marginHorizontal: 8,
  },
});
