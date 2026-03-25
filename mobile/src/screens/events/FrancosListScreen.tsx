import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '../../services/eventService';
import { Event, EventType } from '../../types';
import Screen from '../../components/ui/Screen';
import EmptyState from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';

const toLocalDate = (dateStr: string): Date => {
  const d = dateStr.slice(0, 10);
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
};

const isPast = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toLocalDate(dateStr) < today;
};

const isToday = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toLocalDate(dateStr).getTime() === today.getTime();
};

const formatFullDate = (dateStr: string): string => {
  const date = toLocalDate(dateStr);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
};

const getDateNumber = (dateStr: string): string => {
  return String(toLocalDate(dateStr).getDate());
};

const getMonthShort = (dateStr: string): string => {
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return months[toLocalDate(dateStr).getMonth()];
};

type ListItem =
  | { type: 'header'; title: string }
  | { type: 'franco'; data: Event; isLast: boolean };

export default function FrancosListScreen({ navigation }: any) {
  const canCreate = useAuthStore((s) => s.hasPermission('francos', 'crear'));
  const { data: allEvents, isLoading, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getAll(),
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refetch());
    return unsubscribe;
  }, [navigation, refetch]);

  const listItems = useMemo(() => {
    const francos = (allEvents || [])
      .filter((e) => e.eventType === EventType.FRANCO)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const upcoming = francos.filter((e) => !isPast(e.date));
    const past = francos.filter((e) => isPast(e.date)).reverse();

    const items: ListItem[] = [];

    if (upcoming.length > 0) {
      items.push({ type: 'header', title: 'Próximos' });
      upcoming.forEach((e, i) =>
        items.push({ type: 'franco', data: e, isLast: i === upcoming.length - 1 }),
      );
    }

    if (past.length > 0) {
      items.push({ type: 'header', title: 'Pasados' });
      past.forEach((e, i) =>
        items.push({ type: 'franco', data: e, isLast: i === past.length - 1 }),
      );
    }

    return items;
  }, [allEvents]);

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
        </View>
      );
    }

    const franco = item.data;
    const past = isPast(franco.date);
    const today = isToday(franco.date);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.timelineRow}
        onPress={() => navigation.navigate('FrancoDetail', { eventId: franco.id })}
      >
        {/* Timeline left: date pill + line */}
        <View style={styles.timelineLeft}>
          <View style={[
            styles.datePill,
            today && styles.datePillToday,
            past && styles.datePillPast,
          ]}>
            <Text style={[styles.dateNumber, today && styles.dateNumberToday, past && styles.dateNumberPast]}>
              {getDateNumber(franco.date)}
            </Text>
            <Text style={[styles.dateMonth, today && styles.dateMonthToday, past && styles.dateMonthPast]}>
              {getMonthShort(franco.date)}
            </Text>
          </View>
          {!item.isLast && <View style={[styles.timelineLine, past && styles.timelineLinePast]} />}
        </View>

        {/* Content */}
        <View style={[styles.timelineContent, past && styles.timelineContentPast]}>
          <View style={styles.contentHeader}>
            <Ionicons name="sunny-outline" size={16} color={past ? '#475569' : '#fbbf24'} />
            <Text style={[styles.francoName, past && styles.francoNamePast]} numberOfLines={1}>
              {franco.name}
            </Text>
          </View>
          <Text style={[styles.francoDate, past && styles.francoDatePast]}>
            {formatFullDate(franco.date)}
          </Text>
          {franco.description ? (
            <View style={styles.peopleRow}>
              <Ionicons name="person-outline" size={12} color={past ? '#475569' : '#64748b'} />
              <Text style={[styles.francoDesc, past && styles.francoDescPast]} numberOfLines={1}>
                {franco.description}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <FlatList
        data={listItems}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'header' ? `h-${item.title}` : `f-${item.data.id}`
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          canCreate ? (
            <TouchableOpacity
              style={styles.fab}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CreateFranco')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.fabText}>Nuevo franco</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            title="Sin francos registrados"
            description="Registrá un día libre o franco"
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 4,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineLeft: {
    width: 56,
    alignItems: 'center',
  },
  datePill: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillToday: {
    backgroundColor: '#f59e0b',
  },
  datePillPast: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  dateNumberToday: {
    color: '#0f172a',
  },
  dateNumberPast: {
    color: '#475569',
  },
  dateMonth: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    marginTop: -1,
  },
  dateMonthToday: {
    color: '#451a03',
  },
  dateMonthPast: {
    color: '#334155',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1e293b',
    marginVertical: 4,
  },
  timelineLinePast: {
    backgroundColor: '#0f172a',
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    marginLeft: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  timelineContentPast: {
    opacity: 0.5,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  francoName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f1f5f9',
    flex: 1,
  },
  francoNamePast: {
    color: '#94a3b8',
  },
  francoDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  francoDatePast: {
    color: '#475569',
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  francoDesc: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  francoDescPast: {
    color: '#475569',
  },
});
