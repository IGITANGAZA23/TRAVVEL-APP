import { API_CONFIG } from '@/config';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  retry?: number;
}

class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    // Ensure endpoint is a string to prevent "[object Object]" errors
    if (typeof endpoint !== 'string') {
      throw new Error(`Invalid endpoint: ${String(endpoint)}`);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Add auth token if available
    const token = localStorage.getItem('travvel_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Read the raw response for debugging
        let text: string;
        try {
          text = await response.text();
        } catch {
          text = response.statusText;
        }
        console.error(`API request failed: ${response.status} ${response.statusText}`, text);

        // Try parsing JSON for better error messages
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'API request failed');
        } catch {
          throw new Error(text || 'API request failed');
        }
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error('API request exception:', error);
      throw error;
    }
  }

  // HTTP Methods
public get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  return this.request<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

public post<T>(
  endpoint: string,
  data: Record<string, unknown>,
  options: RequestOptions = {}
): Promise<T> {
  return this.request<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

public put<T>(
  endpoint: string,
  data: Record<string, unknown>,
  options: RequestOptions = {}
): Promise<T> {
  return this.request<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

public delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  return this.request<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}





  // Route-specific methods
  public async getRoutes(): Promise<any> {
    return this.get('/routes');
  }

  public async searchRoutes(filters: Record<string, any>): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    return this.get(`/routes/search?${queryParams.toString()}`);
  }

  public async getRouteById(id: string): Promise<any> {
    return this.get(`/routes/${id}`);
  }

  public async getRoutesByOriginDestination(from: string, to: string): Promise<any> {
    return this.get(`/routes/from/${from}/to/${to}`);
  }

  public async getOrigins(): Promise<any> {
    return this.get('/routes/origins');
  }

  public async getDestinations(): Promise<any> {
    return this.get('/routes/destinations');
  }

  // Booking-specific methods
  public async createBooking(data: Record<string, any>): Promise<any> {
    // Ensure endpoint is a string, prevent accidental object
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid booking data provided');
    }
    return this.post('/bookings', data);
  }

  public async getBookings(): Promise<any> {
    return this.get('/bookings');
  }

  public async getBookingById(id: string): Promise<any> {
    return this.get(`/bookings/${id}`);
  }
}

export const api = new ApiService();
