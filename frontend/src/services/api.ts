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
        const error = await this.parseError(response);
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async parseError(response: Response): Promise<Error> {
    try {
      const errorData = await response.json();
      return new Error(errorData.message || 'An error occurred');
    } catch (e) {
      return new Error(response.statusText || 'An error occurred');
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
    return this.get('/api/routes');
  }

  public async searchRoutes(filters: Record<string, any>): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    return this.get(`/api/routes/search?${queryParams.toString()}`);
  }

  public async getRouteById(id: string): Promise<any> {
    return this.get(`/api/routes/${id}`);
  }

  public async getRoutesByOriginDestination(from: string, to: string): Promise<any> {
    return this.get(`/api/routes/from/${from}/to/${to}`);
  }

  public async getOrigins(): Promise<any> {
    return this.get('/api/routes/origins');
  }

  public async getDestinations(): Promise<any> {
    return this.get('/api/routes/destinations');
  }
}

export const api = new ApiService();
