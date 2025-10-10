// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      ME: '/auth/me'
    },
    BOOKINGS: {
      BASE: '/bookings',
      BY_ID: (id: string) => `/bookings/${id}`
    },
    TICKETS: {
      BASE: '/tickets',
      BY_ID: (id: string) => `/tickets/${id}`
    },
    APPEALS: {
      BASE: '/appeals',
      BY_ID: (id: string) => `/appeals/${id}`
    },
    ROUTES: {
      BASE: '/routes',
      SEARCH: '/routes/search',
      BY_ID: (id: string) => `/routes/${id}`,
      BY_ORIGIN_DESTINATION: (from: string, to: string) => `/routes/from/${from}/to/${to}`,
      ORIGINS: '/routes/origins',
      DESTINATIONS: '/routes/destinations'
    }
  },
  // Timeout for API requests in milliseconds
  TIMEOUT: 10000,
  // Maximum number of retries for failed requests
  MAX_RETRIES: 3
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'travvel_auth_token',
  REFRESH_TOKEN_KEY: 'travvel_refresh_token',
  TOKEN_EXPIRY: import.meta.env.VITE_TOKEN_EXPIRE || '30d'
};

// Environment
const ENV = import.meta.env.MODE || 'development';
export const IS_DEVELOPMENT = ENV === 'development';
export const IS_PRODUCTION = ENV === 'production';
