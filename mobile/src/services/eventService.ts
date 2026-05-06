import { api } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Event, CreateEventDto, CalendarAvailability, PaginatedResult } from '../types';

export type EventsParams = { page?: number; limit?: number; type?: string };

export const eventService = {
  async getAll(params: EventsParams = {}): Promise<PaginatedResult<Event>> {
    const response = await api.get<PaginatedResult<Event>>(API_ENDPOINTS.EVENTS, { params });
    return response.data;
  },

  async getById(id: string): Promise<Event> {
    const response = await api.get<Event>(`${API_ENDPOINTS.EVENTS}/${id}`);
    return response.data;
  },

  async create(data: CreateEventDto): Promise<Event> {
    const response = await api.post<Event>(API_ENDPOINTS.EVENTS, data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateEventDto>): Promise<Event> {
    const response = await api.patch<Event>(`${API_ENDPOINTS.EVENTS}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.EVENTS}/${id}`);
  },

  async checkAvailability(date: string, eventId?: string, eventType?: string): Promise<CalendarAvailability> {
    const response = await api.get<CalendarAvailability>(
      `${API_ENDPOINTS.EVENTS}/availability`,
      { params: { date, eventId, eventType } },
    );
    return response.data;
  },

  async previewQuarterlyAdjustment(id: string) {
    const response = await api.post(
      `${API_ENDPOINTS.EVENTS}/${id}/quarterly-adjustment`,
      { apply: false },
    );
    return response.data;
  },

  async applyQuarterlyAdjustment(id: string, force?: boolean) {
    const response = await api.post(
      `${API_ENDPOINTS.EVENTS}/${id}/quarterly-adjustment`,
      { apply: true, force },
    );
    return response.data;
  },
};
