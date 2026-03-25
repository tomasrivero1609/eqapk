import { api } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { UserPermissions } from '../types';

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: UserPermissions;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  role?: string;
  permissions?: UserPermissions;
}

export interface UpdateUserPayload {
  name?: string;
  role?: string;
  permissions?: UserPermissions;
}

export const userService = {
  async getAll(): Promise<UserListItem[]> {
    const res = await api.get<UserListItem[]>(API_ENDPOINTS.USERS);
    return res.data;
  },

  async getOne(id: string): Promise<UserListItem> {
    const res = await api.get<UserListItem>(`${API_ENDPOINTS.USERS}/${id}`);
    return res.data;
  },

  async create(data: CreateUserPayload): Promise<UserListItem> {
    const res = await api.post<UserListItem>(API_ENDPOINTS.USERS, data);
    return res.data;
  },

  async update(id: string, data: UpdateUserPayload): Promise<UserListItem> {
    const res = await api.patch<UserListItem>(`${API_ENDPOINTS.USERS}/${id}`, data);
    return res.data;
  },

  async changePassword(id: string, password: string): Promise<void> {
    await api.patch(`${API_ENDPOINTS.USERS}/${id}/password`, { password });
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.USERS}/${id}`);
  },
};
