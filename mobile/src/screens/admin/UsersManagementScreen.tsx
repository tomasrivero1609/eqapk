import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { userService, UserListItem } from '../../services/userService';
import Screen from '../../components/ui/Screen';
import EmptyState from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';

export default function UsersManagementScreen({ navigation }: any) {
  const canCreate = useAuthStore((s) => s.hasPermission('usuarios', 'crear'));
  const canDelete = useAuthStore((s) => s.hasPermission('usuarios', 'eliminar'));
  const currentUserId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => refetch());
    return unsub;
  }, [navigation, refetch]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleDelete = (user: UserListItem) => {
    if (user.id === currentUserId) {
      Alert.alert('Error', 'No podés eliminar tu propio usuario');
      return;
    }
    Alert.alert(
      'Eliminar usuario',
      `¿Seguro que querés eliminar a ${user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(user.id),
        },
      ],
    );
  };

  const getRoleBadge = (role: string) => {
    const isSuperAdmin = role === 'SUPERADMIN';
    return (
      <View style={[styles.roleBadge, isSuperAdmin && styles.roleBadgeSuper]}>
        <Text style={[styles.roleBadgeText, isSuperAdmin && styles.roleBadgeTextSuper]}>
          {isSuperAdmin ? 'Super Admin' : 'Staff'}
        </Text>
      </View>
    );
  };

  const getPermissionCount = (user: UserListItem): number => {
    if (user.role === 'SUPERADMIN') return 7;
    const perms = user.permissions || {};
    return Object.values(perms).filter(
      (actions) => Array.isArray(actions) && actions.length > 0,
    ).length;
  };

  const renderItem = ({ item }: { item: UserListItem }) => {
    const isCurrentUser = item.id === currentUserId;

    return (
      <TouchableOpacity
        style={[styles.userCard, isCurrentUser && styles.userCardCurrent]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('UserEdit', { userId: item.id })}
      >
        <View style={styles.userCardContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.name}
              </Text>
              {isCurrentUser && (
                <Text style={styles.youLabel}>(vos)</Text>
              )}
            </View>
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
            <View style={styles.metaRow}>
              {getRoleBadge(item.role)}
              <Text style={styles.permCount}>
                {getPermissionCount(item)} módulos
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            {canDelete && !isCurrentUser && item.role !== 'SUPERADMIN' && (
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={styles.deleteBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
            <Ionicons name="chevron-forward" size={18} color="#475569" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      <FlatList
        data={users || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          canCreate ? (
            <TouchableOpacity
              style={styles.fab}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('UserEdit', { userId: null })}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.fabText}>Nuevo usuario</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
          ) : (
            <EmptyState
              title="Sin usuarios"
              description="No se encontraron usuarios"
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    gap: 8,
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  userCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  userCardCurrent: {
    borderColor: '#7c3aed40',
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c4b5fd',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  youLabel: {
    fontSize: 11,
    color: '#7c3aed',
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  roleBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeSuper: {
    backgroundColor: '#7c3aed20',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  roleBadgeTextSuper: {
    color: '#c4b5fd',
  },
  permCount: {
    fontSize: 10,
    color: '#475569',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    padding: 4,
  },
  loading: {
    paddingTop: 60,
    alignItems: 'center',
  },
});
