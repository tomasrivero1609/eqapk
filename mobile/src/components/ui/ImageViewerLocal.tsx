import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type ViewerImage = {
  source: any;
  label?: string;
};

type ImageViewerLocalProps = {
  visible: boolean;
  images: ViewerImage[];
  initialIndex?: number;
  onClose: () => void;
};

export default function ImageViewerLocal({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: ImageViewerLocalProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ViewerImage>>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsReady(false);
      return;
    }
    
    setCurrentIndex(initialIndex);
    
    // Esperar a que el modal esté completamente renderizado
    const timer1 = setTimeout(() => {
      setIsReady(true);
    }, 100);

    // Hacer scroll después de que esté listo
    const timer2 = setTimeout(() => {
      if (listRef.current && initialIndex >= 0 && initialIndex < images.length) {
        try {
          listRef.current.scrollToIndex({
            index: initialIndex,
            animated: false,
            viewPosition: 0.5,
          });
        } catch (error) {
          // Si falla scrollToIndex, usar scrollToOffset como fallback
          listRef.current.scrollToOffset({
            offset: initialIndex * width,
            animated: false,
          });
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [visible, initialIndex, width, images.length]);

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
      supportedOrientations={["portrait", "landscape"]}
    >
      <SafeAreaView className="flex-1 bg-black" edges={['left', 'right', 'bottom']}>
        <View className="flex-1" pointerEvents="box-none">
          <View
            className="absolute left-0 right-0 z-10 px-5 pb-4"
            pointerEvents="box-none"
            style={{ paddingTop: insets.top + 12 }}
          >
            <View className="flex-row items-center justify-between">
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text className="text-base font-semibold text-slate-100" numberOfLines={2}>
                  {images[currentIndex]?.label || ""}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="rounded-full bg-slate-800/70 px-4 py-2"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text className="text-xs font-semibold text-slate-200">Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            key={`${width}x${height}`}
            ref={listRef}
            data={images}
            keyExtractor={(_, index) => `viewer-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width}
            decelerationRate="fast"
            initialNumToRender={Math.max(initialIndex + 1, 2)}
            initialScrollIndex={isReady ? undefined : initialIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onMomentumScrollEnd={handleMomentumEnd}
            onScrollToIndexFailed={(info) => {
              // Fallback si falla el scroll inicial
              const wait = new Promise(resolve => setTimeout(resolve, 500));
              wait.then(() => {
                listRef.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                  viewPosition: 0.5,
                });
              });
            }}
            renderItem={({ item, index }) => (
              <View style={{ width, height }}>
                <ScrollView
                  style={{ width, height }}
                  contentContainerStyle={{
                    width,
                    height,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  maximumZoomScale={3}
                  minimumZoomScale={1}
                  bouncesZoom
                  centerContent
                >
                  <Image
                    source={item.source}
                    style={{ width, height }}
                    resizeMode="contain"
                  />
                </ScrollView>
              </View>
            )}
          />

          <View className="absolute bottom-6 left-0 right-0 items-center">
            <Text className="text-xs text-slate-300">
              {images.length ? `${currentIndex + 1} / ${images.length}` : ""}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
