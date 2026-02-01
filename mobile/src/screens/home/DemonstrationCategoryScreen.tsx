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
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';
import { demonstrationService } from '../../services/demonstrationService';
import { supabase } from '../../services/supabaseClient';

const BUCKET_NAME = 'demostraciones';

const getFileExtension = (uri: string) => {
  const match = uri.split('.');
  return match[match.length - 1] || 'jpg';
};

export default function DemonstrationCategoryScreen({ navigation, route }: any) {
  const { category } = route.params as { category: string };
  const { width } = useWindowDimensions();
  const isCompact = width < 400;
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role || UserRole.ADMIN);
  const canUpload = role === UserRole.ADMIN || role === UserRole.SUPERADMIN;

  const { data: items, isLoading } = useQuery({
    queryKey: ['demonstrations', category],
    queryFn: () => demonstrationService.getByCategory(category),
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a tus fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (result.canceled) {
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

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, blob, {
          contentType: asset.mimeType || `image/${ext}`,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      const imageUrl = data.publicUrl;

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
              Fotos cargadas para esta categoria.
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
              grouped.map((item) => (
                <Card key={item.id} className="p-0 overflow-hidden">
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: '100%', height: 220 }}
                    resizeMode="cover"
                  />
                  <View className="px-4 py-3">
                    <Text className="text-base font-semibold text-slate-100">
                      {item.title}
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
