"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class AvailableTicketsService {
    constructor() {
        this.dataPath = path_1.default.join(process.cwd(), 'data', 'available-tickets', 'rwanda-routes.json');
    }

    loadData() {
        try {
            const rawData = fs_1.default.readFileSync(this.dataPath, 'utf8');
            return JSON.parse(rawData);
        }
        catch (error) {
            console.error('Error loading available tickets data:', error);
            throw new Error('Failed to load available tickets data');
        }
    }

    saveData(data) {
        try {
            data.metadata.lastUpdated = new Date().toISOString();
            fs_1.default.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error('Error saving available tickets data:', error);
            throw new Error('Failed to save available tickets data');
        }
    }

    getAllRoutes() {
        const data = this.loadData();
        return data.routes;
    }

    getRoutesByOriginDestination(from, to) {
        const data = this.loadData();
        return data.routes.filter(route => route.from.toLowerCase() === from.toLowerCase() &&
            route.to.toLowerCase() === to.toLowerCase());
    }

    getRouteById(id) {
        const data = this.loadData();
        return data.routes.find(route => route.id === id) || null;
    }

    searchRoutes(filters) {
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

    updateAvailableSeats(routeId, seatsToBook) {
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

    addAvailableSeats(routeId, seatsToAdd) {
        const data = this.loadData();
        const route = data.routes.find(r => r.id === routeId);
        if (!route) {
            return false;
        }
        route.availableSeats += seatsToAdd;
        this.saveData(data);
        return true;
    }

    getOrigins() {
        const data = this.loadData();
        const origins = new Set(data.routes.map(route => route.from));
        return Array.from(origins).sort();
    }

    getDestinations() {
        const data = this.loadData();
        const destinations = new Set(data.routes.map(route => route.to));
        return Array.from(destinations).sort();
    }

    getMetadata() {
        const data = this.loadData();
        return data.metadata;
    }

    updateRoute(routeId, updatedRoute) {
        const data = this.loadData();
        const routeIndex = data.routes.findIndex(r => r.id === routeId);
        if (routeIndex === -1) {
            return false;
        }
        data.routes[routeIndex] = { ...data.routes[routeIndex], ...updatedRoute };
        this.saveData(data);
        return true;
    }

    addRoute(newRoute) {
        const data = this.loadData();
        const routeId = `${newRoute.from.toLowerCase()}-${newRoute.to.toLowerCase()}-${Date.now()}`;
        const route = {
            id: routeId,
            ...newRoute
        };
        data.routes.push(route);
        data.metadata.totalRoutes = data.routes.length;
        this.saveData(data);
        return routeId;
    }
}
exports.default = new AvailableTicketsService();
