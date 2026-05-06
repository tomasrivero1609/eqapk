import React, { useEffect, useMemo } from 'react';
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
import { isNetworkError, isColdStart } from '../../services/api';
import { Event, EventType } from '../../types';
import Screen from '../../components/ui/Screen';
import EmptyState from '../../components/ui/EmptyState';
import NetworkError from '../../components/ui/NetworkError';
import { useAuthStore } from '../../store/authStore';

const toLocalDate = (dateStr: string): Date => {
  const d = dateStr.slice(0, 10);
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
};

const getRelativeLabel = (dateStr: string): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = toLocalDate(dateStr);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays === -1) return 'Ayer';
  if (diffDays > 1 && diffDays <= 7) return `En ${diffDays} días`;
  if (diffDays < -1) return 'Pasada';
  return '';
};

const isPast = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toLocalDate(dateStr) < today;
};

const formatShortDate = (dateStr: string): string => {
  const date = toLocalDate(dateStr);
  const day = date.getDate();
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${day} ${months[date.getMonth()]}`;
};

const getDayName = (dateStr: string): string => {
  const date = toLocalDate(dateStr);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

type SectionItem =
  | { type: 'header'; title: string }
  | { type: 'entrevista'; data: Event };

export default function EntrevistasListScreen({ navigation }: any) {
  const canCreate = useAuthStore((s) => s.hasPermission('entrevistas', 'crear'));
  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: ['events', 'VISITA'],
    queryFn: () => eventService.getAll({ type: 'VISITA', limit: 100 }),
  });
  const allEvents = result?.data ?? [];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 400;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => refetch());
    return unsubscribe;
  }, [navigation, refetch]);

  const sections = useMemo(() => {
    const entrevistas = allEvents
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const upcoming = entrevistas.filter((e) => !isPast(e.date));
    const past = entrevistas.filter((e) => isPast(e.date)).reverse();

    const items: SectionItem[] = [];

    if (upcoming.length > 0) {
      items.push({ type: 'header', title: 'Próximas' });
      upcoming.forEach((e) => items.push({ type: 'entrevista', data: e }));
    }

    if (past.length > 0) {
      items.push({ type: 'header', title: 'Pasadas' });
      past.forEach((e) => items.push({ type: 'entrevista', data: e }));
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

  if (error && (isNetworkError(error) || isColdStart(error))) {
    return (
      <Screen>
        <NetworkError error={error} onRetry={refetch} isRetrying={isLoading} />
      </Screen>
    );
  }

  const renderItem = ({ item }: { item: SectionItem }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
        </View>
      );
    }

    const e = item.data;
    const past = isPast(e.date);
    const relativeLabel = getRelativeLabel(e.date);
    const isToday = relativeLabel === 'Hoy';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.row, past && styles.rowPast]}
        onPress={() => navigation.navigate('EntrevistaDetail', { eventId: e.id })}
      >
        <View style={[styles.dateBlock, isToday && styles.dateBlockToday]}>
          <Text style={[styles.dateDay, isToday && styles.dateDayToday]}>{formatShortDate(e.date)}</Text>
          <Text style={[styles.dateDayName, isToday && styles.dateDayNameToday]}>{getDayName(e.date)}</Text>
        </View>

        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <Text style={[styles.rowName, past && styles.rowNamePast]} numberOfLines={1}>
              {e.name}
            </Text>
            {relativeLabel && !past ? (
              <View style={[styles.relativeBadge, isToday && styles.relativeBadgeToday]}>
                <Text style={[styles.relativeText, isToday && styles.relativeTextToday]}>{relativeLabel}</Text>
              </View>
            ) : null}
          </View>

          {e.startTime ? (
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={12} color={past ? '#475569' : '#64748b'} />
              <Text style={[styles.timeText, past && styles.timeTextPast]}>
                {e.startTime}{e.endTime ? ` - ${e.endTime}` : ''}
              </Text>
            </View>
          ) : null}

          {e.description ? (
            <Text style={[styles.description, past && styles.descriptionPast]} numberOfLines={1}>
              {e.description}
            </Text>
          ) : null}
        </View>

        <Ionicons name="chevron-forward" size={16} color={past ? '#334155' : '#475569'} />
      </TouchableOpacity>
    );
  };

  const entrevistasCount = sections.filter((s) => s.type === 'entrevista').length;

  return (
    <Screen>
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'header' ? `h-${item.title}` : `e-${item.data.id}`
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
              onPress={() => navigation.navigate('CreateVisit')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.fabText}>Nueva entrevista</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            title="Sin entrevistas"
            description="Agendá tu primera entrevista"
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
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12,
  },
  rowPast: {
    opacity: 0.55,
  },
  dateBlock: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBlockToday: {
    backgroundColor: '#7c3aed',
  },
  dateDay: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  dateDayToday: {
    color: '#fff',
  },
  dateDayName: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  dateDayNameToday: {
    color: '#e9d5ff',
  },
  rowContent: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f1f5f9',
    flex: 1,
  },
  rowNamePast: {
    color: '#94a3b8',
  },
  relativeBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  relativeBadgeToday: {
    backgroundColor: '#7c3aed',
  },
  relativeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  relativeTextToday: {
    color: '#fff',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
  },
  timeTextPast: {
    color: '#475569',
  },
  description: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  descriptionPast: {
    color: '#475569',
  },
});
