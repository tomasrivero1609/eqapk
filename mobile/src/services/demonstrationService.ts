import { api } from './api';

export type DemonstrationItem = {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: string;
};

export const demonstrationService = {
  async getByCategory(category: string): Promise<DemonstrationItem[]> {
    const response = await api.get('/demonstrations', { params: { category } });
    return response.data;
  },
  async create(payload: { title: string; category: string; imageUrl: string }) {
    const response = await api.post('/demonstrations', payload);
    return response.data;
  },
  async remove(id: string) {
    const response = await api.delete(`/demonstrations/${id}`);
    return response.data;
  },
};
