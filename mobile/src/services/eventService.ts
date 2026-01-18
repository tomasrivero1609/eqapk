import { api } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { Event, CreateEventDto, CalendarAvailability } from '../types';

export const eventService = {
  async getAll(): Promise<Event[]> {
    const response = await api.get<Event[]>(API_ENDPOINTS.EVENTS);
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

  async checkAvailability(date: string): Promise<CalendarAvailability> {
    const response = await api.get<CalendarAvailability>(
      `${API_ENDPOINTS.EVENTS}/availability`,
      { params: { date } },
    );
    return response.data;
  },
};
