import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
};

export default function Input({ label, hint, ...props }: InputProps) {
  return (
    <View className="space-y-2">
      {label ? <Text className="text-sm font-semibold text-slate-300">{label}</Text> : null}
      <TextInput
        className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 text-base text-slate-100"
        placeholderTextColor="#64748B"
        {...props}
      />
      {hint ? <Text className="text-xs text-slate-500">{hint}</Text> : null}
    </View>
  );
}
