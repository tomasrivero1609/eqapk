import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from "@expo/vector-icons";
import { demoCategories } from "./demonstrationsData";

type IoniconsName = keyof typeof Ionicons.glyphMap;

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
              Selecciona una categoria para ver los platos.
            </Text>
          </View>

          <View className="mt-6 px-6">
            {demoCategories.map((category, index) => (
              <TouchableOpacity
                key={category.key}
                onPress={() =>
                  navigation.navigate("DemonstrationCategory", {
                    categoryKey: category.key,
                  })
                }
                activeOpacity={0.85}
                style={{ marginBottom: index < demoCategories.length - 1 ? 12 : 0 }}
              >
                <Card className="flex-row items-center justify-between">
                  <View className="flex-row items-center" style={{ flex: 1 }}>
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-violet-500/20 mr-3">
                      <Ionicons name={category.icon as IoniconsName} size={20} color="#c4b5fd" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text className="text-base font-semibold text-slate-100">
                        {category.title}
                      </Text>
                      <Text className="text-xs text-slate-400 mt-1">
                        {category.description}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
