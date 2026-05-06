import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { clientService } from '../../services/clientService';
import { isNetworkError, isColdStart } from '../../services/api';
import { Client } from '../../types';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import NetworkError from '../../components/ui/NetworkError';
import Button from '../../components/ui/Button';

const PAGE_SIZE = 20;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ClientsListScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 400;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['clients', debouncedSearch, page],
    queryFn: () => clientService.getAll({ page, limit: PAGE_SIZE, search: debouncedSearch || undefined }),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    setPage(1);
    setAllClients([]);
    setHasMore(true);
  }, [debouncedSearch]);

  useEffect(() => {
    if (data) {
      setAllClients((prev) => {
        if (page === 1) return data.data;
        const ids = new Set(prev.map((c) => c.id));
        return [...prev, ...data.data.filter((c) => !ids.has(c.id))];
      });
      setHasMore(page < data.totalPages);
    }
  }, [data, page]);

  useEffect(() => {
    if (!isFetching) setLoadingMore(false);
  }, [isFetching]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !isFetching) {
      setLoadingMore(true);
      setPage((p) => p + 1);
    }
  }, [loadingMore, hasMore, isFetching]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setAllClients([]);
    setHasMore(true);
    refetch();
  }, [refetch]);

  if (isLoading && allClients.length === 0) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  if (error && allClients.length === 0 && (isNetworkError(error) || isColdStart(error))) {
    return (
      <Screen>
        <NetworkError error={error} onRetry={handleRefresh} isRetrying={isLoading} />
      </Screen>
    );
  }

  const renderClient = ({ item }: { item: Client }) => (
    <TouchableOpacity
      className="mx-4 my-2"
      onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
    >
      <Card>
        <View className="flex-row items-center justify-between">
          <Text className={`${isCompact ? 'text-base' : 'text-lg'} font-bold text-slate-100`}>{item.name}</Text>
          <Text className="text-xs font-semibold text-violet-300">Ver</Text>
        </View>
        <View className={`${isCompact ? 'mt-1' : 'mt-2'} space-y-1`}>
          {item.email ? (
            <Text className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-400`}>{item.email}</Text>
          ) : null}
          {item.phone ? (
            <Text className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-400`}>{item.phone}</Text>
          ) : null}
          {item.address ? (
            <Text className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-400`}>{item.address}</Text>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View className="px-4 pt-6 pb-2">
        <Button
          label="Nuevo cliente"
          onPress={() => navigation.navigate('CreateClient')}
        />
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, email o teléfono…"
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={(v) => { setSearch(v); setPage(1); }}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCapitalize="none"
        />
      </View>
      <FlatList
        data={allClients}
        renderItem={renderClient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 120 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            title={debouncedSearch ? 'Sin resultados' : 'No hay clientes'}
            description={debouncedSearch ? `No encontramos clientes que coincidan con "${debouncedSearch}"` : 'Crea un cliente para comenzar'}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#8B5CF6" style={{ marginVertical: 16 }} />
          ) : hasMore && allClients.length > 0 ? (
            <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore} activeOpacity={0.8}>
              <Text style={styles.loadMoreText}>Cargar más</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
  },
  searchInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  loadMoreBtn: {
    alignSelf: 'center',
    marginVertical: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  loadMoreText: {
    color: '#c4b5fd',
    fontWeight: '600',
    fontSize: 14,
  },
});
