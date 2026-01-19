import React from 'react';
import { View, useWindowDimensions } from 'react-native';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 520;

  return (
    <View
      className={`rounded-3xl border border-slate-800 bg-slate-900/80 ${
        isCompact ? 'p-3' : 'p-4'
      } shadow-sm ${className || ''}`}
    >
      {children}
    </View>
  );
}
