import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { eventService } from '../../services/eventService';
import { Event } from '../../types';
import { parseLocalDateString, formatLocalDate } from '../../utils/date';

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;

const buildMonthGrid = (base: Date) => {
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const last = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  const startIndex = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < startIndex; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(base.getFullYear(), base.getMonth(), day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
};

export default function EventsCalendarScreen({ navigation }: any) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getAll(),
  });
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    (events || []).forEach((event) => {
      const date = parseLocalDateString(event.date);
      const key = toDateKey(date);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(event);
    });
    return map;
  }, [events]);

  const monthCells = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);
  const selectedKey = toDateKey(selectedDate);
  const selectedEvents = eventsByDay.get(selectedKey) || [];

  if (isLoading) {
    return (
      <Screen className="items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerClassName="pb-32">
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-slate-100">Calendario</Text>
          <Text className="mt-2 text-sm text-slate-400">
            Selecciona un dia para ver eventos.
          </Text>
        </View>

        <View className="mt-6 px-6">
          <Card>
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
                  )
                }
              >
                <Text className="text-sm font-semibold text-violet-300">Anterior</Text>
              </TouchableOpacity>
              <Text className="text-base font-semibold text-slate-100">
                {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
                  )
                }
              >
                <Text className="text-sm font-semibold text-violet-300">Siguiente</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-4 flex-row justify-between">
              {weekDays.map((day, index) => (
                <Text
                  key={`${day}-${index}`}
                  className={`${isTablet ? 'text-sm' : 'text-xs'} w-[13%] text-center text-slate-400`}
                >
                  {day}
                </Text>
              ))}
            </View>

            <View className="mt-2 flex-row flex-wrap">
              {monthCells.map((date, index) => {
                if (!date) {
                  return (
                    <View
                      key={`empty-${index}`}
                      className={`w-[13%] ${isTablet ? 'h-12' : 'h-10'}`}
                    />
                  );
                }
                const key = toDateKey(date);
                const hasEvents = eventsByDay.has(key);
                const isSelected = key === selectedKey;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSelectedDate(date)}
                    className={`w-[13%] ${
                      isTablet ? 'h-12' : 'h-10'
                    } items-center justify-center rounded-2xl ${
                      isSelected
                        ? 'bg-violet-500/30'
                        : hasEvents
                        ? 'bg-rose-500/25'
                        : ''
                    }`}
                  >
                    <Text
                      className={`${isTablet ? 'text-base' : 'text-sm'} ${
                        isSelected
                          ? 'text-violet-100 font-semibold'
                          : hasEvents
                          ? 'text-rose-100 font-semibold'
                          : 'text-slate-200'
                      }`}
                    >
                      {date.getDate()}
                    </Text>
                    {hasEvents ? (
                      <View
                        className={`mt-1 rounded-full bg-rose-300 ${
                          isTablet ? 'h-2 w-2' : 'h-1.5 w-1.5'
                        }`}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </View>

        <View className="mt-6 px-6">
          <Text className="text-lg font-semibold text-slate-100">
            Eventos del dia
          </Text>
          {selectedEvents.length === 0 ? (
            <View className="mt-4">
              <EmptyState
                title="Sin eventos"
                description="No hay eventos para esta fecha."
              />
            </View>
          ) : (
            <View className="mt-4 space-y-3">
              {selectedEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
                  activeOpacity={0.8}
                >
                  <Card className="px-4 py-3">
                    <Text className="text-base font-semibold text-slate-100">
                      {event.name}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-400">
                      {formatLocalDate(event.date)}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-500">
                      Estado: {event.status}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
