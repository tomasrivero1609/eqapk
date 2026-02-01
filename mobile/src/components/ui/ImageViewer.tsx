import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewerImage = {
  uri: string;
  title?: string;
};

type ImageViewerProps = {
  visible: boolean;
  images: ViewerImage[];
  initialIndex?: number;
  onClose: () => void;
};

export default function ImageViewer({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: ImageViewerProps) {
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<ViewerImage>>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setCurrentIndex(initialIndex);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: width * initialIndex,
        animated: false,
      });
    });
  }, [visible, initialIndex, width]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(nextIndex);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      presentationStyle="fullScreen"
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1">
          <View className="absolute left-0 right-0 top-0 z-10 px-5 pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-slate-100">
                {images[currentIndex]?.title || ''}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="rounded-full bg-slate-800/70 px-4 py-2"
              >
                <Text className="text-xs font-semibold text-slate-200">Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            ref={listRef}
            data={images}
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumEnd}
            renderItem={({ item }) => (
              <ScrollView
                style={{ width, height }}
                contentContainerStyle={{
                  width,
                  height,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                maximumZoomScale={3}
                minimumZoomScale={1}
                bouncesZoom
                centerContent
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{ width, height }}
                  resizeMode="contain"
                />
              </ScrollView>
            )}
          />

          <View className="absolute bottom-6 left-0 right-0 items-center">
            <Text className="text-xs text-slate-300">
              {images.length ? `${currentIndex + 1} / ${images.length}` : ''}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
