"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDestinations = exports.getOrigins = exports.getRoutesByOriginDestination = exports.getRouteById = exports.searchRoutes = exports.listRoutes = void 0;
const availableTicketsService_1 = __importDefault(require("../services/availableTicketsService"));

const listRoutes = async (req, res) => {
    try {
        const routes = availableTicketsService_1.default.getAllRoutes();
        res.status(200).json({
            success: true,
            count: routes.length,
            data: routes,
            metadata: availableTicketsService_1.default.getMetadata()
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.listRoutes = listRoutes;

const searchRoutes = async (req, res) => {
    try {
        const { from, to, agency, busType, routeType, maxPrice, minSeats } = req.query;
        const filters = {};
        if (from)
            filters.from = from;
        if (to)
            filters.to = to;
        if (agency)
            filters.agency = agency;
        if (busType)
            filters.busType = busType;
        if (routeType)
            filters.routeType = routeType;
        if (maxPrice)
            filters.maxPrice = parseInt(maxPrice);
        if (minSeats)
            filters.minSeats = parseInt(minSeats);
        const routes = availableTicketsService_1.default.searchRoutes(filters);
        res.status(200).json({
            success: true,
            count: routes.length,
            data: routes,
            filters
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.searchRoutes = searchRoutes;

const getRouteById = async (req, res) => {
    try {
        const { id } = req.params;
        const route = availableTicketsService_1.default.getRouteById(id);
        if (!route) {
            return res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        }
        res.status(200).json({
            success: true,
            data: route
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getRouteById = getRouteById;

const getRoutesByOriginDestination = async (req, res) => {
    try {
        const { from, to } = req.params;
        const routes = availableTicketsService_1.default.getRoutesByOriginDestination(from, to);
        res.status(200).json({
            success: true,
            count: routes.length,
            data: routes,
            search: { from, to }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getRoutesByOriginDestination = getRoutesByOriginDestination;

const getOrigins = async (req, res) => {
    try {
        const origins = availableTicketsService_1.default.getOrigins();
        res.status(200).json({
            success: true,
            data: origins
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getOrigins = getOrigins;

const getDestinations = async (req, res) => {
    try {
        const destinations = availableTicketsService_1.default.getDestinations();
        res.status(200).json({
            success: true,
            data: destinations
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getDestinations = getDestinations;
