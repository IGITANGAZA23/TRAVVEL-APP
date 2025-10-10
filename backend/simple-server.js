const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Load available tickets service
const availableTicketsService = require('./dist/services/availableTicketsService.js');

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get all routes
app.get('/api/routes', (req, res) => {
  try {
    const routes = availableTicketsService.default.getAllRoutes();
    res.json({
      success: true,
      count: routes.length,
      data: routes,
      metadata: availableTicketsService.default.getMetadata()
    });
  } catch (error) {
    console.error('Error getting routes:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Search routes with filters
app.get('/api/routes/search', (req, res) => {
  try {
    const filters = {};
    Object.keys(req.query).forEach(key => {
      if (req.query[key] !== undefined && req.query[key] !== null && req.query[key] !== '') {
        if (key === 'maxPrice' || key === 'minSeats') {
          filters[key] = parseInt(req.query[key]);
        } else {
          filters[key] = req.query[key];
        }
      }
    });

    const routes = availableTicketsService.default.searchRoutes(filters);
    res.json({
      success: true,
      count: routes.length,
      data: routes,
      filters
    });
  } catch (error) {
    console.error('Error searching routes:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get route by ID
app.get('/api/routes/:id', (req, res) => {
  try {
    const route = availableTicketsService.default.getRouteById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Error getting route:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get routes by origin and destination
app.get('/api/routes/from/:from/to/:to', (req, res) => {
  try {
    const routes = availableTicketsService.default.getRoutesByOriginDestination(
      req.params.from, 
      req.params.to
    );
    
    res.json({
      success: true,
      count: routes.length,
      data: routes,
      search: { from: req.params.from, to: req.params.to }
    });
  } catch (error) {
    console.error('Error getting routes by origin/destination:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get all unique origins
app.get('/api/routes/origins', (req, res) => {
  try {
    const origins = availableTicketsService.default.getOrigins();
    res.json({
      success: true,
      data: origins
    });
  } catch (error) {
    console.error('Error getting origins:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get all unique destinations
app.get('/api/routes/destinations', (req, res) => {
  try {
    const destinations = availableTicketsService.default.getDestinations();
    res.json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error('Error getting destinations:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Mock booking endpoint (for testing)
app.post('/api/bookings', (req, res) => {
  try {
    const { routeId, passengers, totalAmount, paymentStatus = 'pending', paymentId } = req.body;
    
    // Validate route exists
    const route = availableTicketsService.default.getRouteById(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    if (route.availableSeats < passengers.length) {
      return res.status(400).json({
        success: false,
        message: `Only ${route.availableSeats} seats available, but ${passengers.length} passengers requested`
      });
    }

    // Update available seats
    const seatUpdateSuccess = availableTicketsService.default.updateAvailableSeats(routeId, passengers.length);
    if (!seatUpdateSuccess) {
      return res.status(400).json({
        success: false,
        message: 'Failed to reserve seats. Please try again.'
      });
    }

    // Mock booking and tickets
    const mockBooking = {
      _id: `booking-${Date.now()}`,
      user: 'user-id',
      route: {
        from: route.from,
        to: route.to,
        departureTime: route.departureTime,
        arrivalTime: route.arrivalTime,
      },
      routeId: route.id,
      passengers,
      totalAmount,
      paymentStatus,
      paymentId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const mockTickets = passengers.map((passenger, index) => ({
      _id: `ticket-${Date.now()}-${index}`,
      ticketNumber: `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      passenger: {
        name: passenger.name,
        age: passenger.age,
        gender: passenger.gender,
      },
      journeyDetails: {
        from: route.from,
        to: route.to,
        departureTime: route.departureTime,
        arrivalTime: route.arrivalTime,
        seatNumber: passenger.seatNumber || `SEAT-${index + 1}`,
      },
      price: totalAmount / passengers.length,
      status: 'active',
      qrCode: `qr-data-${Date.now()}-${index}`
    }));

    res.status(201).json({
      success: true,
      data: {
        booking: mockBooking,
        tickets: mockTickets,
        route: {
          id: route.id,
          from: route.from,
          to: route.to,
          agency: route.agency,
          departureTime: route.departureTime,
          arrivalTime: route.arrivalTime,
          busType: route.busType
        }
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
  console.log(`📊 Available tickets service loaded with ${availableTicketsService.default.getAllRoutes().length} routes`);
  console.log(`🔗 Frontend proxy: http://localhost:5173/api -> http://localhost:${PORT}/api`);
});
