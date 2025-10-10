import fs from 'fs';
import path from 'path';

export interface AvailableRoute {
  id: string;
  from: string;
  to: string;
  agency: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  busType: string;
  routeType: string;
  duration: string;
  departureDays: string[];
}

export interface AvailableTicketsData {
  routes: AvailableRoute[];
  metadata: {
    lastUpdated: string;
    totalRoutes: number;
    availableAgencies: string[];
    busTypes: string[];
    routeTypes: string[];
  };
}

class AvailableTicketsService {
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'available-tickets', 'rwanda-routes.json');
  }

  /**
   * Load available tickets data from JSON file
   */
  private loadData(): AvailableTicketsData {
    try {
      const rawData = fs.readFileSync(this.dataPath, 'utf8');
      return JSON.parse(rawData) as AvailableTicketsData;
    } catch (error) {
      console.error('Error loading available tickets data:', error);
      throw new Error('Failed to load available tickets data');
    }
  }

  /**
   * Save available tickets data to JSON file
   */
  private saveData(data: AvailableTicketsData): void {
    try {
      data.metadata.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving available tickets data:', error);
      throw new Error('Failed to save available tickets data');
    }
  }

  /**
   * Get all available routes
   */
  public getAllRoutes(): AvailableRoute[] {
    const data = this.loadData();
    return data.routes;
  }

  /**
   * Get routes by origin and destination
   */
  public getRoutesByOriginDestination(from: string, to: string): AvailableRoute[] {
    const data = this.loadData();
    return data.routes.filter(
      route => 
        route.from.toLowerCase() === from.toLowerCase() && 
        route.to.toLowerCase() === to.toLowerCase()
    );
  }

  /**
   * Get route by ID
   */
  public getRouteById(id: string): AvailableRoute | null {
    const data = this.loadData();
    return data.routes.find(route => route.id === id) || null;
  }

  /**
   * Search routes with filters
   */
  public searchRoutes(filters: {
    from?: string;
    to?: string;
    agency?: string;
    busType?: string;
    routeType?: string;
    maxPrice?: number;
    minSeats?: number;
  }): AvailableRoute[] {
    const data = this.loadData();
    
    return data.routes.filter(route => {
      if (filters.from && route.from.toLowerCase() !== filters.from.toLowerCase()) {
        return false;
      }
      if (filters.to && route.to.toLowerCase() !== filters.to.toLowerCase()) {
        return false;
      }
      if (filters.agency && route.agency !== filters.agency) {
        return false;
      }
      if (filters.busType && route.busType !== filters.busType) {
        return false;
      }
      if (filters.routeType && route.routeType !== filters.routeType) {
        return false;
      }
      if (filters.maxPrice && route.price > filters.maxPrice) {
        return false;
      }
      if (filters.minSeats && route.availableSeats < filters.minSeats) {
        return false;
      }
      return true;
    });
  }

  /**
   * Update available seats for a specific route
   */
  public updateAvailableSeats(routeId: string, seatsToBook: number): boolean {
    const data = this.loadData();
    const route = data.routes.find(r => r.id === routeId);
    
    if (!route) {
      return false;
    }
    
    if (route.availableSeats < seatsToBook) {
      return false;
    }
    
    route.availableSeats -= seatsToBook;
    this.saveData(data);
    return true;
  }

  /**
   * Add seats back to a route (for cancellations)
   */
  public addAvailableSeats(routeId: string, seatsToAdd: number): boolean {
    const data = this.loadData();
    const route = data.routes.find(r => r.id === routeId);
    
    if (!route) {
      return false;
    }
    
    route.availableSeats += seatsToAdd;
    this.saveData(data);
    return true;
  }

  /**
   * Get all unique origins
   */
  public getOrigins(): string[] {
    const data = this.loadData();
    const origins = new Set(data.routes.map(route => route.from));
    return Array.from(origins).sort();
  }

  /**
   * Get all unique destinations
   */
  public getDestinations(): string[] {
    const data = this.loadData();
    const destinations = new Set(data.routes.map(route => route.to));
    return Array.from(destinations).sort();
  }

  /**
   * Get metadata
   */
  public getMetadata() {
    const data = this.loadData();
    return data.metadata;
  }

  /**
   * Update route data (for admin purposes)
   */
  public updateRoute(routeId: string, updatedRoute: Partial<AvailableRoute>): boolean {
    const data = this.loadData();
    const routeIndex = data.routes.findIndex(r => r.id === routeId);
    
    if (routeIndex === -1) {
      return false;
    }
    
    data.routes[routeIndex] = { ...data.routes[routeIndex], ...updatedRoute };
    this.saveData(data);
    return true;
  }

  /**
   * Add new route
   */
  public addRoute(newRoute: Omit<AvailableRoute, 'id'>): string {
    const data = this.loadData();
    const routeId = `${newRoute.from.toLowerCase()}-${newRoute.to.toLowerCase()}-${Date.now()}`;
    
    const route: AvailableRoute = {
      id: routeId,
      ...newRoute
    };
    
    data.routes.push(route);
    data.metadata.totalRoutes = data.routes.length;
    this.saveData(data);
    return routeId;
  }
}

export default new AvailableTicketsService();
