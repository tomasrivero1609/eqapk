import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";

const demoImages = [
  require("../../assets/images/test1.jpeg"),
  require("../../assets/images/test2.jpeg"),
  require("../../assets/images/test3.jpeg"),
  require("../../assets/images/test4.jpeg"),
];

export default function DemonstrationsScreen({ navigation }: any) {
  return (
    <Screen>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="pb-32">
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

          <View className="mt-6 px-6">
            <FlatList
              data={demoImages}
              keyExtractor={(_, index) => `demo-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center"
              renderItem={({ item }) => (
                <Card className="mr-4 p-0 overflow-hidden" style={{ width: 280 }}>
                  <Image source={item} style={{ width: "100%", height: 240 }} resizeMode="cover" />
                </Card>
              )}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
