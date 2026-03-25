import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '../../services/eventService';
import { Event, EventStatus, EventType } from '../../types';
import Screen from '../../components/ui/Screen';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatLocalDate } from '../../utils/date';

const statusVariant = (status: EventStatus) => {
  switch (status) {
    case EventStatus.CONFIRMED:
      return 'success';
    case EventStatus.COMPLETED:
      return 'neutral';
    case EventStatus.CANCELLED:
      return 'danger';
    default:
      return 'warning';
  }
};

export default function FrancosListScreen({ navigation }: any) {
  const { data: allEvents, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getAll(),
  });
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isCompact = width < 400;
  const isLandscape = width > height;

  const francos = (allEvents || []).filter(
    (e) => e.eventType === EventType.FRANCO,
  );

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

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardWrapper}
      onPress={() => navigation.navigate('FrancoDetail', { eventId: item.id })}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isCompact && styles.titleCompact]} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
              <Text style={styles.dateText}>{formatLocalDate(item.date)}</Text>
            </View>
          </View>
          <View style={styles.badgesContainer}>
            <Badge label={item.status} variant={statusVariant(item.status)} />
          </View>
        </View>

        {item.description ? (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={[styles.header, { paddingTop: isLandscape ? 24 : 16 }]}>
        <Button
          label="Nuevo franco"
          iconName="add-circle-outline"
          onPress={() => navigation.navigate('CreateFranco')}
        />
      </View>

      <FlatList
        data={francos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No hay francos registrados"
            description="Registra un franco o día libre"
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 8,
    lineHeight: 24,
  },
  titleCompact: {
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  badgesContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  descriptionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  descriptionText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
});
