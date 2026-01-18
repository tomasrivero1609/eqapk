import React from 'react';
import { View, Text } from 'react-native';

type BadgeProps = {
  label: string;
  variant?: 'neutral' | 'success' | 'info' | 'warning' | 'danger';
};

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const styles = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
  }[variant];

  return (
    <View className={`rounded-full px-3 py-1 ${styles}`}>
      <Text className="text-xs font-semibold">{label}</Text>
    </View>
  );
}
