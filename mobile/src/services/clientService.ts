import { api } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Client, CreateClientDto } from '../types';

export const clientService = {
  async getAll(): Promise<Client[]> {
    const response = await api.get<Client[]>(API_ENDPOINTS.CLIENTS);
    return response.data;
  },

  async getById(id: string): Promise<Client> {
    const response = await api.get<Client>(`${API_ENDPOINTS.CLIENTS}/${id}`);
    return response.data;
  },

  async create(data: CreateClientDto): Promise<Client> {
    const response = await api.post<Client>(API_ENDPOINTS.CLIENTS, data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateClientDto>): Promise<Client> {
    const response = await api.patch<Client>(`${API_ENDPOINTS.CLIENTS}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.CLIENTS}/${id}`);
  },
};
