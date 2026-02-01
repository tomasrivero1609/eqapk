import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageViewer from '../../components/ui/ImageViewer';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { demonstrationService } from '../../services/demonstrationService';
import { supabaseAnonKey, supabaseUrl } from '../../services/supabaseClient';

const BUCKET_NAME = 'demostraciones';

const getFileExtension = (uri: string) => {
  const match = uri.split('.');
  return match[match.length - 1] || 'jpg';
};

export default function DemonstrationCategoryScreen({ navigation, route }: any) {
  const { category, mode = 'view' } = route.params as {
    category: string;
    mode?: 'view' | 'manage';
  };
  const { width: screenWidth } = useWindowDimensions();
  const isCompact = screenWidth < 400;
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role || UserRole.ADMIN);
  const canManage = role === UserRole.ADMIN || role === UserRole.SUPERADMIN;
  const canUpload = canManage && mode === 'manage';

  const { data: items, isLoading } = useQuery({
    queryKey: ['demonstrations', category],
    queryFn: () => demonstrationService.getByCategory(category),
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted && permission.accessPrivileges !== 'limited') {
      Alert.alert('Permiso requerido', 'Habilita el acceso a fotos para continuar.');
      return;
    }
    let result: ImagePicker.ImagePickerResult;
    try {
      const mediaTypes =
        (ImagePicker as any).MediaType?.Images || ImagePicker.MediaTypeOptions.Images;
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        quality: 0.85,
      });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo abrir la galeria.');
      return;
    }

    if (result.canceled) {
      return;
    }
    if (!result.assets || result.assets.length === 0) {
      Alert.alert('Error', 'No se pudo leer la imagen seleccionada.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Falta titulo', 'Escribe el nombre del plato antes de subir.');
      return;
    }

    const asset = result.assets[0];
    try {
      setUploading(true);
      const ext = getFileExtension(asset.uri);
      const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

      const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${fileName}`;
      const uploadResult = await FileSystem.uploadAsync(uploadUrl, asset.uri, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
          'Content-Type': asset.mimeType || `image/${ext}`,
          'x-upsert': 'false',
        },
      });

      if (uploadResult.status < 200 || uploadResult.status >= 300) {
        throw new Error(`Upload failed (${uploadResult.status})`);
      }

      const imageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;

      await demonstrationService.create({
        title: title.trim(),
        category,
        imageUrl,
      });

      setTitle('');
      queryClient.invalidateQueries({ queryKey: ['demonstrations', category] });
      Alert.alert('Listo', 'Imagen subida correctamente.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const grouped = useMemo(() => items || [], [items]);
  const viewerImages = useMemo(
    () => grouped.map((item) => ({ uri: item.imageUrl, title: item.title })),
    [grouped]
  );
  const deleteFromStorage = async (imageUrl: string) => {
    const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const index = imageUrl.indexOf(marker);
    if (index === -1) {
      return { ok: false, status: 0 };
    }
    const filePath = imageUrl.slice(index + marker.length);
    const encodedPath = filePath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    const deleteUrl = `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${encodedPath}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
    });
    if (response.status === 404) {
      return { ok: true, status: 404 };
    }
    if (!response.ok) {
      return { ok: false, status: response.status };
    }
    return { ok: true, status: response.status };
  };

  const handleDelete = (item: { id: string; imageUrl: string }) => {
    Alert.alert('Eliminar imagen', '¿Seguro que deseas eliminar esta imagen?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingId(item.id);
            const storageResult = await deleteFromStorage(item.imageUrl);
            await demonstrationService.remove(item.id);
            queryClient.invalidateQueries({ queryKey: ['demonstrations', category] });
            if (!storageResult.ok) {
              Alert.alert(
                'Aviso',
                'Se borro el registro, pero no se pudo borrar la imagen en Supabase.'
              );
            }
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'No se pudo eliminar la imagen.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="pb-32">
          <View className="px-6 pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-2xl font-semibold text-slate-100">{category}</Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="rounded-full bg-slate-800 px-4 py-2"
              >
                <Text className="text-xs font-semibold text-slate-200">Volver</Text>
              </TouchableOpacity>
            </View>
            <Text className="mt-2 text-sm text-slate-400">
              {mode === 'manage'
                ? 'Carga y administra las fotos de esta categoria.'
                : 'Fotos cargadas para esta categoria.'}
            </Text>
          </View>

          {canUpload && (
            <View className="mt-6 px-6 space-y-3">
              <Card>
                <Text className="text-xs font-semibold text-slate-400">Nueva imagen</Text>
                <View className="mt-3 space-y-3">
                  <Input
                    label="Titulo"
                    placeholder="Nombre del plato"
                    value={title}
                    onChangeText={setTitle}
                  />
                  <Button
                    label={uploading ? 'Subiendo...' : 'Subir imagen'}
                    onPress={pickImage}
                    loading={uploading}
                  />
                </View>
              </Card>
            </View>
          )}

          <View className={`mt-6 px-6 ${isCompact ? 'space-y-3' : 'space-y-4'}`}>
            {isLoading ? (
              <Text className="text-sm text-slate-400">Cargando...</Text>
            ) : grouped.length === 0 ? (
              <Text className="text-sm text-slate-400">Sin imagenes cargadas.</Text>
            ) : (
              grouped.map((item, index) => (
                <Card key={item.id} className="p-0 overflow-hidden">
                  <View className="flex-row items-center justify-between border-b border-slate-700/50 px-4 py-3">
                    <Text className="text-base font-semibold text-slate-100">
                      {item.title}
                    </Text>
                    {canUpload && (
                      <TouchableOpacity
                        onPress={() => handleDelete({ id: item.id, imageUrl: item.imageUrl })}
                        disabled={deletingId === item.id}
                        className="rounded-full bg-rose-500/15 px-3 py-1"
                      >
                        <Text className="text-xs font-semibold text-rose-300">
                          {deletingId === item.id ? 'Eliminando...' : 'Eliminar'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      setViewerIndex(index);
                      setViewerVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: '100%', height: 220 }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
      <ImageViewer
        visible={viewerVisible}
        images={viewerImages}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </Screen>
  );
}
