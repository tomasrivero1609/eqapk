import React, { useRef, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, useWindowDimensions, Modal, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";

const images = [
  require("../../assets/images/test1.jpeg"),
  require("../../assets/images/test2.jpeg"),
  require("../../assets/images/test3.jpeg"),
  require("../../assets/images/test4.jpeg"),
];

export default function DemonstrationsScreen({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const cardWidth = Math.min(520, width - 48);
  const imageHeight = Math.min(cardWidth * 0.95, height * 0.65);
  const insets = useSafeAreaInsets();
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const viewerListRef = useRef<FlatList<number> | null>(null);

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setIsViewerOpen(true);
    setTimeout(() => {
      viewerListRef.current?.scrollToIndex({ index, animated: false });
    }, 50);
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1">
        <View className="px-6 pt-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-semibold text-slate-100">
              Demostraciones
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="rounded-full bg-slate-800 px-4 py-2"
            >
              <Text className="text-xs font-semibold text-slate-200">Volver</Text>
            </TouchableOpacity>
          </View>
          <Text className="mt-2 text-sm text-slate-400">
            Desliza para ver los platos.
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="center"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 80 }}
        >
          {images.map((source, index) => (
            <View key={`demo-${index}`} style={{ width: cardWidth, marginRight: 16 }}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => openViewer(index)}>
                <Card className="p-0 overflow-hidden bg-slate-950/70">
                  <Image
                    source={source}
                    style={{ width: "100%", height: imageHeight, borderRadius: 18 }}
                    resizeMode="contain"
                  />
                </Card>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <Modal visible={isViewerOpen} transparent animationType="fade">
          <View className="flex-1 bg-black">
            <View className="absolute right-6 z-10" style={{ top: Math.max(16, insets.top + 6) }}>
              <TouchableOpacity
                onPress={() => setIsViewerOpen(false)}
                className="rounded-full bg-slate-800/80 px-4 py-2"
              >
                <Text className="text-xs font-semibold text-slate-200">Cerrar</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              ref={viewerListRef}
              data={images.map((_, index) => index)}
              keyExtractor={(index) => `viewer-${index}`}
              horizontal
              pagingEnabled
              initialScrollIndex={viewerIndex}
              showsHorizontalScrollIndicator={false}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              renderItem={({ item: index }) => (
                <View style={{ width, height }} className="items-center justify-center">
                  <Image
                    source={images[index]}
                    style={{ width: width, height: height * 0.8 }}
                    resizeMode="contain"
                  />
                </View>
              )}
            />
          </View>
        </Modal>
      </SafeAreaView>
    </Screen>
  );
}
