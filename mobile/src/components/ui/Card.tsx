import React from 'react';
import { View } from 'react-native';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: CardProps) {
  return (
    <View
      className={`rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm ${className || ''}`}
    >
      {children}
    </View>
  );
}
