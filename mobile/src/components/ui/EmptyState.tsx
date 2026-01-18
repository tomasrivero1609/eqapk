import React from 'react';
import { View, Text } from 'react-native';

type EmptyStateProps = {
  title: string;
  description?: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="h-14 w-14 rounded-full bg-slate-800" />
      <Text className="mt-4 text-lg font-semibold text-slate-200">{title}</Text>
      {description ? (
        <Text className="mt-2 text-center text-sm text-slate-400">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
