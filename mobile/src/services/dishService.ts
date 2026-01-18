import { api } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Dish, CreateDishDto } from '../types';

export const dishService = {
  async getAll(activeOnly?: boolean): Promise<Dish[]> {
    const params = activeOnly ? { activeOnly: 'true' } : {};
    const response = await api.get<Dish[]>(API_ENDPOINTS.DISHES, { params });
    return response.data;
  },

  async getById(id: string): Promise<Dish> {
    const response = await api.get<Dish>(`${API_ENDPOINTS.DISHES}/${id}`);
    return response.data;
  },

  async create(data: CreateDishDto): Promise<Dish> {
    const response = await api.post<Dish>(API_ENDPOINTS.DISHES, data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateDishDto>): Promise<Dish> {
    const response = await api.patch<Dish>(`${API_ENDPOINTS.DISHES}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.DISHES}/${id}`);
  },
};
