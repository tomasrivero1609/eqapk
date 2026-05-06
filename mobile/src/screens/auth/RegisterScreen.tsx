import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
    } catch (error: any) {
      Alert.alert('Error', formatErrorForAlert(error, 'Error al registrarse'));
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
            style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 16 }}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Logo Eventos Quilmes"
          />
          <Text className="text-sm font-semibold text-violet-300 mb-1">Eventos Quilmes</Text>
          <Text className="text-3xl font-bold text-slate-100 mb-2 text-center">
            Crear cuenta
          </Text>
          <Text className="text-base text-slate-400 text-center px-2">
            Registrate con correo electrónico
          </Text>
        </View>

        <View className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Tu nombre completo"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Correo electrónico"
            placeholder="nombre@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <Button
            label="Crear cuenta"
            onPress={handleRegister}
            loading={loading}
            className="mt-4"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="mt-6"
          >
            <Text className="text-violet-300 text-center text-base font-medium">
              Ya tienes cuenta?{' '}
              <Text className="font-bold">Inicia sesion</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
