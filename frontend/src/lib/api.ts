import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: FormData) =>
    api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Users
export const usersAPI = {
  getAthletes: (params?: { page?: number; limit?: number; discipline?: string; search?: string }) =>
    api.get('/users/athletes', { params }),
  getProfile: (id: string) => api.get(`/users/${id}`),
  follow: (id: string) => api.post(`/users/${id}/follow`),
  unfollow: (id: string) => api.delete(`/users/${id}/follow`),
  getFollowers: (id: string) => api.get(`/users/${id}/followers`),
  getFollowing: (id: string) => api.get(`/users/${id}/following`),
};

// Videos
export const videosAPI = {
  getFeed: (params?: { page?: number; limit?: number; category?: string; sort?: string }) =>
    api.get('/videos/feed', { params }),
  getShorts: (params?: { page?: number; limit?: number }) =>
    api.get('/videos/shorts', { params }),
  getVideo: (id: string) => api.get(`/videos/${id}`),
  getByAthlete: (id: string, params?: { page?: number }) =>
    api.get(`/videos/athlete/${id}`, { params }),
  upload: (data: FormData) =>
    api.post('/videos/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  like: (id: string) => api.post(`/videos/${id}/like`),
  unlike: (id: string) => api.delete(`/videos/${id}/like`),
  save: (id: string) => api.post(`/videos/${id}/save`),
  getComments: (id: string, params?: { page?: number }) =>
    api.get(`/videos/${id}/comments`, { params }),
  addComment: (id: string, text: string) =>
    api.post(`/videos/${id}/comments`, { text }),
  search: (params: { q: string; page?: number }) =>
    api.get('/videos/search', { params }),
};

// Events
export const eventsAPI = {
  getAll: (params?: { status?: string; page?: number }) =>
    api.get('/events', { params }),
  getEvent: (id: string) => api.get(`/events/${id}`),
  interested: (id: string) => api.post(`/events/${id}/interested`),
};

// Notifications
export const notificationsAPI = {
  getAll: (params?: { page?: number }) => api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: { page?: number; role?: string }) =>
    api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  getPendingVideos: () => api.get('/admin/videos/pending'),
  approveVideo: (id: string) => api.put(`/admin/videos/${id}/approve`),
  rejectVideo: (id: string) => api.put(`/admin/videos/${id}/reject`),
  getEvents: () => api.get('/admin/events'),
  createEvent: (data: any) => api.post('/admin/events', data),
  updateEvent: (id: string, data: any) => api.put(`/admin/events/${id}`, data),
};

// Payments
export const paymentsAPI = {
  createCheckout: (priceId: string) => api.post('/payments/checkout', { priceId }),
  getSubscription: () => api.get('/payments/subscription'),
  cancelSubscription: () => api.delete('/payments/subscription'),
  purchasePPV: (eventId: string) => api.post('/payments/ppv', { eventId }),
};

export default api;
