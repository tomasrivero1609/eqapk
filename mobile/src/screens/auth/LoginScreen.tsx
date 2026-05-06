import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { formatErrorForAlert } from '../../utils/errorMessage';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completá correo electrónico y contraseña');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        'Error',
        formatErrorForAlert(error, 'Error al iniciar sesion'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950"
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <View className="mb-10 items-center">
          <Image
            source={require('../../../assets/icon.png')}
            style={{ width: 88, height: 88, borderRadius: 22, marginBottom: 20 }}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Logo Eventos Quilmes"
          />
          <Text className="text-3xl font-bold text-slate-100 mb-2 text-center">
            Eventos Quilmes
          </Text>
          <Text className="text-base text-slate-400 text-center px-2">
            Iniciá sesión con tu correo y contraseña
          </Text>
        </View>

        <View className="space-y-4">
          <Input
            label="Correo electrónico"
            placeholder="nombre@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Text className="-mt-1 text-xs leading-5 text-slate-500 px-1">
            El sistema solo usa correo electrónico (no hay usuario distinto).
          </Text>

          <Input
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <Button
            label="Iniciar sesion"
            onPress={handleLogin}
            loading={loading}
            className="mt-4"
          />

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
