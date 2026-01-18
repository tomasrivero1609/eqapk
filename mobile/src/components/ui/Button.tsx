import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
};

export default function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  className,
}: ButtonProps) {
  const base =
    'rounded-3xl px-5 py-4 items-center justify-center flex-row shadow-lg';
  const styles = {
    primary: 'bg-violet-600 shadow-violet-500/30',
    secondary: 'bg-slate-800 shadow-slate-800/30',
    ghost: 'bg-transparent shadow-transparent',
  }[variant];
  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    ghost: 'text-violet-300',
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${styles} ${className || ''} ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#2563EB' : '#fff'} />
      ) : (
        <Text className={`text-base font-semibold ${textStyles}`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
