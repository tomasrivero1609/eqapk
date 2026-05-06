import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import * as SecureStore from 'expo-secure-store';
import { emitUnauthorized } from '../utils/authEvents';

export function isNetworkError(error: unknown): boolean {
  const err = error as AxiosError;
  return !err.response && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message === 'Network Error');
}

export function isColdStart(error: unknown): boolean {
  const err = error as AxiosError;
  return err.response?.status === 503 || err.response?.status === 502;
}

export function networkErrorMessage(error: unknown): string {
  if (isColdStart(error)) {
    return 'El servidor está iniciando. Esperá unos segundos y reintentá.';
  }
  if (isNetworkError(error)) {
    return 'Sin conexión al servidor. Verificá tu red e intentá de nuevo.';
  }
  return 'Error de conexión inesperado.';
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
          emitUnauthorized();
        }
        return Promise.reject(error);
      },
    );
  }

  getApi() {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.getApi();
