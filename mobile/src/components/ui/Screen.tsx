import React from 'react';
import { View } from 'react-native';

type ScreenProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Screen({ children, className }: ScreenProps) {
  return (
    <View className="flex-1 bg-slate-950">
      <View className="absolute -top-28 -right-20 h-60 w-60 rounded-full bg-violet-600/20" />
      <View className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-fuchsia-500/10" />
      <View className={`flex-1 ${className || ''}`}>{children}</View>
    </View>
  );
}
