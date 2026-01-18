import { api } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Order, CreateOrderDto, OrderStatus } from '../types';

export const orderService = {
  async getAll(eventId?: string): Promise<Order[]> {
    const params = eventId ? { eventId } : {};
    const response = await api.get<Order[]>(API_ENDPOINTS.ORDERS, { params });
    return response.data;
  },

  async getById(id: string): Promise<Order> {
    const response = await api.get<Order>(`${API_ENDPOINTS.ORDERS}/${id}`);
    return response.data;
  },

  async create(data: CreateOrderDto): Promise<Order> {
    const response = await api.post<Order>(API_ENDPOINTS.ORDERS, data);
    return response.data;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await api.patch<Order>(`${API_ENDPOINTS.ORDERS}/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.ORDERS}/${id}`);
  },
};
