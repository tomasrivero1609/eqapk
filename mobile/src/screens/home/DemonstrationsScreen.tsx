import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";
import { useAuthStore } from "../../store/authStore";
import { UserRole } from "../../types";

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
  const [tab, setTab] = useState<"view" | "manage">("view");
  const role = useAuthStore((state) => state.user?.role || UserRole.ADMIN);
  const canManage = role === UserRole.ADMIN || role === UserRole.SUPERADMIN;
  const tabs = useMemo(
    () => [
      { key: "view", label: "Categorias" },
      ...(canManage ? [{ key: "manage", label: "Cargar platos" }] : []),
    ],
    [canManage]
  );

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

          <View className="mt-5 px-6">
            <View className="flex-row rounded-full bg-slate-900/60 p-1">
              {tabs.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setTab(item.key as "view" | "manage")}
                  className={`flex-1 rounded-full px-3 py-2 ${
                    tab === item.key ? "bg-violet-600" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-center text-xs font-semibold ${
                      tab === item.key ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mt-6 px-6 space-y-3">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() =>
                  navigation.navigate("DemonstrationCategory", {
                    category,
                    mode: tab,
                  })
                }
                activeOpacity={0.8}
              >
                <Card className="flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-slate-100">
                    {category}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    {tab === "manage" ? "Cargar" : "Ver"}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
