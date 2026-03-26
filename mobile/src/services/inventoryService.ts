import { api } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import {
  InventoryItem,
  InventoryMovement,
  CreateInventoryItemDto,
  CreateMovementDto,
} from '../types';

export const inventoryService = {
  async getAll(): Promise<InventoryItem[]> {
    const response = await api.get<InventoryItem[]>(API_ENDPOINTS.INVENTORY);
    return response.data;
  },

  async getById(id: string): Promise<InventoryItem> {
    const response = await api.get<InventoryItem>(`${API_ENDPOINTS.INVENTORY}/${id}`);
    return response.data;
  },

  async create(data: CreateInventoryItemDto): Promise<InventoryItem> {
    const response = await api.post<InventoryItem>(API_ENDPOINTS.INVENTORY, data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateInventoryItemDto>): Promise<InventoryItem> {
    const response = await api.patch<InventoryItem>(`${API_ENDPOINTS.INVENTORY}/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.INVENTORY}/${id}`);
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>(`${API_ENDPOINTS.INVENTORY}/categories`);
    return response.data;
  },

  async bulkCreate(items: CreateInventoryItemDto[]): Promise<{ count: number }> {
    const response = await api.post<{ count: number }>(`${API_ENDPOINTS.INVENTORY}/bulk`, items);
    return response.data;
  },

  async getMovements(itemId: string): Promise<InventoryMovement[]> {
    const response = await api.get<InventoryMovement[]>(
      `${API_ENDPOINTS.INVENTORY}/${itemId}/movements`,
    );
    return response.data;
  },

  async createMovement(itemId: string, data: CreateMovementDto): Promise<InventoryMovement> {
    const response = await api.post<InventoryMovement>(
      `${API_ENDPOINTS.INVENTORY}/${itemId}/movements`,
      data,
    );
    return response.data;
  },
};
