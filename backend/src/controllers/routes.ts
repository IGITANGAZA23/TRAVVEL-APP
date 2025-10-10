import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import availableTicketsService from '../services/availableTicketsService';

// @desc    Get all available routes
// @route   GET /api/routes
// @access  Public
export const listRoutes = async (req: Request, res: Response) => {
  try {
    const routes = availableTicketsService.getAllRoutes();
    res.status(200).json({ 
      success: true, 
      count: routes.length, 
      data: routes,
      metadata: availableTicketsService.getMetadata()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Search routes with filters
// @route   GET /api/routes/search
// @access  Public
export const searchRoutes = async (req: Request, res: Response) => {
  try {
    const {
      from,
      to,
      agency,
      busType,
      routeType,
      maxPrice,
      minSeats
    } = req.query;

    const filters: any = {};
    if (from) filters.from = from as string;
    if (to) filters.to = to as string;
    if (agency) filters.agency = agency as string;
    if (busType) filters.busType = busType as string;
    if (routeType) filters.routeType = routeType as string;
    if (maxPrice) filters.maxPrice = parseInt(maxPrice as string);
    if (minSeats) filters.minSeats = parseInt(minSeats as string);

    const routes = availableTicketsService.searchRoutes(filters);
    res.status(200).json({ 
      success: true, 
      count: routes.length, 
      data: routes,
      filters
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get route by ID
// @route   GET /api/routes/:id
// @access  Public
export const getRouteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const route = availableTicketsService.getRouteById(id);
    
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get routes by origin and destination
// @route   GET /api/routes/from/:from/to/:to
// @access  Public
export const getRoutesByOriginDestination = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.params;
    const routes = availableTicketsService.getRoutesByOriginDestination(from, to);
    
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes,
      search: { from, to }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all unique origins
// @route   GET /api/routes/origins
// @access  Public
export const getOrigins = async (req: Request, res: Response) => {
  try {
    const origins = availableTicketsService.getOrigins();
    res.status(200).json({
      success: true,
      data: origins
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all unique destinations
// @route   GET /api/routes/destinations
// @access  Public
export const getDestinations = async (req: Request, res: Response) => {
  try {
    const destinations = availableTicketsService.getDestinations();
    res.status(200).json({
      success: true,
      data: destinations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


