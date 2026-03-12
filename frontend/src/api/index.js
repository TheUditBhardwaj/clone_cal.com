import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Event Types
export const getEventTypes = () => apiClient.get('/event-types');
export const createEventType = (data) => apiClient.post('/event-types', data);
export const updateEventType = (id, data) => apiClient.put(`/event-types/${id}`, data);
export const deleteEventType = (id) => apiClient.delete(`/event-types/${id}`);

// ── Schedules (new Cal.com-style) ──
export const getSchedules = () => apiClient.get('/availability/schedules');
export const getScheduleById = (id) => apiClient.get(`/availability/schedules/${id}`);
export const createSchedule = (data) => apiClient.post('/availability/schedules', data);
export const updateSchedule = (id, data) => apiClient.put(`/availability/schedules/${id}`, data);
export const deleteSchedule = (id) => apiClient.delete(`/availability/schedules/${id}`);

// ── Legacy Availability (flat) ──
export const getAvailability = () => apiClient.get('/availability');
export const createAvailability = (data) => apiClient.post('/availability', data);
export const updateAvailability = (id, data) => apiClient.put(`/availability/${id}`, data);
export const deleteAvailability = (id) => apiClient.delete(`/availability/${id}`);
export const getAvailableSlots = (eventSlug, date) =>
  apiClient.get(`/availability/slots?event_slug=${eventSlug}&date=${date}`);

// Bookings
export const getBookings = () => apiClient.get('/bookings');
export const createBooking = (data) => apiClient.post('/bookings', data);
export const deleteBooking = (id) => apiClient.delete(`/bookings/${id}`);

// Users
export const getUsers = () => apiClient.get('/users');
