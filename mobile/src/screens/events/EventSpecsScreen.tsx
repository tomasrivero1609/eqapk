import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Screen from "../../components/ui/Screen";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { eventService } from "../../services/eventService";
import { Event } from "../../types";

export default function EventSpecsScreen({ route }: any) {
  const { event } = route.params as { event: Event };
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    menuDescription: "",
    eventHours: "",
    receptionType: "",
    courseCountAdult: "",
    courseCountJuvenile: "",
    courseCountChild: "",
    islandType: "",
    dessert: "",
    sweetTable: "",
    partyEnd: "",
    specialDishes: "",
    cake: "",
    hallSetupDescription: "",
    tablecloth: "",
    tableNumbers: "",
    centerpieces: "",
    souvenirs: "",
    bouquet: "",
    candles: "",
    charms: "",
    roses: "",
    cotillon: "",
    photographer: "",
    optionalContracted: "",
  });

  useEffect(() => {
    if (!event) {
      return;
    }
    setFormData({
      menuDescription: event.menuDescription || "",
      eventHours: event.eventHours || "",
      receptionType: event.receptionType || "",
      courseCountAdult: event.courseCountAdult || "",
      courseCountJuvenile: event.courseCountJuvenile || "",
      courseCountChild: event.courseCountChild || "",
      islandType: event.islandType || "",
      dessert: event.dessert || "",
      sweetTable: event.sweetTable || "",
      partyEnd: event.partyEnd || "",
      specialDishes: event.specialDishes || "",
      cake: event.cake || "",
      hallSetupDescription: event.hallSetupDescription || "",
      tablecloth: event.tablecloth || "",
      tableNumbers: event.tableNumbers || "",
      centerpieces: event.centerpieces || "",
      souvenirs: event.souvenirs || "",
      bouquet: event.bouquet || "",
      candles: event.candles || "",
      charms: event.charms || "",
      roses: event.roses || "",
      cotillon: event.cotillon || "",
      photographer: event.photographer || "",
      optionalContracted: event.optionalContracted || "",
    });
  }, [event]);

  const mutation = useMutation({
    mutationFn: (payload: typeof formData) => eventService.update(event.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", event.id] });
      Alert.alert("Listo", "Especificaciones actualizadas");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudieron guardar los cambios",
      );
    },
  });

  return (
    <Screen>
      <ScrollView contentContainerClassName="pb-32">
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-slate-100">
            Especificaciones tecnicas
          </Text>
          <Text className="mt-2 text-sm text-slate-400">
            Edita los detalles del evento.
          </Text>
        </View>

        <View className="mt-6 px-6 space-y-4">
          <Card>
            <Text className="text-xs font-semibold text-slate-400">Catering</Text>
            <View className="mt-3 space-y-2">
              <Input
                label="Descripcion de menu"
                placeholder="Detalle del menu"
                value={formData.menuDescription}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, menuDescription: text }))
                }
                multiline
              />
              <Input
                label="Cantidad de horas del evento"
                placeholder="Ej: 5"
                value={formData.eventHours}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, eventHours: text }))
                }
              />
              <Input
                label="Tipo de recepcion"
                placeholder="Formal / Informal"
                value={formData.receptionType}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, receptionType: text }))
                }
              />
              <Input
                label="Cantidad de platos (Adulto)"
                placeholder="Primer plato - plato principal"
                value={formData.courseCountAdult}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, courseCountAdult: text }))
                }
              />
              <Input
                label="Cantidad de platos (Juvenil)"
                placeholder="Primer plato - plato principal"
                value={formData.courseCountJuvenile}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, courseCountJuvenile: text }))
                }
              />
              <Input
                label="Cantidad de platos (Infantil)"
                placeholder="Primer plato - plato principal"
                value={formData.courseCountChild}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, courseCountChild: text }))
                }
              />
              <Input
                label="Tipo de isla"
                placeholder="Detalle"
                value={formData.islandType}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, islandType: text }))
                }
              />
              <Input
                label="Postre"
                placeholder="Detalle"
                value={formData.dessert}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, dessert: text }))
                }
              />
              <Input
                label="Mesa dulce"
                placeholder="Detalle"
                value={formData.sweetTable}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, sweetTable: text }))
                }
              />
              <Input
                label="Fin de fiesta"
                placeholder="Detalle"
                value={formData.partyEnd}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, partyEnd: text }))
                }
              />
              <Input
                label="Platos especial"
                placeholder="Detalle"
                value={formData.specialDishes}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, specialDishes: text }))
                }
              />
              <Input
                label="Torta"
                placeholder="Detalle"
                value={formData.cake}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, cake: text }))
                }
              />
            </View>
          </Card>

          <Card>
            <Text className="text-xs font-semibold text-slate-400">Armado salon</Text>
            <View className="mt-3 space-y-2">
              <Input
                label="Descripcion armado"
                placeholder="Detalle"
                value={formData.hallSetupDescription}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, hallSetupDescription: text }))
                }
                multiline
              />
              <Input
                label="Manteleria"
                placeholder="Detalle"
                value={formData.tablecloth}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, tablecloth: text }))
                }
              />
              <Input
                label="Numeradores de mesa"
                placeholder="Detalle"
                value={formData.tableNumbers}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, tableNumbers: text }))
                }
              />
              <Input
                label="Centros de mesa"
                placeholder="Detalle"
                value={formData.centerpieces}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, centerpieces: text }))
                }
              />
              <Input
                label="Souvenirs"
                placeholder="Detalle"
                value={formData.souvenirs}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, souvenirs: text }))
                }
              />
              <Input
                label="Ramo"
                placeholder="Detalle"
                value={formData.bouquet}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, bouquet: text }))
                }
              />
              <Input
                label="Velas"
                placeholder="Detalle"
                value={formData.candles}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, candles: text }))
                }
              />
              <Input
                label="Dijes"
                placeholder="Detalle"
                value={formData.charms}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, charms: text }))
                }
              />
              <Input
                label="Rosas"
                placeholder="Detalle"
                value={formData.roses}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, roses: text }))
                }
              />
              <Input
                label="Cotillon"
                placeholder="Detalle"
                value={formData.cotillon}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, cotillon: text }))
                }
              />
              <Input
                label="Fotografo"
                placeholder="Detalle"
                value={formData.photographer}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, photographer: text }))
                }
              />
              <Input
                label="Opcional contratado"
                placeholder="Detalle"
                value={formData.optionalContracted}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, optionalContracted: text }))
                }
              />
            </View>
          </Card>
        </View>

        <View className="mt-6 px-6">
          <Button
            label="Guardar especificaciones"
            onPress={() => mutation.mutate(formData)}
            loading={mutation.isPending}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
