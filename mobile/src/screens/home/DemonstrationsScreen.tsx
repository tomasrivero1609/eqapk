import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "../../components/ui/Screen";
import { demoImages } from "./demonstrationsData";
import ImageViewerLocal from "../../components/ui/ImageViewerLocal";

// Componente de Card con animación
const AnimatedCard = ({ 
  item, 
  index, 
  cardWidth, 
  cardHeight, 
  imageHeight, 
  onPress 
}: {
  item: { source: any; label: string };
  index: number;
  cardWidth: number;
  cardHeight: number;
  imageHeight: number;
  onPress: (index: number) => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <View style={[styles.cardWrapper, { width: cardWidth }]}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => onPress(index)}
          style={[styles.card, { width: cardWidth, height: cardHeight }]}
        >
          {/* Image Container */}
          <View style={[styles.imageContainer, { height: imageHeight }]}>
            <Image
              source={item.source}
              style={[styles.image, { width: cardWidth, height: imageHeight }]}
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
      </Animated.View>
    </View>
  );
};

export default function DemonstrationsScreen({ navigation }: any) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Tamaño fijo y consistente para TODAS las cards
  const CARD_WIDTH = width - 64; // Ancho de pantalla menos padding
  const CARD_HEIGHT = height * 0.65; // 65% de la altura de pantalla
  const IMAGE_HEIGHT = CARD_HEIGHT - 80; // Altura de imagen (resta espacio para texto)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + 32));
    setCurrentIndex(index);
  };

  const openImageViewer = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  return (
    <Screen>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Demostraciones</Text>
            <Text style={styles.description}>
              Explora nuestra selección de platos
            </Text>
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
            data={demoImages}
            keyExtractor={(_, index) => `demo-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 32}
            decelerationRate="fast"
            contentContainerStyle={styles.flatListContent}
            onMomentumScrollEnd={handleScroll}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => (
              <AnimatedCard
                item={item}
                index={index}
                cardWidth={CARD_WIDTH}
                cardHeight={CARD_HEIGHT}
                imageHeight={IMAGE_HEIGHT}
                onPress={openImageViewer}
              />
            )}
          />
        </View>

        {/* Indicador de posición */}
        <View style={[styles.indicatorContainer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.indicator}>
            <Text style={styles.indicatorText}>
              {currentIndex + 1} / {demoImages.length}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Image Viewer */}
      <ImageViewerLocal
        visible={viewerVisible}
        images={demoImages}
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
  indicatorContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 16,
  },
  indicator: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  indicatorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
  },
});
