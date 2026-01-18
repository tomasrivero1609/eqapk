// API Configuration
// Para dispositivo físico, usa tu IP local de la computadora
// Para obtener tu IP: Windows: ipconfig | findstr IPv4 | Mac/Linux: ifconfig | grep inet
const DEFAULT_DEV_URL = 'http://192.168.0.216:3000';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? DEFAULT_DEV_URL : 'https://tu-api-produccion.com');

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  EVENTS: '/events',
  CLIENTS: '/clients',
  DISHES: '/dishes',
  MENUS: '/menus',
  ORDERS: '/orders',
  PAYMENTS: '/payments',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
} as const;
