import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:5001',
});

// Event Types
export const getEventTypes = () => apiClient.get('/event-types');
export const createEventType = (data) => apiClient.post('/event-types', data);
export const updateEventType = (id, data) => apiClient.put(`/event-types/${id}`, data);
export const deleteEventType = (id) => apiClient.delete(`/event-types/${id}`);

// Availability
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
