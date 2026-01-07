const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TRAVVEL API',
      version: '1.0.0',
      description: 'API documentation for TRAVVEL travel booking application',
      contact: {
        name: 'TRAVVEL Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            phoneNumber: {
              type: 'string',
              description: 'User phone number',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'staff'],
              description: 'User role',
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether user email is verified',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Route: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Route ID',
            },
            from: {
              type: 'string',
              description: 'Departure location',
            },
            to: {
              type: 'string',
              description: 'Destination location',
            },
            agency: {
              type: 'string',
              description: 'Bus agency name',
            },
            departureTime: {
              type: 'string',
              description: 'Departure time',
            },
            arrivalTime: {
              type: 'string',
              description: 'Arrival time',
            },
            price: {
              type: 'number',
              description: 'Ticket price',
            },
            availableSeats: {
              type: 'number',
              description: 'Number of available seats',
            },
            busType: {
              type: 'string',
              description: 'Type of bus (Standard, Executive, etc.)',
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Booking ID',
            },
            user: {
              type: 'string',
              description: 'User ID who made the booking',
            },
            routeId: {
              type: 'string',
              description: 'Route ID',
            },
            passengers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  age: { type: 'number' },
                  gender: { type: 'string', enum: ['male', 'female', 'other'] },
                  seatNumber: { type: 'string' },
                },
              },
            },
            totalAmount: {
              type: 'number',
              description: 'Total booking amount',
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'refunded', 'failed'],
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Ticket: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Ticket ID',
            },
            booking: {
              type: 'string',
              description: 'Booking ID',
            },
            ticketNumber: {
              type: 'string',
              description: 'Unique ticket number',
            },
            passengerName: {
              type: 'string',
            },
            route: {
              type: 'object',
              description: 'Route information',
            },
            seatNumber: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['active', 'used', 'cancelled'],
            },
            qrCode: {
              type: 'string',
              description: 'QR code data',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Appeal: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Appeal ID',
            },
            user: {
              type: 'string',
              description: 'User ID',
            },
            ticketId: {
              type: 'string',
              description: 'Ticket ID',
            },
            subject: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_review', 'resolved', 'rejected'],
            },
            response: {
              type: 'string',
              description: 'Admin response',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/index.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

