import { api } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Menu, CreateMenuDto } from '../types';

export const menuService = {
  async getAll(activeOnly?: boolean): Promise<Menu[]> {
    const params = activeOnly ? { activeOnly: 'true' } : {};
    const response = await api.get<Menu[]>(API_ENDPOINTS.MENUS, { params });
    return response.data;
  },

  async getById(id: string): Promise<Menu> {
    const response = await api.get<Menu>(`${API_ENDPOINTS.MENUS}/${id}`);
    return response.data;
  },

  async create(data: CreateMenuDto): Promise<Menu> {
    const response = await api.post<Menu>(API_ENDPOINTS.MENUS, data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateMenuDto>): Promise<Menu> {
    const response = await api.patch<Menu>(`${API_ENDPOINTS.MENUS}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.MENUS}/${id}`);
  },
};
