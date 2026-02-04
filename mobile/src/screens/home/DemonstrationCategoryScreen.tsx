import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Screen from "../../components/ui/Screen";
import { demoCategories } from "./demonstrationsData";
import ImageViewerLocal from "../../components/ui/ImageViewerLocal";

export default function DemonstrationCategoryScreen({ navigation, route }: any) {
  const { categoryKey } = route.params as { categoryKey: string };
  const category = demoCategories.find((item) => item.key === categoryKey);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  
  // Tamaño fijo y consistente para TODAS las cards
  const CARD_WIDTH = width - 64; // Ancho de pantalla menos padding
  const CARD_HEIGHT = height * 0.65; // 65% de la altura de pantalla (reducido para más espacio arriba)
  const IMAGE_HEIGHT = CARD_HEIGHT - 80; // Altura de imagen (resta espacio para texto)

  if (!category) {
    return (
      <Screen>
        <SafeAreaView className="flex-1">
          <View className="px-6 pt-4">
            <Text className="text-base text-slate-100">Categoria no encontrada.</Text>
          </View>
        </SafeAreaView>
      </Screen>
    );
  }

  const openImageViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  return (
    <Screen>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{category.title}</Text>
            <Text style={styles.description}>{category.description}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>

        {/* Cards Container */}
        <View style={styles.cardsContainer}>
          <FlatList
            data={category.images}
            keyExtractor={(_, index) => `${category.key}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 32}
            decelerationRate="fast"
            contentContainerStyle={styles.flatListContent}
            renderItem={({ item, index }) => (
              <View style={[styles.cardWrapper, { width: CARD_WIDTH }]}>
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={() => openImageViewer(index)}
                  style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
                >
                  {/* Image Container */}
                  <View style={[styles.imageContainer, { height: IMAGE_HEIGHT }]}>
                    <Image
                      source={item.source}
                      style={[styles.image, { width: CARD_WIDTH, height: IMAGE_HEIGHT }]}
                      resizeMode="cover"
                    />
                  </View>

                  {/* Label Container */}
                  <View style={styles.labelContainer}>
                    <Text style={styles.label} numberOfLines={2}>
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </SafeAreaView>

      {/* Image Viewer */}
      <ImageViewerLocal
        visible={viewerVisible}
        images={category.images}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  cardWrapper: {
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  imageContainer: {
    width: "100%",
    backgroundColor: "#1e293b",
    overflow: "hidden",
  },
  image: {
    backgroundColor: "#1e293b",
  },
  labelContainer: {
    height: 80,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e2e8f0",
    lineHeight: 22,
  },
});
