const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  BOOKINGS: {
    ROOT: `${API_BASE_URL}/bookings`,
    ONE: (id: string) => `${API_BASE_URL}/bookings/${id}`,
    STATUS: (id: string) => `${API_BASE_URL}/bookings/${id}/status`,
  },
  TICKETS: {
    ROOT: `${API_BASE_URL}/tickets`,
    ONE: (id: string) => `${API_BASE_URL}/tickets/${id}`,
    STATUS: (id: string) => `${API_BASE_URL}/tickets/${id}/status`,
    VERIFY: (ticketNumber: string) => `${API_BASE_URL}/tickets/verify/${ticketNumber}`,
    SCAN: `${API_BASE_URL}/tickets/scan`,
  },
  APPEALS: {
    ROOT: `${API_BASE_URL}/appeals`,
    ONE: (id: string) => `${API_BASE_URL}/appeals/${id}`,
    ADMIN_ALL: `${API_BASE_URL}/appeals/admin/all`,
  },
  ROUTES: {
    ROOT: `${API_BASE_URL}/routes`,
  }
};

export const setAuthToken = (token: string) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};
