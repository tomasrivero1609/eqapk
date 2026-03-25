import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '../../services/eventService';
import { EventStatus } from '../../types';
import Screen from '../../components/ui/Screen';
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

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export default function FrancoDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params;
  const queryClient = useQueryClient();

  const { data: franco, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventService.getById(eventId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => eventService.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigation.goBack();
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Eliminar franco',
      '¿Estás seguro de que deseas eliminar este franco?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ],
    );
  };

  if (isLoading || !franco) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.name}>{franco.name}</Text>
          <View style={styles.badgeRow}>
            <Badge
              label={statusLabels[franco.status] || franco.status}
              variant={statusVariant(franco.status)}
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <InfoRow
            icon="calendar-outline"
            label="Fecha"
            value={formatLocalDate(franco.date)}
          />
          {franco.description ? (
            <InfoRow
              icon="document-text-outline"
              label="Descripción"
              value={franco.description}
            />
          ) : null}
          {franco.notes ? (
            <InfoRow
              icon="chatbubble-outline"
              label="Notas"
              value={franco.notes}
            />
          ) : null}
          <InfoRow
            icon="time-outline"
            label="Creado"
            value={new Date(franco.createdAt).toLocaleDateString('es-AR')}
          />
        </View>

        <View style={styles.actionsSection}>
          <Button
            label="Eliminar franco"
            variant="danger"
            iconName="trash-outline"
            onPress={handleDelete}
            loading={deleteMutation.isPending}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.iconContainer}>
        <Ionicons name={icon} size={18} color="#c4b5fd" />
      </View>
      <View style={infoStyles.content}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  headerSection: {
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 16,
  },
  actionsSection: {
    marginTop: 24,
  },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#e2e8f0',
    fontWeight: '600',
    lineHeight: 20,
  },
});
