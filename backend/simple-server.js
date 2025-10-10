const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Load available tickets service
const availableTicketsService = require('./dist/services/availableTicketsService.js');

// Mock user database (in production, this would be a real database)
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+250788123456',
    password: 'password123', // In production, this would be hashed
    paymentMethods: [
      {
        id: 'pm1',
        type: 'mtn_mobile_money',
        identifier: '+250788123456',
        isDefault: true
      }
    ]
  }
];

// Mock tickets database
const tickets = [
  {
    id: 'ticket-1',
    bookingId: 'booking-1',
    userId: '1',
    ticketNumber: 'TKT-1760122490127-123',
    qrCode: 'qr-data-1760122490127-1',
    status: 'active',
    journeyDetails: {
      from: 'Huye',
      to: 'Kigali',
      departureTime: '2025-01-11T06:00:00.000Z',
      arrivalTime: '2025-01-11T09:00:00.000Z',
      seatNumber: 'SEAT-1'
    },
    passenger: {
      name: 'John Doe',
      age: 30,
      gender: 'male'
    },
    price: 2500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock appeals database
const appeals = [
  {
    id: 'appeal-1',
    ticketId: 'ticket-1',
    userId: '1',
    subject: 'Need to change departure time',
    description: 'I need to change my departure time to a later slot due to personal reasons.',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Simple JWT-like token generation (in production, use proper JWT)
const generateToken = (userId) => {
  return `mock-token-${userId}-${Date.now()}`;
};

// Mock authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  // Simple token validation (in production, use proper JWT verification)
  const userId = token.split('-')[2];
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }

  req.user = user;
  next();
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;
    
    // Find user by email or phone
    const user = users.find(u => 
      (email && u.email === email) || 
      (phoneNumber && u.phoneNumber === phoneNumber)
    );
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const token = generateToken(user.id);
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => 
      u.email === email || u.phoneNumber === phoneNumber
    );
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone number already exists'
      });
    }
    
    // Create new user
    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      phoneNumber,
      password, // In production, hash this
      paymentMethods: []
    };
    
    users.push(newUser);
    
    const token = generateToken(newUser.id);
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    // Return user data without password
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// User management routes
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const user = req.user;
    
    // Update user data
    user.name = name || user.name;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    
    // Return updated user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/api/auth/payment-methods', authenticateToken, (req, res) => {
  try {
    const { type, identifier, isDefault } = req.body;
    const user = req.user;
    
    // Create new payment method
    const newPaymentMethod = {
      id: `pm-${Date.now()}`,
      type,
      identifier,
      isDefault: isDefault || false
    };
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      user.paymentMethods.forEach(pm => pm.isDefault = false);
    }
    
    user.paymentMethods.push(newPaymentMethod);
    
    // Return updated user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Tickets routes
app.get('/api/tickets', authenticateToken, (req, res) => {
  try {
    const { status } = req.query;
    let userTickets = tickets.filter(ticket => ticket.userId === req.user.id);
    
    if (status) {
      userTickets = userTickets.filter(ticket => ticket.status === status);
    }
    
    // Sort by departure time (most recent first)
    userTickets.sort((a, b) => new Date(b.journeyDetails.departureTime) - new Date(a.journeyDetails.departureTime));
    
    res.json({
      success: true,
      count: userTickets.length,
      data: userTickets
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.get('/api/tickets/:id', authenticateToken, (req, res) => {
  try {
    const ticket = tickets.find(t => t.id === req.params.id && t.userId === req.user.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.put('/api/tickets/:id/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    const ticket = tickets.find(t => t.id === req.params.id && t.userId === req.user.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    if (!['active', 'used', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status update'
      });
    }
    
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/api/tickets/scan', authenticateToken, (req, res) => {
  try {
    const { qr } = req.body;
    
    if (!qr) {
      return res.status(400).json({
        success: false,
        message: 'QR payload is required'
      });
    }
    
    // Find ticket by QR code
    const ticket = tickets.find(t => t.qrCode === qr);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    if (ticket.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not active'
      });
    }
    
    // Check if ticket is for today
    const today = new Date();
    const ticketDate = new Date(ticket.journeyDetails.departureTime);
    if (
      ticketDate.getDate() !== today.getDate() ||
      ticketDate.getMonth() !== today.getMonth() ||
      ticketDate.getFullYear() !== today.getFullYear()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not valid for today'
      });
    }
    
    // Mark as used
    ticket.status = 'used';
    ticket.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Scan ticket error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.get('/api/tickets/verify/:ticketNumber', authenticateToken, (req, res) => {
  try {
    const ticket = tickets.find(t => t.ticketNumber === req.params.ticketNumber);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    if (ticket.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is not active'
      });
    }
    
    // Mark as used
    ticket.status = 'used';
    ticket.updatedAt = new Date().toISOString();
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Verify ticket error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Appeals routes
app.get('/api/appeals', authenticateToken, (req, res) => {
  try {
    const userAppeals = appeals.filter(appeal => appeal.userId === req.user.id);
    
    // Sort by creation date (most recent first)
    userAppeals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      count: userAppeals.length,
      data: userAppeals
    });
  } catch (error) {
    console.error('Get appeals error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.post('/api/appeals', authenticateToken, (req, res) => {
  try {
    const { ticketId, subject, description } = req.body;
    
    // Verify ticket belongs to user
    const ticket = tickets.find(t => t.id === ticketId && t.userId === req.user.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    
    // Create new appeal
    const newAppeal = {
      id: `appeal-${Date.now()}`,
      ticketId,
      userId: req.user.id,
      subject,
      description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    appeals.push(newAppeal);
    
    res.status(201).json({
      success: true,
      data: newAppeal
    });
  } catch (error) {
    console.error('Create appeal error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.get('/api/appeals/:id', authenticateToken, (req, res) => {
  try {
    const appeal = appeals.find(a => a.id === req.params.id && a.userId === req.user.id);
    
    if (!appeal) {
      return res.status(404).json({
        success: false,
        message: 'Appeal not found'
      });
    }
    
    res.json({
      success: true,
      data: appeal
    });
  } catch (error) {
    console.error('Get appeal error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
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

    // Get user from token (in real app, this would come from auth middleware)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const userId = token ? token.split('-')[2] : '1'; // Default to user 1 for testing

    // Create booking
    const booking = {
      _id: `booking-${Date.now()}`,
      user: userId,
      route: {
        from: route.from,
        to: route.to,
        departureTime: new Date().toISOString(), // Use current time for demo
        arrivalTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
      },
      routeId: route.id,
      passengers,
      totalAmount,
      paymentStatus,
      paymentId,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Create actual tickets and add to database
    const createdTickets = passengers.map((passenger, index) => {
      const ticket = {
        id: `ticket-${Date.now()}-${index}`,
        bookingId: booking._id,
        userId: userId,
        ticketNumber: `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        qrCode: `qr-data-${Date.now()}-${index}`,
        status: 'active',
        journeyDetails: {
          from: route.from,
          to: route.to,
          departureTime: booking.route.departureTime,
          arrivalTime: booking.route.arrivalTime,
          seatNumber: passenger.seatNumber || `SEAT-${index + 1}`,
        },
        passenger: {
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
        },
        price: totalAmount / passengers.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to tickets database
      tickets.push(ticket);
      return ticket;
    });

    res.status(201).json({
      success: true,
      data: {
        booking,
        tickets: createdTickets,
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

// Admin routes (in production, add proper admin authentication)
app.get('/api/admin/stats', (req, res) => {
  try {
    const stats = {
      totalUsers: users.length,
      totalTickets: tickets.length,
      totalAppeals: appeals.length,
      totalRoutes: availableTicketsService.default.getAllRoutes().length,
      activeTickets: tickets.filter(t => t.status === 'active').length,
      pendingAppeals: appeals.filter(a => a.status === 'pending').length,
      totalBookings: tickets.length, // Assuming 1 booking per ticket for simplicity
      systemUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.get('/api/admin/users', (req, res) => {
  try {
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({
      success: true,
      count: usersWithoutPasswords.length,
      data: usersWithoutPasswords
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

app.get('/api/admin/appeals', (req, res) => {
  try {
    res.json({
      success: true,
      count: appeals.length,
      data: appeals
    });
  } catch (error) {
    console.error('Admin appeals error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TRAVVEL Server running on http://localhost:${PORT}`);
  console.log(`📊 Available tickets service loaded with ${availableTicketsService.default.getAllRoutes().length} routes`);
  console.log(`👥 Mock database loaded with ${users.length} users, ${tickets.length} tickets, ${appeals.length} appeals`);
  console.log(`🔗 Frontend proxy: http://localhost:5173/api -> http://localhost:${PORT}/api`);
  console.log(`🔗 Frontend proxy: http://localhost:5174/api -> http://localhost:${PORT}/api`);
  console.log(`📋 Available endpoints:`);
  console.log(`   🔐 Auth: POST /api/auth/login, POST /api/auth/register, GET /api/auth/me`);
  console.log(`   🎫 Tickets: GET /api/tickets, GET /api/tickets/:id, POST /api/tickets/scan`);
  console.log(`   🚌 Routes: GET /api/routes, GET /api/routes/search, GET /api/routes/from/:from/to/:to`);
  console.log(`   📝 Appeals: GET /api/appeals, POST /api/appeals`);
  console.log(`   🛒 Bookings: POST /api/bookings`);
  console.log(`   👨‍💼 Admin: GET /api/admin/stats, GET /api/admin/users, GET /api/admin/appeals`);
  console.log(`🎉 System ready for 100% functionality testing!`);
});
