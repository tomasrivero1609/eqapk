import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
};

export default function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  className,
  iconName,
  iconPosition = 'left',
}: ButtonProps) {
  const base =
    'rounded-3xl px-5 py-4 items-center justify-center flex-row shadow-lg';
  const styles = {
    primary: 'bg-violet-600 shadow-violet-500/30',
    secondary: 'bg-slate-800 shadow-slate-800/30',
    ghost: 'bg-transparent shadow-transparent',
    danger: 'bg-rose-600 shadow-rose-500/30',
  }[variant];
  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    ghost: 'text-violet-300',
    danger: 'text-white',
  }[variant];
  const iconColor =
    variant === 'ghost' ? '#A78BFA' : '#F8FAFC';

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
        <View className="flex-row items-center gap-2">
          {iconName && iconPosition === 'left' ? (
            <Ionicons name={iconName} size={18} color={iconColor} />
          ) : null}
          <Text className={`text-base font-semibold ${textStyles}`}>
            {label}
          </Text>
          {iconName && iconPosition === 'right' ? (
            <Ionicons name={iconName} size={18} color={iconColor} />
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}
