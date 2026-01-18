import { api } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { CreatePaymentDto, Payment, Currency } from '../types';

export const paymentService = {
  async getAll(eventId?: string): Promise<Payment[]> {
    const response = await api.get<Payment[]>(
      API_ENDPOINTS.PAYMENTS,
      eventId ? { params: { eventId } } : undefined,
    );
    return response.data;
  },

  async create(data: CreatePaymentDto): Promise<Payment> {
    const response = await api.post<Payment>(API_ENDPOINTS.PAYMENTS, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.PAYMENTS}/${id}`);
  },

  async getSummary(): Promise<Record<Currency, number>> {
    const response = await api.get<Record<Currency, number>>(
      `${API_ENDPOINTS.PAYMENTS}/summary`,
    );
    return response.data;
  },
};
