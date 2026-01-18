import { api } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { LoginDto, RegisterDto, AuthResponse } from '../types';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const { user, access_token } = response.data;
    
    // Guardar token y usuario
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return response.data;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    const { user, access_token } = response.data;
    
    // Guardar token y usuario
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user));
    
    return response.data;
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
  },

  async getStoredToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getStoredUser(): Promise<any | null> {
    const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },
};
