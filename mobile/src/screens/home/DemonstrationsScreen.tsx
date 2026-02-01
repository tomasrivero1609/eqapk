import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";

const categories = [
  "Recepcion",
  "Islas",
  "Primer plato",
  "Plato principal",
  "Postre",
  "Mesa de dulces",
  "Desayuno",
  "Tragos",
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
              Selecciona una categoria para ver los platos.
            </Text>
          </View>

          <View className="mt-6 px-6 space-y-3">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => navigation.navigate('DemonstrationCategory', { category })}
                activeOpacity={0.8}
              >
                <Card className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-slate-100">
                    {category}
                  </Text>
                  <Text className="text-xs text-slate-400">Ver</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
