import axios from 'axios';
import { Task, TaskStatus, TaskPriority, AuthResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isLoginRequest = err.config?.url === '/login';
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/login', { email, password }).then((r) => r.data),
};

// Tasks
export const tasksApi = {
  getAll: (status?: TaskStatus | 'all') => {
    const params = status && status !== 'all' ? { status } : {};
    return api.get<Task[]>('/tasks', { params }).then((r) => r.data);
  },
  create: (data: { title: string; description?: string; status: TaskStatus; priority: TaskPriority; due_date?: string }) =>
    api.post<Task>('/tasks', data).then((r) => r.data),
  update: (id: number, data: Partial<{ title: string; description: string; status: TaskStatus; priority: TaskPriority; due_date: string }>) =>
    api.put<Task>(`/tasks/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};
